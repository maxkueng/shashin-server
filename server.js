var path = require('path');
var hapi = require('hapi');

var config = require('./config.js');

var server = new hapi.Server(config.server.host, config.server.port, {
	cors: config.server.cors,
	views: {
		engines: {
			hbs: require('handlebars')
		},
		path: path.resolve(__dirname, 'templates'),
		partialsPath: path.resolve(__dirname, 'templates', 'partials'),
		helpersPath: path.resolve(__dirname, 'templates', 'helpers'),
		layoutPath: path.resolve(__dirname, 'templates', 'layouts'),
		layout: 'default'
	}
});

server.route(require('./routes'));

server.pack.register([
], function () {
	server.start(function () {
		console.log('Server started at', server.info.uri);
	});
});
