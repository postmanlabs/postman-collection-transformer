var fs = require('fs'),
    stripJSONComments = require('strip-json-comments'),

    util; // exports

util = {
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
