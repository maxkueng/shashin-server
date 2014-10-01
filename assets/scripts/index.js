var url = require('url');
var domready = require('domready');
var Vue = require('vue');

var viewports = require('viewportsizes');

Vue.directive('required', function (value) {
	var nv = value.trim();
	this.vm.validation[this.key] = (!nv);
	return value;
});

Vue.directive('required-viewport', function (value) {
	var nv = value.trim().toLowerCase();
	var ok = false;

	if (/^\d+x\d+$/i.test(nv) || viewports.get(nv)) {
		ok = true;
	}

	this.vm.validation[this.key] = (!ok);
	return value;
});

Vue.directive('optional-size', function (value) {
	var nv = value.trim();
	var ok = false;
	if (!nv || /^\d+x\d+$/i.test(nv)) {
		ok = true;
	}

	this.vm.validation[this.key] = (!ok);
	return value;
});

Vue.directive('optional-numeric', function (value) {
	var nv = value.trim();
	var ok = false;
	if (!nv || (!isNaN(nv) && Number(nv) >= 0)) {
		ok = true;
	}

	this.vm.validation[this.key] = (!ok);
	return value;
});

domready(function () {

	var v = new Vue({
		el: '#form',

		data: {
			validation: {
				url: true,
				resolution: true,
				size: false,
				delay: false
			},
			url: '',
			resolution: '',
			deviceOrientation: '',
			size: '',
			selector: '',
			delay: '',
			crop: false,
			skipCache: false
		},

		computed: {
			isDeviceResolution: function () {
				return (viewports.get(this.resolution.trim().toLowerCase()) !== null);
			},

			hasErrors : function () {
				var self = this;

				var values = Object.keys(this.validation).map(function (key) {
					return this.validation[key];
				}.bind(this));

				return values.reduce(function (a, b) {
					return (a || b);
				});
			},

			screenshotUrl: function () {
				var values = {};

				var resolution = this.resolution;
				if (this.isDeviceResolution && this.deviceOrientation) {
					resolution += '@' + this.deviceOrientation;
				}

				if (this.url) { values.url = encodeURIComponent(this.url.trim()); }
				if (this.resolution) { values.resolution = encodeURIComponent(resolution.trim()); }
				if (this.size) { values.size = encodeURIComponent(this.size.trim()); }
				if (this.selector) { values.selector = encodeURIComponent(this.selector.trim()); }
				if (this.delay) { values.delay = Number(this.delay); }
				if (this.crop) { values.crop = '1'; }
				if (this.skipCache) { values.skipCache = '1'; }

				var urlObj = {
					protocol: window.location.protocol,
					hostname: window.location.hostname,
					port: window.location.port,
					pathname: '/screenshot.png',
					query: values
				};

				return url.format(urlObj);
			}
		}
	});

});
