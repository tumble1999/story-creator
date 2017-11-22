const mongoose = require('mongoose');

const storyID = require('../config/story_id');

const Schema = mongoose.Schema;
const ObjectID = Schema.ObjectID;

var StorySchema = new Schema({
  title: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  currentSentence: {
    type: Number,
    default: 0
  },
  currentWord: {
    type: Number,
    default: 0
  },
  text: {
    type: [[String]]
  }

});

StorySchema
.virtual('url')
.get(function () {
  return '/story/' + this[storyID.attribute];
});

StorySchema
.virtual('fullStory')
.get(function () {
  var story = [];

  for (var i = 0; i < this.text.length; i++) {
    story[i] = this.text[i].join(" ");
    if (i<this.currentSentence) {
      story[i]+=".";
    }
  }
  return story.join(" ");
});

StorySchema
.virtual('preview')
.get(function () {
  var story = [];
  var min = this.currentSentence-2;
  var max = this.currentSentence+1;

  if (min<0) {
    min=0;
  }

  if (this.text[0]) {
    for (var i = min; i < max; i++) {
      if (this.text[i]) {
        story[i] = this.text[i].join(" ");
        if (i<this.currentSentence) {
          story[i]+=".";
        }
      }
    }
    return story.join(" ") + " ";
  }
  else {
    return "";
  }
});


module.exports = mongoose.model('Story', StorySchema);
