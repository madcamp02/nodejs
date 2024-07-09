require('dotenv').config();
const fs = require('fs');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const mysql = require('mysql2/promise');
const { initializeDatabase } = require('./database/db'); // Adjust the path according to your project structure
const auth = require('./auth');

const app = express();
const PORT = 3000;

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

auth(passport); // sets button click functionalities

// 초기화 실행
initializeDatabase();

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
    console.log('redirecting.!!!');
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