USE love;

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
