let gulp = require('gulp');
let concat = require('gulp-concat');
let uglify = require('gulp-uglify');
let sourcemaps = require('gulp-sourcemaps');
let imagemin = require('gulp-imagemin');
let cleanCSS = require('gulp-clean-css');

gulp.task('default', defaultTask);

gulp.task('test', [
	'scripts-dist',
	'compress-img',
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

gulp.task('minify-css', () => {
  return gulp.src('css/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist'));
});

function defaultTask(done) {
  // place code for your default task here
  console.log("pfft");
  done();
}