/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "you are a medical reports analyzer which analyze the reports and give output in a specific format where the  Keys are summary of analysis, Date of report , Precautions, Possible disease risks, severity rating out of 10, which specialist(one or less) is needed. the format of output should be in:  Short-Analysis:String,Precautions:Array,Possible-disease risks:Array,Severity:int,specialist:String as json format\n",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run() {
  const chatSession = model.startChat({
    generationConfig,
 // safetySettings: Adjust safety settings
 // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [
      {
        role: "user",
        parts: [
          {text: "{\n  \"date\": \"24/03/2019\",\n  \"Uric Acid\": \"4.0 mg/dL\",\n  \"Urea\": \"16 mg/dL\",\n  \"Creatinine\": \"0.5 mg/dL\",\n  \"Sodium\": \"138 mmol/L\",\n  \"Potassium\": \"5.0 mmol/L\",\n  \"Chlorides\": \"101 mmol/L\",\n  \"Fasting Plasma Glucose\": \"201 mg/dL\",\n  \"2 hrs Post Lunch Plasma Glucose\": \"212 mg/dL\",\n  \"Haemoglobin\": \"11.2 g/dL\",\n  \"Total RBC Count\": \"4.38 millions/cumm\",\n  \"Packed Cell Volume / Hematocrit\": \"34.2 Vol%\",\n  \"MCV\": \"78.1 fl\",\n  \"MCH\": \"25.7 pg\",\n  \"MCHC\": \"32.9 gm/dL\",\n  \"RDW\": \"16.8 %\",\n  \"Total WBC Count\": \"6400 Cells/cumm\",\n  \"Neutrophils\": \"60 %\",\n  \"Lymphocytes\": \"28 %\",\n  \"Eosinophils\": \"2 %\",\n  \"Monocytes\": \"9 %\",\n  \"Basophils\": \"1 %\",\n  \"Absolute Neutrophil Count\": \"3900 Cells/cumm\",\n  \"Absolute Lymphocyte Count\": \"1800 Cells/cumm\",\n  \"Absolute Eosinophil Count\": \"100 Cells/cumm\",\n  \"Absolute Monocyte Count\": \"600 Cells/cumm\",\n  \"Platelet Count\": \"427000 /cumm\",\n  \"RBC\": \"Normocytic Normochromic with mild anisocytosis\",\n  \"WBC\": \"Normal in morphology,maturity and distribution\",\n  \"Platelets\": \"Adequate\",\n  \"Colour\": \"Pale Yellow\",\n  \"Appearance\": \"Clear\",\n  \"Specific Gravity\": \"1.010\",\n  \"Reaction/pH\": \"Alkaline (7.5)\",\n  \"Protein\": \"Nil\",\n  \"Glucose\": \"Nil\",\n  \"Urobilinogen\": \"Normal\",\n  \"Bilirubin\": \"Negative\",\n  \"Ketones\": \"Negative\",\n  \"Nitrites\": \"Negative\",\n  \"Pus Cells\": \"1-2/HPF\",\n  \"R.B.C\": \"Nil\",\n  \"Epithelial Cells\": \"1-2/HPF\",\n  \"Casts\": \"Nil\",\n  \"Crystals\": \"Nil\",\n  \"Serum Status\": \"Clear\",\n  \"Triglycerides\": \"212 mg/dL\",\n  \"Total Cholesterol\": \"161 mg/dL\",\n  \"LDL Cholesterol\": \"83 mg/dL\",\n  \"HDL Cholesterol\": \"36 mg/dL\",\n  \"VLDL\": \"42 mg/dL\",\n  \"Total Cholesterol/HDL Cholesterol Ratio\": \"4.47\",\n  \"LDL Cholesterol/HDL Cholesterol Ratio\": \"2.29\",\n  \"Glycosylated Haemoglobin\": \"8.3 %\"\n   \"Current medications\": \"Vitamin c\",\n    \"chronic conditions\": \"obesity\",\n}\n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "```json\n{\n  \"Short-Analysis\": \"The report indicates borderline high fasting and post-meal blood sugar levels, suggesting prediabetes or diabetes. Elevated HbA1c further supports this.  The patient also has high cholesterol, particularly high LDL and low HDL, increasing cardiovascular risks. Mild urinary tract infection is also observed.\",\n  \"Date of report\": \"24/03/2019\",\n  \"Precautions\": [\n    \"Follow a balanced diet low in carbohydrates and unhealthy fats.\",\n    \"Engage in regular physical activity.\",\n    \"Maintain healthy weight.\",\n    \"Monitor blood sugar levels regularly.\",\n    \"Drink plenty of water.\"\n  ],\n  \"Possible-disease risks\": [\n    \"Diabetes\",\n    \"Hypercholesterolemia\",\n    \"Cardiovascular disease\",\n    \"Urinary Tract Infection\"\n  ],\n  \"Severity\": 7,\n  \"specialist\": \"Endocrinologist\"\n}\n```\n"},
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
}

run();