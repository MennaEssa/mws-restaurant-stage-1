let gulp = require('gulp');
let concat = require('gulp-concat');
let sourcemaps = require('gulp-sourcemaps');
let imagemin = require('gulp-imagemin');
let cleanCSS = require('gulp-clean-css');
const webp = require('gulp-webp');
var cssnano = require('gulp-cssnano');
const minify = require('gulp-minify');


gulp.task('default', defaultTask);

gulp.task('test', [
	'scripts-dist',
	'imagemin',
	'minify-css',

]);

 
gulp.task('compress', function() {
  gulp.src('js/*.js')
    .pipe(minify())
    .pipe(gulp.dest('dist/js'))
});


gulp.task('imagemin', function() {
    return gulp.src('img/*.jpg')
        .pipe(imagemin([
            imagemin.jpegtran({
                progressive: true
            }),
        ]))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('webp', () =>
    gulp.src('img/*.jpg')
        .pipe(webp())
        .pipe(gulp.dest('dist/img'))
);

gulp.task('styles', function () {
    return gulp.src('css/styles.css')
        .pipe(cssnano())
        .pipe(gulp.dest('./dist/css'));
});

function defaultTask(done) {
  // place code for your default task here
  console.log("pfft");
  done();
}