import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import morgan from 'morgan';
import { initializeDatabase } from './models/db.js';
import configurePassport from './auth.js';

const app = express();
const PORT = 3000;

app.use(morgan('dev'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

configurePassport(passport);

initializeDatabase();

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const accessToken = authHeader.split(' ')[1];
    req.user = { access_token: accessToken };
  }
  next();
});

import repoRoutes from './routes/repo.js';
import milestoneRoutes from './routes/milestones.js';
import issueRoutes from './routes/issues.js';
import labelRoutes from './routes/labels.js';
import commitRoutes from './routes/commits.js';
import tilRoutes from './routes/tils.js';

app.use('/repo', repoRoutes);
app.use('/milestones', milestoneRoutes);
app.use('/issues', issueRoutes);
app.use('/labels', labelRoutes);
app.use('/commits', commitRoutes);
app.use('/tils', tilRoutes);

app.get('/', (req, res) => {
  res.send('<h1>Welcome to GitCat</h1><a href="/auth/github">Login with GitHub</a>');
});

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
    const gitcatSecret = process.env.GITCAT_SECRET;
    const userId = req.user.id; // Ensure userId is available from req.user
    res.redirect(`gitcat://loginsuccess?user_id=${userId}&gitcat_secret=${gitcatSecret}`);
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
