#!/bin/sh
rsync -avz \
        --exclude 'rsync.sh' \
        --exclude '.git/' \
        --exclude '*.swp' \
        --exclude 'node_modules' \
        --exclude '*.db' \
        --exclude 'config.json' \
        --exclude 'npm-debug.log' \
        --exclude '.git*' \
        . \
        yggdrasil:/root/setup/dockerfiles/etatismus/schnack-image/schnack
