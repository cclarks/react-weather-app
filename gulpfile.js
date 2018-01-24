var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var notifier = require('node-notifier');
var server = require('gulp-server-livereload');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var watch = require('gulp-watch');

var notify = function(error) {
  var message = 'In: ';
  var title = 'Error';

  if (error.description) {
    title += error.description;
  } else if (error.message) {
    title += error.message;
  }

  if (error.filename) {
    var file = error.filename.split('/');
    message += file[file.length - 1];
  }

  if (error.lineNumber) {
    message += '\nOn Line: ' + error.lineNumber;
  }

  notifier.notify({title: title, message: message});
};

//Bundle settings
//automatic bundling of browserify-based scripts
var bundler = watchify(browserify({
  entries: ['./src/app.jsx'],
  transform: [reactify], //transforms jsx into js files
  extensions: ['.jsx'],
  debug: true,
  cache: {},
  packageCache: {},
  fullPaths: true
}));

//Bundle tasks
//transform jsx to js then bundle evrthing 2gether into file called main.js
//that will sit in the root
function bundle() {
  return bundler
    .bundle()
    .on('error', notify)
    .pipe(source('main.js'))
    .pipe(gulp.dest('./'))
}
bundler.on('update', bundle);

//Create bundle
gulp.task('build', function() {
  bundle()
});

//compile sass files from main.scss
gulp.task('sass', function() {
  gulp.src('./sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./'));
});

//live reload server settings
//reloads browser automatically each time there is a change in our code
gulp.task('serve', function(done) {
  gulp.src('')
    .pipe(server({
      livereload: {
        enable: true,
        filter: function(filePath, cb) {
          if (/main.js/.test(filePath)) { //test filter, checks compiled css+js files b4 reloading browser
            cb(true)
          } else if (/style.css/.test(filePath)) {
            cb(true)
          }
        }
      },
      open: true
    }));
});

//watch task for sass files and sets order in which all created tasks need to run
gulp.task('watch', function() {
  gulp.watch('./sass/**/*.scss', ['sass']);
});

//run tasks in specific order
gulp.task('default', ['build', 'serve', 'sass', 'watch']);
