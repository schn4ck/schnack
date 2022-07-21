#!/bin/bash

REPO=jasworks/schnack
ARCH=`uname -p`
VARIANT=$1

docker build -t $REPO:$ARCH-$VARIANT -f Dockerfile.$VARIANT .
docker push $REPO:$ARCH-$VARIANT
