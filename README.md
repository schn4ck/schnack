# simple-comments
a simple node app for disqus-like drop-in commenting

## Minimal setup drop-in

The app runs as a node server that provides a JS file to be dropped into any website.

```html
<script src="//comments.yoursite.com/embed.js"
    data-slug="post-slug"
    data-target=".comment-section">
</script>
```

## Authentication

Users who want to submit a comment need to authenticate using Twitter or Facebook authentication API.

## Data storage

Comments are stored in a SQLite database.

## Comment approval via web admin with push notifications

Ideally there's an admin app that lets the admin approve/reject comments or users. Each new comment triggers a [push notification](https://developer.mozilla.org/en-US/docs/Web/API/Push_API), within reasonable limits. If a user is whitelisted, all of her comments are automatically approved. If a user is blocked, all of his comments are automatically rejected. Otherwise each comment needs to be approved/rejected manually.

## Server requirements

Just Node.js.
