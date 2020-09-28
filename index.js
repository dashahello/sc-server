const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/sc-demo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const User = mongoose.model('User', { username: String, password: String });

// const kitty = new Cat({ name: '' });
// kitty.save().then(() => console.log('meow'));

// (async () => {
//   const cats = await Cat.findOne({});
//   console.log(cats);
// })();

const app = express();

const PORT = 3005;

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`Request incoming: ${req.url}`);
  next();
});

app.post('/login', (req, res) => {
  console.log('login', req.body);

  res.json({
    asd: 'asd'
  });
});

app.post('/register', async (req, res) => {
  console.log('register', req.body);

  if (await User.exists({ username: req.body.username })) {
    res.json({
      success: false,
      reason: 'username already taken'
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
