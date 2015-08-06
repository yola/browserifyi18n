# browserifyi18n
Browserify transform for internationalizing tagged strings


## Install

```
$ npm install browserifyi18n
```

## Usage

For standard, non-optimized usage, do:

```javascript
var browserify = require('browserify');
var i18n = require('browserifyi18n');
var opts = {
  locale: 'en',                         // The locale code to be used
  localeDirs: ['./path/to/locale/dir/'] // Array of paths to locale .po files
};

browserify('./source/file.js')
  .transform(i18n, opts)
  .bundle()
  .pipe(...);
```

For optimized usage do:

```javascript
var browserify = require('browserif');
var i18n = require('browserifyi18n');
var opts = {
  // Normal browserify transform options go here
};

var fastOpts = {
  locale: 'en',                         // The locale code to be used
  localeDirs: ['./path/to/locale/dir/'] // Array of paths to locale .po files
};

browserify('./source/file.js')
  .transform(i18n.fast(fastOpts), opts)
  .bundle()
  .pipe(...);
```

The optimized task is much faster because it only parses `.po` files once,
instead of once for every browserified module.

To specify a custom interpolator for handlebars do:

```javascript
var opts = {
  locale: 'en',
  localeDirs: ['./path/to/locale/dir/'],
  interpolateHbs: \{tr\s"([\s\S]+?)"}\g     // Custom interpolation RegExp
};

browserify('./source/file.js')
  .transform(i18n, opts)
  .bundle()
```

A custom interpolator for javascript can be configured by using the
`interpolateJs` option.

## Test

```sh
$ mocha
```
