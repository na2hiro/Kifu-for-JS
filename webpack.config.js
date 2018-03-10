const path = require('path');
const glob = require('glob');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const SRC_DIR = 'src';
const DIST_DIR = 'dist';

module.exports = {
    entry: './' + SRC_DIR + '/shogi.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'shogi.js',
        path: path.resolve(__dirname, DIST_DIR)
    },
    plugins: [
        new CleanWebpackPlugin([DIST_DIR])
    ]
};
