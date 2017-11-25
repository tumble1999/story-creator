const express = require('express');
const async = require('async');

const Story = require('../models/story');
const storyID = require('../config/story_id');

const min = {
  words: 20,
  sentences: 100
}

// Displys the create story form
exports.story_create_get = function (req, res) {
  res.render('story_create', {
    title: "Create Story"
  });
};

//Creates a story when the form is submitted
exports.story_create_post = function (req, res) {
  var title = req.body.title.split(' ').join('') || "";

  Story
  .find({title: title})
  .exec(function (err, results) {
    if (err) {
      res.render('story_create', {
        title: "Create Story",
        error: err
      });
      return;
    }
    if (results[0]) {

      //EXISTS
      res.redirect(results[0].url);
    }
    else {
      var newStory = new Story({title: title});
      newStory.save(function (err) {
        if (err) {
          res.render('story_create', {
            title: "Create Story",
            error: err
          });
          return;
        }

        //CREATED
        module.exports.story_array_req(function (error, results) {
          console.log('[Socket.io]: Sending Stories....');
          res.io.emit('story_list_update_res', error, module.exports.story_html_sentence_array(results));
        });

        res.redirect(newStory.url);
      });
    }
  });
};

//Displays the list of stories for the home page
exports.story_list_get = function (req, res) {

  Story
  .find({})
  .sort({complete: 1})
  .exec(function (error, results) {
    res.render('story_list', {
      title: "Stories",
      stories: results,
      error:error
    });
  });
};

//Displays the story detail page where you can add a word
exports.story_detail_get = function (req, res) {
  Story
  .findOne({[storyID.attribute]:req.params.id})
  .exec(function (error, results) {
    res.render('story_details', {
      title: results.title + " - Story",
      story: results,
      id: req.params.id,
      error: error,
      min: min
    });
  });
};

//addes a word to the story when one is submittd
exports.story_detail_post = function (req, res) {
  var words = req.body.word.split('.').join('').split(' ') || [""];
  var wordCount = words.length;
  var action = req.body.action;
  var id = req.params.id;

  Story
  .findOne({[storyID.attribute]:id})
  .exec(function (error, results) {
    if(words[0] === "" | words[0] === undefined | words.length === 0 | words === "" | words === undefined) {
      error = "Nothing was entered."
    }
    if(error) {
      res.render('story_details', {
        title: results.title + " - Story",
        story: results,
        error: error,
        min: min
      });
      return;
    }
    var newdata = results;
    var errorError;
    switch (action) {
      case "Add Word":
        if (newdata.text===undefined) {
          newdata.text = [[]];
        }
        if (newdata.text[newdata.currentSentence]===undefined) {
          newdata.text[newdata.currentSentence] = [];
        }
        for (word of words) {
          newdata.text[newdata.currentSentence][newdata.currentWord]=word;
          newdata.currentWord++;
        }
        break;
      case "New Sentence":
        newdata.currentSentence++;
        newdata.currentWord=0;
        break;
      case "Complete Story":
        newdata.completed=true;
        newdata.currentSentence=0;
        newdata.currentWord=0;
        break;
      default:
        errorError = "No action specified.";
    }
    results.update(newdata, function (error) {
      if(error){
        errorError = error;
        return;
      }
      console.log('[Socket.io]: Sending New Preview....');
      switch (action) {
        case "Add Word":
          res.io.emit('story_preview_update_res', newdata[storyID.attribute], undefined, newdata.preview, newdata.currentWord, newdata.currentSentence, newdata.completed);
        case "New Sentence":
          res.io.emit('refresh');
          break;
        case "Complete Story":
            res.io.emit('refresh');
          break;
        default:
        break;
      }

      if (newData.currentWord>=min.words) {
        res.io.emit('refresh');
      } else if (newData.currentSentence>=min.sentences) {
        res.io.emit('refresh');
      }
    });

    res.render('story_details', {
      title: results.title + " - Story",
      story: results,
      error: errorError,
      min: min
    });
  })
};

//Displays the story detail page where you can add a word
exports.story_detail_twitch_get = function (req, res) {

  Story
  .findOne({[storyID.attribute]:req.params.id})
  .exec(function (error, results) {

    res.render('story_details_twitch', {
      title: results.title||"No Story" + " - Story",
      story: results,
      id: req.params.id,
      error: error,
      min: min
    });
  });

};

exports.story_array_req = function (callback) {

  async.parallel({
      stories: function (cb) {
        Story
        .find({})
        .sort({complete: 1})
        .exec(function (error, results) {
          cb(error, results);
        });
      }
    },
    function(error, results) {
      var res = results.stories;
      callback(error, res);
    }
  );
};

exports.story_preview_req = function (id, callback) {
  async.parallel({
    story: function (cb) {
      Story
      .findOne({[storyID.attribute]:id})
      .exec(function (error, results) {
        cb(error, results);
      });
    }
  },
  function(error, results) {
    //console.log("results: " + JSON.stringify(results));
    var res = results.story;
    res.preview = results.story.preview;
    callback(error, res);
  }
  );
};

exports.story_html_sentence_array = function (stories) {
  var output = [""];
  for (var i = 0; i < stories.length; i++) {
    var story = stories[i];
    var completedLine = !story.completed?'<strong style="color: red;">Incomplete</strong>':''
    output[i] = '<div class="story_item">' +
                  '<h2><a href="' + story.url + '">' +
                    story.title +
                    '</a>' +
                  '</h2>' +
                  completedLine +
                  '<p>' +
                  story.fullStory +
                  '</p></div>'
  }
  return output;
};
