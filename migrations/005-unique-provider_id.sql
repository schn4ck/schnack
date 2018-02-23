-- Up
CREATE UNIQUE INDEX idx_user_provider_id ON user(provider, provider_id);

-- Down
DROP INDEX idx_user_provider_id;
