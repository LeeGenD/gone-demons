var browserSync = require('browser-sync');
var config = require('./config');
var gulp = require('gulp');
var fs = require('fs');
var colors = require('colors');

gulp.task('browserSync', function() {
    browserSync({
        open: false,
        server: [
            config.dist
        ],
        notify: false,
        //port: 9999,
        ui: false,// 关闭ui界面
        ghostMode: false,// 关闭所有同步选项
        logPrefix: 'LOCAL SERVE',
        middleware: [
            function(req, res, next) {
                if (req.url === '/crossDomain') {
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.end('success');
                }
                else if (req.method === 'POST') {
                    var data = '{}';
                    var fileName = req.url;
                    try {
                        data = fs.readFileSync(config.src + fileName, 'utf8');
                    }
                    catch (e) {
                        console.log('can\'t not find url:' + fileName);
                    }
                    res.setHeader('content-type', 'application/json');
                    res.end(data);
                }
                next();
            }
        ]
    }, function (err, bs) {
        var local = bs.options.getIn(["urls", "local"]);
        var external = bs.options.getIn(["urls", "external"]);
        console.log('[' + 'LOCAL SERVE'.blue + ']' + ' Entry:');
        console.log(' --------------------------------------'.grey);
        console.log('       Local: ' + (local + '/index.html').magenta);
        console.log('    External: ' + (external + '/index.html').magenta);
        console.log(' --------------------------------------'.grey);
    });
});
