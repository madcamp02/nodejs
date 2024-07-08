-- 데이터베이스 생성 및 사용

CREATE DATABASE IF NOT EXISTS gitcat_db;
USE gitcat_db;

-- User 테이블 생성
CREATE TABLE IF NOT EXISTS Users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    github_id BIGINT,
    access_token VARCHAR(255) NOT NULL,
    owner_ids JSON
);

-- Owner 테이블 생성
CREATE TABLE IF NOT EXISTS Owners (
    owner_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    is_organization TINYINT(1) NOT NULL DEFAULT 0,
    owner_github_id BIGINT,
    owner_name VARCHAR(255) NOT NULL,
    repo_ids JSON
);

-- Repository 테이블 생성
CREATE TABLE IF NOT EXISTS Repositories (
    repo_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    repo_name VARCHAR(255) NOT NULL,
    repo_url VARCHAR(255) NOT NULL,
    owner_id BIGINT,
    FOREIGN KEY (owner_id) REFERENCES Owners(owner_id)
);

-- Milestones 테이블 생성
CREATE TABLE IF NOT EXISTS Milestones (
    mlstn_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mlstn_state TINYINT(1),
    mlstn_title VARCHAR(255) NOT NULL,
    mlstn_due DATE,
    mlstn_descr VARCHAR(255),
    repo_id BIGINT,
    FOREIGN KEY (repo_id) REFERENCES Repositories(repo_id)
);

-- Issue 테이블 생성
CREATE TABLE IF NOT EXISTS Issues (
    issue_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_title VARCHAR(255) NOT NULL,
    issue_state TINYINT(1),
    mlstn_id BIGINT,
    label_ids JSON,
    FOREIGN KEY (mlstn_id) REFERENCES Milestones(mlstn_id)
);

-- Label 테이블 생성
CREATE TABLE IF NOT EXISTS Labels (
    label_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    label_name VARCHAR(50),
    label_color VARCHAR(7)
);

-- Commit 테이블 생성 (외래 키 없이)
CREATE TABLE IF NOT EXISTS Commits (
    commit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ai_labeled TINYINT(1),
    repo_id BIGINT,
    commit_msg TEXT,
    commit_date DATETIME,
    commit_image VARCHAR(255),
    til_id BIGINT DEFAULT NULL,
    issue_ids JSON,
    FOREIGN KEY (repo_id) REFERENCES Repositories(repo_id)
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

-- -- 외래 키 추가
-- ALTER TABLE Commit
-- ADD CONSTRAINT fk_commit_repo_id FOREIGN KEY (repo_id) REFERENCES Repository(repo_id),
-- ADD CONSTRAINT fk_commit_til_id FOREIGN KEY (til_id) REFERENCES TIL(til_id);

-- ALTER TABLE TIL
-- ADD CONSTRAINT fk_til_user_id FOREIGN KEY (user_id) REFERENCES User(user_id),
-- ADD CONSTRAINT fk_til_commit_id FOREIGN KEY (commit_id) REFERENCES Commit(commit_id);
