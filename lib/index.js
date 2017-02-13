'use strict';

const Boom = require('boom');

const internals = {};

internals.onPreHandler = function (options) {

    return function (request, reply) {

        if (request.method !== 'post') {
            return reply.continue();
        }

        const opts = Object.assign({}, options);
        delete opts.validator;

        options.validator(request.payload, opts, (err, valid) => {

            if (err) {
                const error = Boom.badRequest(err.message);
                error.output.headers['content-validation'] = 'failure';
                error.output.payload.validation = {
                    source: 'payload',
                    keys: (err.details || []).map((entry) => entry.path)
                };

                return reply(error);
            }

            if (valid) {
                request.app.hasInvalidContent = false;
            }

            reply.continue();
        });
    };
};

internals.onPreResponse = function (options) {

    return function (request, reply) {

        if (!request.response.isBoom && request.app.hasInvalidContent === false) {
            request.response.header('content-validation', 'success');
        }

        reply.continue();
    };
};

exports.register = function (server, options, next) {

    server.ext('onPreHandler', internals.onPreHandler(options));
    server.ext('onPreResponse', internals.onPreResponse(options));

    next();
};

exports.register.attributes = {
    pkg: require('../package.json')
};
