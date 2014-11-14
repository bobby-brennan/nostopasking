var DB = require('./db_conn.js');
var EXPRESS = require('express');
var APP = EXPRESS();

APP.set('views', __dirname + '/views')
APP.set('view engine', 'ejs');

APP.get("/res/*", function(req, res) {
  var path = sanitizePath(req.url);
  res.sendFile(__dirname + path);
});

APP.get('*', function(req, res) {
  DB.getArticles(function(articles) {
    res.render('home', {articles: articles});
  });
});

var sanitizePath = function(path) {
  // Get rid of weird chars
  path = path.replace(/[^\w\.\/]/g, '');
  // Get rid of traversals
  path = path.replace(/\.\./g, '');
  return path;
}

APP.listen(3020);
