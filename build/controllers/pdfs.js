

const { MongoClient, ObjectId, GridFSBucket } = require('mongodb');
const Pdf = require('pdf-parse');
const multer = require('multer');
const express = require('express');
const app = express();
const axios = require('axios');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { analysis } = require('./LLM');
const { report } = require('../Schema');
const mongoURI = "mongodb+srv://Project:Florencemidhebaramvesam@project.tbx2krn.mongodb.net/Saanjh";
const databaseName = 'Saanjh';
const client = new MongoClient(mongoURI);
let db;
client.connect();
db = client.db(databaseName);
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadXray = async (req, res) => {
    const buffer = Buffer.from(req.body.photo, 'base64');
    const bucket = new GridFSBucket(db);
    const uploadStream = bucket.openUploadStream('x-ray');
    const fileId = uploadStream.id;

    await new Promise((resolve, reject) => {
        uploadStream.end(buffer, (error) => {
            if (error) {
                console.error(`Error uploading ${`xray`}:`, error);
                reject(error);
            } else {
                console.log(`image uploaded successfully, stored under id:`, fileId);
                resolve(fileId);
            }
        });
    });

    return res.json({ data: fileId });
};
const uploadpdf = async (req, res) => {
    try {
        if (!db) {
            throw new Error('MongoDB connection not established.');
        }
        const { file, filename, patientId, name} = req.body;
      
       
        const uploadFile = async (data, name) => {
            const buffer = Buffer.from(data, 'base64');
            const bucket = new GridFSBucket(db);
            const uploadStream = bucket.openUploadStream(name);
            const fileId = uploadStream.id;
            let parsed;

            await Pdf(buffer).then(function (data) {
                parsed = (data.text);
            })

            const response = await axios.post('http://localhost:5001/en/getparameters', { text: parsed });


            if (response.data.data === false) {
                return { fileId: null, jsonObject: null };
            }

            const jsonObject = response.data.data;



            await new Promise((resolve, reject) => {
                uploadStream.end(buffer, (error) => {
                    if (error) {
                        console.error(`Error uploading ${name}:`, error);
                        reject(error);
                    } else {
                        console.log(`${name} uploaded successfully, stored under id:`, fileId);
                        resolve(fileId);
                    }
                });
            });

            return { fileId, jsonObject };
        };
        const fileDetails = file ? await uploadFile(file, filename) : null;
        if (fileDetails.fileId === null) {
            return res.json({ data: false });
        }
        const fileId = fileDetails.fileId;
        const jsonObject = fileDetails.jsonObject;

        console.log("hi");
        // const analysis_response = await axios.post('http://localhost:5001/en/analysis',{fileId : fileId, jsonObject:jsonObject,patientId: patientId,name : name } );
        //  console.log("analysis_response ",analysis_response.data.data)
        const analysis_response = await axios.post('http://localhost:5001/en/llmanalysis', { fileId: fileId, jsonObject: jsonObject, patientId: patientId, name: name });
        const reportId = analysis_response.data.reportId;
        // if (photo) {
        //     const response = await axios.post('http://localhost:5001/en/checkImage', { photo: photo, mimeType: mimeType });
        //     const parameters = response.data.parameters;
        //     if (parameters.validMedicalImage == false) {
        //         return res.json({ data: false });
        //     }
        //     else {
        //         parameters.typeofImage
        //         const a = await report.findOne({ _id: reportId });
        //         a.image = imageUrl;
        //         await a.save();
        //         const getSelectedImageType = (parameters) => {
        //             const typeOfImage = parameters.typeofImage;
                    
        //             // Find the key that has true value
        //             const selectedType = Object.entries(typeOfImage)
        //               .find(([_, value]) => value === true);
                      
        //             // Return the key if found, otherwise null
        //             return selectedType ? selectedType[0] : null;
        //           };
        //         const photoData = photo.data instanceof Blob || photo.data instanceof File
        //             ? await convertToBase64(photo.data)
        //             : photo.data;

        //             const selectedType = getSelectedImageType(parameters);
        //             const responseImage = await axios.post('https://keen-marten-tops.ngrok-free.app/getImage', {
        //                 photo: photoData,
        //                 imageType:selectedType,
        //               }, {
        //                 headers: {
        //                   'Content-Type': 'application/json'
        //                 }
        //               });
        //               const metrics=responseImage.data.metrics;
        //               console.log(typeof(metrics))
        //               a.imagemetrics=metrics;
        //               a.save();                      
        //     }
        // }
        
        return res.json({ data: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save pdf details' });
    }
}


const pdfid = async (req, res) => {
    try {
        const conn = mongoose.createConnection("mongodb+srv://Project:Florencemidhebaramvesam@project.tbx2krn.mongodb.net/Saanjh");
        let gfs;
        conn.once('open', () => {
            gfs = new mongoose.mongo.GridFSBucket(conn.db, {
                bucketName: 'fs'
            });
        });



        const fileId = new mongoose.Types.ObjectId(req.params.id);

        if (!gfs) {
            conn.once('open', () => {
                gfs = new mongoose.mongo.GridFSBucket(conn.db, {
                    bucketName: 'fs'
                });
                const readStream = gfs.openDownloadStream(fileId);
                res.set('Content-Type', 'application/pdf');
                readStream.pipe(res);
            });
        } else {
            gfs.openDownloadStream(fileId).pipe(res);
        }


    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal server error');
    }
};

const pdfparse = async (req, res) => {
    try {
        const { file } = req.body;
        const buffer = Buffer.from(data, 'base64');

    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Error processing file');
    }
};

const reciver = async (req, res) => {
    const parsed = req.body.text;
}



module.exports = { uploadpdf, pdfid, pdfparse, reciver, analysis, uploadXray }
