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


var addSlash = {
  '\n': '\\n',
  '"': '\\"'
};

var escapeMatch = function(match) {
  return addSlash[match];
};

var getTranslator = function(catalog, opts) {
  var re = opts.interpolate || /\{\{trans\s*(?:"([^"]+)"|\'([^\']+)\')\s*\}\}/g;

  return function(chunk, enc, callback) {
    var template = chunk.toString();
    var match, msgid, needle, translated;

    translated = template;
    match = re.exec(template);

    while (match) {
      needle = match[0];
      msgid = match[1] || match[2];
      translated = translated.replace(needle, catalog[msgid] || msgid);
      match = re.exec(template);
    }

    var translatedChunk = translated
      .replace(/(\n|")/g, escapeMatch);

    var moduleString = 'module.exports = "' + translatedChunk + '";';

    callback(null, moduleString);
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
  '.hbs'
];

var translatable = function(file) {
  var ext = path.extname(file);
  return _.include(acceptedExtensions, ext);
};

var i18n = function(file, opts) {
  if(!translatable(file)) {
    return through2();
  }
  var catalog = getJSONCatalog(opts.locale, opts.localeDirs);
  var translator = getTranslator(catalog, opts);
  return through2(translator);
};

i18n.fast = function(fastOpts) {
  var catalog = getJSONCatalog(fastOpts.locale, fastOpts.localeDirs);

  return function(file, opts) {
    if(!translatable(file)) {
      return through2();
    }
    var mergedOpts = _.extend({}, opts, fastOpts);
    var translator = getTranslator(catalog, mergedOpts);
    return through2(translator);
  };
};

module.exports = i18n;
