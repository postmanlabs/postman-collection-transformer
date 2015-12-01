var rnd = Math.random,
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
    }
};

module.exports = util;
