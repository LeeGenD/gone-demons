var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var config = require('./config');

gulp.task('watch', ['browserSync'], function() {
    // Watchify will watch and recompile our JS, so no need to gulp.watch it
    gulp.watch(config.watchSrc, ['default', reload]);
});
