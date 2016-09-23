var rnd = Math.random,
    _ = require('lodash').noConflict(),
    util; // exports

util = {
    /**
     * Returns unique GUID on every call as per pseudo-number RFC4122 standards.
     *
     * @type {function}
     * @returns {string}
     */
    uid: function () {
        var n,
            r,
            E = '',
            H = '-'; // r = result , n = numeric variable for positional checks

        // if "n" is not 9 or 14 or 19 or 24 return a random number or 4
        // if "n" is not 15 generate a random number from 0 to 15
        // `(n ^ 20 ? 16 : 4)` := unless "n" is 20, in which case a random number from 8 to 11 otherwise 4
        //
        // in other cases (if "n" is 9,14,19,24) insert "-"
        /* jshint noempty: false */// jscs:disable
        for (r = n = E; n++ < 36; r += n * 51 & 52 ? (n ^ 15 ? 8 ^ rnd() * (n ^ 20 ? 16 : 4) : 4).toString(16) : H) {
        }
        // jscs:enable
        return r;
    },

    stringStartsWith: function (string, prefix) {
        return string.slice(0, prefix.length) == prefix;
    },

    stringEndsWith: function (string, suffix) {
        return string.indexOf(suffix, string.length - suffix.length) !== -1;
    },

    urlparse: function (url) {
        url = _.trim(url);
        var p = {
            raw: url
        };

        // extract the protocol
        p.protocol = url.match(/^([^:]+):\/\/([^\?#\/:]+|$)/);
        p.protocol = _.get(p.protocol, '[1]');
        // remove that damn protocol from url
        _.isString(p.protocol) && (url = url.substr(p.protocol.length + 3));

        // extract authentication information
        p.auth = url.match(/^(([^:]+):?([^@]*))@([^\?#\/:]+|$)/);
        // remove the auth part from url
        _.isString(_.get(p.auth, '[1]')) && (url = url.substr(_.get(p.auth, '[1]').length + 1));
        p.auth = {
            user: _.get(p.auth, '[2]'),
            password: _.get(p.auth, '[3]')
        };

        // extract the host
        p.host = url.match(/^([^\?#\/:]+)/);
        p.host = _.get(p.host, '[1]');
        _.isString(p.host) && ((url = url.substr(p.host.length)), (p.host = _.trim(p.host, '.').split('.')));

        // get the port
        p.port = url.match(/^:(\d+|{{.+}})(\/|\?|^)/);
        p.port = _.get(p.port, '[1]');
        _.isString(p.port) && (url = url.substr(p.port.length + 1));

        // extract the path
        p.path = url.match(/.*?(?=\?|#|$)/);
        p.path = _.get(p.path, '[0]');
        _.isString(p.path) && ((url = url.substr(p.path.length)), (p.path = _.trimLeft(p.path, '/').split('/')));

        p.query = url.match(/^\?([^#$]+)/);
        p.query = _.get(p.query, '[1]');
        if (_.isString(p.query)) {
            url = url.substr(p.query.length + 1);
            p.query = p.query.split('&').map(function (q) {
                q = q.split('=');
                return {
                    key: _.trim(q[0]) || '',
                    value: _.trim(q[1]) || ''
                };
            });
        }

        // extract the hash
        p.hash = url.match(/#(.+)$/);
        p.hash = _.get(p.hash, '[1]');

        return p;
    },

    urlunparse: function (urlObj) {
        var rawUrl = '',
            path,
            queryString;

        if (urlObj.protocol) {
            rawUrl = rawUrl + (_.endsWith(urlObj.protocol, '://') ? urlObj.protocol : urlObj.protocol + '://');
        }

        if (urlObj.auth && urlObj.auth.user) { // If the user is not specified, ignore the password.
            rawUrl = rawUrl + ((urlObj.auth.password) ?
                urlObj.auth.user + ':' + urlObj.auth.password : urlObj.auth.user) + '@'; // ==> username:password@
        }

        if (urlObj.host) {
            rawUrl = rawUrl + (_.isArray(urlObj.host) ? urlObj.host.join('.') : urlObj.host.toString());
        }

        if (urlObj.port) {
            rawUrl = rawUrl + ':' + urlObj.port.toString();
        }

        if (urlObj.path) {
            path = (_.isArray(urlObj.path) ? urlObj.path.join('/') : urlObj.path.toString());
            rawUrl = rawUrl + (_.startsWith(path, '/') ? path : '/' + path);
        }

        if (urlObj.query && urlObj.query.length) {
            queryString = _.reduce(urlObj.query, function (accumulator, param) {
                if (accumulator.length > 0) {
                    accumulator += '&';
                }
                accumulator += encodeURI(param.key + '=' + param.value);
                return accumulator;
            }, '');

            // Special handling to ensure "{{" and "}}" are not URL encoded in the final query-string.
            queryString = queryString.replace(/%7B%7B/g, '{{');
            queryString = queryString.replace(/%7D%7D/g, '}}');

            rawUrl = rawUrl + '?' + queryString;
        }

        if (urlObj.hash) {
            rawUrl = rawUrl + '#' + urlObj.hash;
        }

        return rawUrl;
    },

    // jscs:disable
    /* jshint ignore:start */
    authMappersFromLegacy: {
        basicAuth: function (oldParams) {
            return {
                username: oldParams.username,
                password: oldParams.password,
                saveHelperData: oldParams.saveToRequest,
                showPassword: false
            };
        },
        digestAuth: function (oldParams) {
            return {
                algorithm: oldParams.algorithm,
                username: oldParams.username,
                realm: oldParams.realm,
                password: oldParams.password,
                nonce: oldParams.nonce,
                nonceCount: oldParams.nonceCount,
                clientNonce: oldParams.clientNonce,
                opaque: oldParams.opaque,
                qop: oldParams.qop
            };
        },
        oAuth1: function (oldParams) {
            return {
                consumerKey: oldParams.consumerKey,
                consumerSecret: oldParams.consumerSecret,
                token: oldParams.token,
                tokenSecret: oldParams.tokenSecret,
                signatureMethod: oldParams.signatureMethod,
                timeStamp: oldParams.timestamp,
                nonce: oldParams.nonce,
                version: oldParams.version,
                realm: oldParams.realm,
                addParamsToHeader: oldParams.header,
                autoAddParam: oldParams.auto,
                addEmptyParamsToSign: oldParams.includeEmpty
            };
        },
        hawkAuth: function (oldParams) {
            return {
                authId: oldParams.hawk_id,
                authKey: oldParams.hawk_key,
                algorithm: oldParams.algorithm,
                user: oldParams.user,
                saveHelperData: oldParams.saveToRequest,
                nonce: oldParams.nonce,
                extraData: oldParams.ext,
                appId: oldParams.app,
                delegation: oldParams.dlg,
                timestamp: oldParams.timestamp
            };
        },
        oAuth2: function (oldParams) {
            return {
                authUrl: oldParams.authorization_url,
                accessTokenUrl: oldParams.access_token_url,
                clientId: oldParams.client_id,
                clientSecret: oldParams.client_secret,
                scope: oldParams.scope,
                requestAccessTokenLocally: oldParams.local_access_token
            };
        },
        // Only exists for consistency
        awsSigV4: function (oldParams) {
            return oldParams;
        }
    },
    authMappersFromCurrent: {
        normal: function () {
            return {}
        },
        basicAuth: function (newParams) {
            return {
                id: 'basic',
                username: newParams.username,
                password: newParams.password,
                saveToRequest: newParams.saveHelperData
            }
        },
        digestAuth: function (newParams) {
            return {
                id: 'digest',
                algorithm: newParams.algorithm,
                username: newParams.username,
                realm: newParams.realm,
                password: newParams.password,
                nonce: newParams.nonce,
                nonceCount: newParams.nonceCount,
                clientNonce: newParams.clientNonce,
                opaque: newParams.opaque,
                qop: newParams.qop
            }
        },
        oAuth1: function (newParams) {
            return {
                id: 'oAuth1',
                consumerKey: newParams.consumerKey,
                consumerSecret: newParams.consumerSecret,
                token: newParams.token,
                tokenSecret: newParams.tokenSecret,
                signatureMethod: newParams.signatureMethod,
                timestamp: newParams.timeStamp,
                nonce: newParams.nonce,
                version: newParams.version,
                realm: newParams.realm,
                header: newParams.addParamsToHeader,
                auto: newParams.autoAddParam,
                includeEmpty: newParams.addEmptyParamsToSign
            }
        },
        hawkAuth: function (newParams) {
            return {
                id: 'hawk',
                hawk_id: newParams.authId,
                hawk_key: newParams.authKey,
                algorithm: newParams.algorithm,
                user: newParams.user,
                saveToRequest: newParams.saveHelperData,
                nonce: newParams.nonce,
                ext: newParams.extraData,
                app: newParams.appId,
                dlg: newParams.delegation,
                timestamp: newParams.timestamp
            }
        },
        oAuth2: function (newParams) {
            return {
                name: newParams.name,
                authorization_url: newParams.authUrl,
                access_token_url: newParams.accessTokenUrl,
                client_id: newParams.clientId,
                client_secret: newParams.clientSecret,
                scope: newParams.scope,
                local_access_token: newParams.requestAccessTokenLocally
            }
        },
        // Only exists for consistency
        awsSigV4: function (newParams) {
            return newParams;
        }
    }
    /* jshint ignore:end */
    // jscs:enable
};

module.exports = util;
