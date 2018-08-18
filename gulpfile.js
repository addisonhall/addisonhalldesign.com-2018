// include gulp and required node modules
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    data = require('gulp-data'),
    fs = require('fs'),
    imagemin = require('gulp-imagemin'),
    nunjucksRender = require('gulp-nunjucks-render'),
    postcss = require('gulp-postcss'),
    cssnano = require('cssnano'),
    cssImport = require('postcss-import'),
    cssCustomMedia = require('postcss-custom-media'),
    cssCustomProperties = require('postcss-custom-properties'),
    cssCalc = require('postcss-calc'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    jsuglify = require('gulp-uglify-es').default,
    connect = require('gulp-connect');

// process html (nunjucks)
gulp.task('nunjucks', function () {
    gulp.src('./src/nunjucks/pages/**/*.html')
        .pipe(data(function() {
            return JSON.parse(fs.readFileSync('config.json'));
        }))
        .pipe(nunjucksRender({
            path: ['./src/nunjucks/templates/'],
            data: {
                urlPath: 'http://localhost:8080'
            }
        }))
		.on('error', gutil.log)
		.pipe(gulp.dest('./dist/'))
		.pipe(connect.reload());
});

// Process nunjucks for live HTML
gulp.task('liveHtml', function () {
    gulp.src('./src/nunjucks/pages/**/*.html')
        .pipe(data(function() {
            return JSON.parse(fs.readFileSync('config.json'));
        }))
        .pipe(nunjucksRender({
            path: ['./src/nunjucks/templates/'],
            data: {
                urlPath: 'https://addisonhalldesign.com'
            }
        }))
		.on('error', gutil.log)
		.pipe(gulp.dest('./dist/'));
});

// process css (postcss)
gulp.task('css', function () {
    var plugins = [
        cssImport,
        cssCustomMedia,
        cssCustomProperties,
        cssCalc,
        cssnano
    ]
    gulp.src('./src/css/site.css')
        .pipe(postcss(plugins))
        .pipe(sourcemaps.init())
        .on('error', gutil.log)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/assets/css/'))
        .pipe(connect.reload());
});

// process js
gulp.task('js', function () {
	gulp.src([
            './src/js/site.js'
        ])
		.pipe(concat('site.js'))
		.pipe(jsuglify())
		.on('error', gutil.log)
		.pipe(gulp.dest('./dist/assets/js/'))
		.pipe(connect.reload());
});

// process images
gulp.task('images', function() {
    gulp.src('./src/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/assets/img/'))
});

// copy fonts
gulp.task('copyfonts', function() {
    gulp.src('./src/fonts/**/*.{ttf,woff,woff2,eof,svg}')
    .pipe(gulp.dest('./dist/assets/fonts'));
});

// live reload
gulp.task('connect', function() {
	connect.server({
		root: 'dist',
		livereload: true
	});
});

// watch these files (removed './' because of gaze bug?)
gulp.task('watch', function () {
    gulp.watch(['src/nunjucks/pages/**/*.html', 'src/nunjucks/templates/layouts/*.html', 'src/nunjucks/templates/includes/*.html'], ['nunjucks']);
    gulp.watch(['src/css/**/*.css'], ['css']);
	gulp.watch(['src/js/*.js'], ['js']);
	gulp.watch(['src/img/*'], ['images']);
});

// run default task
gulp.task('default', ['nunjucks', 'css', 'js', 'images', 'connect', 'watch']).on('error', gutil.log);