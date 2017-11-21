var express = require('express');
var router = express.Router();

var storyController = require('../controllers/storyController');

router.get('/', storyController.story_list_get);

router.get('/create', storyController.story_create_get);
router.post('/create', storyController.story_create_post);

router.get('*', function (req, res) {
  res.redirect('/stories');
});

module.exports = router;
