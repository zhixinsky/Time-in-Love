USE love;

INSERT IGNORE INTO users (id, open_id, nickname, role) VALUES
('u_me', 'mock-openid-me', '我', 'member'),
('u_ta', 'mock-openid-ta', 'Ta', 'member');

INSERT IGNORE INTO spaces (id, name, subtitle, first_joined_at, love_start_date) VALUES
('space_demo', '恋爱时光', '记录我们的心动瞬间', '2024-12-19', '2024-12-19');

INSERT IGNORE INTO space_members (space_id, user_id) VALUES
('space_demo', 'u_me'),
('space_demo', 'u_ta');

INSERT IGNORE INTO anniversaries (id, space_id, title, anniversary_date, repeat_type) VALUES
('a1', 'space_demo', '恋爱纪念日', '2024-12-19', 'yearly'),
('a2', 'space_demo', '第一次约会', '2025-01-12', 'yearly');

INSERT IGNORE INTO moods (id, space_id, owner_label, avatar, mood_text, mood_date) VALUES
('m1', 'space_demo', '我', '👧🏻', '很幸福', CURDATE()),
('m2', 'space_demo', 'Ta', '👦🏻', '想见你', CURDATE());

INSERT IGNORE INTO bill_monthly (space_id, bill_month, expense, income) VALUES
('space_demo', DATE_FORMAT(CURDATE(), '%Y-%m'), 1314, 520);

INSERT IGNORE INTO diaries (id, space_id, content, mood, weather, location, created_at) VALUES
('d1', 'space_demo',
 '今天一起去看了日落，他的侧脸在夕阳下好温柔。走在海边吹着风，突然觉得能和他一起看很多很多次日落，真的是很幸福的事呀～',
 '很幸福', '晴 26℃', '海边', NOW());
