-- Up
CREATE TABLE setting (
    name CHAR(128) PRIMARY KEY NOT NULL,
    active BOOLEAN NOT NULL
);

INSERT INTO setting (name, active) VALUES ('notification', 1);

CREATE TABLE subscription (
    endpoint CHAR(600) PRIMARY KEY NOT NULL,
    publicKey CHAR(4096) NOT NULL,
    auth CHAR(600) NOT NULL
);

-- Down
DROP TABLE setting;
DROP TABLE subscription;
