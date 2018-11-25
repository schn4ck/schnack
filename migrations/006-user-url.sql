-- Up
ALTER TABLE user ADD COLUMN url CHAR(255);

-- Down
ALTER TABLE user RENAME TO user_old;
CREATE TABLE user (
    id INTEGER PRIMARY KEY NOT NULL,
    name CHAR(128),
    display_name CHAR(128),
    provider CHAR(128),
    provider_id CHAR(128),
    created_at TEXT NOT NULL,
    blocked BOOLEAN,
    trusted BOOLEAN
);
INSERT INTO user SELECT id, name, display_name, provider, provider_id,
	created_at, blocked, trusted FROM user_old;
DROP TABLE user_old;
