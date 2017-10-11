CREATE TABLE comment (
    id INTEGER PRIMARY KEY NOT NULL,
    user_id NOT NULL,
    slug CHAR(128) NOT NULL,
    created_at TEXT NOT NULL,
    comment CHAR(4000) NOT NULL,
    rejected BOOLEAN,
    approved BOOLEAN
);

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

CREATE TABLE setting (
    id CHAR(128) PRIMARY KEY NOT NULL,
    value BOOLEAN NOT NULL
);

CREATE TABLE subscription (
    endpoint CHAR(600) PRIMARY KEY NOT NULL,
    publicKey CHAR(4096) NOT NULL,
    auth CHAR(600) NOT NULL
);

INSERT INTO setting (id, value) VALUES ('notification', true);
