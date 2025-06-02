const mongoose = require('mongoose');
const express = require('express');
const fs = require('fs');
const pdf = require('pdf-parse');
const { report, patient } = require('../Schema.js');
const bodyParser = require('body-parser');
const app = express();
const axios=require('axios');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require('@google/generative-ai');
const { CLIENT_RENEG_LIMIT } = require('tls');
//Achieving state-of-the-art performance on the challenging MedQA (USMLE) benchmark with 91.1% accuracy

const safety_settings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];




const getParameters = async (req, res) => {
    const parsed = req.body.text;
    const apiKey = process.env.API_KEY_1;
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction:
            'If input is not related to medical diagnosis must respond with only {\n"medicalQuery":"no"\n}',
        safetySettings: safety_settings,
    });
    const generationConfig = {
        //randomness
        temperature: 0,
        //probability mass 95%
        topP: 0.95,
        //limits model to consider top 64 most likely words
        topK: 64,
        //maximum length in the form of tokens
        maxOutputTokens: 8192,
        responseMimeType: 'text/plain',
    };
    const chatSession = model.startChat({
        generationConfig,
        history: [
            {
                role: 'user',
                parts: [
                    {
                        text: "the user will give you the parsed test report  and you should give response as health parameter and it's value as key value pair in a object and also fetch date and include in the output at first position.",
                    },
                    {
                        text: 'Vijaya Diagnostic Centre\n3-6-16 & 17, Street No. 19, Basheerbagh, Hyderabad - 500 029\nLABORATORY TEST REPORT \n07:16:   3/24/2019Regn DateSample Collection:   24/03/2019   07:24\n:Print DateName15:2725/03/2019:\nMRS. G V RAMANI\n:Regn No/:\n141922478\nAge / Sex\nFemale54 Years\n:Regn CentreAmeerpetRef  By:   Dr. RAGHU K\nSample Type :   SerumRef no.:\nURIC ACID\nTEST NAMERESULTBIOLOGICAL REFERENCE INTERVAL\nUric Acid\n2.6 - 6.0  mg/dL4.0\n:\nMethod : Uricase Peroxidase\nComments / Interpretation :\n----------------------------------\n- Useful for monitoring therapeutic management of gout and chemotherapeutic treatment of neoplasms.\nUREA\nTEST NAMERESULTBIOLOGICAL REFERENCE INTERVAL\nUrea\nAdult       : 17  -  43 mg/dL\nNewborn : 8.4 - 25.8 mg/dL\nChildren   : 10.8 - 38.4 mg/dL\nInfant      : 10.8 - 38.4 mg/dL\n16\n:\nMethod : Urease / GLDH\nComments / Interpretation :\n---------------------------------\n- In conjunction with serum creatinine, urea level aids in differential diagnosis of Pre-Renal, Renal and Post-Renal hyperuremia.\nCREATININE\nTEST NAMERESULTBIOLOGICAL REFERENCE INTERVAL\nCreatinine\nAdult Female : 0.6 - 1.0 mg/dL\nNeonate         : 0.3 - 1.0 mg/dL\nInfant             : 0.2 - 0.4 mg/dL\nChildren         : 0.3 - 0.8 mg/dL\n0.5\n:\nMethod : Jaffe Kinetic IDMS\nComments / Interpretation :\n-------------------------------\n- Useful in the diagnosis renal insufficiency and is more specific and sensitive indicator of renal disease than of BUN.\n- Use of simultaneously BUN and creatinine levels provide more information in the diagnosis of renal insufficiency.\nELECTROLYTES\nTEST NAMERESULTBIOLOGICAL REFERENCE INTERVAL\nSodium\n136 - 146  mmol/L138\n:\nMethod : ISE INDIRECT\nPotassium\n3.5 - 5.1  mmol/L5.0\n:\nMethod : ISE INDIRECT\nChlorides\n101 - 109  mmol/L101\n:\nMethod : ISE INDIRECT\n*141922478*\nReleased Date \n:\n24/03/2019  11:26\nPage 1 of 7\n\nVijaya Diagnostic Centre\n3-6-16 & 17, Street No. 19, Basheerbagh, Hyderabad - 500 029\nLABORATORY TEST REPORT \n07:16:   3/24/2019Regn DateSample Collection:   24/03/2019   07:24\n:Print DateName15:2725/03/2019:\nMRS. G V RAMANI\n:Regn No/:\n141922478\nAge / Sex\nFemale54 Years\n:Regn CentreAmeerpetRef  By:   Dr. RAGHU K\nSample Type :   SerumRef no.:\nComments / Interpretation :\n---------------------------------\nSodium :-\n- Useful in the diagnosis and treatment of dehydration, overhydration. Hypernatremia suggests dehydration and Hyponatremia\n  (<130 mmol/L) suggests overhydration.\n- Levels of sodium when evaluated with electrolytes aid in assessing acid base balance, water balance and water intoxication.\nPotassium :-\n- Useful in evaluation of electrolyte balance, cardiac arrhythmia, muscular weakness, hepatic encephalopathy and renal failure.\nChloride :-\n- Useful, when assayed along with Sodium, Potassium and bicarbonate in assessment of electrolyte, acid base and water \n  balance.\nDR S G ALI HATIM\nCONSULTANT BIOCHEMIST\n*141922478*\nReleased Date \n:\n24/03/2019  11:26\nPage 2 of 7\n\nVijaya Diagnostic Centre\n3-6-16 & 17, Street No. 19, Basheerbagh, Hyderabad - 500 029\nLABORATORY TEST REPORT \n07:16:   3/24/2019Regn DateSample Collection:   24/03/2019   07:24\n:Print DateName15:2725/03/2019:\nMRS. G V RAMANI\n:Regn No/:\n141922478\nAge / Sex\nFemale54 Years\n:Regn CentreAmeerpetRef  By:   Dr. RAGHU K\nSample Type :   Fluoride PlasmaRef no.:\nFASTING PLASMA GLUCOSE (FPG)\nTEST NAMERESULTBIOLOGICAL REFERENCE INTERVAL\nFasting Plasma Glucose\nNormal : 70-100 mg/dL\nImpaired Fasting Glucose : 101-125 mg/dL\nDiabetes : >/=126  mg/dL\n:201\nMethod : Hexokinase\nComments / Interpretation :\n---------------------------------\n- ADA Guidelines (2018) are adopted for the evaluation of Diabetic Status.\nPOST LUNCH PLASMA GLUCOSE (PLPG)\nTEST NAMERESULTBIOLOGICAL REFERENCE INTERVAL\n2 hrs Post Lunch Plasma Glucose\nNormal : 100-140 mg/dL\nImpaired Glucose Tolerance : 141-199 mg/dL\nDiabetes : >/=200  mg/dL\n:212\nMethod : Hexokinase\nComments / Interpretation :\n---------------------------------\n- ADA Guidelines (2018) are adopted for the evaluation of Diabetic Status.\nDR S G ALI HATIM\nCONSULTANT BIOCHEMIST\nCertificate # MC-2657\nNABL Accredited\n*141922478*\nReleased Date \n:\n24/03/2019  16:09\nPage 3 of 7\n\nVijaya Diagnostic Centre\n3-6-16 & 17, Street No. 19, Basheerbagh, Hyderabad - 500 029\nLABORATORY TEST REPORT \n07:16:   3/24/2019Regn DateSample Collection:   24/03/2019   07:24\n:Print DateName15:2725/03/2019:\nMRS. G V RAMANI\n:Regn No/:\n141922478\nAge / Sex\nFemale54 Years\n:Regn CentreAmeerpetRef  By:   Dr. RAGHU K\nSample Type :   Whole Blood - EDTARef no.:\nCOMPLETE BLOOD PICTURE (CBP)\nTEST NAMERESULTBIOLOGICAL REFERENCE INTERVAL\nHaemoglobin\n12.0 - 15.0  g/dL\n:11.2\nPhotometric measurement\nTotal RBC Count\n3.8 - 4.8  millions/cumm4.38\n:\nCoulter Principle\nPacked Cell Volume / Hematocrit\n36.0 - 46.0  Vol%\n:34.2\nCalculated\nMCV\n83.0 - 101.0  fl\n:78.1\nDerived from RBC Histogram\nMCH\n27 - 32  pg\n:25.7\nCalculated\nMCHC\n31.5 - 34.5  gm/dL32.9\n:\nCalculated\nRDW\n11.6 - 14.0  %\n:16.8\nDerived from RBC Histogram\nTotal WBC Count\n4000 - 10000  Cells/cumm6400\n:\nCoulter Principle\nDifferential count\nNeutrophils\n40 - 80  %60\n:\nVCSn Technology &  Microscopy\nLymphocytes\n20 - 40  %28\n:\nVCSn Technology &  Microscopy\nEosinophils\n1 - 6  %2\n:\nVCSn Technology &  Microscopy\nMonocytes\n2 - 10  %9\n:\nVCSn Technology &  Microscopy\nBasophils\n0 - 2  %1\n:\nVCSn Technology &  Microscopy\nAbsolute Leucocyte Count\nAbsolute Neutrophil Count\n2000 - 7000  Cells/cumm3900\n:\nMethod : Calculation\nAbsolute Lymphocyte Count\n1000 - 3000  Cells/cumm1800\n:\nMethod : Calculation\nAbsolute Eosinophil Count\n20 - 500  Cells/cumm100\n:\nMethod : Calculation\nAbsolute Monocyte Count\n200 - 1000  Cells/cumm600\n:\nMethod : Calculation\nNABL Accredited\n*141922478*\nReleased Date \n:\n24/03/2019  12:09\nPage 4 of 7\n\nVijaya Diagnostic Centre\n3-6-16 & 17, Street No. 19, Basheerbagh, Hyderabad - 500 029\nLABORATORY TEST REPORT \n07:16:   3/24/2019Regn DateSample Collection:   24/03/2019   07:24\n:Print DateName15:2725/03/2019:\nMRS. G V RAMANI\n:Regn No/:\n141922478\nAge / Sex\nFemale54 Years\n:Regn CentreAmeerpetRef  By:   Dr. RAGHU K\nSample Type :   Whole Blood - EDTARef no.:\nCOMPLETE BLOOD PICTURE (CBP)\nTEST NAMERESULTBIOLOGICAL REFERENCE INTERVAL\nPlatelet Count\n150000 - 410000  /cumm\n:427000\nCoulter Principle\nPeripheral Smear\nRBC\nNormocytic Normochromic with mild anisocytosis\n:\nMicroscopy : Leishman stain/Modified Giemsa Stain\nWBC\nNormal in morphology,maturity and distribution\n:\nMicroscopy : Leishman stain/Modified Giemsa Stain\nPlatelets\nAdequate\n:\nMicroscopy : Leishman stain/Modified Giemsa Stain\nDR.DILIP KUMAR DAS\nCONSULTANT PATHOLOGIST\nCertificate # MC-2657\nNABL Accredited\n*141922478*\nReleased Date \n:\n24/03/2019  12:09\nPage 5 of 7\n\nVijaya Diagnostic Centre\n3-6-16 & 17, Street No. 19, Basheerbagh, Hyderabad - 500 029\nLABORATORY TEST REPORT \n07:16:   3/24/2019Regn DateSample Collection:   24/03/2019   07:24\n:Print DateName15:2725/03/2019:\nMRS. G V RAMANI\n:Regn No/:\n141922478\nAge / Sex\nFemale54 Years\n:Regn CentreAmeerpetRef  By:   Dr. RAGHU K\nSample Type :   UrineRef no.:\nCOMPLETE URINE EXAMINATION (CUE)\nTEST NAMERESULTBIOLOGICAL REFERENCE INTERVAL\nMacroscopic Examination\nColour\nPale YellowPale Yellow\n:\nAppearance\nClearClear\n:\nSpecific Gravity\n1.003 - 1.0301.010\n:\nIon Exchange\nReaction/pH\n4.6 - 8Alkaline (7.5)\n:\nDouble Indicator\nProtein\nNil - TraceNil\n:\nProtein error of Indicator\nGlucose\nNilNil\n:\nGOD-POD\nUrobilinogen\nNANormal\n:\nModified Ehrlich reaction\nBilirubin\nNegativeNegative\n:\nDiazonium method\nKetones\nNegativeNegative\n:\nNitroprusside reaction\nNitrites\nNegativeNegative\n:\nDiazonium method\nMicroscopic Examination\nPus Cells\n0 - 5  Cells / HPF1-2/HPF\n:\nR.B.C\n0 - 2  Cells / HPFNil\n:\nEpithelial Cells\n0 - 5  Cells / HPF1-2/HPF\n:\nCasts\nNil/LPFNil\n:\nCrystals\nNilNil\n:\nMethod\nReagent Strip Method, Microscopy.\n:\nDR.ASIMA MUBEEN QUADRI\nCONSULTANT PATHOLOGIST\nCertificate # MC-2657\nNABL Accredited\n*141922478*\nReleased Date \n:\n25/03/2019  15:20\nPage 6 of 7\n\nVijaya Diagnostic Centre\n3-6-16 & 17, Street No. 19, Basheerbagh, Hyderabad - 500 029\nLABORATORY TEST REPORT \n07:16:   3/24/2019Regn DateSample Collection:   24/03/2019   07:24\n:Print DateName15:2725/03/2019:\nMRS. G V RAMANI\n:Regn No/:\n141922478\nAge / Sex\nFemale54 Years\n:Regn CentreAmeerpetRef  By:   Dr. RAGHU K\nSample Type :   SerumRef no.:\nLIPID PROFILE (LP)\nTEST NAMERESULTBIOLOGICAL REFERENCE INTERVAL\nSerum Status\nClear\n:\nTriglycerides\nDesirable Level : < 150 mg/dL\nBorderline         : 150 - 199 mg/dL\nHigh                  : 200 - 499 mg/dL\nVery High         : > 499 mg/dL\n212\n:\nMethod : GPO-POD\nTotal Cholesterol\nDesirable Level : < 200 mg/dL\nBorderline         : 200 - 239 mg/dL\nUndesirable       : > 239 mg/dL\n161\n:\nMethod : CHOD-POD\nLDL Cholesterol.\nOptimal             : < 100 mg/dL\nNear Optimal    : 100 - 129 mg/dL\nBorderline High : 130 - 159 mg/dL\nHigh                   : 160 - 189 mg/dL\nVery High           : > 189 mg/dL\n83\n:\nMethod: Calculation\nHDL Cholesterol\nDesirable Level : > 59 mg/dL\nOptimal            : 40 - 59 mg/dL\nUndesirable      : < 40 mg/dL\n36\n:\nMethod : Enzymatic Immunoinhibition\nVLDL\n< 30  mg/dL42\n:\nMethod: Calculation\nTotal Cholesterol/HDL Cholesterol Ratio\nLow Risk         : 3.3 - 4.4\nAverage Risk    : 4.5 - 7.1\nModerate Risk : 7.2 - 11.0\n4.47\n:\nMethod: Calculation\nLDL Cholesterol/HDL Cholesterol Ratio\nDesirable Level : 0.5 - 3.0\nBorderline Risk : 3.0 - 6.0\nHigh Risk          : > 6.0\n2.29\n:\nMethod: Calculation\nComments / Interpretation :\n---------------------------------\n- Lipid profile is a panel of blood tests that serves as an initial broad medical screening tool for abnormalities in lipids, the\n  results of this tests can identify certain genetic diseases and can determine approximate risks for cardiovascular disease,\n  certain forms of pancreatitis and other diseases.\nDR S G ALI HATIM\nCONSULTANT BIOCHEMIST\nCertificate # MC-2657\nNABL Accredited\n*141922478*\nReleased Date \n:\n24/03/2019  12:21\nPage 7 of 7\n\nLABORATORY TEST REPORT \n07:16\n:\n24/03/2019Regn DateSample Collection\n:\n24/03/2019   07:24\n:\nPrint DateName15:2725/03/2019\n:\nMRS. G V RAMANI\n:\nRegn No\n/:\n141922478\nAge / Sex\nFemale54 Years\n:Regn Centre\nAmeerpetRef  By\n:\nDr. RAGHU K\nSample Type :\nWhole Blood - EDTA\nRef no.:\nGLYCOSYLATED HAEMOGLOBIN (HbA1c)\nTEST NAMERESULTBIOLOGICAL REFERENCE INTERVAL\nGlycosylated Haemoglobin\nNon Diabetic : < 5.6% \nPrediabetic Range : 5.7 - 6.4%\nDiabetic Range : > 6.5%\n8.3\n:\nMethod : High Performance Liquid Chromatography (HPLC)\nComments / Interpretation :\n---------------------------------\n- Glycosylated hemoglobin is proportional to mean plasma glucose level during previous 6-12 weeks.\n- Values may not be comparable with different methodologies and even different laboratories using the same methodology.\n- Perform A1c at least twice annually in Diabetes patients to ascertain meeting of goals\n- Perform A1c test quarterly in Diabetes patients whose therapy has changed and who are not meeting goals\n- Recommended goal of A1c is < 7%\n- ADA Guidelines 2016.\n*141922478*\nReleased Date :\n24/03/2019  11:41\nPage 1 of 2\n\nLABORATORY TEST REPORT \n07:16\n:\n24/03/2019Regn DateSample Collection\n:\n24/03/2019   07:24\n:\nPrint DateName15:2725/03/2019\n:\nMRS. G V RAMANI\n:\nRegn No\n/:\n141922478\nAge / Sex\nFemale54 Years\n:Regn Centre\nAmeerpetRef  By\n:\nDr. RAGHU K\nSample Type :\nWhole Blood - EDTA\nRef no.:\nDR S G ALI HATIM\nCONSULTANT BIOCHEMIST\nCertificate # MC-2657\n*141922478*\nReleased Date :\n24/03/2019  11:41\nPage 2 of 2\n\nBio-Rad CDM SystemPATIENT REPORT\nCDM 5.1 VII TURBO InstrumentV2TURBO_A1c_2.0\nPatient DataAnalysis Data \nSample ID: 141922478Analysis Performed: 24/03/2019 10:56:16\nPatient ID: Injection Number: 13713\nName: Run Number: 692\nPhysician:Rack ID:\nSex: Tube Number:9\nDOB: Report Generated:24/03/2019 11:01:12\nOperator ID:\nComments:\nNGSPRetentionPeak\nPeak Name%Area %Time (min)Area\nA1a--- 1.5 0.16315349\nA1b--- 2.5 0.23324922\nLA1c--- 2.3 0.38523384\nA1c8.3*--- 0.48569821\nP3--- 4.0 0.76439918\nP4--- 1.5 0.85215086\nAo--- 81.1 1.000807659\n*Values outside of expected ranges\nTotal Area:996,138*\nHbA1c (NGSP) = 8.3* % \n0.000.250.500.751.001.251.50\n0.0\n2.5\n5.0\n7.5\n10.0\n12.5\n15.0\n17.5\n20.0\nTime (min.)\n%A1c\n - \n0.16\n - \n0.23\n - \n0.39\nA1c  - \n0.49\n - \n0.76\n - \n0.85\n - \n1.00',
                    },
                ],
            },
            {
                role: 'model',
                parts: [
                    {
                        text: '```json\n{\n"medicalQuery":"yes",\n  "date": "24/03/2019",\n  "Uric Acid": "4.0 mg/dL",\n  "Urea": "16 mg/dL",\n  "Creatinine": "0.5 mg/dL",\n  "Sodium": "138 mmol/L",\n  "Potassium": "5.0 mmol/L",\n  "Chlorides": "101 mmol/L",\n  "Fasting Plasma Glucose": "201 mg/dL",\n  "2 hrs Post Lunch Plasma Glucose": "212 mg/dL",\n  "Haemoglobin": "11.2 g/dL",\n  "Total RBC Count": "4.38 millions/cumm",\n  "Packed Cell Volume / Hematocrit": "34.2 Vol%",\n  "MCV": "78.1 fl",\n  "MCH": "25.7 pg",\n  "MCHC": "32.9 gm/dL",\n  "RDW": "16.8 %",\n  "Total WBC Count": "6400 Cells/cumm",\n  "Neutrophils": "60 %",\n  "Lymphocytes": "28 %",\n  "Eosinophils": "2 %",\n  "Monocytes": "9 %",\n  "Basophils": "1 %",\n  "Absolute Neutrophil Count": "3900 Cells/cumm",\n  "Absolute Lymphocyte Count": "1800 Cells/cumm",\n  "Absolute Eosinophil Count": "100 Cells/cumm",\n  "Absolute Monocyte Count": "600 Cells/cumm",\n  "Platelet Count": "427000 /cumm",\n  "RBC": "Normocytic Normochromic with mild anisocytosis",\n  "WBC": "Normal in morphology,maturity and distribution",\n  "Platelets": "Adequate",\n  "Colour": "Pale Yellow",\n  "Appearance": "Clear",\n  "Specific Gravity": "1.010",\n  "Reaction/pH": "Alkaline (7.5)",\n  "Protein": "Nil",\n  "Glucose": "Nil",\n  "Urobilinogen": "Normal",\n  "Bilirubin": "Negative",\n  "Ketones": "Negative",\n  "Nitrites": "Negative",\n  "Pus Cells": "1-2/HPF",\n  "R.B.C": "Nil",\n  "Epithelial Cells": "1-2/HPF",\n  "Casts": "Nil",\n  "Crystals": "Nil",\n  "Serum Status": "Clear",\n  "Triglycerides": "212 mg/dL",\n  "Total Cholesterol": "161 mg/dL",\n  "LDL Cholesterol": "83 mg/dL",\n  "HDL Cholesterol": "36 mg/dL",\n  "VLDL": "42 mg/dL",\n  "Total Cholesterol/HDL Cholesterol Ratio": "4.47",\n  "LDL Cholesterol/HDL Cholesterol Ratio": "2.29",\n  "Glycosylated Haemoglobin": "8.3 %"\n}\n```',
                    },
                ],
            },
            {
                role: 'user',
                parts: [
                    {
                        text: 'Question\n1\nComplete\nMark 0.00 out of\n1.00\nStarted onSaturday, 27 April 2024, 12:13 PM\nStateFinished\nCompleted onSaturday, 27 April 2024, 12:18 PM\nTime taken4 mins 31 secs\nMarks2.25/6.00\nGrade37.50 out of 100.00\ninterface WithDefinitionsInter {\ndefault void definedMeth() {\nSystem.out.println("inside interface");\n}\n}\nclass WithDefinitionsImpl implements WithDefinitionsInter {\npublic void definedMeth() {\nsuper.definedMeth();\nSystem.out.println("inside class");\n}\n}\npublic class QuizDef {\npublic static void main(String par[]) {\nWithDefinitionsInter withDef = new WithDefinitionsImpl();\nwithDef.definedMeth();\n}\n}\nWhat will happen to the above code when compiled?\nSelect one:\na. The code will not get compiled because the method definedMeth() is\nundefined in Object class\nb. The code will not get compiled because the interface holds method\ndefinition\nc. The code will get compiled and executed successfully\nd. The code will not get compiled because the interface does not even have a\nsingle abstract method\nDashboard (http://10.11.51.100/tessellator43/student/dashboard.php) / Quiz\n\nQuestion\n2\nComplete\nMark 0.00 out of\n1.00\n1: interface HasExoskeleton {\n2: abstract int getNumberOfSections();\n3: }\n4: abstract class Insect implements HasExoskeleton {\n5: abstract int getNumberOfLegs();\n6: }\n7: public class Beetle extends Insect {\n8: int getNumberOfLegs() { return 6; }\n9: }\nSelect one:\na. The code will not compile because of line 2.\nb. The code will not compile because of line 7.\nc. It compiles and runs without issue.\nd. The code will not compile because of line 4.\ne. It compiles but throws an exception at runtime.\n\nQuestion\n3\nComplete\nMark 0.50 out of\n1.00\npublic interface Deduction {\nstatic void deduct() {\nSystem.out.println("deduct");\n}\n}\n@SuppressWarnings("")\npublic class Customer implements Deduction {\npublic void serviceCharge() {\n        //deduction functionality being invoked\ndeduct();\n}\n}\npublic class TechSol {\npublic static void main(String[] args) {\nnew customer().serviceCharge();\n}\n}\nWhat will happen to the above code when compile and execute? (Select two valid\noptions)\nSelect one or more:\na. The code will not get compiled because the static method of interface is not\naccessed using interface name\nb. Will lead to run time ambiguity as the static method is not accessed using\ninterface name\nc. Will get executed successfully leaving the output “deduct”\nd. The code will not get compiled as the method deduct() is undefined for the\nCustomer class\n\nQuestion\n4\nComplete\nMark 0.00 out of\n1.00\nQuestion\n5\nComplete\nMark 0.75 out of\n1.00\npublic interface Deduction {\nstatic void deduct() {\nSystem.out.println("deduct");\n}\n}\npublic class Customer implements Deduction {\npublic static void deduct() {\nSystem.out.println("deduction for customer");\n}\n}\npublic class TechSol {\npublic static void main(String[] args) {\nDeduction deduction = new Customer();\ndeduction.deduct();\n}\n}\nWhat will happen when the code is subjected to compilation and execution?\nSelect one:\na. The code will not get compiled as the static method of interface is not\naccessed using interface name\nb. Will get executed successfully leaving the output “deduct”\nc. Will lead to run time ambiguity as the interface’s static method is overridden\nd. Will get executed successfully leaving the output “deduction for customer”\npublic interface CanHop {}\npublic class Frog implements CanHop {\n public static void main(String[] args) {\n________ frog = new TurtleFrog();\n }\n}\npublic class BrazilianHornedFrog extends Frog {}\npublic class TurtleFrog extends Frog {}\nSelect one or more:\na. BrazilianHornedFrog\nb. Object\nc. Frog\nd. Long\ne. TurtleFrog\nf. CanHop\n\nQuestion\n6\nComplete\nMark 1.00 out of\n1.00\nWhat is expected when the following code gets compiled and executed?\ninterface WithDefinitionsInter {\ndefault void definedMeth() {\nSystem.out.println("inside interface");\n}\n}\nclass WithDefinitionsImpl implements WithDefinitionsInter {\npublic void definedMeth() {\nSystem.out.println("inside class");\n}\n}\npublic class QuizDef {\npublic static void main(String par[]) {\nWithDefinitionsInter withDef = new WithDefinitionsImpl();\nwithDef.definedMeth();\n}\n}\nSelect one:\na. No successful compilation because the interface does not even have a\nsingle abstract method\nb. The code will be executed successfully. And, the execution result will be,\ninside class\nc. No successful compilation because the interface holds method definition\nd. The code will print, inside interface and inside class as a result of\nsuccessful execution\nlogo icon\nVersion 4.3Copyright © 2024 Teleparadigm Networks Pvt. Ltd. All Rights Reserved.',
                    },
                ],
            },
            {
                role: 'model',
                parts: [{ text: '{\n"medicalQuery":"no"\n}\n' }],
            },
            {
                role: 'user',
                parts: [
                    {
                        text: 'A computer system is divided into two categories: Hardware and Software.  \nHardware refers to the physical and visible components of the system such as a monitor, CPU, \nkeyboard and mouse.  \nSoftware, on the other hand, refers to a set of instructions which enable the hardware to perform \na specific set of tasks.\n\n\n\nTypes of Computer Software\n System Software\n Application Software\nSystem Software: System Software is a component of Computer Software that directly operates\nwith Computer Hardware which has the work to control the Computer’s Internal Functioning and\nalso takes responsibility for controlling Hardware Devices such as Printers, Storage Devices, etc.\nTypes of System Software include Operating systems, Language processors, and Device Drivers.\nApplication Software: Application Software are the software that works the basic operations of\nthe computer. It performs a specific task for users. Application Software basically includes Word\nProcessors, Spreadsheets, etc. Types of Application software include General Purpose Software,\nCustomized Software, etc.\n\nDefinition:\nOperating System can be defined as a system software which acts as an interface between user and\nthe hardware. It manages all other applications and programs in a computer, and it is loaded into\nthe computer by a boot program.\n\n\n\nOperating System Objectives\n To make the computer system convenient to use in an efficient manner.\n To hide the details of the hardware resources from the users.\n To provide users a convenient interface to use the computer system.\n To act as an intermediary between the hardware and its users, making it easier for the\nusers to access and use other resources.\n To manage the resources of a computer system.\n To  keep  track  of  who  is  using  which  resource,  granting  resource  requests,  and\nmediating conflicting requests from different programs and users.\n To provide efficient and fair sharing of resources among users and programs.\n\nUser View and System View\nThe  operating  system  can  be  observed  from  the  point  of  view  of  the  user  or  the  system.  This  is\nknown  as  the  user  view  and  the  system  view  respectively.  More  details  about  these  are  given  as\nfollows −\n\nUser View:\n\nThe user view depends on the system interface that is used by the users. The different types of\nuser view experiences can be explained as follows −\n If the user is using a personal computer, the operating system is largely designed to make\nthe interaction easy. Some attention is also paid to the performance of the system, but there is no\nneed for the operating  system  to  worry  about  resource  utilization.  This  is  because the personal\ncomputer uses all the resources available and there is no sharing.\n If the user is using a system connected to a mainframe or a minicomputer, the operating\nsystem  is  largely  concerned  with  resource  utilization.  This  is  because  there  may  be  multiple\nterminals connected to the mainframe and the operating system makes sure that all the resources\nsuch as CPU,memory, I/O devices etc. are divided uniformly between them.\n If  the user  is  sitting on a workstation connected to  other  workstations  through  networks,\nthen the operating system needs to focus on both individual usage of resources and sharing though\nthe network. This happens because the workstation exclusively uses its own resources but it also\nneeds to share files etc. with other workstations across the network.\n If the user is using a handheld computer such as a mobile, then the operating system handles\nthe usability of the device including a few remote operations. The battery level of the device is also\ntaken into account.\n There are some devices that contain very less or no user view because there is no interaction\nwith the users. Examples are embedded computers in home devices, automobiles etc.\nSystem View:\nFrom the System point of view the operating system is the program which is most intermediate\nwith the hardware.\n The system views the operating system as a resource allocator. There are many resources such\nas CPU time, memory space, file storage space, I/O devices etc. that are required by processes for\nexecution.  It  is  the  duty  of  the  operating  system  to  allocate  these  resources  judiciously  to  the\nprocesses so that the computer system can run as smoothly as possible.\n The operating system can also work as a control program. It manages all the processes and I/O\ndevices so that the computer system works smoothly and there are no errors. It makes sure that\nthe I/O devices work in a proper manner without creating problems.',
                    },
                ],
            },
            {
                role: 'model',
                parts: [{ text: '{\n"medicalQuery":"no"\n}\n' }],
            },
            {
                role: 'user',
                parts: [
                    {
                        text: '\nPage\n3\n/\n19\nPractice Questions\n1. Construct a TM for L\nPage 1 of 19UNIT 3Syllabus: TM: Definition of TM, Structural representation of TM, Construction of TMCompiler: Definition of Compiler, Phases of Compiler, Lexical Analysis, Input Buffering.========================================================================Turing MachineTopics to be Discussed:→ Introduction→ Configuration→ Definition→ REC & Recursive→ Construction of TMIntroduction→ Mathematical Model of General-Purpose Computer→ Languages accepted by TM are called REL.→ Consists of input tape of Infinite length, read-write head and a finite control.Configuration Can also be said FA + [ RW head] + [ left | Right Direction] Can also be said Two stack FA. PDA = FA + 1 stack, 7 tuple systemDefinitionsA TM is a 7-tuple systemTM Μ= (Q, ∑, Ґ, δ, q0, B, F)DTM → δ: Q X Ґ → Q X Ґ { L, R }NTM → δ: Q X Ґ → 2 Q X Ґx {L, R}\nPage 1 of 19\nPage 2 of 19Variants of TM One-way Infinite Tape TM Two-way Infinite Tape TM Multitape Infinite Tape TM Multitape and Multihead Multidimensional TM Universal TM 2 stack PDA FA + 2 stack========================================================================Functions of TM1. Acceptor: (TM accepts REL) → transducer. If w ∈ REC, it always halts at finalstate. If w ∉ REL, it may halt at non finalstate or it may never halt (Entersinto loop).2. Enumerator: It enumerates the language.========================================================================TM that halts at FSHalting TM1. Final state + Halt → accepts w ∈ L (TM)2. Non-final + Halt → Not accept w ∉ L (TM)3. ∞- loop or No Halt → can’t conclude w ∈ L (TM)w ∉ L (TM)HTM: if w ∈ L halts at final state If w ∉ L halts at non finalEffective order lexicographical order.\nPage 2 of 19\nPage 3 of 19Construction of TM: How to remember a symbolFA========================================================================Practice Questions1. Construct a TM for L = {an bn | n >= 1}No of states required: 5========================================================================2. Construct a TM for L = {an bn cn | n >= 1} → PDA does not accept.Number of of states required: 6.\nPage 3 of 19\nPage 4 of 19========================================================================3. L = {Ending with 00}========================================================================4. L = {Ending with abb}========================================================================5. TM that accepts palindromes of strings over the alphabet ∑ = {a, b}Q: # states for even palindrome ---------------------Q: # states for odd palindrome ----------------------========================================================================6. 1’s complement of a binary number.========================================================================\nPage 4 of 19\nPage 5 of 197. 2’s compliment of a binary number.# 3 states========================================================================8. TM for unary adder.# of states.========================================================================9. TM for the increment of a binary number.# States required.========================================================================10. TM for the decrement of a binary number.Q: The input string is 10001Q: # states required to decrement the w = 1000========================== =============================================\nPage 5 of 19\nFind in document\nUNIT_3_ACD NOTES.pdf\nOpen with Google Docs\n Share\n\nPage 3 of 19',
                    },
                ],
            },
            {
                role: 'model',
                parts: [{ text: '{\n"medicalQuery":"no"\n}\n' }],
            },
        ],
    });
    const result = await chatSession.sendMessage(
        'the below information will provide you a data of test report file , fetch the parameters as json object and If data is not related to medical diagnosis must respond with only {\n"medicalQuery":"no"\n} \n' +
        parsed
    );
    matter = result.response.text();
    matter = matter
        .replace('json', '')
        .replace('```', '')
        .replace('```', '')
        .replace('\n', '');
    const jsonObject = JSON.parse(matter);
    if (jsonObject['medicalQuery'] == 'no') {
        return res.json({ data: false });
    }

    return res.json({ data: jsonObject });


}

