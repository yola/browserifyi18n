var chai = require('chai');
var browserify = require('browserify');
var through2 = require('through2');
var translate = require('../index');
var path = require('path');

chai.should();
process.chdir(__dirname);

describe('browserify i18n', function() {
  var options = {
    locale: 'es',
    localeDirs: ['./locale/']
  };

  describe('standard configuration', function() {
    var browserifyObj = browserify()
      .transform(translate, options)
      .add('./fake-app.js');

    it('bundles translated code handlebars files', function(done) {
      browserifyObj.bundle(function(err, src) {
        src.toString().should.contain('module.exports = "Hola";');
        done(err);
      });
    });
  });

  describe('optimized configuration', function() {
    var browserifyObj = browserify()
      .transform(translate.fast(options))
      .add('./fake-app.js');

    it('bundles translated handlebars files', function(done) {
      browserifyObj.bundle(function(err, src) {
        src.toString().should.contain('module.exports = "Hola";');
        done(err);
      });
    });
  });
});
