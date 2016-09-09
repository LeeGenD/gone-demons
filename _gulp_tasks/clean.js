var gulp = require('gulp');
var config = require('./config');
var del = require('del');

gulp.task('clean', function() {
    return del([
        'dist'
    ], {
        dot: true
    });
});