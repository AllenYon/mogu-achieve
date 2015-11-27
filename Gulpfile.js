'use strict';

var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  mocha = require('gulp-mocha-co'),
  watch = require('gulp-watch');

var babel = require('gulp-babel');

var fs = require('fs');
var babelrc = JSON.parse(fs.readFileSync('./.babelrc', 'utf-8'));


// Copy all static images
gulp.task('test', function () {
  gulp.src('./test/*.js')
    .pipe(mocha({
      ignoreLeaks: false,
      reporter: 'nyan'
    }));
});

gulp.task('babel', function() {
  return gulp.src('*.js')
  .pipe(babel({
    whitelist: babelrc.env.node.whitelist
  }))
  .pipe(gulp.dest('dist/server'));
});


gulp.task('nodemon', function () {
  nodemon({ script: 'app.js', env: { 'NODE_ENV': 'development' }, nodeArgs: ['--debug=9999', '--harmony' ]})
    .on('restart');
});

// Rerun the task when a file changes

gulp.task('watch', function() {
    gulp.src(['*.js','routes/*.js', 'models/*.js', 'config/*.js'], { read: true })
        .pipe(watch({ emit: 'all' }));
});

// gulp.task('sass-watch', function() {
//   gulp.watch('./public/sass/*.scss', ['sass']);
// })

// The default task (called when you run `gulp` from cli)
//gulp.task('default', ['test', 'nodemon', 'watch']);
gulp.task('default', ['babel','nodemon', 'watch']);
