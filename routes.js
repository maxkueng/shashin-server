var path = require('path');
var config = require('./config.js');

exports = module.exports = [

	{
		path: '/static/{path*}',
		method: 'GET',
		handler: {
			directory: {
				path: path.join(__dirname, 'static'),
				listing: false,
				index: false
			}
		}
	},

	{
		path: '/',
		method: 'GET',
		handler: require('./lib/screenshot/index.js')(config.screenshot)
	},

	{
		path: '/screenshot.png',
		method: 'GET',
		handler: require('./lib/screenshot/generate-screenshot.js')(config.screenshot)
	}

];
