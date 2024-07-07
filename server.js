require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const auth = require('./auth');

const app = express();
const PORT = 3000;

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

auth(passport); // sets button click functionalities

// if link is : http://localhost:3000/
app.get('/', (req, res) => {
  res.send('<h1>Welcome to GitCat</h1><a href="/auth/github">Login with GitHub</a>');
});

// if link is : http://localhost:3000/auth/github
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// if link is : http://localhost:3000/auth/github/callback
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
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

// app.get('/logout', (req, res) => {
//   req.logout((err) => {
//     if (err) {
//       return next(err);
//     }
//     res.redirect('/');
//   });
// });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});