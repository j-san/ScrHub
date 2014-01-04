
# Scrum Hub
[![Build Status](https://travis-ci.org/j-san/ScrHub.png?branch=master)](https://travis-ci.org/j-san/ScrHub)
[![Dependency Status](https://david-dm.org/j-san/ScrHub.png)](https://david-dm.org/j-san/ScrHub)
[![Coverage Status](https://coveralls.io/repos/j-san/ScrHub/badge.png?branch=master)](https://coveralls.io/r/j-san/ScrHub?branch=master)

This project is an interface disagned for scrum with GitHub, all stories data
is stored on GitHub using GitHub api, no secondary DB.

Written in Javascript for Node.js on Express.js, with a Mongodb database and Mongoose server side and backbone, Require.js and Twitter Bootstrap client side.

## Install

When Node.js is installed run:

```bash
npm install
```

### Run in dev mode:

Install grunt

```bash
sudo npm install -g grunt-cli
```

Create a .env file

```
NODE_ENV=dev
MONGO_URL=mongodb://example.com/scrhub
```

Then run the server with a watcher

```bash
grunt server
```

### Run in production mode:

create a .env file

```
NODE_ENV=prd
MONGO_URL=mongodb://example.com/scrhub
```

Export a serice with [Forman](http://ddollar.github.io/foreman/)


You can also try it at http://www.scrhub.com/

Self product backlog: http://www.scrhub.com/j-san/ScrHub/backlog/




todo:
- rename index => app, files => public
- review coverage report
- console level print winston ?
- github api => stories.list, stories.get, stories.update, ...