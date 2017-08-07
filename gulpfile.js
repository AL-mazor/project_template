var gulp = require('gulp'),
	pug = require('gulp-pug'), // html templates
	sass = require('gulp-sass'),
	uncss = require('gulp-uncss'), // unused css
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
	changed = require('gulp-changed'), // check if files in dist directory are changed
	plumber = require('gulp-plumber'), // catch error on the fly without gulp stop
	// rimraf = require('rimraf'),
	// buffer = require('vinyl-buffer'),
	mainBowerFiles = require('gulp-main-bower-files'),
	csso = require('gulp-csso');

// pathes to files
var paths = {
    build: {
        html: 'dist/',
        css: 'dist/',
        js: 'dist/js/',
        img: 'dist/img/',
		sprites: 'dist/img/sprites',
        fonts: 'dist/fonts/',
		libs: 'dist/libs/'
    },
    src: {
		pug: ['src/*.pug', 'src/**/*.pug'],
		sass: ['src/css/*.sass' , 'src/*.sass'],
		scripts: ['src/js/*.js'],
		images: ['src/img/*.png', 'src/img/*.jpg'],
		sprites: ['src/img/sprites/*.*'],
		fonts: ['src/fonts/**/*'],
    }
};

// pug to HTML
gulp.task('html', function buildHTML() {
	return gulp.src(paths.src.pug[0])
		.pipe(pug({
		  pretty: true
		}))
		.pipe(gulp.dest(paths.build.html))
		.pipe(sync.stream());
});

// sass to css
gulp.task('sass', function () {
    return gulp.src(paths.src.sass)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(changed(paths.build.css))
        .pipe(sass())
        .pipe(csso())
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(sourcemaps.write('css/'))
        .pipe(gulp.dest(paths.build.css))
        .pipe(sync.stream());
});


// scripts
gulp.task('scripts', function() {
	return gulp.src(paths.src.scripts)
        .pipe(plumber())
		.pipe(rigger())
		.pipe(changed(paths.build.js))
		.pipe(uglify())
		.pipe(concat('main.js'))
		.pipe(gulp.dest(paths.build.js))
		.pipe(sync.stream());
});

// images
gulp.task('imgmin', function () {
	return gulp.src(paths.src.images)
		.pipe(changed(paths.build.img))
		.pipe(imagemin())
		.pipe(gulp.dest(paths.build.img))
});

// sprites
gulp.task('sprites', function () {
  var spriteData = gulp.src(paths.src.sprites).pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css'
  }));
  var imgStream = spriteData.img 
    // .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest(paths.build.sprites));
  var cssStream = spriteData.css
    .pipe(csso())
    .pipe(gulp.dest(paths.build.sprites));
  return merge(imgStream, cssStream);
});

// Bower Files
gulp.task('bowerFiles', function() {
	return gulp.src('bower.json')
		.pipe(mainBowerFiles())
		.pipe(changed(paths.build.libs))
		.pipe(gulp.dest(paths.build.libs));
});


// fonts
gulp.task('fonts', function () {
  return gulp.src(paths.src.fonts)
    .pipe(gulp.dest(paths.build.fonts));
});

// browser sync
gulp.task('serve', ['html', 'sass', 'scripts', 'fonts', 'imgmin', 'sprites'], function() {
	sync.init({
		server: {
			baseDir: paths.build.html
		}
	});
	// TODO add main-bower-files to watch
	gulp.watch(paths.src.pug, ['html']);
	gulp.watch(paths.src.sass, ['sass']);
	gulp.watch(paths.src.scripts, ['scripts']);
	gulp.watch(paths.src.fonts, ['fonts']);
	gulp.watch(paths.src.images, ['imgmin']);
	gulp.watch(paths.src.sprites, ['sprites']);
	gulp.watch('dist/*.html').on('change', sync.reload);
});

gulp.task('default', ['serve']);