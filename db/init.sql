-- 데이터베이스 생성 및 사용
CREATE DATABASE IF NOT EXISTS gitcatDB;
USE gitcatDB;

-- User 테이블 생성
CREATE TABLE IF NOT EXISTS User (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    github_id BIGINT,
    access_token VARCHAR(255) NOT NULL,
    owner_ids JSON
);

-- Owner 테이블 생성
CREATE TABLE IF NOT EXISTS Owner (
    owner_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    is_organization TINYINT(1) NOT NULL DEFAULT 0,
    owner_github_id BIGINT,
    owner_name VARCHAR(255) NOT NULL,
    repo_ids JSON
);

-- Repository 테이블 생성
CREATE TABLE IF NOT EXISTS Repository (
    repo_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    repo_name VARCHAR(255) NOT NULL,
    repo_url VARCHAR(255) NOT NULL,
    owner_id BIGINT,
    FOREIGN KEY (owner_id) REFERENCES Owner(owner_id)
);

-- Milestones 테이블 생성
CREATE TABLE IF NOT EXISTS Milestones (
    mlstn_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mlstn_state TINYINT(1),
    mlstn_title VARCHAR(255) NOT NULL,
    mlstn_due DATE,
    mlstn_descr VARCHAR(255),
    repo_id BIGINT,
    FOREIGN KEY (repo_id) REFERENCES Repository(repo_id)
);

-- Issue 테이블 생성
CREATE TABLE IF NOT EXISTS Issue (
    issue_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_title VARCHAR(255) NOT NULL,
    issue_state TINYINT(1),
    mlstn_id BIGINT,
    label_ids JSON,
    FOREIGN KEY (mlstn_id) REFERENCES Milestones(mlstn_id)
);

-- Label 테이블 생성
CREATE TABLE IF NOT EXISTS Label (
    label_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    label_name VARCHAR(50),
    label_color VARCHAR(7)
);

-- Commit 테이블 생성
CREATE TABLE IF NOT EXISTS Commit (
    commit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ai_labeled TINYINT(1),
    repo_id BIGINT,
    commit_msg TEXT,
    commit_date DATETIME,
    commit_image VARCHAR(255),
    til_id BIGINT DEFAULT NULL,
    issue_ids JSON,
    FOREIGN KEY (repo_id) REFERENCES Repository(repo_id),
    FOREIGN KEY (til_id) REFERENCES TIL(til_id)
);

-- TIL 테이블 생성
CREATE TABLE IF NOT EXISTS TIL (
    til_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    til_content TEXT,
    commit_id BIGINT,
    commit_msg TEXT,
    commit_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (commit_id) REFERENCES Commit(commit_id)
);

-- 초기 데이터 삽입 (예시)
INSERT INTO User (user_name, github_id, access_token, owner_ids) VALUES
('exampleuser', 123456, 'exampletoken', '[]');

INSERT INTO Owner (is_organization, owner_github_id, owner_name, repo_ids) VALUES
(0, 123456, 'My Repos', '[]');

INSERT INTO Repository (repo_name, repo_url, owner_id) VALUES
('example-repo', 'https://github.com/exampleuser/example-repo', 1);
