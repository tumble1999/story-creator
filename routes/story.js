var express = require('express');
var router = express.Router();

var storyController = require('../controllers/storyController');

router.get('/', function (req, res) {
  res.redirect('/stories');
});

router.get('/:id', storyController.story_detail_get);
router.post('/:id', storyController.story_detail_post);

module.exports = router;
