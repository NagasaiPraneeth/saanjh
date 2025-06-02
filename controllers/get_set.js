const express = require('express');
const app = express();
const { patient ,report,Log} = require('../Schema');
const {ObjectId} = require('mongodb');
const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');

const image = async(req, res) => {
    try 
    {
        const id = req.params.id;
        if (!id || id.length !== 24) {
            throw new Error('Invalid ObjectId format');
        }
        
        const fileId = new mongoose.Types.ObjectId(id);
        //console.log(fileId);
        await gfs.openDownloadStream(fileId).pipe(res);
    }
    catch(error)
    {
        console.log(error);
    }
};
const getReport = async (req, res) => {
    try {
        
        const id = req.params.id;
        
        const reportInfo = await report.findOne({ _id: id });
    
        res.json(reportInfo);
    }
    catch (error) {
       ;
        res.status(500).json({ error: 'Failed to retrieve reports' });
    }
}
const getPatient = async (req,res) => {
    const id = req.params.id;
    const patientInfo =await patient.findOne({_id:id});
    res.json(patientInfo);
}

const setPatient = async (req,res)=>{
    const info = req.body;

    
    
    let newpatient = new patient({
        name:info.firstName +" "+info.lastName,
        DOB:info.dateOfBirth,
        chronics:info.chronics,
        bloodGroup:info.bloodGroup,
        phone:info.phoneNumber,
        gender:info.gender
    })
    newpatient = await newpatient.save();
    
    res.json({data : "success"});
}

const editPatient = async (req,res)=>{
    const { formDataToSend,patientId} = req.body;

    const patientInfo =await patient.findOne({_id:patientId});
    patientInfo.name=formDataToSend.firstName +" "+formDataToSend.lastName;
    patientInfo.DOB=formDataToSend.dateOfBirth;
    patientInfo.chronics=formDataToSend.chronics;
    patientInfo.bloodGroup=formDataToSend.bloodGroup;
    patientInfo.phone=formDataToSend.phoneNumber;
    patientInfo.gender=formDataToSend.gender;
    patientInfo.save();
    
    res.json({data : "success"});

}

function formatDate(inputDate){
    const date=new Date(inputDate);
    const day=String(date.getDate()).padStart(2,'0');
    const month= String(date.getMonth()+1).padStart(2,'0');
    const year=date.getFullYear();
    return `${day}/${month}/${year}`
}


const getDates = async (req,res)=>{
    const id = req.params.id;
    const data = await report.find({patientId:id});
    const dates = data.map(item=>({
        file: item._id,
        specialistReq:item.specialistReq,
        date: item.valuesFromReport.date ? item.valuesFromReport.date : formatDate(item.dateOfReport)

    }))
    
    res.json(dates);

}

const getPrevReports = async (req,res)=>{
    const { patientId,reportId} = req.body;
    
    const data = await report.find({patientId:patientId});
    const modified = data.filter(item => item._id.toString() !== reportId.toString());
    
    const dates = modified.map(item=>({
        file: item._id,
        specialistReq:item.specialistReq,
        date: item.valuesFromReport.date ? item.valuesFromReport.date : formatDate(item.dateOfReport)

    }))
    
    res.json(dates);

}


const getPatients = async (req,res) => {
    try{
        const patients = await patient.find() // TODO: add session oldagehome queryfetch 
        res.json(patients);
    }
    catch(error){
        console.error(error);
        res.status(500).json({error: 'Failed to retrieve patients'});
    }
}


const getreports = async (req,res) => {
    try{
        const reports = await report.find();
        res.json(reports);
    }
    catch(error){
        console.error(error);
        res.status(500).json({error: 'Failed to retrieve reports'});
    }
}

const getOldageHomeInfo = async (req,res) => {
    try{
        const name = req.params.name;
        const oldAgeHomeDetails = await oldAgeHome.findOne(); // TODO: add session oldagehome query
        res.json(oldAgeHomeDetails);
    }
    catch(error){
        console.error(error);
        res.status(500).json({error: 'Failed to retrieve old age home details'});
    }
}

