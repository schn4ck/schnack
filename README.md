# schnack.js

[schnack.js](https://dict.leo.org/englisch-deutsch/schnack) is a simple node app for Disqus-like drop-in commenting on static websites.

[Say hello to Schnack.js](https://www.vis4.net/blog/2017/10/hello-schnack/)

### Related projects

This is not a new idea, so there are a few projects that are doing almost the same thing:

* [CoralProject Talk](https://github.com/coralproject/talk) - Node + MongoDB + Redis
* [Discourse](https://github.com/discourse/discourse) - Ruby on Rails + PostgreSQL + Redis
* [Commento](https://github.com/adtac/commento) - Go + Node
* [Isso](https://github.com/posativ/isso/) - Python + SQLite3

### Server requirements

Node 6+ and SQLite.

### Minimal setup drop-in

The app runs as a node server that provides a JS file to be dropped into any website.

```html
<div class="comments-go-here"></div>
<script src="//comments.yoursite.com/embed.js"
    data-schnack-slug="post-slug"
    data-schnack-target=".comments-go-here">
</script>
```

### Authentication

So far, users who want to post a comment need to Twitter or Github. More auth providers can be added easily, thanks to [Passport.js](passportjs.org).

### Data storage

Comments are stored in a SQLite database. For a normal sized blog this should last a couple of decades.

### Comment approval

New comments need to be approved by the site admin, who can see and approve or reject them right in the comments section. To save some work, admins can "trust" certain authors so their comments are approved automatically.

### Push notifications for new comments

Schnack.js provides two mechanisms to remind you of new comments. The old-school way is an RSS feed that you could hook into services like [IFTTT](https://ifttt.com). Alternatively you can hook into a push notification service like [Pushover](https://pushover.net) to get notifications right to your phone.

### Who is behind Schnack?

Schnack is [yet another](https://github.com/gka/canvid/) happy collaboration between [Webkid](https://webkid.io/) and [Gregor Aisch](https://www.vis4.net).
