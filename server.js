var DB = require('./db_conn.js');
var EXPRESS = require('express');
var APP = EXPRESS();
var BODY_PARSER = require('body-parser');
var RSS = require('rss');

APP.set('views', __dirname + '/views')
APP.set('view engine', 'ejs');

APP.use(BODY_PARSER.json());

APP.get("/res/*", function(req, res) {
  var path = sanitizePath(req.url);
  res.sendFile(__dirname + path);
});

APP.post("/answer", function(req, res) {
  DB.addResponse(req.body, function() {
    DB.getStats(req.body.url, function(stats) {
      return res.end(JSON.stringify(stats));
    });
  });
});

APP.get('/rss', function(req, res) {
  DB.getArticles(function(articles) {
    res.end(getRssForArticles(articles));
  });
});

APP.get('*', function(req, res) {
  DB.getArticles(function(articles) {
    articles = getUniqueTitles(articles);
    res.render('home', {articles: articles});
  });
});

var sanitizePath = function(path) {
  // Get rid of weird chars
  path = path.replace(/[^\w\.\/\-]/g, '');
  // Get rid of traversals
  path = path.replace(/\.\./g, '');
  return path;
}

var getRssForArticles = function(articles) {
  var feed = new RSS({
        title: 'No. Stop Asking.',
        description: 'A compilation of headlines in the form of a question',
        feed_url: 'http://www.nostopasking.com/nostop/rss',
        site_url: 'http://www.nostopasking.com/nostop',
        language: 'en',
        ttl: '60'
  });
  for (var i = 0; i < articles.length; ++i) {
    feed.item({
      title: articles[i].title,
      url: articles[i].url,
      date: articles[i].date
    });
  }
  return feed.xml();
}

var getUniqueTitles = function(articles) {
  var unique = [];
  var seen = {};
  for (var i = 0; i < articles.length; ++i) {
    if (!seen[articles[i].title]) {
      seen[articles[i].title] = true;
      unique.push(articles[i]);
    }
  }
  return unique;
}

APP.listen(3020);
