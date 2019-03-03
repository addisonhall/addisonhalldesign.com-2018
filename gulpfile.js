// include gulp and required node modules
const { src, dest, parallel } = require('gulp')
const gulp = require('gulp')
const gutil = require('gulp-util')
const data = require('gulp-data')
const fs = require('fs')
const imagemin = require('gulp-imagemin')
const nunjucksRender = require('gulp-nunjucks-render')
const postcss = require('gulp-postcss')
const purgecss = require('gulp-purgecss')
const cssnano = require('cssnano')
const cssImport = require('postcss-import')
const cssCustomMedia = require('postcss-custom-media')
const cssCustomProperties = require('postcss-custom-properties')
const cssCalc = require('postcss-calc')
const sourcemaps = require('gulp-sourcemaps')
const concat = require('gulp-concat')
const jsuglify = require('gulp-uglify-es').default
const connect = require('gulp-connect')

// process html (nunjucks)
function nunjucks() {
    return src('./src/nunjucks/pages/**/*.html')
        .pipe(data(function() {
            return JSON.parse(fs.readFileSync('config.json'))
        }))
        .pipe(nunjucksRender({
            path: ['./src/nunjucks/templates/'],
            data: {
                siteUrl: 'https://addisonhalldesign.com',
                devSiteUrl: 'http://localhost:8080'
            }
        }))
		.on('error', gutil.log)
        .pipe(dest('./dist/'))
        .pipe(connect.reload())
}

// process css (postcss)
function css() {
    var plugins = [
        cssImport,
        cssCustomMedia,
        cssCustomProperties,
        cssCalc,
        cssnano
    ]
    return src('./src/css/site.css')
        .pipe(postcss(plugins))
        .pipe(
            purgecss({
                content: ['./src/nunjucks/**/*.html']
            })
        )
        .pipe(sourcemaps.init())
        .on('error', gutil.log)
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./dist/assets/css/'))
        .pipe(connect.reload())
}

// process js
function js() {
	return src([
            './src/js/site.js'
        ])
		.pipe(concat('site.js'))
		.pipe(jsuglify())
		.on('error', gutil.log)
        .pipe(dest('./dist/assets/js/'))
        .pipe(connect.reload())
}

// process images
function images() {
    return src('./src/img/*')
        .pipe(imagemin())
        .pipe(dest('./dist/assets/img/'))
        .pipe(connect.reload())
}

// copy fonts
function copyFonts() {
    return src('./src/fonts/**/*.{ttf,woff,woff2,eof,svg}')
    .pipe(dest('./dist/assets/fonts'))
    .pipe(connect.reload())
}

// live reload
function runServer() {
	connect.server({
        root: 'dist',
        livereload: true
	})
}

// watch these files
function watchFiles() {
    gulp.watch('./src/nunjucks/**/*.html', nunjucks)
    gulp.watch('./src/css/**/*.css', css)
	gulp.watch('./src/js/*.js', js)
	gulp.watch('./src/img/*', images)
}

exports.nunjucks = nunjucks
exports.css = css
exports.js = js
exports.images = images
exports.copyFonts = copyFonts
exports.runServer = runServer
exports.watchFiles = watchFiles
exports.default = parallel(nunjucks, css, js, runServer, watchFiles)