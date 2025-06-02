const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')
patientSchema = new mongoose.Schema({
    patientID:Number,
    name: String,
    DOB:Date,
    gender: String,
    chronics:Array,//Chronical diseases like diabetes,BP
    phone:Number,
    reportsList:Array,//latest report is at 0 index
    bloodGroup:String,
})
oldAgeHomeSchema=new mongoose.Schema({
    name:String,
    doctors:Array,
    patients:Array,
    address:String,
    contact:Number,
})

loginSchema = new mongoose.Schema({
  email: String,
  password: String,
  id:String
});

reportSchema = new mongoose.Schema({
    patient: String,
    patientId:ObjectId,
    doctor: String,
    file: ObjectId,
    dateOfReport: Date,
    valuesFromReport:Object,
    precautions: Array,
    severity:Number,
    summary: String,
    specialistReq: String,
    possibleDiseases: Array,
    doctorNotes: String,//prescribtion
    periodicAnalysis:String,
    isVerified:Boolean,
    image:String,
    imagemetrics:Object,
    imageAnalysis:String,
    Diet : Object
  });

doctorSchema = new mongoose.Schema({
    name: String,
    specialization: String
});

PdfSchema = new mongoose.Schema({
    name: String,
    data: Buffer,
  });

const patient = mongoose.model('patients', patientSchema);
const report = mongoose.model('report', reportSchema);
const oldAgeHome = mongoose.model('oldAgeHome', oldAgeHomeSchema);
const doctor = mongoose.model('doctor', doctorSchema);
const Pdf=mongoose.model('pdf',PdfSchema)
const Log=mongoose.model('log',loginSchema)


module.exports = { patient, report , oldAgeHome, doctor,Pdf,Log}
