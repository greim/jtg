/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * All Rights Reserved.
 */

var watchify = require('watchify')
  , gulp = require('gulp')
  , browserify = require('browserify')
  , source = require('vinyl-source-stream')
  , server = require('jtg/server')
  , babelify = require('babelify')
  , gulp = require('gulp')
  , jsx = require('node-jsx')

jsx.install({extension:'.jsx'})

gulp.task('run', ['bundle'], function(){
  var port = 8888
  server.listen(port)
  console.log('server running on %d', port)
})

gulp.task('bundle', function(){
  var bundleOpts = {
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  }
  var bundler = watchify(browserify('./node_modules/jtg/main.js', bundleOpts).transform(babelify))
  bundler.on('update', bundle)
  function bundle(){
    var bundling = bundler.bundle()
    bundling.on('error', function(err) {
      if (err.lineNumber){
        console.error('%s in %s, line %d, column %d', err.description, err.fileName, err.lineNumber, err.column)
      } else {
        console.error(err.stack)
      }
      process.exit(1)
    })
    return bundling
    .pipe(source('main.js'))
    .pipe(gulp.dest('./static/js'))
  }
  return bundle()
})
