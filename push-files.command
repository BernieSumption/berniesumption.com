#!/bin/sh

cd `dirname $0`/dist


read -p "Enter 'push' to transfer, or anything else for dry run: " p
if [ x$p == xpush ]; then
	export DRY=
	echo "Overwriting SERVER with files from LOCAL"
else
	export DRY=--dry-run
	echo "DRY RUN coming up"
fi

echo Syncing folder `pwd`

rsync $DRY -avz --perms --chmod=D+r,D+x --exclude=.DS_Store --checksum --delete ./ berniesumption.com@berniesumption.com:domains/berniesumption.com/html/