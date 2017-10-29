-- Up
CREATE UNIQUE INDEX idx_user_id ON user(id);
CREATE INDEX idx_user_blocked ON user(blocked);
CREATE INDEX idx_user_trusted ON user(trusted);
CREATE UNIQUE INDEX idx_comment_id ON comment(id);
CREATE INDEX idx_comment_approved ON comment(approved);
CREATE INDEX idx_comment_created_at ON comment(created_at);
CREATE INDEX idx_comment_rejected ON comment(rejected);
CREATE INDEX idx_comment_user_id ON comment(user_id);
CREATE UNIQUE INDEX idx_setting_name ON setting(name);
CREATE INDEX idx_subscription_endpoint ON subscription(endpoint);

-- Down
DROP INDEX idx_user_id;
DROP INDEX idx_user_blocked;
DROP INDEX idx_user_trusted;
DROP INDEX idx_comment_id;
DROP INDEX idx_comment_approved;
DROP INDEX idx_comment_created_at;
DROP INDEX idx_comment_rejected;
DROP INDEX idx_comment_user_id;
DROP INDEX idx_setting_name;
DROP INDEX idx_subscription_endpoint;
