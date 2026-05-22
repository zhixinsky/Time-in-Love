-- 恋爱背景音乐（可选 MySQL，与内存 store 字段对齐）
USE love;

CREATE TABLE IF NOT EXISTS love_background_music (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(128) NOT NULL,
  singer VARCHAR(64) NOT NULL DEFAULT 'AI星芽',
  epname VARCHAR(128) NOT NULL DEFAULT '星芽恋记情侣空间',
  file_id VARCHAR(512) NOT NULL UNIQUE,
  cover_img_url VARCHAR(512),
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  loop_enabled TINYINT(1) NOT NULL DEFAULT 1,
  sort INT NOT NULL DEFAULT 0,
  remark VARCHAR(256),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_loop (enabled, loop_enabled, sort)
);
