const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {BlogPost} = require('./models');

const app = express();
app.use(morgan('common'));
app.use(bodyParser.json());

app.get('/posts', (req, res) => {
  BlogPost
    .find()
    .exec()
    .then(blogPosts =>{
      res.json(blogPosts.map(blogPost => blogPost.apiRepr()));
      })
    .catch(
      err =>{
        console.log(err);
        res.status(500).json({message: 'Internal server error'});
      })
});

app.get('/posts/:id', (req, res) => {
  BlogPost
    .findById(req.params.id)
    .exec()
    .then(post => res.json(post.apiRepr()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

app.post('/posts', (req, res) =>{

  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++){
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  BlogPost
    .create({
    title:req.body.title,
    content: req.body.content,
    author: req.body.author,
    })
    .then(
      blogPost => res.status(201).json(blogPost.apiRepr()))
    .catch(
      err =>{
        console.log(err);
        res.status(500).json({message: 'Internal server error'});
      })
});

app.put('/posts', (req, res) => {
  if (req.params.id !== req.body.id) {
  const message = (
    `Request path id ${req.params.id} and request body id ${req.body.id} must match`);
  console.error(message);
  return res.status(400).send(message);
  }

  const toUpdate = {};
  const updateableFields = ['title', 'content', 'author'];

  updateableFields.forEach(field =>{
    if (field in req.body){
      toUpdate[field] = req.body[field];
    }
  });

  BlogPost
    .findByIdAndUpdate(req.params.id)
    .exec()
    .then(newBlogPost => res.status(201).json(newBlogPost.apiRepr()))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
})

app.delete('/posts/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(blogPost => res.status(204).json({message: 'success'}))
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
      resolve();
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
