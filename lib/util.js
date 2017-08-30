var url = require('./url'),
    rnd = Math.random,
    util;

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
        oAuth2: function (newParams) {
            return {
                name: newParams.name,
                authorization_url: newParams.authUrl,
                access_token_url: newParams.accessTokenUrl,
                client_id: newParams.clientId,
                client_secret: newParams.clientSecret,
                scope: newParams.scope,
                local_access_token: newParams.requestAccessTokenLocally
            };
        },
        // Only exists for consistency
        awsSigV4: function (newParams) {
            return newParams;
        }
    }
};

module.exports = util;
