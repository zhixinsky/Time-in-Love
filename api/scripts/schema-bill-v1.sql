USE love;

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
