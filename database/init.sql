-- 데이터베이스 생성 및 사용

CREATE DATABASE IF NOT EXISTS gitcat_db;
USE gitcat_db;

-- User 테이블 생성
CREATE TABLE IF NOT EXISTS Users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_github_id BIGINT UNIQUE,
    access_token VARCHAR(255) NOT NULL,
    owner_id_list JSON NOT NULL
);

-- Owner 테이블 생성
CREATE TABLE IF NOT EXISTS Owners (
    owner_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    is_organization TINYINT(1) NOT NULL DEFAULT 0,
    owner_github_id BIGINT UNIQUE,
    owner_name VARCHAR(255) NOT NULL,
    repo_id_list JSON NOT NULL
);

-- Repository 테이블 생성
CREATE TABLE IF NOT EXISTS Repositories (
    repo_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    repo_name VARCHAR(255) NOT NULL,
    repo_url VARCHAR(255) NOT NULL,
    owner_github_id BIGINT,
    repo_github_id BIGINT,
    UNIQUE (owner_github_id, repo_github_id)
);

-- Milestones 테이블 생성
CREATE TABLE IF NOT EXISTS Milestones (
    mlstn_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mlstn_state TINYINT(1),
    mlstn_title VARCHAR(255) NOT NULL,
    mlstn_due DATE,
    mlstn_descr VARCHAR(255),
    owner_github_id BIGINT,
    repo_github_id BIGINT,
    mlstn_github_id BIGINT,
    UNIQUE (owner_github_id, repo_github_id, mlstn_github_id)
);

-- Issue 테이블 생성
CREATE TABLE IF NOT EXISTS Issues (
    issue_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_title VARCHAR(255) NOT NULL,
    issue_state TINYINT(1),
    mlstn_id BIGINT,
    label_id_list JSON NOT NULL,
    owner_github_id BIGINT,
    repo_github_id BIGINT,
    issue_github_id BIGINT,
    UNIQUE (owner_github_id, repo_github_id, issue_github_id)
);

-- Label 테이블 생성
CREATE TABLE IF NOT EXISTS Labels (
    label_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    label_name VARCHAR(50),
    label_color VARCHAR(7),
    owner_github_id BIGINT,
    repo_github_id BIGINT,
    label_github_id BIGINT,
    UNIQUE (owner_github_id, repo_github_id, label_github_id)
);

-- Commit 테이블 생성 (외래 키 없이)
CREATE TABLE IF NOT EXISTS Commits (
    commit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ai_labeled TINYINT(1),
    commit_msg TEXT,
    commit_date DATETIME,
    til_id BIGINT DEFAULT NULL,
    issue_id_list JSON NOT NULL,
    owner_github_id BIGINT,
    repo_github_id BIGINT,
    commit_github_id CHAR(40),
    UNIQUE (owner_github_id, repo_github_id, commit_github_id)
);

-- TIL 테이블 생성 (외래 키 없이)
CREATE TABLE IF NOT EXISTS TILs (
    til_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    til_content TEXT,
    commit_id BIGINT,
    commit_msg TEXT,
    commit_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (commit_id) REFERENCES Commits(commit_id)
);