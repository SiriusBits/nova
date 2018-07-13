var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var app = express();
// must specify options hash even if no options provided!
var phpExpress = require('php-express')({
  // assumes php is in your PATH
  binPath: 'php'
});

// set view engine to php-express
app.set('views', './public');
app.engine('php', phpExpress.engine);
app.set('view engine', 'php');

// routing all .php file to php-express
app.all(/.+\.php$/, phpExpress.router);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

module.exports = app;
