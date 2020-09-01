var { series, parallel, watch, src, dest } = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var rename = require("gulp-rename");
var plumber = require('gulp-plumber');
var pkg = require('./package.json');
var banner = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

function make() {
    return src(['src/angularjs-currency-input-mask.js'])
        .pipe(plumber())
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(dest('./dist/'))
}

function minify() {
    return src(['dist/angularjs-currency-input-mask.js'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(uglify({output: {comments:'some'}}))
        .pipe(sourcemaps.write('.'))
        .pipe(rename(function(path){
            if (!path.extname.endsWith('.map')) {
                path.basename += '.min';
            }
        }))
        .pipe(dest('./dist/'))
}

function dev() {
    watch(['src/angularjs-currency-input-mask.js']).on('change', function(path, stats) {
        series(make,minify)()
    })
}

/**
 * had to break in two steps due to compatibility problems between header and sourcemaps when in a single step
 */
exports.build = series(make,minify);
exports.default = series(exports.build,dev)

