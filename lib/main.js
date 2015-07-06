var converter = require('./converter');

module.exports = {
    convert: function (options, callback) {
        // @todo better handle and sanitise options
        converter.convert(options, callback);
    }
};
