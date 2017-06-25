const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const {BlogPosts} = require('./models');

const jsonParser = bodyParser.json();

BlogPosts.create('Why I Am Cool', 'Well now that you mention it, why am I cool?', 'Uncle Joey', '06/19/17');
BlogPosts.create('Why Is He Cool', 'Well now that he mentions it, why is he cool?', 'Uncle Jesse', '06/20/17');

router.get('/', (req, res) => {
	res.json(BlogPosts.get());
});

router.post('/', jsonParser, (req, res) => {
	const requiredFields = ['title', 'content', 'author', 'publishDate'];
	for (let i=0; i<requiredFields.length;i++){
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing ${field} in request body`
			console.error(message);
			return res.status(400).send(message);
		}
	}
	const item = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate);
	res.status(201).json(item);
});

router.delete('/:id', (req, res) =>{
	BlogPosts.delete(req.params.id);
	console.log(`Deleted shopping list item ${req.params.ID}`);
	res.status(204).end();
});

router.put('/:id', jsonParser, (req, res) =>{
	const requiredFields = ['title', 'content', 'author', 'publishDate'];
	for (let i=0; i<requiredFields.length;i++){
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing ${field} in request body`
			console.error(message);
			return res.status(400).send(message);
		}
	}
  if (req.params.id !== req.body.id) {
    const message = (
      `Request path id ${req.params.id} and request body id ${req.body.id} must match`);
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating shopping list item ${req.params.id}`);
  const updatedItem = BlogPosts.update({
  	id: req.params.id,
  	title:req.body.title,
  	content: req.body.content,
  	author: req.body.author,
  	publishDate: req.body.publishDate
  });
  res.json(updatedItem);
})

module.exports = router;
