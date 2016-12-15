'use strict';

var express = require('express');
var path = require('path');
var ejs = require('ejs');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

const MyBigView = require('./MyBigView')
const MyPagelet = require('./MyPagelet')

app.get('/', function (req, res) {
  var bigpipe = new MyBigView(req, res, 'basic/index', { title: "测试" })

  var Pagelet1 = require('./bpmodules/p1')
  var pagelet1 = new Pagelet1()

  var Pagelet2 = require('./bpmodules/p2')
  var pagelet2 = new Pagelet2()

  bigpipe.add(pagelet1)
  bigpipe.add(pagelet2)

  bigpipe.start()
});

app.get('/nest', function (req, res) {
  var bigpipe = new MyBigView(req, res, 'nest/index', { title: "测试" })

  var pagelet1 = new MyPagelet()
  pagelet1.name = 'pagelet1'
  pagelet1.data = { is: "pagelet1测试" }
  pagelet1.location = 'pagelet1'
  pagelet1.root = 'views'
  pagelet1.tpl = 'basic/p1.html'
  pagelet1.selector = 'pagelet1'
  pagelet1.delay = 2000

  var subPagelet = new MyPagelet()
  subPagelet.name = 'pagelet2'
  subPagelet.data =  {t: "测试" }
  subPagelet.selector = 'pagelet2'
  subPagelet.location = 'pagelet2'
  subPagelet.root = 'views'
  subPagelet.tpl = 'nest/p2.html'
  subPagelet.delay = 4000

  pagelet1.addChild(subPagelet)

  bigpipe.add(pagelet1)

  bigpipe.start()
});


app.get('/nest2', function (req, res) {
  var bigpipe = new MyBigView(req, res, 'nest2/index', { title: "测试" })

  var pagelet1 = new MyPagelet()
  pagelet1.name = 'pagelet1'
  pagelet1.data = { is: "pagelet1测试" }
  pagelet1.location = 'pagelet1'
  pagelet1.root = 'views'
  pagelet1.tpl = 'nest2/p1.html'
  pagelet1.selector = 'pagelet1'
  pagelet1.delay = 2000

  var subPagelet = new MyPagelet()
  subPagelet.name = 'pagelet2'
  subPagelet.data =  {t: "测试" }
  subPagelet.selector = 'pagelet2'
  subPagelet.location = 'pagelet2'
  subPagelet.root = 'views'
  subPagelet.tpl = 'nest2/p2.html'
  subPagelet.delay = 4000

  pagelet1.addChild(subPagelet)

  bigpipe.add(pagelet1)

  bigpipe.start()
});

// app.listen(5000);
module.exports = app
