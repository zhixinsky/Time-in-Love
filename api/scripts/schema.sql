-- 星芽恋记 · 云托管 MySQL 表结构
CREATE DATABASE IF NOT EXISTS love DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE love;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(32) PRIMARY KEY,
  open_id VARCHAR(64) NOT NULL UNIQUE,
  nickname VARCHAR(64) NOT NULL DEFAULT '',
  avatar_url VARCHAR(512) DEFAULT '',
  role VARCHAR(16) NOT NULL DEFAULT 'member',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS spaces (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  subtitle VARCHAR(128) DEFAULT '',
  first_joined_at DATE NOT NULL,
  love_start_date DATE NULL,
  couple_photo VARCHAR(512) DEFAULT '',
  invite_code VARCHAR(16) DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS space_members (
  space_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(32) NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (space_id, user_id)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS anniversaries (
  id VARCHAR(32) PRIMARY KEY,
  space_id VARCHAR(32) NOT NULL,
  title VARCHAR(64) NOT NULL,
  anniversary_date DATE NOT NULL,
  repeat_type VARCHAR(16) NOT NULL DEFAULT 'yearly',
  INDEX idx_space (space_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS moods (
  id VARCHAR(32) PRIMARY KEY,
  space_id VARCHAR(32) NOT NULL,
  owner_label VARCHAR(16) NOT NULL,
  avatar VARCHAR(32) DEFAULT '',
  mood_text VARCHAR(32) NOT NULL,
  mood_date DATE NOT NULL,
  INDEX idx_space_date (space_id, mood_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bill_monthly (
  space_id VARCHAR(32) NOT NULL,
  bill_month CHAR(7) NOT NULL,
  expense DECIMAL(12,2) NOT NULL DEFAULT 0,
  income DECIMAL(12,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (space_id, bill_month)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bill_records (
  id VARCHAR(32) PRIMARY KEY,
  space_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(32) NOT NULL,
  type VARCHAR(16) NOT NULL DEFAULT 'expense',
  category VARCHAR(32) NOT NULL DEFAULT '其他',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  note VARCHAR(128) DEFAULT '',
  bill_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_space_date (space_id, bill_date),
  INDEX idx_space_type (space_id, type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS love_check_items (
  id VARCHAR(32) PRIMARY KEY,
  space_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(32) NOT NULL,
  title VARCHAR(96) NOT NULL,
  category VARCHAR(32) NOT NULL DEFAULT '日常',
  official TINYINT(1) NOT NULL DEFAULT 0,
  completed TINYINT(1) NOT NULL DEFAULT 0,
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_space_completed (space_id, completed)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sweet_questions (
  id VARCHAR(32) PRIMARY KEY,
  category VARCHAR(32) NOT NULL DEFAULT '日常',
  content VARCHAR(255) NOT NULL,
  official TINYINT(1) NOT NULL DEFAULT 1,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sweet_answers (
  id VARCHAR(32) PRIMARY KEY,
  space_id VARCHAR(32) NOT NULL,
  question_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(32) NOT NULL,
  answer TEXT NOT NULL,
  answer_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_space_question_user (space_id, question_id, user_id),
  INDEX idx_space_date (space_id, answer_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS diaries (
  id VARCHAR(32) PRIMARY KEY,
  space_id VARCHAR(32) NOT NULL,
  content TEXT NOT NULL,
  mood VARCHAR(32) DEFAULT '',
  weather VARCHAR(32) DEFAULT '',
  location VARCHAR(64) DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_space_created (space_id, created_at)
) ENGINE=InnoDB;
