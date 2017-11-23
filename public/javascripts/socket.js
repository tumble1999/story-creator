var socket = io();

var Reconnect = function() {
  socket = io();
};

$(function () {
  var lastContent = "";
  var list = $('div.story_list');

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
      return;
    }
    else {
      for (var i = 0; i < stories.length; i++) {
        list.append(stories[i]);
      }
    }
  });
});
