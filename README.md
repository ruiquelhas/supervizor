# supervizor
Server-level request payload validation for [hapi](https://github.com/hapijs/hapi).

[![NPM Version][version-img]][version-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url] [![Dependencies][david-img]][david-url] [![Dev Dependencies][david-dev-img]][david-dev-url]

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Synchronous validation](#synchronous-validation)
  - [Asynchronous validation](#asynchronous-validation)

## Installation
Install via [NPM](https://www.npmjs.org).

```sh
$ npm install supervizor
```

## Usage

Register the package as a server plugin and provide a validation function via the `options` that will be attached to each route.

If the validation fails, a [joi](https://github.com/hapijs/joi)-like `400 Bad Request` error is returned alongside an additional `content-validation: failure` response header. If everything is ok, the response will ultimately contain a `content-validation: success` header.

### Synchronous validation

```js
const Hapi = require('hapi');
const Supervizor = require('supervizor');

const plugin = {
    plugin: Supervizor,
    options: {
        validator: (payload) => {
            // In this example, the payload must contain `valid: true`.
            if (!payload.valid) {
                // Be nice to everyone and provide details about the issue.
                // protip: https://github.com/hapijs/joi/blob/v13.0.1/API.md#errors
                const error = new Error('invalid payload');
                error.details = [{ path: ['valid'] }];

                throw error;
            }

            // Be nice to yourself and allow further validation.
            return payload;
        }
    }
};

try {
    const server = new Hapi.Server();

    await server.register(plugin);
    await server.start();
}
catch (err) {
    throw err;
}
```

### Asynchronous validation

```js
const Hapi = require('hapi');
const Supervizor = require('supervizor');

const plugin = {
    plugin: Supervizor,
    options: {
        validator: async (payload, options) => {
            // In this example, an asychronous validation function is called.
            try {
                await validate(payload, options);

                // Be nice to yourself and allow further validation.
                return payload;
            }
            catch (err) {
                // Be nice to everyone and provide details about the issue.
                // protip: https://github.com/hapijs/joi/blob/v13.0.1/API.md#errors
                const error = new Error('invalid payload');
                error.details = [{ path: ['valid'] }];

                throw error;
            }
        }
    }
};

try {
    const server = new Hapi.Server();

    await server.register(plugin);
    await server.start();
}
catch (err) {
    throw err;
}
```

[coveralls-img]: https://img.shields.io/coveralls/ruiquelhas/supervizor.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/ruiquelhas/supervizor
[david-img]: https://img.shields.io/david/ruiquelhas/supervizor.svg?style=flat-square
[david-url]: https://david-dm.org/ruiquelhas/supervizor
[david-dev-img]: https://img.shields.io/david/dev/ruiquelhas/supervizor.svg?style=flat-square
[david-dev-url]: https://david-dm.org/ruiquelhas/supervizor?type=dev
[version-img]: https://img.shields.io/npm/v/supervizor.svg?style=flat-square
[version-url]: https://www.npmjs.com/package/supervizor
[travis-img]: https://img.shields.io/travis/ruiquelhas/supervizor.svg?style=flat-square
[travis-url]: https://travis-ci.org/ruiquelhas/supervizor
