const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const blogPostRouter = require('./blogRouter');

const app = express();

const blogRouter = require('./blogRouter');

app.use(morgan('common'));

app.use(express.static('public'));

app.use('/blog-posts', blogPostRouter);

let server;

function runServer() {
  const port = process.env.PORT || 4500;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve(server);
    }).on('error', err => {
      reject(err)
    });
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}


app.listen(process.env.PORT || 4500, () => {
	console.log(`Your app is listening on port ${process.env.PORT || 4500}`);
})

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
