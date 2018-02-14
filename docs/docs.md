# What the schnack?

Schnack is an open source commenting system written in JavaScript.
- Tiny! It takes only ~**8 KB!!!** to embed Schnack.
- **Open source** and **self-hosted**.
- Ad-free and Tracking-free. Schnack will **not disturb your users**.
- It's simple to moderate, with a **minimal** and **slick UI** to allow/reject comments or trust/block users.
- **[webpush protocol](https://tools.ietf.org/html/draft-ietf-webpush-protocol-12) to notify the site owner** about new comments awaiting for moderation.
- **Third party providers for authentication** like Github, Twitter, Google and Facebook. Users are not required to register a new account on your system and you don't need to manage a user management system.

# Quickstart

This is the fastest way to setup *schnack*.

**Requirements**:
- Node.js (>= v6)
- npm (>= v5)

Clone or download schnack:

```bash
git clone https://github.com/schn4ck/schnack
```

Go to the schnack directory:
```bash
cd schnack
```

Install dependencies:
```bash
npm install
```

Copy and edit the config file according to [configuration](#configuration) section:

```bash
cp config.tpl.json config.json
vim config.json                 # or open with any editor of your choice
```

Run the server:
```bash
npm start
```

Embed in your HTML page:

```html
<div class="comments-go-here"></div>
<script src="https://comments.yoursite.com/embed.js"
    data-schnack-slug="post-slug"
    data-schnack-target=".comments-go-here">
</script>
```

# Configuration

*schnack* will try to read the configuration from the `config.json` file. The minimal configuration requires the following fields: *schnack_host*, *admins*, *oauth.secret*  and at least one oauth provider (id and secret key) and one notification provider.
The fields *schnack_host* and *page_url* should be hosted on the **same domain**. If your blog is running at *https://blog.example.com*, then your *schnack* instance should be reachable at any **subdomain** of *example.com*.


| option                                    | description                                                                                                                                               |
|-------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| schnack_host                              | the hostname where the schnack server runs (e.g. *https://schnack.example.com*)                                                                            |
| page_url                                  | the page where schnack is going to be embeded. The `%SLUG%` placeholder should be replaceable with you tags (e.g. *https://blog.example.com/posts/%SLUG%*) |
| database                                  |                                                       |
| &nbsp;&nbsp;comments                                  | the filename of the embeded SQLite database where the user comments are going to be stored (e.g. *comments.db*)                                                         |
|  &nbsp;&nbsp;sessions                                  | the filename of the embeded SQLite database where OAuth session data is going to be stored (e.g. *sessions.db*)                                                         |
| port                                      | the port where the schnack server is going to run (e.g. 3000)                                                                                             |
| admins                                    | an array of userIDs which can login as admin (e.g. *[1, 245]*)                                                                                            |
| oauth                                     |                                                                                                                                                           |
| &nbsp;&nbsp;secret                        | the secret passed to [express-session](https://github.com/expressjs/session#secret)                                                                       |
| &nbsp;&nbsp;twitter                       |                                                                                                                                                           |
| &nbsp;&nbsp;&nbsp;&nbsp;consumer_key      | the consumer key for Twitter OAuth apps                                                                                                                   |
| &nbsp;&nbsp;&nbsp;&nbsp;consumer_secret   | the consumer secret for Twitter OAuth apps                                                                                                                |
| &nbsp;&nbsp;github                        |                                                                                                                                                           |
| &nbsp;&nbsp;&nbsp;&nbsp;client_id         | the client id for GitHub OAuth apps                                                                                                                       |
| &nbsp;&nbsp;&nbsp;&nbsp;client_secret     | the client secret for GitHub OAuth apps                                                                                                                   |
| &nbsp;&nbsp;google                        |                                                                                                                                                           |
| &nbsp;&nbsp;&nbsp;&nbsp;client_id         | the client id for Google OAuth2 apps                                                                                                                      |
| &nbsp;&nbsp;&nbsp;&nbsp;client_secret     | the client secret for Google OAuth2 apps                                                                                                                  |
| &nbsp;&nbsp;facebook                      |                                                                                                                                                           |
| &nbsp;&nbsp;&nbsp;&nbsp;client_id         | the client id for Facebook OAuth apps                                                                                                                     |
| &nbsp;&nbsp;&nbsp;&nbsp;client_secret     | the client secret for Facebook OAuth apps                                                                                                                 |
| notify                                    |                                                                                                                                                           |
| &nbsp;&nbsp;pushover                      |                                                                                                                                                           |
| &nbsp;&nbsp;&nbsp;&nbsp;app_token         | the Pushover app token                                                                                                                                    |
| &nbsp;&nbsp;&nbsp;&nbsp;user_key          | the Pushover user key                                                                                                                                     |
| &nbsp;&nbsp;webpush                       |                                                                                                                                                           |
| &nbsp;&nbsp;&nbsp;&nbsp;vapid_public_key  | the [webpush](https://github.com/schn4ck/schnack#push-notifications-for-new-comments) public key                                                              |
| &nbsp;&nbsp;&nbsp;&nbsp;vapid_private_key | the [webpush](https://github.com/schn4ck/schnack#push-notifications-for-new-comments) private key                                                             |
| &nbsp;&nbsp;slack                         |                                                                                                                                                           |
| &nbsp;&nbsp;&nbsp;&nbsp;webhook_url       | the Slack webhook URL                                                                                                                                     |
| date_format                               | how to display dates (e.g. *MMMM DD, YYYY - h:mm a*)                                                                                                      |
| trust                                     | a list of trusted users (see [Trust your friends](#trust-your-friends))                                                                                   |


## Authentication

*schnack* uses OAuth to authenticate the users of your comment platform, in order to prevent spam without having to implement and manage an own user management system. Users have to be registered for one of the configured providers. You should configure at least one of the OAuth providers in order to allow users to login and write comments.
When an user login through an OAuth provider, the session informations are stored into a cookie. In order to allow this action, your *schnack* instance and the page where you are embedding *schnack* should reside on **subdomains of the same domain**.

The `secret` provided in `config.json` will be used by [express-session](https://github.com/expressjs/session#secret) to sign the session ID cookie.

### Twitter

- Create a new OAuth App on [apps.twitter.com](https://apps.twitter.com/)
    - *Name*: the name of your blog
    - *Description*: the description of your blog
    - *Website*: the URL of your *schnack* instance (e.g. https://schnack.example.com)
    - *Callback URL*: the URL of your *schnack* instance followed by `/auth/twitter/callback` (e.g. https://schnack.example.com/auth/twitter/callback)
    - Check the checkbox "Allow this application to be used to Sign in with Twitter"
- Copy the Consumer Key and the Consumer Secret from "Keys and Access Tokens" to `oauth.twitter.consumer_key` and `oauth.twitter.consumer_secret` in `config.json`

### GitHub

- Create a new GitHub [OAuth App](https://github.com/settings/applications/new)
    - *Application name*: the name of your blog
    - *Homepage URL*: the URL of your *schnack* instance (e.g. https://schnack.example.com)
    - *Application description*: the description of your blog
    - *Authorization callack URL*: the URL of your *schnack* instance followed by `/auth/github/callback` (e.g. https://schnack.example.com/auth/github/callback)

### Google

### Facebook

## Notifications

When new comments are awaiting for approval, *schnack* will notify the administrators using one of the following services:

### web-push

Web-push is a [protocol](https://tools.ietf.org/html/draft-ietf-webpush-protocol-12) designed to send push notifications to browsers on mobile and desktop devices. Using a [Service Worker](https://caniuse.com/#feat=serviceworkers) it is possible to register a component which is always listening for push notifications, even when the tab or the browser are closed. This allows to send end-to-end notifications from the *schnack* server to the admins.

In order to configure web-pushes, you should follow these steps:
- Generate a VAPID key pairs using the web-push package:

```bash
node_modules/.bin/web-push generate-vapid-keys
```

- Copy the VAPID keys in `config.json`
- Add your user ID to the *admin* array in `config.json`
- Copy the [sw.js](https://github.com/schn4ck/schnack/blob/master/sw.js) into your website's root path, so that this will be accessible at https://comments.example.com/sw.js
- Login to your *schnack* instance and you will be asked to grant the permission for push notifications.

When a new comment is posted, you will be notified with a notification. In order to avoid flooding, *schnack* will send only a notification every 5 minutes, highlighting the number of comments awaiting for approval.

We strongly reccommend to subscribe to push notifications using Chrome on your mobile device.

### slack

*schnack* can also send a message to a slack channel when a new comment is awaiting for approval. In order to configure this service just create a slack [webhook](https://api.slack.com/incoming-webhooks) and paste its URL to `notify.slack.webhook_url` in `config.json`.

### PushOver

[PushOver](https://pushover.net/) is a service to send notifications to your devices. You can use it to receive *schnack* notifications. In order to configure it you should first register for an account and download a [client](https://pushover.net/clients). Then you can create an app and copy the token and the key to `notify.pushover.app_token` and `notify.pushover.user_key` in `config.json`.

### RSS

If none of the notification services fits your needs, you can still use the RSS feed provided at `/feed` to stay updated about the latest comments posted. You can also use this endpoint in combination with services like [IFTTT](https://ifttt.com).

# Administration

Administrators are managed adding or removing their *schnack* user ID to the `admins` array in `config.js`. When a user logs in as administrator, the moderation UI will appear in the certain comment section. By default it's set to `[1]`. So the first user will be an admin.

## Moderation

It is possible to approve or reject single comments, but it is also possible to trust or block a certain user.
An approved comment will be displayed to all users visiting your site, while a rejected comment will be deleted. Comments posted by a trusted users are approved automatically, while comments posted by blocked users will be automatically deleted.

*schnack* also prevents users from posting the same comment twice.

## Trust your friends

You can provide a list of user IDs of people you trust for each authentication provider. For instance, you could use the Twitter API to [get a list of all the people you follow](https://apigee.com/console/twitter?req=%7B%22resource%22%3A%22friends_ids%22%2C%22params%22%3A%7B%22query%22%3A%7B%22stringify_ids%22%3A%22true%22%2C%22cursor%22%3A%22-1%22%7D%2C%22template%22%3A%7B%7D%2C%22headers%22%3A%7B%7D%2C%22body%22%3A%7B%22attachmentFormat%22%3A%22mime%22%2C%22attachmentContentDisposition%22%3A%22form-data%22%7D%7D%2C%22verb%22%3A%22get%22%7D) and drop that into the `trust.twitter` in `config.js`.

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

## Backups

The most effective way to keep a backup of your data is to take a copy of your `comments.db` file, which is actually including all necessary data. If you cannot find this file then you probably set another name to `database.comments` in `config.json`.

# Import comments

It is possible to import [disqus XML export](https://help.disqus.com/customer/portal/articles/472149-comments-export) and [Wordpress XML export](https://en.blog.wordpress.com/2006/06/12/xml-import-export/).
In order to be able to import your comments, a database should already exist and schnack shouldn't be running.
The importer requires **Node.js >= v9**.

## Wordpress

You can export your data from Wordpress following [this guide](https://en.blog.wordpress.com/2006/06/12/xml-import-export/). Then you can run the following to import the comments into schnack's database:

```bash
npm run import -- wordpress.xml
```

## Disqus

You can [export](https://help.disqus.com/customer/portal/articles/472149-comments-export) your disqus comments and import them into schnack running:

```bash
npm run import -- disqus.xml
```

# Docker

You can build a Docker image for the schnack server running:

```bash
docker build -t schn4ck/schnack .
```

The image will contain everything in the project folder and can be started with:

```bash
docker run -p 3000:3000 -d schn4ck/schnack
```

In order to be able to edit your config file and your SQL database files, you may want to share the project folder with the docker container:

```bash
docker run -p 3000:3000 -v $(pwd):/usr/src/app -d schn4ck/schnack
```
# Try schnack

Here you can leave us some comments. Let us know what you think about schnack!
