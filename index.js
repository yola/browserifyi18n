'use strict';

var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var through2 = require('through2');
var gettextParser = require('gettext-parser');
var Handlebars = require('handlebars');
var jsesc = require('jsesc');

_.templateSettings.interpolate = /{{trans\s"([\s\S]+?)"}}/g;

var replaceText = function(catalog, chunk, enc, callback) {
  var template = _.template(chunk.toString());
  var chunkString = '';

  chunkString += 'module.exports = ';
  chunkString += jsesc(template(catalog), {
    quotes: 'double',
    wrap: true
  });
  chunkString += ';';

  callback(null, chunkString);
};

var filterHandlebars = function(file, catalog) {
  if(file.split('.').pop() !== 'hbs') {
    return through2();
  }

  return through2(_.partial(replaceText, catalog));
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

  return _.transform(catalog, function(acc, msgObject, msgKey) {
    var msgId = msgObject.msgid;
    var msg = (msgObject.msgstr && msgObject.msgstr[0]) || msgId;
    acc[msgId] = msg;
  })
};

var translate = function(file, opts) {
  var locale = opts.locale;
  var localeDirs = opts.localeDirs;
  var catalog = setupHandlebarsHelper(locale, localeDirs);

  return filterHandlebars(file, catalog);
};

translate.fast = function(fastOpts) {
  var locale = fastOpts.locale;
  var localeDirs = fastOpts.localeDirs;
  var catalog = setupHandlebarsHelper(locale, localeDirs);

  return function(file, opts) {
    return filterHandlebars(file, catalog);
  };
};

module.exports = translate;
