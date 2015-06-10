'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var path = require('path');
var browserSync = require('browser-sync');
var reload = browserSync.reload({stream: true});

// error handler
var onError = function (err) {
  console.error(err);
  throw err;
};

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Optimize Images
gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}));
});

gulp.task('sass-dev', function(){
  gulp.src('app/styles/main.scss')
    .pipe($.sass({sourceComments: 'map', sourceMap: 'sass'}))
    .pipe(gulp.dest('app/styles'))
    .pipe($.size({title: 'sass'}))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('sass', function(){
  gulp.src(['app/styles/main.scss'])
    .pipe($.sass())
    .on('error', console.error.bind(console))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe($.csso())
    .pipe(gulp.dest('app/styles'))
    .pipe($.size({title: 'sass'}));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist', 'build']));

// Watch Files For Changes & Reload
gulp.task('serve', function () {
  browserSync({
    notify: false
  });

  gulp.watch(['app/styles/**/*.scss'], ['sass-dev']);
  gulp.watch(['{.tmp,app}/styles/**/*.css'], reload);
  gulp.watch(['app/images/**/*'], reload);
  gulp.watch(['app/scripts/**/*.js', 'app/**/*.html'], reload);

});

gulp.task('develop', ['serve'], function () {
    process.env.NODE_ENV = 'development';

    $.nodemon({ 
      verbose: true,
      script: './backend/app', 
      ext: 'js node',
      ignore: ['app/**/*.*', 'node_modules/**/*.*'] 
    })
    .on('restart', function () {
        console.log('Restarted Backend!');
    });
});

gulp.task('default', ['develop']);