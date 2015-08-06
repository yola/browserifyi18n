'use strict';

var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var through2 = require('through2');
var gettextParser = require('gettext-parser');
var handlebarsTranslator = require('./lib/handlebars-translator');
var javascriptTranslator = require('./lib/javascript-translator');

// Publish a Node.js require() handler for .handlebars and .hbs files
var extension = function(module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};
require.extensions['.handlebars'] = extension;
require.extensions['.hbs'] = extension;

var getTranslator = function(catalog, opts, ext) {
  if (ext === '.js') {
    return function(chunk, enc, callback) {
      var translated = javascriptTranslator(chunk.toString(), catalog);

      callback(null, translated);
    };
  }

  var re = opts.interpolate || /\{\{trans\s*(?:"([^"]+)"|\'([^\']+)\')\s*\}\}/g;

  return function(chunk, enc, callback) {
    var translated = handlebarsTranslator(chunk.toString(), catalog, re);

    callback(null, translated);
  };
};

var getJSONCatalog = function(locale, localeDirs) {
  var catalogDir = function(localeDir) {
    var fp = path.join(localeDir, locale, 'LC_MESSAGES', 'messages.po');
    var hasPo = fs.existsSync(fp);
    var po = hasPo ? fs.readFileSync(fp, {encoding: 'utf8'}) : null;
    var catalog = po ? gettextParser.po.parse(po).translations[''] : {};

    return catalog;
  };

  var makeMasterCatalog = function(localeDirs) {
    var catalogs = _.map(localeDirs, catalogDir);
    return _.reduce(catalogs, _.defaults);
  };

  var catalog = makeMasterCatalog(localeDirs);

  return _.transform(catalog, function(acc, msgObject, msgKey) {
    var msgId = msgObject.msgid;
    var msg = (msgObject.msgstr && msgObject.msgstr[0]) || msgId;
    acc[msgId] = msg;
  });
};

var acceptedExtensions = [
  '.handlebars',
  '.hbs',
  '.js'
];

var translatable = function(file) {
  var ext = path.extname(file);
  return _.include(acceptedExtensions, ext);
};

var i18n = function(file, opts) {
  if(!translatable(file)) {
    return through2();
  }

  var extName = path.extname(file);
  var catalog = getJSONCatalog(opts.locale, opts.localeDirs);
  var translator = getTranslator(catalog, opts, extName);

  return through2(translator);
};

i18n.fast = function(fastOpts) {
  var catalog = getJSONCatalog(fastOpts.locale, fastOpts.localeDirs);

  return function(file, opts) {

    if(!translatable(file)) {
      return through2();
    }

    var extName = path.extname(file);
    var mergedOpts = _.extend({}, opts, fastOpts);
    var translator = getTranslator(catalog, mergedOpts, extName);

    return through2(translator);
  };
};

module.exports = i18n;
