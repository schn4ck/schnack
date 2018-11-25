-- Up
CREATE TABLE oauth_provider (
    id INTEGER PRIMARY KEY NOT NULL,
    provider CHAR(128),
    provider_app_id CHAR(255),
    domain CHAR(255),
    client_id CHAR(255),
    client_secret CHAR(255),
    created_at TEXT NOT NULL
);

-- Down
DROP TABLE oauth_provider;
