USE love;

-- Existing deployments only: run once before publishing the invite-space feature.
ALTER TABLE spaces ADD COLUMN invite_code VARCHAR(16) DEFAULT '';
ALTER TABLE space_members ADD COLUMN joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
