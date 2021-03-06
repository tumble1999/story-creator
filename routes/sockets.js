const express = require('express');
const router = express.Router();

var StoryController = require('../controllers/storyController');

router.use(function (req, res, next) {
  res.io.on('connection', function (socket) {
    console.log('[Socket.io]: Client ' + socket.id + ' connected.');
    res.io.emit('connection_success');

    socket.on('story_list_update_req', function () {
      console.log('[Socket.io]: Stories Requested.');
      StoryController.story_array_req(function (error, results) {
        console.log('[Socket.io]: Sending Stories to client ' + socket.id + '....');
        socket.emit('story_list_update_res', error, StoryController.story_html_sentence_array(results));
      });
    });

    socket.on('story_preview_update_req', function (id) {
      console.log('[Socket.io]: Story preview requested by client ' + socket.id + '.');
      //console.log('id: ' + id);
      StoryController.story_preview_req(id, function (error, results) {
        console.log('[Socket.io]: Sending Story text preview to client ' + socket.id + '...');
        //console.log('results: ' + results);
        socket.emit('story_preview_update_res', id, error, results.preview, results.currentWord, results.currentSentence, results.completed);
      });
    });

    socket.on('disconnect',function () {
      console.log("[Socket.io]: Client " + socket.id + " Disconnected.")
    });
  });
  next();
});

module.exports = router;
