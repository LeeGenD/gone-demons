var gulp = require('gulp');
var config = require('./config');

gulp.task('copy:app', function () {
  return gulp.src([
            __dirname + '/../src/**'
        ])
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['clean'], function() {
  // 将你的默认的任务代码放在这
  gulp.start( 'copy:app', 'scripts');
  //gulp.start('copy:app');
});