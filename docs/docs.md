# Quickstart

This is the fastest way to setup *schnack*. 

**Requirements**:
- Node.js (>= v6)
- npm (>= v5)

Clone or download schnack:
```
git clone https://github.com/gka/schnack
```
Go to the schnack directory:
```
cd schnack
```

Install dependencies:
```
npm install
```
Copy and edit the config file according to [Configuration](#Configuration):
```
cp config.tpl.json config.json
```

Run the server:
```
npm start
```

- Embed in your HTML page:
```html
<div class="comments-go-here"></div>
<script src="https://comments.yoursite.com/embed.js"
    data-schnack-slug="post-slug"
    data-schnack-target=".comments-go-here">
</script>
```

# Configuration

## General

## Authentication
- secret

### Twitter

### GitHub

### Google

### Facebook

## Notifications

### web-push

### slack

### PushOver

## Trust your friends

# Administration

## Moderation

## Backups

# Import comments

## WordPress
## Disqus

# Docker

# How it works ?

# Development

