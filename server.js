import fs from 'fs';
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import { initializeDatabase } from './database/db.js';
import configurePassport from './auth.js';
import dotenv from 'dotenv';
dotenv.config();

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

configurePassport(passport); // GitHub OAuth 설정

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
import gitcatRouter from './routes/gitcatRouter.js'; // Importing repoRouter
app.use('/gitcat', gitcatRouter); // Using repoRouter



// 기본 라우트
app.get('/', (req, res) => {
  res.send('<h1>Welcome to GitCat</h1><a href="/auth/github">Login with GitHub</a>');
});

// GitHub 인증 라우트
app.get('/auth/github',
  passport.authenticate('github', { scope: [
    'repo',
    'repo_deployment',
    'repo:status',
    'read:repo_hook',
    'write:repo_hook',
    'admin:repo_hook',
    'read:org',
    'write:org',
    'admin:org',
    'admin:org_hook',
    'gist',
    'notifications',
    'user',
    'read:user',
    'user:email',
    'user:follow',
    'delete_repo',
    'write:discussion',
    'read:discussion',
    'admin:enterprise',
    'workflow'
  ] })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    console.log('USER\nUSER\nUSER\nUSER\nUSER\n', req.user);
    const gitcatSecret = process.env.GITCAT_SECRET;
    const userGithubId = req.user.id; // Ensure userId is available from req.user
    res.redirect('gitcat://loginsuccess?user_github_id='+userGithubId+'&gitcat_secret='+gitcatSecret);
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