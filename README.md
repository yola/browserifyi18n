# browserify-i18n
Browserify transform for internationalizing tagged strings


## Install

```
$ npm install https://github.com/yola/browserify-i18n.git
```

## Usage

For standard, non-optimized usage, do:

```javascript
var browserify = require('browserify');
var i18n = require('browserify-i18n');
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
var i18n = require('browserify-i18n');
var opts = {
  global: true // Normal browserify transform options
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

To specify a custom interpolator do:

```
browserify('./source/file.js')
  .transform(i18n, {interpolate: \{tr\s"([\s\S]+?)"}\g})
```

## Test

```sh
$ mocha
```
