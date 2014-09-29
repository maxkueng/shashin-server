exports = module.exports = function (options) {

	return function formHandler (request, reply) {
		reply.view('views/screenshot/form');
	}
};
