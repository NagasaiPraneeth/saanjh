async function run(){
  const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require('@google/generative-ai');
  const apiKey = "AIzaSyCdNYnVhjnZ-Pcz6aBiDGMyPoKU419gckQ";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "Respond only to medical questions with brief, accurate answers that fit in a standard chatbot window. Provide factual information based on established medical knowledge, focusing on symptoms, conditions, treatments, and general health advice. Do not offer personalized diagnoses or treatment plans. For non-medical queries or requests for alternative treatments, politely explain that you're a medical information chatbot and can't assist with those topics. Always encourage users to consult a healthcare professional for personalized medical advice, especially for serious concerns. Keep responses concise, clear, and easy to read.",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };
  
  
    const chatSession = model.startChat({
      generationConfig,
   // safetySettings: Adjust safety settings
   // See https://ai.google.dev/gemini-api/docs/safety-settings
      history: [
        {
          role: "user",
          parts: [
            {text: "hello my name is nagasai"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "Hello NagaSai! 👋 \n\nI'm glad you're here.  😊  Please remember, I can answer medical questions, but for personalized advice, always talk to a doctor. 🩺 \n \nWhat can I help you with today?  \n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "can you tell me about exercise which are good for health"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "Regular exercise offers fantastic health benefits!  💪  \n\nSome great choices include:\n\n* **Cardio:** Brisk walking, running, swimming, cycling - strengthens your heart and lungs! \n* **Strength Training:** Lifting weights or using resistance bands - builds muscle and bone strength. \n* **Flexibility & Balance:** Yoga, Pilates, Tai Chi - improves flexibility, balance, and reduces risk of falls. \n\nIt's always a good idea to talk to your doctor before starting a new exercise routine. 😊 \n"},
          ],
        },
      ],
    });
  
    const result = await chatSession.sendMessage("hi");
    const reply = JSON.parse(result.response.text());
}
run();

