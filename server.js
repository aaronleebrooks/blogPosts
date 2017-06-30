const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {blogPost} = require('./models');

const app = express();
app.use(bodyParser.json());

app.get('/blog-posts', (req, res) => {
  blogPost
    .find().limit(10).exec().then(blogPosts => {
      res.json({
        blogPosts: blogPosts.map(
          (blogPost) => blogPost.apiRepr())
      });
    })
    .catch(
      err =>{
        console.log(err);
        res.status(500).json({message: 'Internal server error'});
      })
});

app.post('/blog-posts', (req, res) =>{

  const requiredFields = ['title', 'content', 'author', 'publishDate'];
  for (let i=0; i<requiredFields.length;i++){
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  blogPost
    .create({
    title:req.body.title,
    content: req.body.content,
    author: req.body.author,
    publishDate: req.body.publishDate
    })
    .then(
      blogPost => res.status(201).json(restaurant.apiRepr()))
    .catch(
      err =>{
        console.log(err);
        res.status(500).json({message: 'Internal server error'});
      })
});

app.put('/blog-posts', (req, res) => {
  if (req.params.id !== req.body.id) {
  const message = (
    `Request path id ${req.params.id} and request body id ${req.body.id} must match`);
  console.error(message);
  return res.status(400).send(message);
  }

  const toUpdate = {};
  const updateableFields = ['title', 'content', 'author', 'publishDate'];

  updateableFields.forEach(field =>{
    if (field in req.body){
      toUpdate[field] = req.body[field];
    }
  });

  blogPost
    .findByIdAndUpdate(req.params.id)
    .exec()
    .then(blogPost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
})

app.delete('/blog-posts/:id', (req, res) => {
  blogPost
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(restaurant => res.status(500).json({message: 'Internal server error'}));
    .catch(err => res.status(500).json({message: 'Internal server error'}));
})

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if(err) {
        return reject(err);
      }
    })
    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve(server);
    })
    .on('error', err => {
      mongoose.disconnect();
      reject(err)
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
