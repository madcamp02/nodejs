const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

app.get('/auth/github', (req, res) => {
  const redirect_uri = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`;
  res.redirect(redirect_uri);
});

app.post('/auth/github/callback', async (req, res) => {
  const { code } = req.body;
  const githubTokenUrl = 'https://github.com/login/oauth/access_token';
  const githubUserUrl = 'https://api.github.com/user';

  try {
    const tokenResponse = await axios.post(
      githubTokenUrl,
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { accept: 'application/json' },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    const userResponse = await axios.get(githubUserUrl, {
      headers: { Authorization: `token ${accessToken}` },
    });

    res.json({
      accessToken,
      user: userResponse.data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
