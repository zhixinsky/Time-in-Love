-- 心动日记表（MySQL 可选，与内存 store 字段对齐）

CREATE TABLE IF NOT EXISTS diaries (
  id VARCHAR(64) PRIMARY KEY,
  space_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  content TEXT,
  mood VARCHAR(32),
  weather VARCHAR(32),
  temperature VARCHAR(16),
  location_name VARCHAR(128),
  location_lat DECIMAL(10, 7),
  location_lng DECIMAL(10, 7),
  visibility ENUM('both', 'self') DEFAULT 'both',
  ai_summary VARCHAR(256),
  love_day INT UNSIGNED DEFAULT 1,
  diary_date DATE NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_space_date (space_id, diary_date),
  INDEX idx_user (user_id)
);

CREATE TABLE IF NOT EXISTS diary_media (
  id VARCHAR(64) PRIMARY KEY,
  diary_id VARCHAR(64) NOT NULL,
  type ENUM('image', 'video') NOT NULL,
  url VARCHAR(512) NOT NULL,
  cover_url VARCHAR(512),
  duration INT UNSIGNED DEFAULT 0,
  sort INT UNSIGNED DEFAULT 0,
  created_at DATETIME NOT NULL,
  INDEX idx_diary (diary_id)
);
