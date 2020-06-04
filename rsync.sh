#!/bin/sh
rsync -avz \
        --exclude 'rsync.sh' \
        --exclude '.git/' \
        --exclude '*.swp' \
        --exclude 'node_modules' \
        --exclude '*.db' \
        --exclude 'npm-debug.log' \
        --exclude '.git*' \
        --exclude 'build/' \
        . \
        yggdrasil:/root/data/etatismus/schnack
