module.exports = {
    serialize(val, config, indentation, depth, refs, printer) {
        return JSON.stringify(val);
    },
    test(val) {
        return val && Object.prototype.hasOwnProperty.call(val, 'moves');
    }
}