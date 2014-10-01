var path = require('path');

exports.cacheDir = path.join(__dirname, 'cache')
exports.cacheTTL = 60 * 60 * 1000;

exports.server = {
	host: '0.0.0.0',
	port: 12344,
	cors: true
};

exports.screenshot = {
	cacheDir: path.join(exports.cacheDir, 'screenshots'),
	cacheTTL: exports.cacheTTL
};
