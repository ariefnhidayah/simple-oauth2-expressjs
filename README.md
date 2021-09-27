# Simple Oauth2 Google With Express JS
This is a repository oauth2 google with express js. This is a simple project for learning about oauth2. This project use express js and google. And use docker for containerizing.

## Pre Installation
Before you install this project. You must install node js, npm and docker. And you must have google account.

## Installation
You can running this script for running docker in your local. But before you running this script, you must running your docker in your local pc.
```
docker-compose up -d
```

And you can access **http://localhost:3000**

The following is a routes in this project
- GET => auth/google/url # routes for get url login to google, this route return a link / url for login to google account
- GET => auth/me?token=token # routes for get data your google account with earned token from a logged in google account
