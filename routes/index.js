'use strict'

var express = require('express')
var router = express.Router()
let sse = require('./../middleware/sse')



function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/* GET home page. */
router.get('/', sse, function(req, res, next) {
  res.render('index');
});

router.get('/data', sse, function (req, res, next) {
  res.sseSetup()
  setInterval(function () {
    res.sseSend({date: new Date().getTime(), value: [getRandomInt(11, 15), getRandomInt(0.3, 2.5)] })
  }, 1000)
});

module.exports = router
