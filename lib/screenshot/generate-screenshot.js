var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var shashin = require('shashin');
var objectHash = require('object-hash');
var wrappy = require('wrappy');
var hapi = require('hapi');
var gm = require('gm');

var once = wrappy(function (callback) {
	var called = false
	return function () {
		if (called) { return; }
		called = true
		return callback.apply(this, arguments);
	}
});

function parseSize (size) {
	if (size && typeof size === 'string') {
		if (/^\d+x\d+$/i.test(size)) {
			size = size.split(/x/i);
		}
	}

	if (size && Array.isArray(size) && size.length === 2) {
		return { width: parseInt(size[0], 10), height: parseInt(size[1], 10) };
	}

	if (size && typeof size === 'object' && size.hasOwnProperty('width') && size.hasOwnProperty('height')) {
		return size;
	}

	return null;
}

exports = module.exports = function (options) {

	var imgProc = (options.useImageMagick) ? gm.subClass({ imageMagick: true }) : gm;

	var root = process.cwd();
	mkdirp.sync(options.cacheDir);

	return function screenshotHandler (request, reply) {
		var params = {
			url: (request.query.url) ? decodeURIComponent(request.query.url) : '',
			crop: (request.query.crop == '1'),
			skipCache: (request.query.skipCache == '1'),
			delay: (typeof request.query.delay !== 'undefined') ? parseInt(request.query.delay, 10) : 0,
			resolution: (request.query.resolution) ? decodeURIComponent(request.query.resolution) : '1024x768',
			size: (request.query.size) ? parseSize(decodeURIComponent(request.query.size)) : null,
			selector: (request.query.selector) ? decodeURIComponent(request.query.selector) : null,
		};

		createScreenshot(params, function (err, filePath) {
			if (err) {
				console.log('✗✗', err);
				params.url = path.join(__dirname, 'resources', 'fail.html');
				params.selector = null;

				return createScreenshot(params, function (err, filePath) {
					if (err) {
						console.log('✗', err);
						return reply(hapi.error.badRequest());
					}
					return sendCachedImage(filePath);
				});
			}

			sendCachedImage(filePath);
		});

		function sendCachedImage (filePath) {
			console.log(filePath);
			reply.file(filePath);
		}

		function createScreenshot (params, callback) {
			var hash = objectHash(params);
			var filePath = path.join(options.cacheDir, hash + '.png');
			var url = params.url;
			var resolution = params.resolution;

			var hasCachedImage = false;

			if (fs.existsSync(filePath)) {
				console.log('EXISTS');
				var stat = fs.statSync(filePath);
				var fileTime = Date.parse(stat.mtime).valueOf();
				var now = Date.now().valueOf();
				var diff = now - fileTime;

				if (diff < options.cacheTTL) {
					hasCachedImage = true;
				}
			}

			if (!params.skipCache && hasCachedImage) {
				return sendCachedImage(filePath);
			}

			var opts = {
				delay: params.delay,
				crop: params.crop,
				selector: params.selector
			};

			var info = shashin(url, resolution, opts);
			var file = fs.createWriteStream(filePath);

			var error = null;

			info.stream.on('error', once(function (err) {
				error = err;
			}));

			file.on('finish', function () {
				if (error) {
					return callback(error);
				}

				if (params.size) {
					imgProc(filePath)
						.resize(params.size.width, params.size.height)
						.write(filePath, function (err) {
							if (err) {
								return callback(error);
							}

							callback(null, filePath);
						});

				} else {
					callback(null, filePath);
				}
			});

			info.stream.pipe(file);
		}

	}
};
