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
  var story = "";
  var wordCount = 5;
  var min = this.currentWord-wordCount;
  var max = this.currentWord;

  if (min<0) {
    min=0;
  }

  if (this.text[this.currentSentence]) {
    for (var i = min; i < max; i++) {
      if (this.text[this.currentSentence][i]) {
        story += this.text[this.currentSentence][i]//.join(" ");
        // if (i<this.currentSentence) {
        //   story[i]+=".";
        // }
      }
    }

    if (story.split(" ").length<wordCount) {
      if (this.currentSentence>0) {

        var prev = "";
        for (var i = wordCount - story.split(" ").length; i < this.text[this.currentSentence-1].length; i++) {
          if (this.text[this.currentSentence-1][i]) {
            prev += this.text[this.currentSentence-1][i];
          }
        }
        story = prev + ". " + story;
      }
    }
    return story/*.join(" ")*/ + " ";
  }
  else {
    return "";
  }
});


module.exports = mongoose.model('Story', StorySchema);
