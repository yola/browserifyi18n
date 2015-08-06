'use strict';

var translateJavascript = function(copy, gettext, re) {
  var msgid, needle, replacement, match, bookend, translated, phrase;

  translated = copy;
  match = re.exec(copy);
  while (match) {
    needle = match[0];
    msgid = match[1] || match[2];
    phrase = gettext[msgid] || msgid
    bookend = match[1] ? '"' : '\'';
    replacement = bookend + phrase + bookend;

    translated = translated.replace(needle, replacement);
    match = re.exec(copy);
  }
  return translated;
};

module.exports = translateJavascript;
