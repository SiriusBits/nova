var express = require('express');
var request = require('request')
var path = require('path');
var logger = require('morgan');
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

function querify(queryParamsObject){
    return '?'+Object.keys(queryParamsObject).map(function(val, key){ return val+'='+queryParamsObject[val] }).join('&')
}

function querifyzip(queryParamsObject){
    return Object.keys(queryParamsObject).map(function(val, key){ return queryParamsObject[val] })
}

// adds a new rule to proxy a localUrl -> webUrl
// i.e. proxify ('/my/server/google', 'http://google.com/')
function proxify(localUrl, webUrl){
    app.get(localUrl, function(req, res) {
        req.pipe( request(webUrl + querify(req.query)) ).pipe(res)
    })
}

// adds a new rule to proxy a localUrl -> webUrl
// i.e. proxify ('/my/server/google', 'http://google.com/')
function proxifyzip(localUrl, webUrl){
    app.get(localUrl, function(req, res) {
        req.pipe( request(webUrl + querifyzip(req.query) +  "/degrees")).pipe(res)
    })
}

// add your proxies here.
//
// examples:
// proxify('/yummly/recipes', 'http://api.yummly.com/v1/api/recipes');
proxify('/brewery/search', 'https://api.brewerydb.com/v2/search/geo/point');
proxifyzip('/search/zip', 'https://www.zipcodeapi.com/rest/rXgMGEhUXsMy5AlRosKFvgzoDevdsalT7BFOfXJdpwLu77mvA6b5nKt0ZZerazki/info.json/');

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
