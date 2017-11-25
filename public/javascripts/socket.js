var socket = io();

$(function () {
  var lastContent = "";
  var list = $('div.story_list');
  var preview = $('span.story_preview');
  var currentWord = $('span.current_Word');
  var currentSentence = $('span.current_Sentence');

  socket.on('connection_success', function () {
    console.log("[Socket.io][" + socket.id + "]: Server Connected");
  });

  socket.on("story_list_update_res", function (error, stories) {
    console.log('[Socket.io][' + socket.id + ']: Stories Recived.');
    console.log(stories);
    var lastContent = list.html();
    list.empty();
    if (error) {
      list.append("<p>Error: " + error + "</p>");
      list.append(lastContent);
      console.log('[Socket.io][' + socket.id + ']: Stories are bad.');
      console.log('[Socket.io][' + socket.id + ']: Requesting again for stories');
      socket.emit('story_list_update_req');
      return;
    }
    else {
      for (var i = 0; i < stories.length; i++) {
        list.append(stories[i]);
      }
    }
  });

  socket.on("story_preview_update_res", function (id, error, previewText, currentWordText, currentSentenceText, storyCompleted) {
    //TODO: possible error for not being on a story detail page

    console.log('[Socket.io]: Preview Recived.');
    console.log(previewText);
    var previewLast = preview.html();
    var currentWordLast = currentWord.html();
    var currentSentenceLast = currentSentence.html();

    preview.empty();
    currentWord.empty();
    currentSentence.empty();
    if (error) {
      console.log('[Socket.io]: Preview recived is bad.');
      console.log('[Socket.io]: Requesting again for preview');
      preview.append(pre);
      socket.emit('story_preview_update_req', id);
      return;
    }
    else {
      preview.append(previewText);
      currentWord.append(currentWordText);
      currentSentence.append(currentSentenceText);
    }
  });

  socket.on('refresh', function () {
      var redirect = document.createElement('a');
      redirect.href = document.URL;
      redirect.click();
  });
});
