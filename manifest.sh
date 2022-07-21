#!/bin/bash

REPO=jasworks/schnack
VARIANT=$1

docker manifest create --amend $REPO:$VARIANT \
	$REPO:x86_64-$VARIANT \
	$REPO:aarch64-$VARIANT

docker manifest inspect $REPO:$VARIANT

echo -n "Ready to push manifest ?"
read ans

if [ $ans = "y" ]
then
	docker manifest push $REPO:$VARIANT
fi
