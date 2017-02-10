'use strict';

const Code = require('code');
const Hapi = require('hapi');
const Lab = require('lab');

const lab = exports.lab = Lab.script();
const Supervizor = require('../lib/');

lab.experiment('supervizor', () => {

    let server;

    lab.before((done) => {

        server = new Hapi.Server();
        server.connection();

        const setup = {
            register: Supervizor,
            options: {
                validator: (payload, options, next) => {

                    if (Object.keys(payload).length === 0) {
                        return next();
                    }

                    if (!payload.valid && !payload.empty) {
                        const error = new Error('invalid payload');
                        error.details = [{ path: 'valid' }];

                        return next(error);
                    }

                    if (!payload.valid && payload.empty) {
                        const error = new Error('empty payload');

                        return next(error);
                    }

                    return next(null, payload);
                }
            }
        };

        const route = {
            config: {
                handler: (request, reply) => reply(request.payload)
            },
            method: '*',
            path: '/'
        };

        server.route(route);
        server.register(setup, done);
    });

    lab.test('should return control to the server if the request method is not POST', (done) => {

        server.inject('/', (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.headers['content-validation']).to.not.exist();
            done();
        });
    });

    lab.test('should return control to the server if the request payload is empty', (done) => {

        server.inject({ method: 'POST', url: '/', payload: { } }, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.headers['content-validation']).to.not.exist();
            Code.expect(response.result).to.be.empty();
            done();
        });
    });

    lab.test('should return an error if the request content is not valid', (done) => {

        server.inject({ method: 'POST', url: '/', payload: { valid: false, empty: false } }, (response) => {

            Code.expect(response.statusCode).to.equal(400);
            Code.expect(response.headers['content-validation']).to.equal('failure');
            Code.expect(response.result).to.include(['message', 'validation']);
            Code.expect(response.result.message).to.equal('invalid payload');
            Code.expect(response.result.validation).to.include(['source', 'keys']);
            Code.expect(response.result.validation.source).to.equal('payload');
            Code.expect(response.result.validation.keys).to.include('valid');
            done();
        });
    });

    lab.test('should return an error if the request content is not valid and the payload is empty', (done) => {

        server.inject({ method: 'POST', url: '/', payload: { valid: false, empty: true } }, (response) => {

            Code.expect(response.statusCode).to.equal(400);
            Code.expect(response.headers['content-validation']).to.equal('failure');
            Code.expect(response.result).to.include(['message', 'validation']);
            Code.expect(response.result.message).to.equal('empty payload');
            Code.expect(response.result.validation).to.include(['source', 'keys']);
            Code.expect(response.result.validation.source).to.equal('payload');
            Code.expect(response.result.validation.keys).to.be.empty();
            done();
        });
    });

    lab.test('should return control to the server if the request content is valid', (done) => {

        const payload = { valid: true };

        server.inject({ method: 'POST', url: '/', payload }, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.headers['content-validation']).to.equal('success');
            Code.expect(response.result).to.equal(payload);
            done();
        });
    });
});
