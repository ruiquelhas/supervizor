'use strict';

const Code = require('code');
const Hapi = require('hapi');
const Lab = require('lab');

const lab = exports.lab = Lab.script();
const Supervizor = require('../lib/');

lab.experiment('supervizor', () => {

    let server;

    lab.before(async () => {

        server = new Hapi.Server();

        const setup = {
            plugin: Supervizor,
            options: {
                validator: async (payload) => {

                    if (Object.keys(payload).length === 0) {
                        return;
                    }

                    if (!payload.valid && !payload.empty) {
                        const error = new Error('invalid payload');
                        error.details = [{ path: ['valid'] }];

                        throw error;
                    }

                    if (!payload.valid && payload.empty) {
                        const error = new Error('empty payload');

                        throw error;
                    }

                    return await Promise.resolve(payload);
                }
            }
        };

        server.route({
            options: {
                handler: (request, reply) => request.payload
            },
            method: '*',
            path: '/'
        });

        await server.register(setup);
    });

    lab.test('should return control to the server if the request method is not POST', async () => {

        const { headers, statusCode } = await server.inject('/');

        Code.expect(statusCode).to.equal(200);
        Code.expect(headers['content-validation']).to.not.exist();
    });

    lab.test('should return control to the server if the request payload is empty', async () => {

        const { headers, result, statusCode } = await server.inject({
            method: 'POST',
            url: '/',
            payload: {}
        });

        Code.expect(statusCode).to.equal(200);
        Code.expect(headers['content-validation']).to.not.exist();
        Code.expect(result).to.be.empty();
    });

    lab.test('should return an error if the request content is not valid', async () => {

        const { headers, result, statusCode } = await server.inject({
            method: 'POST',
            url: '/',
            payload: {
                valid: false,
                empty: false
            }
        });

        Code.expect(statusCode).to.equal(400);
        Code.expect(headers['content-validation']).to.equal('failure');
        Code.expect(result).to.include(['message', 'validation']);
        Code.expect(result.message).to.equal('invalid payload');
        Code.expect(result.validation).to.include(['source', 'keys']);
        Code.expect(result.validation.source).to.equal('payload');
        Code.expect(result.validation.keys).to.include('valid');
    });

    lab.test('should return an error if the request content is not valid and the payload is empty', async () => {

        const { headers, result, statusCode } = await server.inject({
            method: 'POST',
            url: '/',
            payload: {
                valid: false,
                empty: true
            }
        });

        Code.expect(statusCode).to.equal(400);
        Code.expect(headers['content-validation']).to.equal('failure');
        Code.expect(result).to.include(['message', 'validation']);
        Code.expect(result.message).to.equal('empty payload');
        Code.expect(result.validation).to.include(['source', 'keys']);
        Code.expect(result.validation.source).to.equal('payload');
        Code.expect(result.validation.keys).to.be.empty();
    });

    lab.test('should return control to the server if the request content is valid', async () => {

        const payload = { valid: true };
        const { headers, result, statusCode } = await server.inject({
            method: 'POST',
            url: '/',
            payload
        });

        Code.expect(statusCode).to.equal(200);
        Code.expect(headers['content-validation']).to.equal('success');
        Code.expect(result).to.equal(payload);
    });
});
