const { GoogleGenAI } = require('@google/genai');
const { conceptExplainPrompt, questionAnswerPrompt} = require('../utils/prompts');

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

 
const generateInterviewQuestion = async (req, res) => {
    try {
        const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

        if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const prompt = questionAnswerPrompt({
            role,
            experience,
            topicsToFocus,
            numberOfQuestions
        });

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite',
            contents: prompt,
        });

        const rawText = response.text;
        const cleanedText = rawText.replace(/^```json\s*/,"").replace(/```$/,"").trim();

        
        const data = JSON.parse(cleanedText);
        if (!Array.isArray(data)) {
            return res.status(500).json({ message: "AI did not return an array of questions." });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error("error while generating question", error);
        res.status(500).json({
            message: 'Failed to generate questions',
            error: error.message,
        });
    }
};
 
const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const prompt = conceptExplainPrompt(question);

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: prompt,
      maxOutputTokens: 800,
    });

    const rawText = response.text || "";
    const cleanedText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

    let data;
    try {
      data = JSON.parse(cleanedText);
      // Ensure AI returned explanation for the current question
      if (!data.explanation || !data.title) {
        throw new Error("Invalid JSON structure");
      }
    } catch {
      // Fallback: wrap plain text with current question
      data = { explanation: cleanedText, title: question };
    }

    res.status(200).json({ data });

  } catch (err) {
    console.error("AI request failed:", err);
    res.status(503).json({
      message: "The AI model is temporarily unavailable. Please try again later.",
      error: err.message
    });
  }
}

 

 
module.exports = { generateInterviewQuestion, generateConceptExplanation};


 