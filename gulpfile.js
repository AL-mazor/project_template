var gulp = require('gulp'),
	jade = require('gulp-jade'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	watch = require('gulp-watch'),
	sync = require('browser-sync').create(),
	concat = require('gulp-concat'),
	mainBowerFiles = require('gulp-main-bower-files'),
	filter = require('gulp-filter'),
	sourcemaps = require('gulp-sourcemaps'),
	merge = require('merge-stream'),
    rigger = require('gulp-rigger'),
	imagemin = require('gulp-imagemin'),
	clean = require('gulp-clean'),
	uglify = require('gulp-uglify'),
	rimraf = require('rimraf'),
	csso = require('gulp-csso');

// pathes to files
var paths = {
	sass: ['src/css/*.sass' , 'src/*.sass'],
	css: ['src/css/*.css'],
	jade: ['src/*.jade', 'src/**/*.jade'],
	scripts: ['src/js/*.js'],
	images: ['src/img/*.png', 'src/img/*.jpg'],
	svg: ['src/img/*.svg'],
	fonts: ['src/fonts/**/*']
}

// Jade to Html
gulp.task('html', function () {
	return gulp.src(paths.jade[0])
		.pipe(jade({
			pretty: true
		}))
		.pipe(gulp.dest('dist'))
		.pipe(sync.stream());
});

// scss to css
gulp.task('sass', function () {
	return gulp.src(paths.sass)
			.pipe(sass())
  			.pipe(csso())
			.pipe(autoprefixer({
				  browsers: ['last 2 versions']
			}))
			.pipe(gulp.dest('dist'))
			.pipe(sync.stream());
});

// scss to css
gulp.task('css', function () {
	return gulp.src(paths.css)
		.pipe(csso())
		.pipe(autoprefixer({
			  browsers: ['last 2 versions']
		}))
		.pipe(gulp.dest('dist'))
		.pipe(sync.stream());
});

//scripts
gulp.task('scripts', function() {
	return gulp.src(paths.scripts)
		.pipe(rigger())
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(concat('main.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(sync.stream());
});

gulp.task('imgmin', function () {
	return gulp.src(paths.images)
		.pipe(imagemin())
		.pipe(gulp.dest('dist/img'))
})

gulp.task('imgsvg', function () {
  return gulp.src(paths.svg)
    .pipe(gulp.dest('dist/img'));
});

gulp.task('fonts', function () {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('clean', function () {
    return gulp.src('dist/**/*', {read: false})
        .pipe(clean());
});

// browser sync
gulp.task('serve', ['sass', 'css', 'html', 'scripts', 'fonts', 'imgmin', 'imgsvg'], function() {
	sync.init({
		server: {
			baseDir: "./dist"
		}
	});

	gulp.watch(paths.sass, ['sass']);
	gulp.watch(paths.css, ['css']);
	gulp.watch(paths.jade, ['html']);
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.fonts, ['fonts']);
	gulp.watch(paths.images, ['imgmin']);
	gulp.watch(paths.svg, ['imgsvg']);
	gulp.watch('dist/*.html').on('change', sync.reload);
});


gulp.task('default', [ 'serve' ]);