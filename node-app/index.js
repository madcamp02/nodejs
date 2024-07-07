const mysql = require('mysql2/promise');
const express = require('express');
require('dotenv').config();

const app = express();
const port = 3000;

// MySQL 연결 설정
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// 데이터베이스 초기화 함수
async function initializeDatabase() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS Users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      github_id VARCHAR(255) UNIQUE NOT NULL,
      access_token VARCHAR(255) NOT NULL,
      username VARCHAR(255) NOT NULL
    )
  `;
  
  const createRepositoriesTable = `
    CREATE TABLE IF NOT EXISTS Repositories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      repo_name VARCHAR(255) NOT NULL,
      repo_url VARCHAR(255) NOT NULL,
      is_organization TINYINT(1) NOT NULL DEFAULT 0,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    )
  `;
  
  try {
    await db.execute(createUsersTable);
    await db.execute(createRepositoriesTable);
    console.log('Tables created successfully.');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// 서버 시작 시 데이터베이스 초기화
initializeDatabase();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
