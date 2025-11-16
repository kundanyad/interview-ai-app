require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDb = require("./config/db");
const authRouter = require("./routes/authRoute");
const sessionRoute = require("./routes/sessionRoute");
const questionRoute = require("./routes/questionRoute");
const { protect } = require("./middleware/authMiddleware");
const { generateInterviewQuestion, generateConceptExplanation } = require("./controllers/aiController");
const cloudDB = require("./config/cloudinary");
const quizRoute = require('./routes/quizRoute');

const app = express();

connectDb();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
cloudDB()
app.get("/", (req, res) => {
  res.send("Welcome to page");
});
 
app.use("/api/auth", authRouter);
app.use("/api/sessions", sessionRoute);
app.use("/api/question", questionRoute);
app.use("/api/quiz", quizRoute);
 
app.post("/api/ai/generate-questions", protect, generateInterviewQuestion);
app.post("/api/ai/generate-explanation", protect, generateConceptExplanation);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
