var fs = require('fs'),
    nodeUtil = require('util'),
    _ = require('lodash'),
    stripJSONComments = require('strip-json-comments'),

    E = '',
    H = '-',
    rnd = Math.random,

    util; // exports

util = {
    /**
     * Deep clone an object.
     *
     * @param {object} obj
     * @returns {object}
     */
    clone: function (obj) {
        return _.cloneDeep(obj);
    },

    /**
     * Performs shallow copy of one object into another.
     *
     * @param {object} recipient
     * @param {object} donor
     * @returns {object} - returns the seeded recipient parameter
     */
    extend: function (recipient, donor) {
        for (var prop in donor) {
            donor.hasOwnProperty(prop) && (recipient[prop] = donor[prop]);
        }
        return recipient;
    },

    /**
     * Shallow copies all non-existing properties from donor to recipient
     *
     * @param {object} recipient
     * @param {object} donor
     * @returns {object} - returns the seeded recipient parameter
     */
    fill: function (recipient, donor) {
        for (var prop in donor) {
            !recipient.hasOwnProperty(prop) && (recipient[prop] = donor[prop]);
        }
        return recipient;
    },

    /**
     * Useful function to iterate on array or object with almost same API.
     *
     * @param {object|array} obj
     * @param {function} iter
     * @param {object|function} [scope]
     * @returns {object|array} - the original object passed is returned for chaining.
     */
    each: function (obj, iter, scope) {
        var i,
            ii;

        !scope && (scope === obj);

        // proceed only when object passed is truly an object (array too is an object, in case it wasn't clear.)
        if (typeof obj !== 'object') {
            return obj;
        }

        if (_.isArray(obj) || _.isArguments(obj)) {
            for (i = 0, ii = obj.length; i < ii; i++) {
                if (iter.call(scope, obj[i], i, obj) === false) {
                    return obj;
                }
            }
        }
        else {
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (iter.call(scope, obj[i], i, obj) === false) {
                        return obj;
                    }
                }
            }
        }
        return obj;
    },

    /**
     * Returns unique GUID on every call as per pseudo-number RFC4122 standards.
     *
     * @type {function}
     * @returns {string}
     */
    uid: function () {
        var n, r; // r = result , n = numeric variable for positional checks

        // if "n" is not 9 or 14 or 19 or 24 return a random number or 4
        // if "n" is not 15 generate a random number from 0 to 15
        // `(n ^ 20 ? 16 : 4)` := unless "n" is 20, in which case a random number from 8 to 11 otherwise 4
        //
        // in other cases (if "n" is 9,14,19,24) insert "-"
        /* jshint noempty: false */// jscs:disable
        for (r = n = E; n++ < 36; r += n * 51 & 52 ? (n ^ 15 ? 8 ^ rnd() * (n ^ 20 ? 16 : 4) : 4).toString(16) : H) { }
        // jscs:enable
        return r;
    },

    /**
     * Forwards the functionality of Node's util.format
     */
    format: function () {
        return nodeUtil.format.apply(nodeUtil, arguments);
    },

    /**
     * Loads a JSON in a safe and compatible way from a file
     *
     * @param  {string} path
     * @param  {function} callback
     */
    loadJSON: function (path, callback) {
        fs.readFile(path, function (error, data) {
            if (error) {
                return callback(error);
            }

            // put the entire JSON parsing within a try-block to ensure parsing
            // errors can be forwarded to the callback.
            try {
                data = JSON.parse(stripJSONComments(data));
            }
            catch (err) {
                return callback(err);
            }

            callback(null, data);
        });
    }
};

module.exports = util;
