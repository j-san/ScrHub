
# Scrum Hub
[![Build Status](https://travis-ci.org/j-san/ScrHub.png?branch=master)](https://travis-ci.org/j-san/ScrHub)
[![Dependency Status](https://david-dm.org/j-san/ScrHub.png)](https://david-dm.org/j-san/ScrHub)
[![Coverage Status](https://coveralls.io/repos/j-san/ScrHub/badge.png?branch=master)](https://coveralls.io/r/j-san/ScrHub?branch=master)
[ ![Codeship Status for j-san/ScrHub](https://www.codeship.io/projects/7b863fd0-57bc-0131-db5e-1a858a86a816/status?branch=master)](https://www.codeship.io/projects/11677)

This project is an interface disagned for scrum with GitHub, all stories data
is stored on GitHub using GitHub api, no secondary DB.

Written in Javascript for Node.js on Express.js, with a Mongodb database and Mongoose server side and backbone, Require.js and Twitter Bootstrap client side.

## Install

When Node.js and Npm are installed run:

```bash
npm install
```

### Run for dev:

```bash
node src/app
```

With a watcher

```bash
sudo npm install -g supervisor

supervisor src/app
```

### Run tests

Install grunt

```bash
sudo npm install -g grunt-cli

grunt
```

### Run in production mode:


Create a .env file

```
NODE_ENV=prd  # default to dev
MONGO_URL=mongodb://example.com/scrhub  # default to localhost
```

Then run the server:

```bash
foreman start -p 1337
```

Export a system serice with [Forman](http://ddollar.github.io/foreman/)


You can also try it at http://www.scrhub.com/

Self product backlog: http://www.scrhub.com/j-san/ScrHub/backlog/
