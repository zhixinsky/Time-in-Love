USE love;

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
