var express = require('express');
var path = require('path');
var logger = require('morgan');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var routes = require('./public/routes/index');
var app = express();

// Create `ExpressHandlebars` instance with a default layout.
var hbs = exphbs.create({
    defaultLayout: 'index',
	extname: '.hbs',
	layoutsDir: __dirname + '/public/pages',
    partialsDir: [
        __dirname + '/public/partials'
    ]
});


/// view engine setup
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'public/pages'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', '/assets/nova/images/favicons/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

// Set Router
app.use('/', routes);

// catch 404 or forward to error handler
app.use(function(err, req, res, next) {
  if (typeof err[path] == 'undefined') {
        res.render('404', {title: 'Nova - Page Not Found', 
	layout: '404'});
    } else {
        next(err);
    }
});

module.exports = app;
