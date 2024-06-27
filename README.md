# TODO.js

This repo is a project for the *Database applications* course I'm taking at my University. It's a simple TODO app written in Nodejs with Express, Passportjs Google authentication and MongoDB.

# Requirements:
 - [Nodejs](https://nodejs.org)
 - [npm](https://www.npmjs.com/)
 - [Docker](https://www.docker.com/)
 - [OAuth 2.0 Google Client IDs](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)

# Quick Setup

Download this repository using:
```bash
$ git clone https://github.com/wedkarz02/todojs.git
```
or use the *Download ZIP* option from the GitHub repository page.

Install the dependencies:
```bash
$ npm install
```

Setup and run MongoDB in a Docker container:
```bash
$ npm run dbSetup
$ npm run dbStart
```

Please note that running *dbSetup* **will delete any container named 'mongodb' if it exists**. You can also stop the database by running *dbStop*.

To run the application:
```bash
$ npm run start
```
or:
```bash
$ npm run dev
```

To open the app, visit http://localhost:5000/ or other address set in the *.env* file.

# .env

This project uses the following enviroment variables:

|                      |
|----------------------|
| PORT                 |
| DB_NAME              |
| DB_PORT              |
| DB_HOST              |
| SESSION_SECRET       |
| GOOGLE_CLIENT_ID     |
| GOOGLE_CLIENT_SECRET |
| GOOGLE_CALLBACK_URL  |

```GOOGLE_CALLBACK_URL``` should always be set to ```http://HOST_NAME:PORT/google/callback```.

Example *.env* file:

```.env
PORT=5000
DB_NAME="myawsomedb"
DB_PORT=27017
DB_HOST="127.0.0.1"
SESSION_SECRET="secret"
GOOGLE_CLIENT_ID="123-abc456.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xyz789"
GOOGLE_CALLBACK_URL="http://localhost:5000/google/callback"
```

See [this](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid) for more info on the Google stuff.
