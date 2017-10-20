-- Up
ALTER TABLE comment ADD COLUMN reply_to INTEGER;

-- Down
ALTER TABLE comment RENAME TO comment_old;

CREATE TABLE comment (
    id INTEGER PRIMARY KEY NOT NULL,
    user_id NOT NULL,
    slug CHAR(128) NOT NULL,
    created_at TEXT NOT NULL,
    comment CHAR(4000) NOT NULL,
    rejected BOOLEAN,
    approved BOOLEAN
);

INSERT INTO comment SELECT id, user_id, slug, created_at, comment, rejected, approved FROM comment_old;
DROP TABLE comment_old;