#! /bin/sh

hps=$(heroku ps --remote heroku 2>&1)
(echo $hps | grep "No dynos" >/dev/null 2>&1) || { remote="heroku"; not="heroku1" }
(echo $hps | grep "No dynos" >/dev/null 2>&1) && { remote="heroku1"; not="heroku" }  # out of hours on main

echo "Deploying from branch $(git branch --show-current) to remote $remote."

if [ ! $(git branch --show-current) = "master" ]; then
    echo "Can only deploy from branch master. Abort."
    exit 1
fi

rm -f tar
tar cf tar serviceAccountKey-dev.json serviceAccountKey-prod.json config-dev.json config-prod.json api-token.json >/dev/null 2>&1  # shh
s=$?
bruh=0  # bruh
oink=0  # oink oink

function cleanup()
{
    if [ $bruh -eq 0 ]; then
        bruh=1
        echo "Cleaning up."
        git reset --hard HEAD~ >/dev/null 2>&1  # oh, shut up
        if [ $oink -eq 1 ]; then
            git stash pop >/dev/null 2>&1  # you shut up too
        fi
        tar xf tar >/dev/null 2>&1  # go away
        rm -f tar
    fi
}

trap cleanup SIGINT

if [ ! $s -eq 0 ]; then
    echo "Config files do not exist. Abort."
    exit 1
fi

git add -f serviceAccountKey-dev.json serviceAccountKey-prod.json config-dev.json config-prod.json api-token.json >/dev/null 2>&1  # please just shut up
s1=$?
git commit --allow-empty -m $remote >/dev/null 2>&1  # please just shut up as well
if [ "$(git status --porcelain)" ]; then
    git stash --all >/dev/null 2>&1
    oink=1
fi

if [ $s1 -eq 0 ]; then
    heroku restart --remote $remote >/dev/null 2>&1
    heroku builds:clear --remote $remote >/dev/null 2>&1 
    git push -fq $remote master 2>&1 | sed 's/^remote: //g; s/^-----//g; s/^     //g; /^[ \t]*$/d'
    echo "Killing dyno on remote $not."
    heroku ps:stop --remote $not
    cleanup
    exit 0
else
    echo 'Failed to add config files. Abort.'
    cleanup
    exit 1
fi
