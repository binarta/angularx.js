var gulp = require('gulp'),
    minifyHtml = require('gulp-minify-html'),
    templateCache = require('gulp-angular-templatecache'),
    path = require('path');

var minifyHtmlOpts = {
    empty: true,
    cdata: true,
    conditionals: true,
    spare: true,
    quotes: true
};

gulp.task('default', function () {
    gulp.src(['template/bootstrap3/*.html', 'src/components/*/*.html'])
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('angularx-tpls-bootstrap3.js', {standalone: true, module: 'angularx.templates', transformUrl: function (url) {
            var split = url.split(path.sep);
            return split[split.length - 1];
        }}))
        .pipe(gulp.dest('src'));
});