function refresh() {
  console.log('[Socket.io]: Requesting Preview Update...');
  socket.emit('story_preview_update_req',$('span.story_id').text())
}

$(function() {
  setInterval(refresh, 1000); // Time in milliseconds
});