const { initIO } = require('../controllers/io');
const http = require('http');
const server = http.createServer(app);
const io = initIO(server);
const savePrecautions = async (req, res) => {
    try {
        const { reportId, precautions, doctorNotes, patientId } = req.body;
        const a = await report.findOne({ _id: reportId });
        

        if (!a) {
            return res.status(404).json({ message: 'Report not found' });
        }

        a.precautions = precautions;
        a.doctorNotes = doctorNotes;
        a.isVerified = true;
        await a.save();
        // console.log('io:', io);
        const specilization=a.specialistReq;
        io.emit('pushNotification', {
            patientId,
            specilization,
            
            // message: Report for Patient ID has been verified.,
            // heading: 'Report Verified',
        });

        res.status(200).send({
            message: 'Precautions saved successfully',
            a,
        });
        io.on('connection',(socket) => {
            console.log('Connected')
            socket.on('disconnect',() => {
                console.log('Client Disconnected')
            })
        })
    } catch (error) {
        console.error('Error saving precautions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



const removePatient = async (req, res) => {
    try {
        const { patientID } = req.body; // Expecting patientID from the request body

        // Use 'new' to create an ObjectId
        const patientToDelete = await patient.findOne({ _id: new ObjectId(patientID) });
        if (!patientToDelete) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // MongoDB connection for GridFS
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db);

        // Loop through each report and remove associated files and chunks
        for (const reportId of patientToDelete.reportsList) {
            const reportDoc = await report.findOne({ _id: new ObjectId(reportId) });
            
            if (reportDoc) {
                // Delete the associated file from GridFS
                const fileId = reportDoc.file;
                
                if (fileId) {
                    // Delete all chunks related to the file
                    await bucket.delete(new ObjectId(fileId));
                }

                // Delete the report document
                await report.deleteOne({ _id: reportDoc._id });
            }
        }

        // Remove the patient from the database
        await patient.deleteOne({ _id: patientToDelete._id });

        res.status(200).json({ message: 'Patient and associated records deleted successfully' });
    } catch (error) {
        console.error('Error removing patient:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const login = async(req,res)=>{
    try{
        const { email, password } = req.body;
        const login = await Log.findOne({"email":email}); 
        if (!login) {
            res.json({err:"Invalid email"})
        }

        else if(login.password===password){
            res.json({id:login.id});
        }
        else{
            res.json({error:"Invalid password"})
        }
    }
    catch(error){
        console.error(error);
        res.status(500).json({error: 'server error'});
    }
}

const fetchDoctorsData = async (req, res) => {
    try {
        const { spec, loc, coordy,flag } = req.body;
        console.log(spec, loc, coordy,flag);

        // First API call - Geocoding
        const formattedCoords = `${encodeURIComponent(coordy[0])}%2C${encodeURIComponent(coordy[1])}`;
        const geocodeUrl = `https://www.practo.com/maps/api/geocode/json?latlng=${formattedCoords}&intent=omni`;
        console.log(geocodeUrl);

        const geocodeResponse = await axios.get(geocodeUrl, {
            headers: {
                'Accept': '*/*',
                'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                'Referer': 'https://www.practo.com/doctors',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            }
        });
        console.log(geocodeResponse);
        // const locationName = geocodeResponse.data.results[0].address_components[1]["long_name"];
        // console.log(locationName);
        // Second API call - Doctor search
        const searchUrl = 'https://www.practo.com/search/doctors';
        const searchParams = {
            results_type: 'doctor',
            q: JSON.stringify([
                { word: spec, autocompleted: true, category: 'subspeciality' },
                { word: "hyderabad", autocompleted: true, category: 'locality' }
            ]),
            city: 'Hyderabad',
        };

        const searchHeaders = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'Cookie': 'visited_city=hyderabad; PHPSESSID=73b2vjavf1o5fo082crtajm676;',
        };

        const searchResponse = await axios.get(searchUrl, { 
            headers: searchHeaders, 
            params: searchParams 
        });

        const $ = cheerio.load(searchResponse.data);
        const reduxStateScript = $('script')
            .filter((i, el) => $(el).html().includes('window.__REDUX_STATE__'))
            .html();

        const reduxState = JSON.parse(reduxStateScript.substring(23));
        const doctors = reduxState.listingV2.doctors.items;

        const doctorDetails = doctors.map(element => {
            const doctor = reduxState.listingV2.doctors.entities[element.id.toString()];
            return {
                doctor_name: doctor.doctor_name,
                image_url: doctor.image_url,
                specialization: doctor.specialization,
                city: doctor.practice.city,
                locality: doctor.practice.locality,
                locality_latitude: doctor.locality_latitude,
                locality_longitude: doctor.locality_longitude,
                summary: doctor.summary,
                experience:doctor.experience_years
            };
        });

        res.json(doctorDetails);

    } catch (error) {
        console.error("Error in fetchDoctorsData:", error);
        res.status(500).json({
            error: "Error fetching doctor data",
            message: error.message
        });
    }
};
  

server.listen(5002, () => {
    console.log(`Server is running at http://localhost:${5002}`);
});


  
module.exports = { getReport, getPatient, setPatient, getPatients, getOldageHomeInfo,getDates,savePrecautions,getPrevReports,getreports,editPatient,login,removePatient,fetchDoctorsData,image}