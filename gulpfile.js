var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var rename = require('gulp-rename');
var bistre = require('bistre');
var nodemon = require('gulp-nodemon');

var paths = {
	scripts: {
		src: './assets/scripts/*.js',
		main: './assets/scripts/index.js',
		dest: 'static/js/'
	}
};

gulp.task('browserify', function () {
	browserify(paths.scripts.main, { debug: true })
		.bundle()
		.pipe(source('index.js'))
		.pipe(gulp.dest(paths.scripts.dest))
		.pipe(rename('index.min.js'))
		.pipe(streamify(uglify()))
		.pipe(gulp.dest(paths.scripts.dest));
});

gulp.task('nodemon', function () {
	process.env.NODE_ENV = 'dev';

	nodemon({
		script: 'server.js',
		ext: 'hbs js',
		ignore: [
			'assets/',
			'node_modules/',
			'static/'
		],
		stdout: false,
	})
	.on('readable', function () {
		this.stdout
			.pipe(bistre({time: true}))
			.pipe(process.stdout);

		this.stderr
			.pipe(bistre({time: true}))
			.pipe(process.stderr);
	});
});

gulp.task('watch', function(){
	gulp.watch(paths.scripts.src, [ 'browserify' ]);
});

gulp.task('build', [ 'browserify' ]);
gulp.task('dev', [ 'build', 'nodemon', 'watch' ]);
gulp.task('default', [ 'build' ]);
