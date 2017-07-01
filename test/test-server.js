const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Blog Poster', function(){
	before(function() {
    	return runServer();
  });

  	after(function() {
    	return closeServer();
  });

  it('should list items on GET', function() {
   return chai.request(app)
     .get('/blog-posts')
     .then(function(res) {
     res.should.have.status(200);
     res.should.be.json;
     res.body.should.be.a('array');
    // because we create three items on app load
     res.body.length.should.be.at.least(1);
        // each item should be an object with key/value pairs
        // for `id`, `name` and `checked`.
     const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
     res.body.forEach(function(item) {
     item.should.be.a('object');
     item.should.include.keys(expectedKeys);
     });
   });
  });

  it('should create a new recipe on POST', function(){
    const newItem = {title: 'Gone with the Wind', content: 'is a book by an author', author: 'Myself', publishDate: '02/39/57'};

    return chai.request(app)
      .post('/blog-posts')
      .send(newItem)
      .then(function(res){
      res.should.have.status(201);
      res.should.be.json;
      res.body.should.be.a('object');
      res.body.id.should.not.be.null;
      res.body.should.include.keys('id', 'title', 'content', 'author', 'publishDate');
      res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
    })
  });

  it('should delete a recipe on DELETE', function(){
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res){
      return chai.request(app)
        .delete(`/blog-posts/${res.body[0].id}`);
    })
    .then(function(res){
      res.should.have.status(204);
    });
  });

  it('should update a recipe on PUT', function(){
    const updatedData = {title: 'Gone with the Wind', content: 'is a book by an author', author: 'Myself', publishDate: '02/39/57'};

    return chai.request(app)
    .get('/blog-posts')
    .then(function(res){
      updatedData.id = res.body[0].id;

      return chai.request(app)
        .put(`/blog-posts/${updatedData.id}`)
        .send(updatedData)
    })
    .then(function(res){
      res.body.should.be.a('object');
      res.should.be.json;
      res.should.have.status(200);
      res.body.should.deep.equal(updatedData);
    });
  });
})