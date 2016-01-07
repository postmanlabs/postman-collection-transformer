var rnd = Math.random,
    _ = require('lodash'),
    log = require('intel'),
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
        var urlObj = {
            raw: url
        };

        // extract the protocol
        urlObj.protocol = url.match(/^([^:]+):\/\/([^\?#\/:]+|$)/);
        urlObj.protocol = _.get(urlObj, 'protocol[1]');
        // remove that damn protocol from url
        _.isString(urlObj.protocol) && (url = url.substr(urlObj.protocol.length + 3));

        // extract authentication information
        urlObj.auth = url.match(/^(([^:]+):?([^@]*))@([^\?#\/:]+|$)/);
        // remove the auth part from url
        _.isString(_.get(urlObj, 'auth[1]')) && (url = url.substr(_.get(urlObj, 'auth[1]').length + 1));
        urlObj.auth = {
            user: _.get(urlObj, 'auth[2]'),
            password: _.get(urlObj, 'auth[3]')
        };

        // extract the host
        urlObj.host = url.match(/^([^\?#\/:]+)/);
        urlObj.host = _.get(urlObj.host, '[1]');
        _.isString(urlObj.host) && ((url = url.substr(urlObj.host.length)), (urlObj.host = _.trim(urlObj.host, '.').split('.')));

        // get the port
        urlObj.port = url.match(/^:(\d+|{{.+}})(\/|\?|^)/);
        urlObj.port = _.get(urlObj.port, '[1]');
        _.isString(urlObj.port) && (url = url.substr(urlObj.port.length + 1));

        // extract the path
        urlObj.path = url.match(/^([^\?#]+)[\?#]?$/);
        console.log(urlObj.path);
        urlObj.path = _.get(urlObj.path, '[1]');

        urlObj.query = url.match(/^\?([^#$]+)/);
        urlObj.query = _.get(urlObj.query, '[1]');
        if (_.isString(urlObj.query)) {
            url = url.substr(urlObj.query.length + 1);
            urlObj.query = urlObj.query.split('&').map(function (q) {
                q = q.split('=');
                return {
                    key: q[0] || '',
                    value: q[1] || ''
                }
            });
        }

        urlObj.hash = url.match(/#(.+)$/);
        urlObj.hash = _.get(urlObj.hash, '[1]');

        return urlObj;
    }
};

module.exports = util;
