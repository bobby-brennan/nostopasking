var DB = require('./db_conn.js');
var FEED = require('feed-read');

var readFeeds = function(feeds) {
  var questionArticles = [];
  var feedsDone = 0;

  var articleSetHandler = function(source) {
    return function (err, articles) {
      if (err) {
        console.log(err);
      } else {
        for (var i = 0; i < articles.length; ++i) {
          if (isQuestionArticle(articles[i])) {
            console.log('  !!question:' + articles[i].title);
            console.log('  source:' + source);
            articles[i].source = source;
            questionArticles.push(articles[i]);
          }
        }
      }
      if (++feedsDone === feeds.length) {
        sendArticlesToDb(questionArticles);
      } 
    }
  }

  for (var i = 0; i < feeds.length; ++i) {
    console.log('checking:' + feeds[i].url);
    FEED(feeds[i].url, articleSetHandler(feeds[i].url));
  }
}

var sendArticlesToDb = function(questionArticles) {
  console.log('\n\nFOUND:' + questionArticles.length);
  var sent = 0;
  for (var i = 0; i < questionArticles.length; ++i) {
    console.log('adding:' + questionArticles[i].title);
    DB.addQuestionArticle(questionArticles[i], function() {
      if(++sent === questionArticles.length) {
        console.log('exiting');
        process.exit(0);
      };
    });
  }
}

var isQuestionArticle = function(article) {
  return article.title.indexOf('?') >= 0 && startsWithQWord(article.title);
}

var Q_WORDS = [
  "is",
  "are",
  "was",
  "were",
  "can",
  "could",
  "do",
  "did",
  "does",
  "have",
  "had",
  "has",
  "may",
  "might",
  "must",
  "should",
  "will",
  "would",
];

var hasQWord = function(str) {
  var pieces = str.split(/[:\.\?!]\s+/);
  for (var i = 0; i < pieces.length; ++i) {
    console.log('piece:<' + pieces[i] + '>'); 
    if (startsWithQWord(pieces[i])) {
      return true;
    }
  }
  return false;
}

var startsWithQWord = function(str) {
  str = str.toLowerCase();
  for (var i = 0; i < Q_WORDS.length; ++i) {
    var loc = str.indexOf(Q_WORDS[i] + ' ');
    if (loc === 0) {
      return true;
    }
  }
  return false;
}

var run = function() {
  var feeds = DB.getFeeds(readFeeds);
}

var test = function() {
  var s1 = 'obama: is he the worst?';
  var s2 = 'something stupid. is it dumb?';
  var s3 = 'can this really happen?  no, probably not.'
  var s4 = '  something dumb.    is it?';
  console.log(hasQWord(s1));
  console.log(hasQWord(s2));
  console.log(hasQWord(s3));
  console.log(hasQWord(s4));
}

run();
