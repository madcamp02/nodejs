require('dotenv').config();
const fs = require('fs');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const morgan = require('morgan');
const { initializeDatabase } = require('./models/db');
const auth = require('./auth');

const app = express();
const PORT = 3000;

// morgan 미들웨어 설정
app.use(morgan('dev'));

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

auth(passport); // GitHub OAuth 설정

// 초기화 실행
initializeDatabase();

// 미들웨어: Authorization 헤더에서 access_token을 읽고 req.user에 설정
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const accessToken = authHeader.split(' ')[1];
    req.user = { access_token: accessToken };
  }
  next();
});

// 라우트 설정
const githubRoutes = require('./routes/github');
const milestoneRoutes = require('./routes/milestones');
const issueRoutes = require('./routes/issues');
const labelRoutes = require('./routes/labels');
const commitRoutes = require('./routes/commits');
const tilRoutes = require('./routes/tils');

app.use('/github', githubRoutes);
app.use('/milestones', milestoneRoutes);
app.use('/issues', issueRoutes);
app.use('/labels', labelRoutes);
app.use('/commits', commitRoutes);
app.use('/tils', tilRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('<h1>Welcome to GitCat</h1><a href="/auth/github">Login with GitHub</a>');
});

// GitHub 인증 라우트
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    const gitcatSecret = process.env.GITCAT_SECRET;
    const userId = req.user.id; // Ensure userId is available from req.user
    res.redirect('gitcat://loginsuccess?user_id='+userId+'&gitcat_secret='+gitcatSecret);
  },
  (err, req, res, next) => {
    console.error('Error during GitHub authentication', err);
    res.redirect('/');
  }
);

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`<h1>Profile</h1><p>Welcome ${req.user.username}</p>`);
  } else {
    res.redirect('/');
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
