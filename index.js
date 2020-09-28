const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const MONGO_URL = 'mongodb://localhost:27017/sc-demo';

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const sessionStore = new MongoDBStore({
  uri: MONGO_URL,
  collection: 'sessions',
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
});

sessionStore.on('error', function (error) {
  console.log('sessionStore error', error);
});

const User = mongoose.model('User', { username: String, password: String });

// const kitty = new Cat({ name: 'Zildjian' });
// kitty.save().then(() => console.log('meow'));

const app = express();

const PORT = 3005;

app.use(cors({ credentials: true, origin: true }));

app.use(
  session({
    secret: '9y32u4n324n234ui2423n4;l73;4o6p',
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: sessionStore,
    resave: true,
    saveUninitialized: true
  })
);

app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`Request incoming: ${req.url}`);
  next();
});

app.get('/currentUser', (req, res) => {
  console.log(req.session);

  res.json(req.session.user || {});
});

app.post('/logout', async (req, res) => {
  console.log('logout', req.body);
  delete req.session.user;
  res.json({
    success: true
  });
});

app.post('/login', async (req, res) => {
  console.log('login attempt', req.body);

  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password
  });

  if (user) {
    req.session.user = {
      _id: user._id,
      username: user.username
    };
    res.json({
      success: true,
      user: req.session.user
    });
  } else {
    res.json({
      success: false,
      message: 'incorrect login details'
    });
  }
});

app.post('/register', async (req, res) => {
  console.log('register attempt', req.body);

  if (await User.exists({ username: req.body.username })) {
    res.json({
      success: false,
      message: 'username already taken'
    });
  } else {
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
    await user.save();

    res.json({
      success: true
    });
  }
});

app.listen(PORT);
console.log(`Listening on port: ${PORT}`);
