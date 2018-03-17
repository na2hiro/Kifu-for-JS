const path = require('path');
const glob = require('glob');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const DIST_DIR = path.resolve(__dirname, './dist');

module.exports = {
    entry: {
        filename: path.resolve(__dirname, './src/shogi.ts')
    },
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
        libraryTarget: "commonjs2",
        filename: 'shogi.js',
        path: DIST_DIR
    },
    plugins: [
        new CleanWebpackPlugin([DIST_DIR])
    ]
};
