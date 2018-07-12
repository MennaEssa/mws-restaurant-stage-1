let gulp = require('gulp');
let concat = require('gulp-concat');
let uglify = require('gulp-uglify');
let sourcemaps = require('gulp-sourcemaps');
let imagemin = require('gulp-imagemin');
let cleanCSS = require('gulp-clean-css');
var csso = require('gulp-csso');

const webp = require('gulp-webp');


gulp.task('default', defaultTask);

gulp.task('test', [
	'scripts-dist',
	'imagemin',
	'minify-css',

]);

gulp.task('scripts-dist', function() {
	gulp.src('js/app/*.js')
		.pipe(sourcemaps.init())
		.pipe(concat('all.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/js'));
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
        .pipe(csso())
        .pipe(gulp.dest('./dist/css'));
});

function defaultTask(done) {
  // place code for your default task here
  console.log("pfft");
  done();
}