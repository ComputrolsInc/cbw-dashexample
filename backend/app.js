var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var path = require('path');

var app = express();

process.env.NODE_ENV = 'development';

app.use(favicon(path.normalize(__dirname + '/../app/images/favicon.ico')));
app.use(express.static(path.normalize(__dirname + '/../app')));

process.env.DEBUG='*';
app.use(morgan('short'));

app.listen(6158);