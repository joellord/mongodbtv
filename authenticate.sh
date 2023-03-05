#!/bin/bash
if [ -z $1 ]
then
  echo "Usage: authenticate.sh <AUTHENTICATION_METHOD> <USER/TOKEN>"
  exit 1
fi

AUTH_PROVIDER=$1

if [ $AUTH_PROVIDER != "local-userpass" ] && [ $AUTH_PROVIDER != "anon-user" ] && [ $AUTH_PROVIDER != "custom-token" ]
then
  echo "First argument must be one of local-userpass, anon-user, custom-jwt"
  exit 1
fi

if [ $AUTH_PROVIDER == "local-userpass" ] && [ -z $2 ]
then
  echo "You must provide a user (user@mongodbtv.com or admin@mongodbtv.com)"
  exit 1
fi

USERNAME=$2
PASSWORD=password

if [ $AUTH_PROVIDER == "custom-token" ] && [ -z $2 ]
then
  echo "You must provide a JWT"
  exit 1
fi

JWT=$2

# valid JWT for testing
# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI6ImFkbWluQG1vbmdvZGJ0di5jb20iLCJyb2xlIjoiYWRtaW4iLCJhdWQiOiJtb25nb2RiLXR2LWFwcC1ic3Z6ZyIsImlhdCI6MTY3NzkzNzA3OCwiZXhwIjoxNjg3OTM2ODE2fQ.VLafOUfa3HZj20tyzEhndmhDMmzTftdlmBay6qzs6WM
# secret for JWT: thisisanotherverylongkeytobeusedwithjwts

APP_ID=mongodb-tv-app-bsvzg
BASE_URL=https://realm.mongodb.com/api/client/v2.0/app/$APP_ID
# anon-user local-userpass custom-token
LOGIN_URL=$BASE_URL/auth/providers/$AUTH_PROVIDER/login
DATA_BASE=https://data.mongodb-api.com/app/mongodb-tv-app-bsvzg/endpoint
DATA_URL=$DATA_BASE/api/epg

if [ "$AUTH_PROVIDER" == "anon-user" ]
then
  TOKEN=$(curl -X POST $LOGIN_URL | jq -r .access_token)
fi

if [ "$AUTH_PROVIDER" == "local-userpass" ]
then
  TOKEN=$(curl -X POST $LOGIN_URL --header "Content-Type: application/json" --data-raw '{"username": "'$USERNAME'", "password": "'$PASSWORD'"}' | jq -r .access_token)
fi

if [ "$AUTH_PROVIDER" == "custom-token" ]
then
  RESULT=$(curl -X POST $LOGIN_URL --header "Content-Type: application/json" --data-raw '{"token": "'$JWT'"}')
  TOKEN=$(echo $RESULT | jq -r .access_token)
fi

if [ -z $TOKEN ] || [ $TOKEN == "null" ]
then
  echo "No access token received, an error occurred"
  echo $RESULT
  exit 1
fi

echo "Got access token, trying a request to the custom API"
# Insert data
# curl -H "Authorization: Bearer "$TOKEN -H "Content-Type: application/json" -X POST --data-raw '{"title": "New Stream"}' $DATA_URL
# Get data
curl -H "Authorization: Bearer "$TOKEN -H "Content-Type: application/json" -X GET $DATA_URL
