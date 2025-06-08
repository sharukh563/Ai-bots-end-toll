const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/chat", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    console.log("User Prompt:", prompt);
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const reply = completion.data.choices[0].message.content;
    res.json({ text: reply });
  } catch (error) {
    console.error("OpenAI Error:", error.response?.data || error.message);
    res.status(500).json({ text: "Error: GPT API failed." });
  }
});

app.get("/suggestions", async (req, res) => {
  try {
    const prompt = req.query.prompt;
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: `${prompt}

Give me 3 follow-up questions.` },
      ],
    });

    const text = completion.data.choices[0].message.content;
    const suggestions = text
      .split("\n")
      .map((s) => s.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 3);

    res.json({ suggestions });
  } catch (err) {
    console.error("Suggestions Error:", err.response?.data || err.message);
    res.status(500).json({ suggestions: [] });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 GPT Chatbot Server running on port ${PORT}`));