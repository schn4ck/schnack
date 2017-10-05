# simple-comments
a simple node app for disqus-like drop-in commenting on static websites

### Server requirements

Just Node.

### Minimal setup drop-in

The app runs as a node server that provides a JS file to be dropped into any website.

```html
<script src="//comments.yoursite.com/embed.js"
    data-slug="post-slug"
    data-target=".comment-section">
</script>
```

### Authentication

Users who want to submit a comment need to [authenticate using Twitter](http://passportjs.org/docs/twitter) or Facebook authentication API.

### Data storage

Comments are stored in a SQLite database. For a normal sized blog this should last a couple of decades.

### Comment approval via web admin with push notifications

* Ideally there's an admin web app that allows approving/blocking of users and approving/rejecting of comments. 
* Each new comment triggers a [push notification](https://developer.mozilla.org/en-US/docs/Web/API/Push_API), within reasonable limits.
* If a user is approved, all of her comments are automatically approved. If a user is blocked, all of his comments are automatically rejected. Otherwise each comment needs to be approved/rejected manually.

### Security

Theoretically any website could include the `embed.js` script. So the first thing the script will do is to load the existing comments from the Node app, which will only permit certain, configurable domains using CORS. 

### Node server endpoints

* `GET /embed.js` - return the script to render the comments and the comment entry form
* `GET /comments/:slug.json` - delivers comments for a given slug as JSON
* `GET /authenticate/(twitter/facebook/...)` - authenticate on third-party website (opens in a popup window or something)
* `POST /comment/:slug` - submits a new comment for a given slug, form-encoded

## Related projects

This is not a new idea, here are a few projects that are doing almost the same thing:

* [CoralProject Talk](https://github.com/coralproject/talk) - Node + MongoDB + Redis
* [Discourse](https://github.com/discourse/discourse) - Ruby on Rails + PostgreSQL + Redis
* [Commento](https://github.com/adtac/commento) - written in Go & Node