const analysis = async (req, res) => {
    const { fileId, patientId, name } = req.body;
    let { jsonObject } = req.body;
    let report1 = new report({});
    report1 = await report1.save();
    const id = report1._id;
    const patientDetails = await patient.findOne({ _id: patientId });
    const listofreports = patientDetails.reportsList || [];
    listofreports.push(id);
    patientDetails.reportsList = listofreports;
    patientDetails.save();

    const apiKey = process.env.API_KEY_2;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        safetySettings: safety_settings,
        systemInstruction:
            'you are a medical reports analyzer which analyze the reports and give output in a specific format where the  Keys are summary of analysis, Date of report , Precautions, Possible disease risks, severity rating out of 10, which specialist(one or less) is needed. the format of output should be in:  Short-Analysis:String,Precautions:Array,Possible-disease risks:Array,Severity:int,specialist:String as json format\n',

    });
    jsonObject["chronic conditions"] = await patient.findOne({ _id: patientId }).select({ 'chronics': 1, '-_id': 1 });   

    const generationConfig = {
        temperature: 0,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: 'text/plain',
    };
    const chatSession = model.startChat({
        generationConfig,

        history: [
            {
                role: 'user',
                parts: [
                    {
                        text: '{\n  "date": "24/03/2019",\n  "Uric Acid": "4.0 mg/dL",\n  "Urea": "16 mg/dL",\n  "Creatinine": "0.5 mg/dL",\n  "Sodium": "138 mmol/L",\n  "Potassium": "5.0 mmol/L",\n  "Chlorides": "101 mmol/L",\n  "Fasting Plasma Glucose": "201 mg/dL",\n  "2 hrs Post Lunch Plasma Glucose": "212 mg/dL",\n  "Haemoglobin": "11.2 g/dL",\n  "Total RBC Count": "4.38 millions/cumm",\n  "Packed Cell Volume / Hematocrit": "34.2 Vol%",\n  "MCV": "78.1 fl",\n  "MCH": "25.7 pg",\n  "MCHC": "32.9 gm/dL",\n  "RDW": "16.8 %",\n  "Total WBC Count": "6400 Cells/cumm",\n  "Neutrophils": "60 %",\n  "Lymphocytes": "28 %",\n  "Eosinophils": "2 %",\n  "Monocytes": "9 %",\n  "Basophils": "1 %",\n  "Absolute Neutrophil Count": "3900 Cells/cumm",\n  "Absolute Lymphocyte Count": "1800 Cells/cumm",\n  "Absolute Eosinophil Count": "100 Cells/cumm",\n  "Absolute Monocyte Count": "600 Cells/cumm",\n  "Platelet Count": "427000 /cumm",\n  "RBC": "Normocytic Normochromic with mild anisocytosis",\n  "WBC": "Normal in morphology,maturity and distribution",\n  "Platelets": "Adequate",\n  "Colour": "Pale Yellow",\n  "Appearance": "Clear",\n  "Specific Gravity": "1.010",\n  "Reaction/pH": "Alkaline (7.5)",\n  "Protein": "Nil",\n  "Glucose": "Nil",\n  "Urobilinogen": "Normal",\n  "Bilirubin": "Negative",\n  "Ketones": "Negative",\n  "Nitrites": "Negative",\n  "Pus Cells": "1-2/HPF",\n  "R.B.C": "Nil",\n  "Epithelial Cells": "1-2/HPF",\n  "Casts": "Nil",\n  "Crystals": "Nil",\n  "Serum Status": "Clear",\n  "Triglycerides": "212 mg/dL",\n  "Total Cholesterol": "161 mg/dL",\n  "LDL Cholesterol": "83 mg/dL",\n  "HDL Cholesterol": "36 mg/dL",\n  "VLDL": "42 mg/dL",\n  "Total Cholesterol/HDL Cholesterol Ratio": "4.47",\n  "LDL Cholesterol/HDL Cholesterol Ratio": "2.29",\n  "Glycosylated Haemoglobin": "8.3 %"\n}\n',
                    },
                ],
            },
            {
                role: 'model',
                parts: [
                    {
                        text: '```json\n{\n  "Short-Analysis": "The report indicates borderline high fasting and post-lunch blood sugar levels, suggesting prediabetes or diabetes. Elevated HbA1c further supports this. Lipid profile shows slightly elevated triglycerides and LDL cholesterol, increasing cardiovascular risk. Mild urinary tract infection is also observed.",\n  "Date of report": "24/03/2019",\n  "Precautions": [\n    "Follow a balanced diet low in carbohydrates and sugars.",\n    "Engage in regular physical activity.",\n    "Maintain healthy weight.",\n    "Drink plenty of water.",\n    "Monitor blood sugar levels regularly."\n  ],\n  "Possible-disease risks": [\n    "Prediabetes",\n    "Type 2 Diabetes",\n    "Dyslipidemia",\n    "Cardiovascular disease",\n    "Urinary Tract Infection"\n  ],\n  "Severity": 6,\n  "specialist": "Endocrinologist"\n}\n```\n',
                    },
                ],
            },
        ],
    });
    const valuej = JSON.stringify(jsonObject);
    const result = await chatSession.sendMessage(valuej);
    let analysisResult = result.response.text();
    analysisResult = analysisResult
        .replace('json', '')
        .replace('```', '')
        .replace('```', '')
        .replace('\n', '');

    const analysisjson = JSON.parse(analysisResult);
    const a = await report.findOne({ _id: id });
    a.precautions = analysisjson['Precautions'];
    a.summary = analysisjson['Short-Analysis'];
    a.possibleDiseases = analysisjson['Possible-disease risks'];
    a.severity = analysisjson['Severity'];
    a.specialistReq = analysisjson['specialist'];
    a.patient = name;
    a.patientId = patientId;
    a.file = fileId;
    a.valuesFromReport = jsonObject;
    a.dateOfReport = new Date();
    
    a.isVerified = false;

    await a.save();



    return res.json({ data: true })


}
async function run(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI("AIzaSyB3sZS0oKnuVSyjyZKxyvRjpKa7nIoKYGg");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "Instruction for Diet Plan Generation:\n\nInput Analysis:\n\nInterpret the user's health report to identify critical health markers, such as blood sugar levels, blood pressure, and respiratory health, particularly noting conditions like prediabetes, type 2 diabetes, or asthma.\nReview the user’s personal data, including lifestyle details such as occupation, hobbies, smoking habits, and any stated food allergies.\nConsider any predicted diseases mentioned in the prompt and incorporate them into the dietary recommendations to support both recovery and prevention.\nFocus on generating a diet plan that prioritizes fast recovery based on the input analysis, with specific recommendations suited to an Indian dietary context.\nOutput Structure:\n\nFoods to Avoid:\n\nDiet Explanation: Describe foods that could worsen the user's health conditions (e.g., high-glycemic foods for elevated blood sugar, dairy for asthma, or foods based on predicted diseases).\nAvoid-Food: List specific foods to avoid without additional explanation, using common Indian examples. Example: mango, white rice, white sugar, sugary beverages, fried snacks like samosas, jalebi, potatoes, and similar items.\nFoods to Eat:\n\nDiet Explanation: Recommend foods that support recovery, regulate blood sugar, and align with the user’s preferences and allergy considerations, factoring in predicted diseases.\nRecommended Food: Provide a specific list of beneficial foods using Indian-locality items without additional explanation. Example: spinach, methi (fenugreek leaves), whole grains like jowar, bajra, and ragi, lentils (dal), paneer, yogurt (if not allergic), fruits like guava and apples, and lean proteins like fish, chicken, and dals.\nMeal Timings:\n\nDiet Explanation: Suggest specific timings for meals such as morning, afternoon, evening, and night, tailored to the user’s blood sugar needs and predicted diseases for consistent energy levels.\nRecommended Food: List recommended foods for each mealtime without additional explanation, using examples suited to an Indian diet. Example: Morning - poha, upma with vegetables; Afternoon - dal, roti, sabzi with leafy greens; Evening - roasted chana, fruits like apple; Night - light khichdi with moong dal, or a simple vegetable soup.\nHealth-Specific Guidelines:\n\nFor Elevated Fasting and Post-Lunch Blood Sugar Levels:\n\nDiet Explanation: Recommend balanced meals low in refined sugars, high in fiber, proteins, and complex carbohydrates, with portion control to prevent blood sugar spikes.\nRecommended Food: Example list using Indian foods: bajra roti, whole wheat chapati, chana dal, green leafy vegetables like spinach, methi, rajma, masoor dal, and nuts like almonds (if not allergic).\nFor Asthma:\n\nDiet Explanation: Avoid allergens (e.g., dairy, if specified) and promote anti-inflammatory foods, using examples from Indian cuisine such as turmeric, ginger, and leafy greens.\nRecommended Food: Example list with Indian items: turmeric milk (if not allergic to dairy), tulsi (holy basil), ginger, spinach, mustard oil, curry leaves, and fresh seasonal fruits like papaya, and pomegranate.",
  });
  
  const generationConfig1 = {
    temperature: 0,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        "Foods to Avoid": {
          type: "object",
          properties: {
            "Diet-Explanation": {
              type: "string"
            },
            Avoid_food: {
              type: "string"
            }
          },
          required: [
            "Diet-Explanation",
            "Avoid_food"
          ]
        },
        "Foods to Eat": {
          type: "object",
          properties: {
            "Diet-Explanation": {
              type: "string"
            },
            "Recommended-Food": {
              type: "string"
            }
          },
          required: [
            "Diet-Explanation",
            "Recommended-Food"
          ]
        },
        "Meal Timings": {
          type: "object",
          properties: {
            morning: {
              type: "object",
              properties: {
                "Diet-Explanation": {
                  type: "string"
                },
                "Recommended-Food": {
                  type: "string"
                }
              },
              required: [
                "Diet-Explanation",
                "Recommended-Food"
              ]
            },
            afternoon: {
              type: "object",
              properties: {
                "Diet-Explanation": {
                  type: "string"
                },
                "Recommended-Food": {
                  type: "string"
                }
              },
              required: [
                "Diet-Explanation",
                "Recommended-Food"
              ]
            },
            evening: {
              type: "object",
              properties: {
                "Diet-Explanation": {
                  type: "string"
                },
                "Recommended-Food": {
                  type: "string"
                }
              },
              required: [
                "Diet-Explanation",
                "Recommended-Food"
              ]
            },
            night: {
              type: "object",
              properties: {
                "Diet-Explanation": {
                  type: "string"
                },
                "Recommended-Food": {
                  type: "string"
                }
              },
              required: [
                "Diet-Explanation",
                "Recommended-Food"
              ]
            }
          },
          required: [
            "morning",
            "afternoon",
            "evening",
            "night"
          ]
        },
        "health-Specific guidlines": {
          type: "string"
        }
      },
      required: [
        "Foods to Avoid",
        "Foods to Eat",
        "Meal Timings",
        "health-Specific guidlines"
      ]
    },
  };
    const chatSession = model.startChat({
      generationConfig1,
      history: [
        {
          role: "user",
          parts: [
            {text: "Analysis: The report shows elevated fasting and post-lunch blood sugar levels, indicating prediabetes or type 2 diabetes. This is concerning, especially considering the patient's existing asthma.\nuser-data:\ngender: male\nblood group: A+\nage:38\noccupation: teacher\nhobbies: reading,\nactivities and habits : gym, smoking.\nfood allergies: sea food, egg, vegetarian, spinach.\n"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "json\n{\"Foods to Avoid\": {\"Avoid_food\": \"White rice, white bread, refined flour (maida), sugary drinks, sweets, desserts, fried foods (samosas, pakoras, etc.), processed snacks, high-fat dairy products, red meat.\", \"Diet-Explanation\": \"These foods can worsen blood sugar control and may trigger inflammation, exacerbating both prediabetes/type 2 diabetes and asthma.  Avoiding these is crucial for managing both conditions.\"}, \"Foods to Eat\": {\"Diet-Explanation\": \"Focus on whole, unprocessed foods that are low in glycemic index and rich in fiber, protein, and healthy fats. These foods help regulate blood sugar levels, reduce inflammation, and support overall health. Since you are vegetarian and allergic to spinach and seafood, the recommendations below exclude these items.\", \"Recommended-Food\": \"Whole grains (jowar, bajra, ragi, brown rice), lentils (moong dal, masoor dal, toor dal, chana dal), vegetables (bottle gourd, ridge gourd, okra, cauliflower, cabbage, carrots, beans), fruits (apple, guava, pear, berries), nuts and seeds (almonds, walnuts, flaxseeds, chia seeds - if not allergic), low-fat dairy (paneer, yogurt - if tolerated), and healthy fats (mustard oil, coconut oil).\"}, \"Meal Timings\": {\"afternoon\": {\"Diet-Explanation\": \"A balanced lunch helps prevent a post-lunch blood sugar spike.\", \"Recommended-Food\": \"Roti/chapati made from whole grains (jowar, bajra, or ragi), a mixed vegetable curry, dal, and a side of salad.\"}, \"evening\": {\"Diet-Explanation\": \"A light and early dinner is recommended to improve blood sugar control and prevent nighttime spikes.\", \"Recommended-Food\": \"A small portion of roasted chana, a handful of nuts (if not allergic), or a cup of herbal tea.\"}, \"morning\": {\"Diet-Explanation\": \"Start your day with a fiber-rich breakfast to help regulate blood sugar levels.\", \"Recommended-Food\": \"Poha, upma with vegetables, or a besan chilla with whole wheat roti.\"}, \"night\": {\"Diet-Explanation\": \"A light dinner aids digestion and better blood sugar management overnight.\", \"Recommended-Food\": \"Moong dal khichdi or a light vegetable soup.\"}}, \"health-Specific guidlines\": \"For Elevated Blood Sugar: Choose complex carbohydrates over simple sugars. Include fiber-rich foods in every meal. Monitor portion sizes to manage calorie intake. For Asthma: Identify and avoid any potential food allergens. Incorporate anti-inflammatory foods like turmeric, ginger, and garlic into your diet. Quit smoking, as it can significantly worsen asthma symptoms.\"}\n\n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "Analysis: Urine culture shows a high count of Klebsiella oxytoca, indicating a urinary tract infection (UTI). The patient is resistant to all tested antibiotics.\npredicted outputs or diseases:\nUrinary Tract Infection (UTI)\nPyelonephritis (kidney infection)\nSepsis\n\nuser-data:\ngender: male\nblood group: A+\nage:58\noccupation: farmer.\nhobbies: empty.\nactivities and habits : gym, smoking, alcohol.\nfood allergies: sea food, egg, vegetarian, spinach."},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "json\n{\"Foods to Avoid\": {\"Avoid_food\": \"Sugar, artificial sweeteners, caffeine, alcohol, spicy foods, processed foods, and foods high in oxalates (spinach, nuts, etc.).\", \"Diet-Explanation\": \"These foods can irritate the urinary tract and potentially worsen the infection. Alcohol and caffeine are diuretics and can dehydrate, while high-oxalate foods may contribute to kidney stone formation, a risk with recurrent UTIs.  Since you are allergic to seafood, eggs, and spinach, and are vegetarian, these are already excluded.\"}, \"Foods to Eat\": {\"Diet-Explanation\": \"Focus on hydrating and nutrient-rich foods that support the immune system and promote urinary tract health.  The diet should also support overall health given the risks of pyelonephritis and sepsis.\", \"Recommended-Food\": \"Cranberries (unsweetened), blueberries, probiotics (yogurt, if tolerated), plenty of water, herbal teas (e.g., chamomile, dandelion - check for interactions with other medications), vitamin C-rich foods (lemon, amla), and vegetables like cucumber and carrots.\"}, \"Meal Timings\": {\"afternoon\": {\"Diet-Explanation\": \"A light and hydrating lunch is recommended.\", \"Recommended-Food\": \"Vegetable khichdi with buttermilk or coconut water.\"}, \"evening\": {\"Diet-Explanation\": \"Keep the evening meal light and easy to digest.\", \"Recommended-Food\": \"Moong dal soup or a small portion of brown rice with steamed vegetables.\"}, \"morning\": {\"Diet-Explanation\": \"Start the day with hydrating fluids and easily digestible foods.\", \"Recommended-Food\": \"Coconut water, herbal tea, or a small bowl of oatmeal with fruit (avoiding high oxalate options).\"}, \"night\": {\"Diet-Explanation\": \"Avoid heavy meals close to bedtime.\", \"Recommended-Food\": \"A small bowl of vegetable soup or a glass of buttermilk.\"}}, \"health-Specific guidlines\": \"Drink plenty of water throughout the day to flush out bacteria. Avoid holding urine for extended periods. Consider D-mannose supplements after consulting a healthcare professional.  Quit smoking and limit alcohol consumption as these habits weaken the immune system.  Since you are resistant to the tested antibiotics, it is crucial to follow up with your doctor immediately to discuss alternative treatment options and monitor for signs of pyelonephritis or sepsis (e.g., fever, chills, back pain, increased fatigue).\"}\n\n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "Analysis: The report shows slightly elevated Uric Acid, Triglycerides, and LDL Cholesterol, suggesting a potential risk for gout and cardiovascular disease. The slightly elevated CRP indicates possible inflammation. The patient has a history of vomitings, which should be investigated further. Overall, the report suggests a need for lifestyle modifications to manage potential health risks.\npredicted outputs or diseases:\nGout\nCardiovascular disease\nInflammation\nGastrointestinal issues\n\nuser-data:\ngender: male\nblood group: O+\nage:44\noccupation: software developer.\nhobbies: online games, watching movies.\nactivities and habits : empty.\nfood allergies: paneer."},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "json\n{\"Foods to Avoid\": {\"Avoid_food\": \"Red meat, organ meats, shellfish, high-purine vegetables (spinach, asparagus, cauliflower), sugary drinks, processed foods, alcohol, and high-fat dairy products (except paneer, due to allergy).\", \"Diet-Explanation\": \"These foods can worsen uric acid levels, triglycerides, LDL cholesterol, and inflammation, increasing the risk of gout and cardiovascular disease.  Limiting these is crucial for managing these conditions.\"}, \"Foods to Eat\": {\"Diet-Explanation\": \"Focus on a balanced diet rich in fruits, vegetables, whole grains, and lean protein.  This diet supports healthy uric acid levels, improves lipid profile, reduces inflammation, and promotes overall health.\", \"Recommended-Food\": \"Low-fat dairy (avoiding paneer due to allergy), fruits (cherries, berries), vegetables (broccoli, carrots, cucumber), whole grains (oats, brown rice), legumes, nuts (in moderation), seeds, and lean protein (fish, chicken breast).\"}, \"Meal Timings\": {\"afternoon\": {\"Diet-Explanation\": \"A balanced lunch helps manage calorie intake and prevents overeating.\", \"Recommended-Food\": \"Brown rice with dal and mixed vegetables, or a salad with grilled chicken/fish.\"}, \"evening\": {\"Diet-Explanation\": \"A light and early dinner aids digestion and prevents nighttime snacking.\", \"Recommended-Food\": \"A small portion of fruit salad or a handful of nuts.\"}, \"morning\": {\"Diet-Explanation\": \"Start your day with a fiber-rich breakfast to promote satiety and regulate blood sugar.\", \"Recommended-Food\": \"Oatmeal with berries and nuts, or whole-wheat toast with avocado.\"}, \"night\": {\"Diet-Explanation\": \"A light dinner supports healthy digestion and prevents acid reflux, especially considering the history of vomiting.\", \"Recommended-Food\": \"Vegetable soup, or a small portion of brown rice with steamed vegetables and lean protein.\"}}, \"health-Specific guidlines\": \"Maintain a healthy weight through regular exercise and a balanced diet.  Limit alcohol intake and avoid sugary drinks.  Stay hydrated by drinking plenty of water.  Manage stress through relaxation techniques.  The history of vomiting should be investigated by a doctor to rule out any underlying gastrointestinal issues.  Regularly monitor uric acid, triglyceride, and cholesterol levels.\"}\n\n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "Analysis:The patient has extremely elevated creatinine levels and a severely reduced eGFR, indicating severe kidney dysfunction. This could be due to chronic kidney disease, possibly exacerbated by spondylitis.\n\npredicted outputs or diseases:\nChronic Kidney Disease (Stage 5)\nKidney Failure\nSpondylitis-related kidney complications\n\nuser-data:\ngender: female\nblood group: B+\nage: 55\noccupation: house wife.\nhobbies: house farming, watching tv.\nactivities and habits : group dicusstions.\nfood allergies: egg."},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "json\n{\"Foods to Avoid\": {\"Avoid_food\": \"High-potassium foods (bananas, oranges, potatoes, tomatoes), high-phosphorus foods (dairy products, nuts, seeds, beans), processed foods, canned foods, salted snacks, and foods high in sodium.\", \"Diet-Explanation\": \"With severely reduced kidney function, it's crucial to limit potassium, phosphorus, and sodium intake to prevent further complications.  These restrictions help reduce the strain on the kidneys.\"}, \"Foods to Eat\": {\"Diet-Explanation\": \"Focus on low-potassium, low-phosphorus, and low-sodium options to support kidney function.  The diet should be tailored to provide adequate nutrition while minimizing strain on the kidneys.\", \"Recommended-Food\": \"Low-potassium fruits (apples, berries, grapes), low-potassium vegetables (cabbage, carrots, cauliflower), refined grains (white rice, white bread), and limited portions of lean protein (egg whites - as eggs are not tolerated).\"}, \"Meal Timings\": {\"afternoon\": {\"Diet-Explanation\": \"A light lunch with controlled portions is essential.\", \"Recommended-Food\": \"Small portion of rice with cooked vegetables.\"}, \"evening\": {\"Diet-Explanation\": \"A very light early dinner is recommended.\", \"Recommended-Food\": \"A small portion of apple or berries.\"}, \"morning\": {\"Diet-Explanation\": \"Start the day with a kidney-friendly breakfast.\", \"Recommended-Food\": \"Rice porridge or a small portion of white bread with limited jam.\"}, \"night\": {\"Diet-Explanation\": \"Avoid eating close to bedtime.\", \"Recommended-Food\": \"If needed, a very small portion of rice.\"}}, \"health-Specific guidlines\": \"Closely monitor fluid intake as directed by the healthcare provider.  Restrict protein intake as per the doctor's recommendation.  Regularly monitor blood pressure and potassium levels.  Consult a renal dietitian for personalized dietary guidance.  The patient's spondylitis should also be managed to prevent further kidney complications.  Given the severity of kidney dysfunction, it's crucial to discuss treatment options with a nephrologist, including dialysis or transplant possibilities.\"}\n\n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "\nAnalysis:The report shows mild anemia with a low hemoglobin level. Elevated ESR suggests inflammation. Positive Salmonella typhi 'O' and 'H' antigens indicate a possible past exposure to typhoid fever. The urine analysis reveals a mild urinary tract infection.\n\npredicted outputs or diseases:\nAnemia\nInflammation\nUrinary Tract Infection\nPast Typhoid Fever Exposure\n\nuser-data:\n\ngender: female\nblood group: O+\nage: 55\noccupation :  doctor.\nhobbies: yoga.\nactivities and habits : alcohol.\nfood allergies : cheese, potato."},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "json\n{\"Foods to Avoid\": {\"Avoid_food\": \"Alcohol, caffeine, spicy foods, processed foods, sugary drinks, high-fat dairy (cheese is already excluded due to allergy), and potentially irritating foods like citrus fruits and tomatoes (if they exacerbate UTI symptoms).\", \"Diet-Explanation\": \"Alcohol can interfere with iron absorption and worsen anemia.  Irritating foods can exacerbate UTI symptoms.  Processed foods, sugary drinks, and high-fat dairy can contribute to inflammation.\"}, \"Foods to Eat\": {\"Diet-Explanation\": \"Focus on iron-rich foods, hydrating fluids, and foods that support the immune system and urinary tract health.  The diet should also be anti-inflammatory.  Cheese and potatoes are excluded due to your allergies.\", \"Recommended-Food\": \"Iron-rich foods:  Beetroot, spinach, lentils, beans, jaggery, raisins, dates.  Hydrating fluids: Water, coconut water, herbal teas.  Immune-boosting and UTI-friendly foods: Cranberries, blueberries, yogurt (if tolerated), whole grains, fruits (excluding citrus if irritating), vegetables (excluding potatoes).\"}, \"Meal Timings\": {\"afternoon\": {\"Diet-Explanation\": \"A balanced and hydrating lunch.\", \"Recommended-Food\": \"Lentil soup with whole-grain bread, or a salad with beans and allowed vegetables.\"}, \"evening\": {\"Diet-Explanation\": \"A light and early dinner to avoid putting stress on the digestive system.\", \"Recommended-Food\": \"Steamed vegetables with brown rice, or a small portion of chicken/fish with quinoa.\"}, \"morning\": {\"Diet-Explanation\": \"Start your day with iron-rich and hydrating foods.\", \"Recommended-Food\": \"Oatmeal with berries and nuts, or a smoothie with spinach, beetroot, and fruits.\"}, \"night\": {\"Diet-Explanation\": \"A light dinner that won't irritate the bladder.\", \"Recommended-Food\": \"Yogurt with fruit, or a small portion of brown rice with steamed vegetables.\"}}, \"health-Specific guidlines\": \"Limit alcohol consumption as it can worsen anemia and inflammation.  Stay hydrated.  Consult a doctor for appropriate treatment for the UTI and to discuss the past typhoid exposure.  Regularly monitor your hemoglobin levels and ESR.\"}\n\n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "Analysis:The report shows slightly elevated blood sugar levels, suggesting prediabetes or early-stage diabetes. Elevated HbA1c further supports this. Mildly elevated CRP indicates possible inflammation. Low vitamin D levels are observed. Lipid profile shows slightly elevated triglycerides, increasing cardiovascular risk. Overall, the report suggests a need for lifestyle modifications and monitoring for potential health issues.\n\npredicted outputs or diseases:\nPrediabetes\nType 2 Diabetes\nLow Vitamin D\nDyslipidemia\nCardiovascular disease\nInflammation\n\nuser-data:\ngender: male\nblood group: O+\nage: 25\noccupation: plumber.\nhobbies: cricket.\nactivities and habits : alcohol.\nfood allergies: empty."},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "json\n{\"Foods to Avoid\": {\"Avoid_food\": \"Sugary drinks, processed foods, refined grains (white bread, white rice), sweets, desserts, fried foods, and excessive saturated and unhealthy fats.\", \"Diet-Explanation\": \"These foods can worsen blood sugar control, increase inflammation, and negatively impact lipid profile, increasing the risk of diabetes, cardiovascular disease, and other related health issues.\"}, \"Foods to Eat\": {\"Diet-Explanation\": \"Focus on whole, unprocessed foods that are low in glycemic index and rich in fiber, protein, and healthy fats. These foods help regulate blood sugar levels, improve lipid profile, reduce inflammation, and promote overall health.\", \"Recommended-Food\": \"Whole grains (brown rice, quinoa, oats), fruits (berries, apples, pears), vegetables (leafy greens, broccoli, carrots), legumes, nuts, seeds, lean protein (fish, chicken breast), and healthy fats (avocado, olive oil).\"}, \"Meal Timings\": {\"afternoon\": {\"Diet-Explanation\": \"A balanced lunch helps prevent blood sugar spikes and provides sustained energy.\", \"Recommended-Food\": \"Brown rice with dal and mixed vegetables, or a salad with grilled chicken/fish.\"}, \"evening\": {\"Diet-Explanation\": \"A light and early dinner aids digestion and prevents nighttime snacking.\", \"Recommended-Food\": \"A small portion of fruit salad or a handful of nuts.\"}, \"morning\": {\"Diet-Explanation\": \"Start your day with a fiber-rich breakfast to regulate blood sugar and promote satiety.\", \"Recommended-Food\": \"Oatmeal with berries and nuts, or whole-wheat toast with avocado.\"}, \"night\": {\"Diet-Explanation\": \"A light dinner supports healthy digestion and prevents overeating.\", \"Recommended-Food\": \"Vegetable soup, or a small portion of brown rice with steamed vegetables and lean protein.\"}}, \"health-Specific guidlines\": \"Limit alcohol intake as it can interfere with blood sugar control and contribute to inflammation. Engage in regular physical activity to improve insulin sensitivity, manage weight, and reduce cardiovascular risk.  Ensure adequate sleep to support overall health and metabolic function.  Increase sun exposure or consider vitamin D supplementation after consulting a doctor to address the deficiency.  Regularly monitor blood sugar levels and lipid profile.\"}\n\n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "\nAnalysis:The report shows elevated CRP and LP(A) levels, indicating potential inflammation and increased cardiovascular risk. Mildly elevated liver enzymes suggest possible liver inflammation. Slightly elevated uric acid and borderline low vitamin D levels are noted. Thyroid function appears normal. Urine analysis is unremarkable.\n\npredicted outputs or diseases:\nInflammation\nCardiovascular disease\nLiver inflammation (Hepatitis)\nGout\nVitamin D deficiency\n\nuser-data:\ngender: female\nblood group: B+\nage: 21\noccupation: student.\nhobbies: house farming, watching tv.\nactivities and habits :  hockey, swimming.\nfood allergies:  fast food."},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "json\n{\"Foods to Avoid\": {\"Avoid_food\": \"Fried foods, processed foods, sugary drinks, red meat, organ meats, shellfish, and foods high in purines (spinach, asparagus, cauliflower).  Fast food is already excluded due to your allergy.\", \"Diet-Explanation\": \"These foods can worsen inflammation, increase cardiovascular risk, and may contribute to liver inflammation and elevated uric acid levels.\"}, \"Foods to Eat\": {\"Diet-Explanation\": \"Focus on a balanced diet rich in anti-inflammatory foods, antioxidants, and nutrients that support liver health.  The diet should also promote healthy uric acid levels and provide adequate vitamin D.\", \"Recommended-Food\": \"Fruits (berries, cherries), vegetables (broccoli, carrots, leafy greens), whole grains, legumes, nuts (in moderation), seeds, lean protein (fish, chicken breast), and healthy fats (olive oil, avocado).\"}, \"Meal Timings\": {\"afternoon\": {\"Diet-Explanation\": \"A balanced lunch with anti-inflammatory foods.\", \"Recommended-Food\": \"Salad with grilled chicken/fish, or a lentil soup with whole-grain bread.\"}, \"evening\": {\"Diet-Explanation\": \"A light and early dinner to support liver detoxification.\", \"Recommended-Food\": \"Steamed vegetables with brown rice, or a small portion of fruit salad.\"}, \"morning\": {\"Diet-Explanation\": \"Start your day with antioxidant-rich foods.\", \"Recommended-Food\": \"Oatmeal with berries and nuts, or a smoothie with spinach and fruits.\"}, \"night\": {\"Diet-Explanation\": \"A light dinner to avoid overworking the liver.\", \"Recommended-Food\": \"Vegetable soup, or a small portion of quinoa with steamed vegetables.\"}}, \"health-Specific guidlines\": \"Engage in regular physical activity, including your hobbies of hockey and swimming, to reduce inflammation and improve cardiovascular health.  Limit alcohol consumption as it can contribute to liver inflammation.  Ensure adequate sleep to support liver regeneration and overall health.  Increase sun exposure or consider vitamin D supplementation after consulting a doctor.  Monitor CRP, LP(a), liver enzymes, uric acid, and vitamin D levels regularly.\"}\n\n"},
          ],
        },
      ],
    });
  
    const result = await chatSession.sendMessage(prompt);
    console.log(result.response);
    return result.response;
  }



const llmanalysis = async (req, res) => {
    
    const { fileId, patientId, name } = req.body;
    let { jsonObject } = req.body;
    let report1 = new report({});
    report1 = await report1.save();
    const id = report1._id;
    const patientDetails = await patient.findOne({ _id: patientId });
    const listofreports = patientDetails.reportsList || [];
    listofreports.push(id);
    patientDetails.reportsList = listofreports;
    patientDetails.save();

    const apiKey = process.env.API_KEY_2;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        safetySettings: safety_settings,
        systemInstruction:
            'you are a medical reports analyzer which analyze the reports and give output in a specific format where the  Keys are summary of analysis, Date of report , Precautions, Possible disease risks, severity rating out of 10, which specialist(one or less) is needed. the format of output should be in:  Short-Analysis:String,Precautions:Array,Possible-disease risks:Array,Severity:int,specialist:String as json format\n',

    });
    jsonObject["chronic conditions"] = await patient.findOne({ _id: patientId }).select({ 'chronics': 1, '-_id': 1 });

    const generationConfig = {
        temperature: 0,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: 'text/plain',
    };
    const chatSession = model.startChat({
        generationConfig,

        history: [
            {
                role: 'user',
                parts: [
                    {
                        text: '{\n  "date": "24/03/2019",\n  "Uric Acid": "4.0 mg/dL",\n  "Urea": "16 mg/dL",\n  "Creatinine": "0.5 mg/dL",\n  "Sodium": "138 mmol/L",\n  "Potassium": "5.0 mmol/L",\n  "Chlorides": "101 mmol/L",\n  "Fasting Plasma Glucose": "201 mg/dL",\n  "2 hrs Post Lunch Plasma Glucose": "212 mg/dL",\n  "Haemoglobin": "11.2 g/dL",\n  "Total RBC Count": "4.38 millions/cumm",\n  "Packed Cell Volume / Hematocrit": "34.2 Vol%",\n  "MCV": "78.1 fl",\n  "MCH": "25.7 pg",\n  "MCHC": "32.9 gm/dL",\n  "RDW": "16.8 %",\n  "Total WBC Count": "6400 Cells/cumm",\n  "Neutrophils": "60 %",\n  "Lymphocytes": "28 %",\n  "Eosinophils": "2 %",\n  "Monocytes": "9 %",\n  "Basophils": "1 %",\n  "Absolute Neutrophil Count": "3900 Cells/cumm",\n  "Absolute Lymphocyte Count": "1800 Cells/cumm",\n  "Absolute Eosinophil Count": "100 Cells/cumm",\n  "Absolute Monocyte Count": "600 Cells/cumm",\n  "Platelet Count": "427000 /cumm",\n  "RBC": "Normocytic Normochromic with mild anisocytosis",\n  "WBC": "Normal in morphology,maturity and distribution",\n  "Platelets": "Adequate",\n  "Colour": "Pale Yellow",\n  "Appearance": "Clear",\n  "Specific Gravity": "1.010",\n  "Reaction/pH": "Alkaline (7.5)",\n  "Protein": "Nil",\n  "Glucose": "Nil",\n  "Urobilinogen": "Normal",\n  "Bilirubin": "Negative",\n  "Ketones": "Negative",\n  "Nitrites": "Negative",\n  "Pus Cells": "1-2/HPF",\n  "R.B.C": "Nil",\n  "Epithelial Cells": "1-2/HPF",\n  "Casts": "Nil",\n  "Crystals": "Nil",\n  "Serum Status": "Clear",\n  "Triglycerides": "212 mg/dL",\n  "Total Cholesterol": "161 mg/dL",\n  "LDL Cholesterol": "83 mg/dL",\n  "HDL Cholesterol": "36 mg/dL",\n  "VLDL": "42 mg/dL",\n  "Total Cholesterol/HDL Cholesterol Ratio": "4.47",\n  "LDL Cholesterol/HDL Cholesterol Ratio": "2.29",\n  "Glycosylated Haemoglobin": "8.3 %"\n}\n',
                    },
                ],
            },
            {
                role: 'model',
                parts: [
                    {
                        text: '```json\n{\n  "Short-Analysis": "The report indicates borderline high fasting and post-lunch blood sugar levels, suggesting prediabetes or diabetes. Elevated HbA1c further supports this. Lipid profile shows slightly elevated triglycerides and LDL cholesterol, increasing cardiovascular risk. Mild urinary tract infection is also observed.",\n  "Date of report": "24/03/2019",\n  "Precautions": [\n    "Follow a balanced diet low in carbohydrates and sugars.",\n    "Engage in regular physical activity.",\n    "Maintain healthy weight.",\n    "Drink plenty of water.",\n    "Monitor blood sugar levels regularly."\n  ],\n  "Possible-disease risks": [\n    "Prediabetes",\n    "Type 2 Diabetes",\n    "Dyslipidemia",\n    "Cardiovascular disease",\n    "Urinary Tract Infection"\n  ],\n  "Severity": 6,\n  "specialist": "Endocrinologist"\n}\n```\n',
                    },
                ],
            },
        ],
    });
    const valuej = JSON.stringify(jsonObject);
    const result = await chatSession.sendMessage(valuej);
    let analysisResult = result.response.text();
    analysisResult = analysisResult
        .replace('json', '')
        .replace('```', '')
        .replace('```', '')
        .replace('\n', '');

    const analysisjson = JSON.parse(analysisResult);
    const a = await report.findOne({ _id: id });
    a.precautions = analysisjson['Precautions'];
    a.summary = analysisjson['Short-Analysis'];
    a.possibleDiseases = analysisjson['Possible-disease risks'];
    a.severity = analysisjson['Severity'];
    a.specialistReq = analysisjson['specialist'];
    a.patient = name;
    a.patientId = patientId;
    a.file = fileId;
    a.valuesFromReport = jsonObject;
    a.dateOfReport = new Date();
    a.isVerified = false;


    const prompt="Analysis:\n"+analysisjson['Short-Analysis']+"predictions:\n"+analysisjson['Possible-disease risks']+"user-data:\n"+JSON.stringify(patientDetails)+"hobbies: gym,occupation:farmer,activities:alcohol,food allergies:yogurt";
    console.log("sjkldjsioipoewio   \n\n\n");
    const Diet=await run(prompt);
    const jsonDiet=Diet.text();
    let cleanString = jsonDiet
            .trim()                              // Remove leading/trailing whitespace
            .replace(/^[\n\r]+|[\n\r]+$/g, '')   // Remove leading/trailing newlines
            .replace(/^\s*```json\s*/, '')       // Remove ```json prefix if present
            .replace(/\s*```\s*$/, ''); 
    finalfood=JSON.parse(cleanString)
console.log(finalfood)
    a.Diet=finalfood;
    await a.save();



    return res.json({ reportId : id })


}
const MedicalChatbotDoctor = async (req, res) => {
    const { input } = req.body;

  const apiKey = process.env.API_KEY_3;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "your name is althea a personalized chatbot for patients, designed to provide accurate, concise, and reliable medical information. Respond only to medical questions, focusing on symptoms, conditions, treatments, general health advice, and recommending appropriate diagnostic tests based on the symptoms provided. Keep answers brief, clear, and easy to read, fitting within a standard chatbot window. Do not offer personalized diagnoses, treatment plans, or alternative therapies. For non-medical queries or requests for alternative treatments, politely clarify that Luna is a medical information chatbot and cannot assist with those topics. Always encourage users to consult a healthcare professional for personalized advice, especially for serious concerns or emergencies. Maintain a professional yet approachable tone to ensure user-friendly communication",
  });
  
  const generationConfig = {
    temperature: 0,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  
    const chatSession = model.startChat({
      generationConfig,
   // safetySettings: Adjust safety settings
   // See https://ai.google.dev/gemini-api/docs/safety-settings
      history: [
        {
          role: "user",
          parts: [
            {text: "hello"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "Hello! How can I help you with your health questions today? \n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "i am suffering from fever and backpain what might be the issue"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "Fever and back pain can be symptoms of various conditions, ranging from muscle strain to infection. It's impossible to diagnose without a proper medical examination. \n\nIt's crucial to consult a doctor for a diagnosis and personalized treatment plan. They can assess your symptoms, medical history, and perform necessary tests. \n\n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "can you tell me the sympots of fever"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "Common symptoms of fever include:\n\n* Elevated body temperature (above 98.6°F or 37°C)\n* Chills\n* Sweating\n* Headache\n* Muscle aches\n* Fatigue\n* Loss of appetite \n\nIf you are experiencing a high fever or concerning symptoms, consult a doctor immediately. \n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "who is the prime minister of india"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "I am a medical information chatbot and cannot provide answers to non-medical questions. \n\nIf you have any health-related questions, feel free to ask! \n"},
          ],
        },
      ],
    });
  
    const result = await chatSession.sendMessage(input ? input : "hi");
    res.send(result.response.text());
    
  }

  const MedicalChatbotPatient = async (req, res) => {
    const { input } = req.body;

  const apiKey = "AIzaSyBcofjoTX6q5HQzwe_LUJw5GpbQzeoQ6-Q";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "your name is luna a personalized chatbot for patients, designed to provide accurate, concise, and reliable medical information. Respond only to medical questions, focusing on symptoms, conditions, treatments, general health advice, and recommending appropriate diagnostic tests based on the symptoms provided. Keep answers brief, clear, and easy to read, fitting within a standard chatbot window. Do not offer personalized diagnoses, treatment plans, or alternative therapies. For non-medical queries or requests for alternative treatments, politely clarify that Luna is a medical information chatbot and cannot assist with those topics. Always encourage users to consult a healthcare professional for personalized advice, especially for serious concerns or emergencies. Maintain a professional yet approachable tone to ensure user-friendly communication",
  });
  
  const generationConfig = {
    temperature: 0,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  
    const chatSession = model.startChat({
      generationConfig,
   // safetySettings: Adjust safety settings
   // See https://ai.google.dev/gemini-api/docs/safety-settings
      history: [
        {
          role: "user",
          parts: [
            {text: "hello"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "Hello! How can I help you with your health questions today? \n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "i am suffering from fever and backpain what might be the issue"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "Fever and back pain can be symptoms of various conditions, ranging from muscle strain to infection. It's impossible to diagnose without a proper medical examination. \n\nIt's crucial to consult a doctor for a diagnosis and personalized treatment plan. They can assess your symptoms, medical history, and perform necessary tests. \n\n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "can you tell me the sympots of fever"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "Common symptoms of fever include:\n\n* Elevated body temperature (above 98.6°F or 37°C)\n* Chills\n* Sweating\n* Headache\n* Muscle aches\n* Fatigue\n* Loss of appetite \n\nIf you are experiencing a high fever or concerning symptoms, consult a doctor immediately. \n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "who is the prime minister of india"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "I am a medical information chatbot and cannot provide answers to non-medical questions. \n\nIf you have any health-related questions, feel free to ask! \n"},
          ],
        },
      ],
    });
  
    const result = await chatSession.sendMessage(input ? input : "hi");
    res.send(result.response.text());
    
  }
  

const getParametersImage = async (req, res) => {

   

    const apiKey = "AIzaSyCqX6XEJ9k1mGC0Q_BP_WblLxSomZrwPPE";
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-exp-0801",
        systemInstruction: "fetch the  test report  and you should give response as health parameter and it's value as key value pairs  and if it is invalid health report then give medicalQuery as false in response include all health parameters in response",
    });

    const generationConfig = {
        temperature: 0,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      };


    
    const base64Image = req.body.fileData;
    const mimeType = req.body.contentType;
    try {
        if (!base64Image && !mimeType) {
            return res.status(404).json({ error: 'File not found' });
        }



        const chatSession = model.startChat({
            generationConfig,
            history: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Image
                            }
                        },
                        { text: "the user will give you the  test report  and you should give response as health parameter and it's value as key value pair in a object and also fetch date and include in the output at first position." },
                    ],
                },
                {
                    role: 'model',
                    parts: [
                        {
                            text: '```json\n{\n"medicalQuery":"yes",\n  "date": "24/03/2019",\n  "Uric Acid": "4.0 mg/dL",\n  "Urea": "16 mg/dL",\n  "Creatinine": "0.5 mg/dL",\n  "Sodium": "138 mmol/L",\n  "Potassium": "5.0 mmol/L",\n  "Chlorides": "101 mmol/L",\n  "Fasting Plasma Glucose": "201 mg/dL",\n  "2 hrs Post Lunch Plasma Glucose": "212 mg/dL",\n  "Haemoglobin": "11.2 g/dL",\n  "Total RBC Count": "4.38 millions/cumm",\n  "Packed Cell Volume / Hematocrit": "34.2 Vol%",\n  "MCV": "78.1 fl",\n  "MCH": "25.7 pg",\n  "MCHC": "32.9 gm/dL",\n  "RDW": "16.8 %",\n  "Total WBC Count": "6400 Cells/cumm",\n  "Neutrophils": "60 %",\n  "Lymphocytes": "28 %",\n  "Eosinophils": "2 %",\n  "Monocytes": "9 %",\n  "Basophils": "1 %",\n  "Absolute Neutrophil Count": "3900 Cells/cumm",\n  "Absolute Lymphocyte Count": "1800 Cells/cumm",\n  "Absolute Eosinophil Count": "100 Cells/cumm",\n  "Absolute Monocyte Count": "600 Cells/cumm",\n  "Platelet Count": "427000 /cumm",\n  "RBC": "Normocytic Normochromic with mild anisocytosis",\n  "WBC": "Normal in morphology,maturity and distribution",\n  "Platelets": "Adequate",\n  "Colour": "Pale Yellow",\n  "Appearance": "Clear",\n  "Specific Gravity": "1.010",\n  "Reaction/pH": "Alkaline (7.5)",\n  "Protein": "Nil",\n  "Glucose": "Nil",\n  "Urobilinogen": "Normal",\n  "Bilirubin": "Negative",\n  "Ketones": "Negative",\n  "Nitrites": "Negative",\n  "Pus Cells": "1-2/HPF",\n  "R.B.C": "Nil",\n  "Epithelial Cells": "1-2/HPF",\n  "Casts": "Nil",\n  "Crystals": "Nil",\n  "Serum Status": "Clear",\n  "Triglycerides": "212 mg/dL",\n  "Total Cholesterol": "161 mg/dL",\n  "LDL Cholesterol": "83 mg/dL",\n  "HDL Cholesterol": "36 mg/dL",\n  "VLDL": "42 mg/dL",\n  "Total Cholesterol/HDL Cholesterol Ratio": "4.47",\n  "LDL Cholesterol/HDL Cholesterol Ratio": "2.29",\n  "Glycosylated Haemoglobin": "8.3 %"\n}\n```',
                        },
                    ],
                }
            ],
        });

        const result = await chatSession.sendMessage("fetch the  test report  and you should give response as health parameter and it's value as key value pair");
        res.json({parameters : result.response.text()})
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the image' });
    }


}


const checkImage = async (req, res) => {
  const apiKey = "AIzaSyBLOumZqL2PKY_uUaXHEzTgg9yPm0RBiks";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Changed to correct model for image processing
  });

  const generationConfig = {
      temperature: 0,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: {
          type: "object",
          properties: {
              validMedicalImage: {
                  type: "boolean"
              },
              typeofImage: {
                  type: "object",
                  properties: {
                      brain: {
                          type: "boolean"
                      },
                      breast: {
                          type: "boolean"
                      },
                      lungs: {
                          type: "boolean"
                      },
                      bones: {
                          type: "boolean"
                      },
                      heart: {
                          type: "boolean"
                      }
                  },
                  required: [
                      "brain",
                      "breast",
                      "lungs",
                      "bones",
                      "heart"
                  ]
              }
          },
          required: [
              "validMedicalImage",
              "typeofImage"
          ]
      },
  };

  try {
      // Get base64Image and mimeType from request
      const { data, mimeType } = req.body.photo;

      if (!data || !mimeType) {
          return res.status(400).json({ error: 'Base64 image data and MIME type are required' });
      }

      // Prepare image data for Gemini
      const imageParts = [{
          inlineData: {
              data: data,
              mimeType: mimeType
          }
      }];

      // Add the prompt text
      const prompt = "Analyze this medical image and determine its type. Return a JSON response with the following structure: {\"validMedicalImage\": boolean, \"typeofImage\": {\"brain\": boolean, \"breast\": boolean, \"lungs\": boolean, \"bones\": boolean, \"heart\": boolean}}";

      // Generate content with image and prompt
      const result = await model.generateContent([
          ...imageParts,
          { text: prompt }
      ]);

      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      let parsedResponse;
      try {
          // Extract JSON from the response if it's wrapped in code blocks
          const jsonMatch = text.match(/```json\n([\s\S]*)\n```/) || text.match(/{[\s\S]*}/);
          const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
          parsedResponse = JSON.parse(jsonString);
      } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          return res.status(500).json({ error: 'Failed to parse model response' });
      }

      // Return the parsed response
      console.log(parsedResponse)
  
      res.json({ parameters: parsedResponse });

  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while processing the image' });
  }
};













module.exports = { getParameters, analysis, MedicalChatbotDoctor, getParametersImage ,llmanalysis,checkImage,MedicalChatbotPatient}