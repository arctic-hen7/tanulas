#!/bin/bash
# Simple shell script that get a new token for the workshop server. This will be valid for three
# hours.

if [[ "$1" == "--local" ]]; then
    url="http://localhost:8000/api/token"
else
    url="https://unsw-founders-tanulas.deno.dev/api/token"
fi

read -p "What is your email address?: " email
read -p "What is the password?: " secret
echo

token=$(curl -sfX POST "$url" -H "Content-Type: application/json" -d "{\"email\": \"$email\", \"secret\": \"$secret\"}")
if [ "$?" -eq 0 ]; then
    echo "Token fetched successfully! Please copy the below value and paste it into routes/config.ts, in the quotation marks for the SERVER_TOKEN value. (Make sure you get rid of any line breaks after pasting!)"
    echo
    echo "$token"
else
    echo "Failed to fetch token! Please make sure you have a working internet connection and that you're entering the correct workshop password, and then ask the workshop demonstrator for help."
fi
