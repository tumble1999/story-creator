var express = require('express');
var router = express.Router();

var StoryController = require('../controllers/storyController');

var story = require('./story');
var stories = require('./stories');


router.use(function (req, res, next) {
  res.io.on('connection', function (socket) {
    console.log('[Socket.io]: Client connected.');
    res.io.emit('connection_success');

    socket.on('story_list_update_req', function () {
      console.log('[Socket.io]: Stories Requested.');
      StoryController.story_list_update_req(function (error, results) {
        console.log('[Socket.io]: Sending Stories....');
        res.io.emit('story_list_update_res', error, StoryController.story_html_array(results));
      });
    });

    socket.on('disconnect',function () {
      console.log("[Socket.io]: Client Disconnected.")
    });
  });
  next();
});

router.use('/story', story);
router.use('/stories', stories);



/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.redirect('/stories');
});


module.exports = router;
