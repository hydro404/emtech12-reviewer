require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NAME = process.env.NAME || 'TEST';

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS view engine
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'src/views')); // Uncomment if views are in src/views

// Routes
app.get('/', (req, res) => {
  res.render('index', { name: NAME });
});

app.get('/part1', (req, res) => {
  res.render('part1', { name: NAME });
});

app.get('/part2', (req, res) => {
  res.render('part2', { name: NAME });
});

app.get('/part3', (req, res) => {
  res.render('part3', { name: NAME, submittedData: null });
});

app.post('/quiz/part3', async (req, res) => {
  const { future_career, online_tool, explanation } = req.body;

  if (!future_career || !online_tool || !explanation) {
    return res.status(400).send('All fields are required.');
  }

  const studentAnswer = `Career: ${future_career}\nTool: ${online_tool}\nExplanation: ${explanation}`;
  const prompt = `You are a friendly and supportive teacher. A student answered the following question:

"Choose your future career or job. Give one online application, tool, or website that you think might help you in your future career. Explain how this application, tool, or website would help you."

Here is the student's answer:

${studentAnswer}

Please provide short and encouraging feedback (2-3 sentences). Focus on acknowledging the student's effort and giving one helpful suggestion or positive comment.`;


  let advice = '';

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          Referer: 'lessons2u.com',
          'X-Title': 'Emtech Reviewer',
        },
      }
    );

    advice = response.data.choices?.[0]?.message?.content || 'No feedback generated.';
  } catch (error) {
    advice = 'AI feedback could not be generated.';
  }

  res.render('part3', {
    name: NAME,
    submittedData: { future_career, online_tool, explanation, advice },
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
