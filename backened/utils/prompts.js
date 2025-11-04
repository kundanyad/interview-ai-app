const questionAnswerPrompt = ({ role, experience, topicsToFocus, numberOfQuestions }) => `
You are an AI trained to generate interview questions and answers.  
Task:
- Generate ${numberOfQuestions} relevant interview questions based on the role "${role}", experience "${experience}", and topics "${topicsToFocus}".
- For each question, provide a detailed answer.
- If applicable, include a small code block in the answer.
- Keep the formatting very clean and clear.
- Return the result as a valid JSON array of objects in the following format:
[
  {
    "question": "Generated question here?",
    "answer": "Detailed answer here."
  }
]
Important: Do NOT add any extra text outside the JSON format. Only return valid JSON.
`;

const conceptExplainPrompt = (question) => `
Explain the following question in detail and return the response in JSON format with the keys "title" and "explanation".

Question: "${question}"

Example format:
{
  "title": "Your question here",
  "explanation": "Detailed explanation here."
}
`;

module.exports = { questionAnswerPrompt, conceptExplainPrompt };