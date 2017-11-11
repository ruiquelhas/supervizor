'use strict';

const Boom = require('boom');

const internals = {};

internals.onPreHandler = function (options) {

    return async function (request, h) {

        if (request.method !== 'post') {
            return h.continue;
        }

        const opts = Object.assign({}, options);
        delete opts.validator;

        try {
            const payload = await options.validator(request.payload, opts);

            if (payload) {
                request.app.hasInvalidContent = false;
            }

            return h.continue;
        }
        catch ({ message, details = [] }) {
            const error = Boom.badRequest(message);
            error.output.headers['content-validation'] = 'failure';
            error.output.payload.validation = {
                source: 'payload',
                keys: details.reduce((result, entry) => result.concat(entry.path), [])
            };

            throw error;
        }
    };
};

internals.onPreResponse = function (options) {

    return function (request, h) {

        if (!request.response.isBoom && request.app.hasInvalidContent === false) {
            request.response.header('content-validation', 'success');
        }

        return h.continue;
    };
};

internals.register = function (server, options) {

    server.ext('onPreHandler', internals.onPreHandler(options));
    server.ext('onPreResponse', internals.onPreResponse(options));
};

module.exports = {
    pkg: require('../package.json'),
    register: internals.register
};
