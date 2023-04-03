const express = require('express');
// database connection

const app = express();

// database connection
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const username = process.env.MONGODB_USER;
const password = process.env.MONGODB_PASSWORD;

const MONGO_URI = `mongodb+srv://${username}:${password}@clusterexpress.gl8uvk3.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Connected to mongoDB');
});

mongoose.connection.on('error', (err) => {
    console.log('Error connecting to mongoDB', err);
});

// middleware
app.use(express.json());
// cors
const cors = require('cors');
app.use(cors());

// middleware authentication jwt
const requireLogin = require('./middleware/requireLogin');
app.use(requireLogin);

// routes middleware
app.use('/api/blog', require('./routes/blog'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

const port = process.env.PORT || 8000;

// print all routes
function print (path, layer) {
  if (layer.route) {
    layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))))
  } else if (layer.name === 'router' && layer.handle.stack) {
    layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))))
  } else if (layer.method) {
    console.log('%s /%s',
      layer.method.toUpperCase(),
      path.concat(split(layer.regexp)).filter(Boolean).join('/'))
  }
}

function split (thing) {
  if (typeof thing === 'string') {
    return thing.split('/')
  } else if (thing.fast_slash) {
    return ''
  } else {
    var match = thing.toString()
      .replace('\\/?', '')
      .replace('(?=\\/|$)', '$')
      .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
    return match
      ? match[1].replace(/\\(.)/g, '$1').split('/')
      : '<complex:' + thing.toString() + '>'
  }
}

app._router.stack.forEach(print.bind(null, []))

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


