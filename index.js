'use strict';

var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var through2 = require('through2');
var gettextParser = require('gettext-parser');

// Publish a Node.js require() handler for .handlebars and .hbs files
var extension = function(module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

require.extensions['.handlebars'] = extension;
require.extensions['.hbs'] = extension;

var escapeStr = function(str) {
  return str
    .replace(/\n/g, '\\n')
    .replace(/"/g, '\\"');
}

var replaceText = function(catalog, opts, chunk, enc, callback) {
  var template = chunk.toString();
  var re = opts.interpolate || /\{\{trans\s*(?:"([^"]+)"|\'([^\']+)\')\s*\}\}/g;
  var chunkString, needle, msgid, translated, match;

  translated = template;
  match = re.exec(template);

  while (match) {
    needle = match[0];
    msgid = match[1] || match[2];
    translated = translated.replace(needle, catalog[msgid]);
    match = re.exec(template);
  }

  translated = escapeStr(translated);

  chunkString += 'module.exports = "';
  chunkString += translated;
  chunkString += '";';

  callback(null, chunkString);
};

var filterInterpolator = function(file, catalog, opts) {
  if(file.split('.').pop() !== 'hbs') {
    return through2();
  }

  return through2(_.partial(replaceText, catalog, opts));
};

var getCatalog = function(locale, localeDirs) {
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
  });
};

var i18n = function(file, opts) {
  var locale = opts.locale;
  var localeDirs = opts.localeDirs;
  var catalog = getCatalog(locale, localeDirs);

  return filterInterpolator(file, catalog, opts);
};

i18n.fast = function(fastOpts) {
  var locale = fastOpts.locale;
  var localeDirs = fastOpts.localeDirs;
  var catalog = getCatalog(locale, localeDirs);

  return function(file, opts) {
    var mergedOpts = {};

    _.extend(mergedOpts, opts, fastOpts);

    return filterInterpolator(file, catalog, mergedOpts);
  };
};

module.exports = i18n;
