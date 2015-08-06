'use strict';

var handlebarsTranslator = function(template, catalog, re) {
  var match, msgid, needle, translated;

  translated = template;
  match = re.exec(template);

  while (match) {
    needle = match[0];
    msgid = match[1] || match[2];
    translated = translated.replace(needle, catalog[msgid] || msgid);
    match = re.exec(template);
  }

  return translated;
};

module.exports = handlebarsTranslator;
