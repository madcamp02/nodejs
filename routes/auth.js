// routes/auth.js
const express = require('express');
const passport = require('passport');
require('../config/auth'); // GitHub OAuth 설정 파일을 불러옵니다.

const router = express.Router();

router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

module.exports = router;
