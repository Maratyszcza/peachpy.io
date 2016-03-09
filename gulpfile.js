// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var htmlmin = require('gulp-htmlmin');

// Lint Task
gulp.task('lint', function() {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('resources', function() {
    return gulp.src('res/**/*')
        .pipe(gulp.dest('dist'));
});

// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src(['./bower_components/bootstrap/dist/css/bootstrap.min.css', './bower_components/bootstrap/dist/css/bootstrap-theme.min.css'])
        .pipe(concat('all.css'))
        .pipe(gulp.dest('dist'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src(['./bower_components/jquery/dist/jquery.min.js', './bower_components/bootstrap/dist/js/bootstrap.min.js', './bower_components/d3/d3.min.js', './bower_components/ace-builds/src-min/ace.js', './bower_components/ace-builds/src-min/mode-python.js', './bower_components/ace-builds/src-min/theme-monokai.js', './bower_components/d3-tip/index.js'])
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('scriptspeach', function() {
    return gulp.src('js/peachpy.js')
        .pipe(concat('peachpy.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

//minify html
gulp.task('html', function() {
    return gulp.src('index.html')
        // .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    // gulp.watch('js/*.js', ['lint', 'scripts']);
    // gulp.watch('index.html', ['html']);
    // gulp.watch('scss/*.scss', ['sass']);
    // gulp.watch('bower_components/**',['bowermove']);
});

// Default Task
gulp.task('default', ['sass', 'scripts', 'html', 'resources', 'scriptspeach']);