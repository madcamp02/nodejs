const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const mysql = require('mysql2/promise');
require('dotenv').config();
const { db } = require('./database/db.js');
const configurePassport = (passport) => {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log('Access Token:', accessToken);
    console.log('Profile:', profile);

    try {
      const githubId = profile.id;
      const username = profile.username;

      // 사용자 정보 데이터베이스에 저장 또는 업데이트
      const [rows] = await db.execute('SELECT * FROM Users WHERE user_github_id = ?', [githubId]);
      if (rows.length === 0) {
        const [result] = await db.execute('INSERT INTO Owners (owner_github_id, owner_name, repo_id_list) VALUES (?, ?, ?)', [githubId, username, '[]']);
        const ownerIdListJSON = JSON.stringify([result.insertId]);
        await db.execute('INSERT INTO Users (user_github_id, access_token, user_name, owner_id_list) VALUES (?, ?, ?, ?)', [githubId, accessToken, username, ownerIdListJSON]);
      } else {
        await db.execute('UPDATE Users SET access_token = ? WHERE user_github_id = ?', [accessToken, githubId]);
      }
      return done(null, profile);
    } catch (err) {
      console.log('auth.js:', err);
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
};

module.exports = configurePassport;