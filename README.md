# F20-ESN-SA4
[![BCH compliance](https://bettercodehub.com/edge/badge/cmusv-fse/f20-ESN-SA4?branch=master&token=04128ceae34d24f2717780f0c86e7893df0fab95)](https://bettercodehub.com/)
## Start server

### Mongodb

in MacOS you could user Homebrew

### to start mongodb on macOS

```
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### to install all dependencies

```
yarn --pure-lockfile
```

### to start client

```
yarn dev:client
```

### to start server

```
yarn dev:server
```

### API Documentation
```
[localhost:6003/docs](localhost:6003/docs)
Note: we will move the docs to cloud when we have Heroku ready
```
