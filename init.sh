#!/bin/bash

# Use npm install @schnack/plugin-auth-github to install additional plugins. Plugin list can be found here:
# https://github.com/schn4ck/schnack-plugins

if [ -f config/plugins ]
then
  echo "Installing plugins"
	source config/plugins
  echo "Done installing plugins"
fi

if [ "x$NODE_ENV" = "x" ]
then
	NODE_ENV=production
fi

export NODE_ENV

if [ "x$PUID" = "x" ]
then
  echo "Run server"
  npm run server
else
  echo "Creating user $PUID"
  useradd -u $PUID -U -d /usr/src/app appuser
  if [ $? -ne 0 ]
  then
    echo "Cannot create user"
    exit 1
  else
    export NODE_ENV && su - appuser -c "export NODE_ENV=$NODE_ENV && cd /usr/src/app && npm run server"
  fi
fi
