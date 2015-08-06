'use strict';

var trans = function(text) {
  return text;
};

var myFunction = function(what) {
  var hello = trans('Hello');

  return what + ' ' + hello;
};

module.exports = myFunction(trans('What'));
