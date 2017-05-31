var express = require('express');
var path = require('path');
var app = express();

// must specify options hash even if no options provided!
var phpExpress = require('php-express')({
  // assumes php is in your PATH
  binPath: 'php'
});

process.env.DOCUMENT_ROOT = __dirname;

// set view engine to php-express
app.set('views', './public');
app.engine('php', phpExpress.engine);
app.set('view engine', 'php');

// routing all .php file to php-express
app.all(/.+\.php$/, phpExpress.router);

// routing home page to php-express
app.all(/^\/$/, phpExpress.router);

// routing all folders with trailing slash file to php-express
app.all(/^\/(.+)\/$/, phpExpress.router);

// routing all folders WITHOUT trailing slash file to php-express
app.all(/^\/(.+)[\.]$/, phpExpress.router);

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

var server = app.listen(3030, 'localhost', function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('PHPExpress app listening at http://%s:%s', host, port);
  console.log(process.env.DOCUMENT_ROOT);
});
