var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Nova - Home'});
});

/* GET plain requests. */
router.get(/^(.+)$/, function(req, res, next) {
	res.render(req.path.substr(1) + '/index', 
	{title: 'Nova - ' + req.path.substr(1), 
	layout: req.path.substr(1) + '/index'});
});

module.exports = router;