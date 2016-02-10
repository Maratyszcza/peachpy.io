// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var htmlmin = require('gulp-htmlmin');

//copy robot.txt
//copy pyata.tar
//counts

// Lint Task
gulp.task('lint', function() {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('robots', function() {
    return gulp.src('robots.txt')
        .pipe(gulp.dest('dist'));
});

gulp.task('pydata', function() {
    return gulp.src('pydata.tar')
        .pipe(gulp.dest('dist'));
});

gulp.task('lint', function() {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src(['./bower_components/bootstrap/dist/css/bootstrap.min.css', './bower_components/bootstrap/dist/css/bootstrap-theme.min.css', './bower_components/bootstrap-slider/slider.css'])
        .pipe(concat('all.css'))
        .pipe(gulp.dest('dist'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src(['./bower_components/jquery/dist/jquery.min.js'
    	,'./bower_components/bootstrap/dist/js/bootstrap.min.js'
    	,'./bower_components/bootstrap-slider/bootstrap-slider.js'
    	,'./bower_components/d3/d3.min.js'
    	,'./bower_components/ace-builds/src-min/ace.js'
    	,'./bower_components/ace-builds/src-min/mode-python.js'
    	,'./bower_components/ace-builds/src-min/theme-monokai.js'])
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

gulp.task('scriptsasm', function() {
    return gulp.src('js/peachpy.asm.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

//minify html
gulp.task('html', function() {
    return gulp.src('index.html')
        // .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist'));
});

// gulp.task('bowermove', function() {
//     return gulp.src('bower_components/**')
//         .pipe(gulp.dest('dist'));
// });

gulp.task('images', function() {
    return gulp.src('peachpy.png')
        .pipe(gulp.dest('dist'));
});

gulp.task('nmf', function() {
    return gulp.src('peachpy.nmf')
        .pipe(gulp.dest('dist'));   
});

gulp.task('pexe', function() {
    return gulp.src('peachpy.pexe')
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
gulp.task('default', ['lint', 'sass', 'scripts','scriptspeach', 'html', 'images','nmf', 'pexe', 'watch','robots','pydata','scriptsasm']);



