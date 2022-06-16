var peg = require("pegjs");
module.exports = {
    process(src, filename, config, options) {
        return peg.generate(src, {output: "source", format: "commonjs"});
    },
};
