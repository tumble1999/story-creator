const express = require('express');
const async = require('async');

const Story = require('../models/story');
const storyID = require('../config/story_id');

const min = {
  words: 20,
  sentences: 100
}

exports.story_create_get = function (req, res) {
  res.render('story_create', {
    title: "Create Story"
  });
};

exports.story_create_post = function (req, res) {
  var title = req.body.title.split(' ').join('');
  Story
  .find({title: title})
  .exec(function (err, results) {
    if (err) {
      res.render('story_create', {
        title: "Create Story",
        error: err
      });
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
            error:err
          });
        }
        //CREATED
        res.redirect(newStory.url);
      });
    }
  });
};

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

exports.story_detail_get = function (req, res) {
  Story
  .findOne({[storyID.attribute]:req.params.id})
  .exec(function (error, results) {
    res.render('story_details', {
      title: results.title + " - Story",
      story: results,
      error: error,
      min: min
    });
  });
};

exports.story_detail_post = function (req, res) {

  var words = req.body.word.split('.').join('').split(' ');
  var wordCount = words.length;
  var action = req.body.action;
  var id = req.params.id;
  Story
  .findOne({[storyID.attribute]:id})
  .exec(function (error, results) {
    if(error) {
      res.render('story_details', {
        title: results.title + " - Story",
        story: results,
        error: error,
        min: min
      });
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
    newdata.currentSentence++;
    newdata.currentWord=0;
        break;
      default:
      errorError = "No action specified.";
    }
    results.update(newdata, function (error) {
      if(error){
        errorError = error;
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
