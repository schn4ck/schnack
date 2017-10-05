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
	twitter_id CHAR(20),
	facebook_id CHAR(20),
	created_at TIMESTAMP NOT NULL,
	blocked BOOLEAN,
	trusted BOOLEAN
);

-- test data
INSERT INTO user(name, created_at, trusted, blocked)
	VALUES
		("normal guy",datetime(), 0, 0),
		("trusted guy",datetime(), 1, 0),
		("blocked guy",datetime(), 0, 1);

INSERT INTO comment(user_id, slug, created_at, comment, approved, rejected)
	VALUES
		(1,"foo", datetime(), "normal guy approved", 1, 0),
		(1,"foo", datetime(), "normal guy rejected", 0, 1),
		(1,"foo", datetime(), "normal guy nothing", 0, 0),
		(2,"foo", datetime(), "trusted guy approved", 1, 0),
		(2,"foo", datetime(), "trusted guy rejected", 0, 1),
		(2,"foo", datetime(), "trusted guy nothing", 0, 0),
		(3,"foo", datetime(), "blocked guy approved", 1, 0),
		(3,"foo", datetime(), "blocked guy rejected", 0, 1),
		(3,"foo", datetime(), "blocked guy nothing", 0, 0);
