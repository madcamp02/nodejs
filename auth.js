import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
dotenv.config();
import { db } from './database/db.js';


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

      let user;
      // 사용자 정보 데이터베이스에 저장 또는 업데이트
      const [rows] = await db.execute('SELECT * FROM Users WHERE user_github_id = ?', [githubId]);
      if (rows.length === 0) {
        const [result] = await db.execute('INSERT INTO Users (user_github_id, access_token, user_name) VALUES (?, ?, ?)', [githubId, accessToken, username]);
        user = { id: result.insertId, user_github_id: githubId, access_token: accessToken, user_name: username };
        console.log('insert ID:', user.id);
      } else {
        await db.execute('UPDATE Users SET access_token = ? WHERE user_github_id = ?', [accessToken, githubId]);
        user = { ...rows[0], access_token: accessToken };
      }
      return done(null, user);
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

export default configurePassport