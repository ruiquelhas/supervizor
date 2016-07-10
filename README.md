# supervizor
Server-level request payload validation for [hapi](https://github.com/hapijs/hapi).

[![NPM Version][fury-img]][fury-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url] [![Dependencies][david-img]][david-url]

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Example](#example)

## Installation
Install via [NPM](https://www.npmjs.org).

```sh
$ npm install supervizor
```

## Usage

Register the package as a server plugin and provide a validation function via the `options` that will be attached to each route.

If the validation fails, a [joi](https://github.com/hapijs/joi)-like `400 Bad Request` error is returned alongside an additional `content-validation: failure` response header. If everything is ok, the response will ultimately contain a `content-validation: success` header.

### Example

```js
const Hapi = require('hapi');
const Supervizor = require('supervizor');

server = new Hapi.Server();
server.connection({
    // go nuts
});

const plugin = {
    register: Supervizor,
    options: {
        validator: (payload, options, next) => {
            // In this example, the payload must contain `valid: true`.
            if (!payload.valid) {
                // Be nice to everyone and provide details about the issue.
                const error = new Error('invalid payload');
                error.details = [{ path: 'valid' }];

                return next(error);
            }

            // Be nice to yourself and allow further validation.
            next(null, payload);
        });
    }
};

server.register(plugin, (err) => {

    if (err) {
        throw err;
    }

    server.start(() => {
        // go nuts
    });
});
```

[coveralls-img]: https://coveralls.io/repos/ruiquelhas/supervizor/badge.svg
[coveralls-url]: https://coveralls.io/github/ruiquelhas/supervizor
[david-img]: https://david-dm.org/ruiquelhas/supervizor.svg
[david-url]: https://david-dm.org/ruiquelhas/supervizor
[fury-img]: https://badge.fury.io/js/supervizor.svg
[fury-url]: https://badge.fury.io/js/supervizor
[travis-img]: https://travis-ci.org/ruiquelhas/supervizor.svg
[travis-url]: https://travis-ci.org/ruiquelhas/supervizor
