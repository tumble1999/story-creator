var express = require('express');
var router = express.Router();

var story = require('./story');
var stories = require('./stories');

router.use('/story', story);
router.use('/stories', stories);

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.redirect('/stories');
});

module.exports = router;
