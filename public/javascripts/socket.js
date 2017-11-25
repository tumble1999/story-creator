var socket = io();

$(function () {
  var lastContent = "";
  var list = $('div.story_list');
  var preview = $('span.story_preview');

  socket.on('connection_success', function () {
    console.log("[Socket.io]: Server Connected");
  });

  socket.on("story_list_update_res", function (error, stories) {
    console.log('[Socket.io]: Stories Recived.');
    console.log(stories);
    var lastContent = list.html();
    list.empty();
    if (error) {
      list.append("<p>Error: " + error + "</p>");
      list.append(lastContent);
      console.log('[Socket.io]: Stories are bad.');
      console.log('[Socket.io]: Requesting again for stories');
      socket.emit('story_list_update_req');
      return;
    }
    else {
      for (var i = 0; i < stories.length; i++) {
        list.append(stories[i]);
      }
    }
  });

  socket.on("story_preview_update_res", function (id, error, story) {

    //TODO: possible error for not being on a story detail page

    console.log('[Socket.io]: Preview Recived.');
    console.log(story);
    var lastContent = list.html();
    preview.empty();
    if (error) {
      console.log('[Socket.io]: Preview recived is bad.');
      console.log('[Socket.io]: Requesting again for preview');
      preview.append(lastContent);
      socket.emit('story_preview_update_req');
      return;
    }
    else {
      preview.append(story);
    }
  });
});
