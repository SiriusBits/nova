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
    helpers: {
    	getElement: function ( elid ){
		  var content = document.getElementbyId(elid);
		  if (content)
		  	return content.outerHtml;
		  else
		  	return '';
		}
	},
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

// routing all folders with trailing slash file to views
//app.all(/^\/(.+)\/$/, routes);

// routing all folders WITHOUT trailing slash file to views
//app.all(/^\/(.+)[\.]$/, routes);


// serve static files
//app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(err, req, res, next) {
	console.log(typeof err[path]);
  if (typeof err[path] == 'undefined') {
        res.render('404', {title: 'Nova - Page Not Found', 
	layout: '404'});
    } else {
        next(err);
    }
});

module.exports = app;
