import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/process", async (req, res) => {
  try {
    const { text } = req.body;

    const response = await client.chat.completions.create({
      model: "4.104.0",
      messages: [
        { role: "system", content: "You summarize text and generate quizzes." },
        {
          role: "user",
          content: `Summarize this text and create a quiz:\n\n${text}`,
        },
      ],
    });

    const output = response.choices[0].message.content;

    const [summary, quiz] = output.split("Quiz:");

    res.json({
      summary: summary.trim(),
      quiz: "Quiz: " + quiz.trim(),
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Backend error");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
