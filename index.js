'use strict';

var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var through2 = require('through2');
var gettextParser = require('gettext-parser');
var Handlebars = require('handlebars');
var jsesc = require('jsesc');

var replaceText = function(chunk, enc, callback) {
  var template = Handlebars.compile(chunk.toString());
  var chunkString = '';

  chunkString += 'module.exports = "';
  chunkString += jsesc(template(), {quotes: 'double'});
  chunkString += '";';

  callback(null, chunkString);
};

var filterHandlebars = function(file) {
  if(file.split('.').pop() !== 'hbs') {
    return through2();
  }

  return through2(replaceText);
};

var setupHandlebarsHelper = function(locale, localeDirs) {
  var poParser = function(localeDir) {
    var fp = path.join(localeDir, locale, 'LC_MESSAGES', 'messages.po');
    var hasPo = fs.existsSync(fp);
    var po = hasPo ? fs.readFileSync(fp, {encoding: 'utf8'}) : null;
    var catalog = po ? gettextParser.po.parse(po).translations[''] : {};

    return catalog;
  };

  var catalogParser = function(defaultLang, localeDirs) {
    if (locale === defaultLang) {
      return {};
    }

    var jsonPoArray = _.map(localeDirs, poParser);

    return _.reduce(jsonPoArray, _.defaults);
  };

  var catalog = catalogParser('en', localeDirs);

  Handlebars.registerHelper('trans', function(text) {
    var msg = catalog[text];

    return (msg.msgstr && msg.msgstr[0]) || text;
  });
};

var translate = function(file, opts) {
  var locale = opts.locale;
  var localeDirs = opts.localeDirs;

  // build catalog for locale
  setupHandlebarsHelper(locale, localeDirs);

  return filterHandlebars(file);
};

translate.fast = function(fastOpts) {
  var locale = fastOpts.locale;
  var localeDirs = fastOpts.localeDirs;

  setupHandlebarsHelper(locale, localeDirs);

  return function(file, opts) {
    return filterHandlebars(file);
  };
};

module.exports = translate;
