var chai = require('chai');
var browserify = require('browserify');
var through2 = require('through2');
var i18n = require('../index');


chai.should();
process.chdir(__dirname);

describe('browserify i18n javascript translation', function() {
  var options = {
    locale: 'es',
    localeDirs: ['./locale/'],
    translateJavascript: true
  };

  var expectedStringQue = 'module.exports = myFunction(\'Qué\');';
  var expectedStringHola = 'var hello = \'Hola\'';

  describe('standard configuration', function() {
    var browserifyObj = browserify()
      .transform(i18n, options)
      .add('./translated-javascript.js');

    it('translates tagged strings', function(done) {
      browserifyObj.bundle(function(err, src) {
        if(src) {
          src.toString().should.contain(expectedStringQue);
          src.toString().should.contain(expectedStringHola);
        }

        if(err) {
          console.error(err);
          throw err;
        }

        done();
      });
    });
  });

  describe('optimized configuration', function() {
    var browserifyObj = browserify()
      .transform(i18n.fast(options))
      .add('./translated-javascript.js');

    it('translates tagged strings', function(done) {
      browserifyObj.bundle(function(err, src) {
        if(src) {
          src.toString().should.contain(expectedStringQue);
          src.toString().should.contain(expectedStringHola);
        }

        if(err) {
          console.error(err);
          throw err;
        }

        done();
      });
    });
  });
});
