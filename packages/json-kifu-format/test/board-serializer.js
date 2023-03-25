// eslint-disable-next-line no-undef
module.exports = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serialize(val, config, indentation, depth, refs, printer) {
        return JSON.stringify(val);
    },
    test(val) {
        return val && Object.prototype.hasOwnProperty.call(val, "moves");
    },
};
