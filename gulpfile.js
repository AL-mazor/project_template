var gulp = require('gulp'),
	pug = require('gulp-pug'),
	sass = require('gulp-sass'),
	uncss = require('gulp-uncss'),
	spritesmith = require('gulp.spritesmith'),
	autoprefixer = require('gulp-autoprefixer'),
	watch = require('gulp-watch'),
	sync = require('browser-sync').create(),
	concat = require('gulp-concat'),
	sourcemaps = require('gulp-sourcemaps'),
	merge = require('merge-stream'),
    rigger = require('gulp-rigger'),
	imagemin = require('gulp-imagemin'),
	uglify = require('gulp-uglify'),
	changed = require('gulp-changed'),
	rimraf = require('rimraf'),
	buffer = require('vinyl-buffer'),
	csso = require('gulp-csso');

// pathes to files
var paths = {
	pug: ['src/*.pug', 'src/**/*.pug'],
	sass: ['src/css/*.sass' , 'src/*.sass'],
	scripts: ['src/js/*.js'],
	images: ['src/img/*.png', 'src/img/*.jpg'],
	sprites: ['src/img/sprites/*.*'],
	fonts: ['src/fonts/**/*'],
	dist: ['dist']
}

// pug to HTML
gulp.task('html', function () {
	return gulp.src(paths.pug[0])
		.pipe(changed(dist))
		.pipe(pug())
		.pipe(gulp.dest(dist))
		.pipe(sync.stream());
});

// sass to css
gulp.task('sass', function () {
	return gulp.src(paths.sass)
		.pipe(sourcemaps.init())
		.pipe(changed(dist))
		.pipe(sass())
		.pipe(csso())
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(dist))
		.pipe(sync.stream());
});

// scripts
gulp.task('scripts', function() {
	return gulp.src(paths.scripts)
		.pipe(rigger())
		.pipe(sourcemaps.init())
		.pipe(changed('dist/js'))
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(concat('main.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(sync.stream());
});

// images
gulp.task('imgmin', function () {
	return gulp.src(paths.images)
		.pipe(changed('./townhouse/images'))
		.pipe(imagemin())
		.pipe(gulp.dest('dist/img'))
})

// sprites
gulp.task('sprites', function () {
  var spriteData = gulp.src(paths.sprites).pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css'
  }));
  var imgStream = spriteData.img 
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img/sprites'));
  var cssStream = spriteData.css
    .pipe(csso())
    .pipe(gulp.dest('dist/img/sprites'));
  return merge(imgStream, cssStream);
});


// fonts
gulp.task('fonts', function () {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest('dist/fonts'));
});

// browser sync
gulp.task('serve', ['html', 'sass', 'scripts', 'fonts', 'imgmin', 'sprites'], function() {
	sync.init({
		server: {
			baseDir: dist
		}
	});

	gulp.watch(paths.pug, ['html']);
	gulp.watch(paths.sass, ['sass']);
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.fonts, ['fonts']);
	gulp.watch(paths.images, ['imgmin']);
	gulp.watch(paths.sprites, ['sprites']);
	gulp.watch('dist/*.html').on('change', sync.reload);
});

gulp.task('default', ['serve']);