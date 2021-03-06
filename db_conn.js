var FS = require('fs');
var MYSQL = require('mysql');

var credentials = FS.readFileSync('db_credentials.json');
credentials = JSON.parse(credentials);
var DB = MYSQL.createConnection(credentials);

var QUERY_GET_FEEDS = "SELECT * from sourceFeeds";
exports.getFeeds = function(onDone) {
  console.log("GET FEEDS");
  DB.query(QUERY_GET_FEEDS, [], function(err, rows) {
    if (err) {
      throw err;
    }
    console.log('got ' + rows.length + ' rows'); 
    return onDone(rows);
  });
}

var QUERY_INSERT_ARTICLE = "INSERT INTO qArticles (url, title, date, source, crawlTime) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE url=url";
exports.addQuestionArticle = function(article, onDone) {
  DB.query(QUERY_INSERT_ARTICLE, [article.link, article.title, article.published, article.source], function (err) {
    if (err) {
      throw err;
    }
    onDone();
  });
}

var QUERY_GET_ARTICLES = "SELECT qArticles.url, qArticles.title, sourceFeeds.url as sourceUrl," +
    " sourceFeeds.name as sourceName, sourceFeeds.subtopic as subtopic" +
    " FROM qArticles INNER JOIN sourceFeeds ON qArticles.source=sourceFeeds.url" +
    " ORDER BY date DESC limit 100";
exports.getArticles = function(onDone) {
  DB.query(QUERY_GET_ARTICLES, [], function(err, rows) {
    if (err) {
      console.log('error getting articles');
      throw err;
    }
    onDone(rows);
  });
}

var QUERY_ADD_RESPONSE = "UPDATE qArticles set yes = yes + ?, no = no + ? WHERE url=?"
exports.addResponse = function(response, onDone) {
  DB.query(QUERY_ADD_RESPONSE, [(response.isYes ? 1 : 0), (response.isYes ? 0 : 1), response.url], function(err) {
    if (err) throw err;
    onDone();
  });
}

var QUERY_GET_STATS = "SELECT yes, no FROM qArticles WHERE url=?";
exports.getStats = function(url, onDone) {
  DB.query(QUERY_GET_STATS, [url], function(err, rows) {
    if (err) throw err;
    onDone(rows[0]);
  });
}
