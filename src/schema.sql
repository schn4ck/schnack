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
		("Normal User",datetime(), 0, 0),
		("Trusted User",datetime(), 1, 0),
		("Blocked User",datetime(), 0, 1);

INSERT INTO comment(user_id, slug, created_at, comment, approved, rejected)
	VALUES
		(1,"foo", datetime(), "This comment was written by a normal user and was approved", 1, 0),
		(1,"foo", datetime(), "This comment was written by a normal user and was rejected", 0, 1),
		(1,"foo", datetime(), "This comment was written by a normal user and was neither approved nor rejected", 0, 0),
		(2,"foo", datetime(), "This comment was written by a trusted user and was approved", 1, 0),
		(2,"foo", datetime(), "This comment was written by a trusted user and was rejected", 0, 1),
		(2,"foo", datetime(), "This comment was written by a trusted user and was neither approved nor rejected", 0, 0),
		(3,"foo", datetime(), "This comment was written by a blocked user and was approved", 1, 0),
		(3,"foo", datetime(), "This comment was written by a blocked user and was rejected", 0, 1),
		(3,"foo", datetime(), "This comment was written by a blocked user and was neither approved nor rejected", 0, 0);
