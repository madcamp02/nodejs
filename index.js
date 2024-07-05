const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

const app = express();

app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new GitHubStrategy({
  clientID: 'YOUR_GITHUB_CLIENT_ID',
  clientSecret: 'YOUR_GITHUB_CLIENT_SECRET',
  callbackURL: 'http://localhost:3000/auth/github/callback'
},
(accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}
));

app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`<h1>Hello ${req.user.username}</h1><p>Email: ${req.user.emails[0].value}</p>`);
});

app.get('/', (req, res) => {
  res.send('<h1>Welcome</h1><a href="/auth/github">Login with GitHub</a>');
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
