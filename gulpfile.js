var gulp = require('gulp')
    , gutil = require('gulp-util')
    , del = require('del')
    , concat = require('gulp-concat')
    , rename = require('gulp-rename')
    , minifycss = require('gulp-minify-css')
    , minifyhtml = require('gulp-minify-html')
    , jshint = require('gulp-jshint')
    , jscs = require('gulp-jscs')
    , streamify = require('gulp-streamify')
    , uglify = require('gulp-uglify')
    , less = require('gulp-less')
    , jade = require('gulp-jade')
    , sourcemaps = require('gulp-sourcemaps')
    , connect = require('gulp-connect')
    , source = require('vinyl-source-stream')
    , browserify = require('browserify')
    , babelify = require('babelify')
    , errorify = require('errorify')
    , watchify = require('watchify')
    , gulpif = require('gulp-if')
    , vinylPaths = require('vinyl-paths')
    , open = require('gulp-open')
    , imagemin = require('gulp-imagemin')
    , pngquant = require('imagemin-pngquant')
    , paths;

var watching = false;

paths = {
    assets: 'src/assets/**/*',
    less:    'src/less/*.less',
    libs: [
        './src/bower_components/phaser-official/build/phaser.js',
        './src/bower_components/chance/chance.js',
        './src/bower_components/lodash/lodash.js'
    ],
    jade: ['src/index.jade', 'src/tmpl/**/*.jade'],
    js: ['src/js/**/*.js'],
    entry: './src/js/main.js',
    dist: './dist/'
};

gulp.task('clean', function () {
    return gulp.src(paths.dist)
        .pipe(vinylPaths(del))
        .on('error', gutil.log);
});

gulp.task('copyassets', ['clean'], function () {
    gulp.src(paths.assets)
        .pipe(gulpif(!watching, imagemin({
            optimizationLevel: 4,
            use: [pngquant()]
        })))
        .pipe(gulp.dest(paths.dist + 'assets'))
        .on('error', gutil.log);
});

gulp.task('copylibs', ['clean'], function () {
    gulp.src(paths.libs)
        .pipe(uglify())
        //.pipe(gulpif(!watching, uglify({outSourceMaps: false})))
        .pipe(concat('lib.js'))
        .pipe(gulp.dest(paths.dist + 'js'))
        .on('error', gutil.log);
});

gulp.task('compilejs', ['jscs', 'jshint', 'clean'], function () {
    var bundler = browserify({
        cache: {}, packageCache: {}, fullPaths: true,
        entries: [paths.entry],
        debug: watching
    })
        .transform(babelify);
        
    if(watching) {
        bundler.plugin(errorify);
    }

    var bundlee = function() {
        return bundler
            .bundle()
            .pipe(source('js/main.min.js'))
            .pipe(gulpif(!watching, streamify(uglify({outSourceMaps: false}))))
            .pipe(gulp.dest(paths.dist))
            .on('error', gutil.log);
    };

    if (watching) {
        bundler = watchify(bundler);
        bundler.on('update', bundlee);
    }

    return bundlee();
});

gulp.task('jscs', function() {
    gulp.src(paths.js)
        .pipe(jscs(require('./.jscs.json')))//could not get it to work as .jscsrc -- workaround
        .on('error', gutil.log);
});

gulp.task('jshint', function() {
    gulp.src(paths.js)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .on('error', gutil.log);
});

gulp.task('compileless', ['clean'], function () {
    gulp.src(paths.less)
        .pipe(sourcemaps.init())
            .pipe(less())
            .pipe(concat('css/main.css'))
            .pipe(gulpif(!watching, minifycss({
                keepSpecialComments: false,
                removeEmpty: true
            })))
            .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.dist))
        .on('error', gutil.log);
});

gulp.task('compilejade', ['clean'], function() {
    gulp.src(paths.jade)
        .pipe(jade({
            pretty: watching
        }))
        .pipe(gulpif(!watching, minifyhtml()))
        .pipe(gulp.dest(paths.dist))
        .on('error', gutil.log);
});

gulp.task('html', ['build'], function(){
    gulp.src('dist/*.html')
        .pipe(connect.reload())
        .on('error', gutil.log);
});

gulp.task('connect', function () {
    connect.server({
        root: ['./dist'],
        port: 8000,
        livereload: true
    });
});

gulp.task('open', function() {
    gulp.src('./dist/index.html')
        .pipe(open('', {
            url: 'http://localhost:8000'
        }));
});

gulp.task('watch', function () {
    watching = true;
    return gulp.watch([paths.less, paths.jade, paths.js], ['build', 'html']);
});

gulp.task('default', ['connect', 'open', 'watch', 'build']);
gulp.task('build', ['clean', 'copyassets', 'copylibs', 'compile']);
gulp.task('compile', ['compilejs', 'compileless', 'compilejade']);
