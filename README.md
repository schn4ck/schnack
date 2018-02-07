# schnack.js

[![Join the chat at https://gitter.im/schnackjs/schnack](https://badges.gitter.im/schnackjs/schnack.svg)](https://gitter.im/schnackjs/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[schnack.js](https://dict.leo.org/englisch-deutsch/schnack) is a simple node app for Disqus-like drop-in commenting on static websites.

* [Say hello to Schnack.js](https://www.vis4.net/blog/2017/10/hello-schnack/)
* Follow [@schnackjs](https://twitter.com/schnackjs) on Twitter

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
<script src="https://comments.yoursite.com/embed.js"
    data-schnack-slug="post-slug"
    data-schnack-target=".comments-go-here">
</script>
```
### Server installation

Run:

```
npm install
```

Then copy `config.tpl.json` to `config.json` and edit your [config](#configuration).
Create [web-push keys](https://github.com/gka/schnack#push-notifications-for-new-comments) and finally run the server with:

```
npm run server
```

### Configuration

- *schnack_host*: the hostname where the schnack server runs (e.g. *https://schnack.mysite.com*)
- *page_url*: the page where schnack is going to be embeded.
	the `%SLUG%` placeholder should be replaceble with you tags (e.g. *https://blog.mysite.com/posts/%SLUG%*)
- *database*: the filename of the embeded SQLite database where data is going to be stored (e.g. *comments.db*)
- *port*: the port where the schnack server is going to run (e.g. 3000)
- *admins*: an array of userIDs which can login as admin (e.g. *[1, 245]*)
- *oauth*:
	- *secret*: the secret passed to [express-session](https://github.com/expressjs/session#secret)
	- *twitter*: 
		- *consumer_key*: the consumer key for Twitter OAuth apps
		- *consumer_secret*: the consumer secret for Twitter OAuth apps
	- *github*:
		- *client_id*: the client id for Github OAuth apps
		- *client_secret*: the client secret for Github OAuth apps
	- *google*:
		- *client_id*: the client id for Google OAuth2 apps
		- *client_secret*: the client secret for Google OAuth2 apps
	- *facebook*:
		- *client_id*: the client id for Facebook OAuth apps
		- *client_secret*: the client secret for Facebook OAuth apps
- *notify*:
	- *pushover*:
		- *app_token*: the Pushover app token
		- *user_key*: the Pushover user key
	- *webpush*:
		- *vapid_public_key*: the [webpush](https://github.com/gka/schnack#push-notifications-for-new-comments) public key,
		- *vapid_private_key*: the [webpush](https://github.com/gka/schnack#push-notifications-for-new-comments) private key
	- *slack*: 
		- *webhook_url*: the Slack webhook URL
- *date_format*: how to display dates (e.g. *MMMM DD, YYYY - h:mm a*)

### Run with Docker

You can build a Docker image for the schnack server running:

```sh
docker build -t gka/schnack .
```

The image will contain everything in the project folder and can be started with:

```sh
docker run -p 3000:3000 -d gka/schnack
```

In order to be able to edit your config file and your SQL database files, you may want to share the project folder with the docker container:

```sh
docker run -p 3000:3000 -v $(pwd):/usr/src/app -d gka/schnack
```


### Authentication

So far, users who want to post a comment need to authenticate using Twitter, Github, Facebook and Google. More auth providers can be added easily, thanks to [Passport.js](http://passportjs.org).

### Data storage

Comments are stored in a SQLite database. For a normal sized blog this should last a couple of decades.

### Comment approval

New comments need to be approved by the site admin, who can see and approve or reject them right in the comments section. To save some work, admins can "trust" certain authors so their comments are approved automatically.

### Push notifications for new comments

Schnack.js provides two mechanisms to notify you about new comments. The old-school way is an [RSS feed](https://github.com/gka/schnack/blob/master/src/server.js#L123-L141) that you can use in services like [IFTTT](https://ifttt.com). Alternatively you can hook into a push notification service like [Pushover](https://pushover.net) to get notifications right to your phone.

**New: web-push notifications**

If you want you can be notified about new comments using web-push notifications. To configure this you need to do 3 things:

1. Generate the vapid-keys using `node_modules/.bin/web-push generate-vapid-keys` and copy them into your config.json.
2. Copy the [sw.js](https://github.com/gka/schnack/blob/master/sw.js) into your website's root path.
3. Next time you log into your site you will be asked to allow notifications.

### Semi-automatically trust your friends

You can provide a list of user IDs of people you trust for each authentication provider. For instance, you could use the Twitter API to [get a list of all the people you follow](https://apigee.com/console/twitter?req=%7B%22resource%22%3A%22friends_ids%22%2C%22params%22%3A%7B%22query%22%3A%7B%22stringify_ids%22%3A%22true%22%2C%22cursor%22%3A%22-1%22%7D%2C%22template%22%3A%7B%7D%2C%22headers%22%3A%7B%7D%2C%22body%22%3A%7B%22attachmentFormat%22%3A%22mime%22%2C%22attachmentContentDisposition%22%3A%22form-data%22%7D%7D%2C%22verb%22%3A%22get%22%7D) and drop that into the config.

```json
"trust": {
	"twitter": [
		"916586732845400064",
		"902094599329591296"
	],
	"github": [
		1639, 2931, 2946, 3602, 4933
	]
}
```

### Import comments from disqus or Wordpress

You can import comments from your [disqus XML export](https://help.disqus.com/customer/portal/articles/472149-comments-export) as following:

```
npm run import -- disqus.xml
```

This will work for [Wordpress XML exports](https://en.blog.wordpress.com/2006/06/12/xml-import-export/) as well.

### Who is behind Schnack?

Schnack is [yet another](https://github.com/gka/canvid/) happy collaboration between [Webkid](https://webkid.io/) and [Gregor Aisch](https://www.vis4.net).

### Who is using Schnack?

Schnack will never track who is using it, so we don't know! If you are a Schnack user, [let us know](https://twitter.com/schnackjs) and we'll add your website here. So far Schnack is being used on:

* https://vis4.net/blog
* https://blog.datawrapper.de
* https://blog.webkid.io
