#!/bin/bash

# Use npm install @schnack/plugin-auth-github to install additional plugins. Plugin list can be found here:
# https://github.com/schn4ck/schnack-plugins

if [ -f config/plugins ]
then
	source config/plugins
fi


npm run server
