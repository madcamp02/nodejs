const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL 연결 설정
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = (passport) => {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    // Logging to debug
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    console.log('Profile:', profile);

    try {
      const githubId = profile.id;
      const username = profile.username;

      // 사용자 정보 데이터베이스에 저장 또는 업데이트
      const [rows] = await db.execute('SELECT * FROM Users WHERE user_github_id = ?', [githubId]);
      if (rows.length === 0) {
        await db.execute('INSERT INTO Users (user_github_id, access_token, user_name) VALUES (?, ?, ?)', [githubId, accessToken, username]);
      } else {
        await db.execute('UPDATE Users SET access_token = ? WHERE user_github_id = ?', [accessToken, githubId]);
      }
      return done(null, profile);
    } catch (err) {
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
