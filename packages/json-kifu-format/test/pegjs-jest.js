var peg = require("pegjs");
module.exports = {
    process(src, filename, config, options) {
        return {
            code: peg.generate(src, {output: "source", format: "commonjs"}),
        };
    },
};
