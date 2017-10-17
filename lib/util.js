var _ = require('lodash'),
    url = require('./url'),
    rnd = Math.random,
    util;

util = {
    typeMap: {
        string: 'string',
        boolean: 'boolean',
        number: 'number'
    },

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
        // eslint-disable-next-line curly
        for (r = n = E; n++ < 36; r += n * 51 & 52 ? (n ^ 15 ? 8 ^ rnd() * (n ^ 20 ? 16 : 4) : 4).toString(16) : H);
        return r;
    },

    urlparse: function (u) {
        return url.parse(u);
    },

    urlunparse: function (urlObj) {
        return url.unparse(urlObj);
    },

    /**
     * A generic utility method to sanitize variable transformations across collection formats.
     *
     * @param entity {Object} - A generic object that could contain variable data.
     * @param fallback {Object} - A set of optional fallback values for variable transformations.
     * @return {Array} - The set of sanitized entity level variables.
     */
    handleVars: function (entity, fallback) {
        var self = this,
            source = entity && (entity.variables || entity.variable),
            result = _.map(source || (fallback && fallback.values), function (item) {
                var result = {
                    id: item.id,
                    key: item.key || item.id,
                    value: item.value,
                    type: item.type || self.typeMap[typeof item.value] || 'any'
                };

                item.disabled && (result.disabled = true);
                item.description && (result.description = item.description);

                return result;
            });

        if (result.length) { return result; }
    },

    /**
     * A helper function to determine if the passed auth instance is eligible for transformation.
     *
     * @param auth {Object} - The auth instance to be transformed.
     * @returns {Boolean}
     */
    isInvalidAuth: function (auth) {
        return !(auth && (auth.type !== 'noauth'));
    },

    /**
     * Transforms an array of auth params to their object equivalent.
     *
     * @param entity {Object} - The wrapper object for the array of auth params.
     * @returns {*}
     */
    authArrayToMap: function (entity) {
        var result,
            auth = entity && entity.auth;

        if (this.isInvalidAuth(auth)) { return; }

        result = { type: auth.type };
        result[auth.type] = _.transform(auth[auth.type], function (result, param) {
            result[param.key] = param.value;
        }, {});

        return result;
    },

    /**
     * Transforms an object of auth params to their array equivalent.
     *
     * @param entity {Object} - The wrapper object for the array of auth params.
     * @returns {*}
     */
    authMapToArray: function (entity) {
        var result,
            self = this,
            auth = entity && entity.auth;

        if (self.isInvalidAuth(auth)) { return; }

        result = { type: auth.type }; // @todo: Replace this with ES6 style dynamic property definition later
        // @todo: Handle all non _ prefixed properties, ala request bodies
        result[auth.type] = _.map(auth[auth.type], function (value, key) {
            return {
                key: key,
                value: value,
                type: self.typeMap[typeof value] || 'any'
            };
        });

        return result;
    },

    /**
     * Sanitizes a collection SDK compliant auth list.
     *
     * @param entity {Object} - The wrapper entity for the auth manifest.
     * @returns {Object[]} - An array of raw collection SDK compliant auth parameters.
     */
    sanitizeAuthArray: function (entity) {
        var result,
            self = this,
            auth = entity && entity.auth;

        if (self.isInvalidAuth(auth)) { return; }

        result = { type: auth.type };
        result[auth.type] = _.map(auth[auth.type], function (param) {
            return {
                key: param.key,
                value: param.value,
                type: param.type || self.typeMap[typeof param.value] || 'any'
            };
        });

        return result;
    },

    /**
     * A helper function to determine if the provided v1 entity has legacy properties.
     *
     * @private
     * @param {Object} entityV1 - The v1 entity to be checked for the presence of legacy properties.
     * @param {String} type - The type of property to be adjudged against.
     * @returns {Boolean} - A flag to indicate the legacy property status of the passed v1 entity.
     */
    notLegacy: function (entityV1, type) {
        if (!entityV1) { return; }

        switch (type) {
            case 'script':
                return !(entityV1.tests || entityV1.preRequestScript);
            case 'auth':
                return !entityV1.currentHelper || _.isEmpty(entityV1.helperAttributes);
            default:
                return true;
        }
    },

    authMappersFromLegacy: {
        basicAuth: function (oldParams) {
            return {
                username: oldParams.username,
                password: oldParams.password,
                saveHelperData: oldParams.saveToRequest,
                showPassword: false
            };
        },
        bearerAuth: function (oldParams) {
            return {
                token: oldParams.token
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
                qop: oldParams.qop,
                disableRetryRequest: oldParams.disableRetryRequest
            };
        },
        oAuth1: function (oldParams) {
            return {
                consumerKey: oldParams.consumerKey,
                consumerSecret: oldParams.consumerSecret,
                token: oldParams.token,
                tokenSecret: oldParams.tokenSecret,
                signatureMethod: oldParams.signatureMethod,
                timestamp: oldParams.timestamp,
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
        ntlmAuth: function (oldParams) {
            return {
                username: oldParams.username,
                password: oldParams.password,
                domain: oldParams.domain,
                workstation: oldParams.workstation,
                disableRetryRequest: oldParams.disableRetryRequest
            };
        },
        oAuth2: function (oldParams) {
            return {
                accessToken: oldParams.accessToken,
                addTokenTo: oldParams.addTokenTo,
                callBackUrl: oldParams.callBackUrl,
                authUrl: oldParams.authUrl,
                accessTokenUrl: oldParams.accessTokenUrl,
                clientId: oldParams.clientId,
                clientSecret: oldParams.clientSecret,
                clientAuth: oldParams.clientAuth,
                grantType: oldParams.grantType,
                scope: oldParams.scope,
                username: oldParams.username,
                password: oldParams.password,
                tokenType: oldParams.tokenType,
                redirectUri: oldParams.redirectUri,
                refreshToken: oldParams.refreshToken
            };
        },
        // Only exists for consistency
        awsSigV4: function (oldParams) {
            return oldParams;
        }
    },
    authMappersFromCurrent: {
        normal: function () {
            return {};
        },
        basicAuth: function (newParams) {
            return {
                id: 'basic',
                username: newParams.username,
                password: newParams.password,
                saveToRequest: newParams.saveHelperData
            };
        },
        bearerAuth: function (newParams) {
            return {
                id: 'bearer',
                token: newParams.token
            };
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
                qop: newParams.qop,
                disableRetryRequest: newParams.disableRetryRequest
            };
        },
        oAuth1: function (newParams) {
            return {
                id: 'oAuth1',
                consumerKey: newParams.consumerKey,
                consumerSecret: newParams.consumerSecret,
                token: newParams.token,
                tokenSecret: newParams.tokenSecret,
                signatureMethod: newParams.signatureMethod,
                timestamp: newParams.timeStamp || newParams.timestamp,
                nonce: newParams.nonce,
                version: newParams.version,
                realm: newParams.realm,
                header: newParams.addParamsToHeader,
                auto: newParams.autoAddParam,
                includeEmpty: newParams.addEmptyParamsToSign
            };
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
            };
        },
        ntlmAuth: function (newParams) {
            return {
                id: 'ntlm',
                username: newParams.username,
                password: newParams.password,
                domain: newParams.domain,
                workstation: newParams.workstation,
                disableRetryRequest: newParams.disableRetryRequest
            };
        },
        oAuth2: function (newParams) {
            return {
                id: 'oAuth2',
                accessToken: newParams.accessToken,
                addTokenTo: newParams.addTokenTo,
                callBackUrl: newParams.callBackUrl,
                authUrl: newParams.authUrl,
                accessTokenUrl: newParams.accessTokenUrl,
                clientId: newParams.clientId,
                clientSecret: newParams.clientSecret,
                clientAuth: newParams.clientAuth,
                grantType: newParams.grantType,
                scope: newParams.scope,
                username: newParams.username,
                password: newParams.password,
                tokenType: newParams.tokenType,
                redirectUri: newParams.redirectUri,
                refreshToken: newParams.refreshToken
            };
        },
        // Only exists for consistency
        awsSigV4: function (newParams) {
            return newParams;
        }
    }
};

module.exports = util;
