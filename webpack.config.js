var path = require("path");
var webpack = require("webpack");
var CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
	entry: {
		app: "./src/javascript/app"
	},
	output: {
	},
	module: {
		loaders: [
		]
	},
	resolve: {
		alias: {

			// ensure loader extensions match
    		extensions: ['','.ts','.js','.json','.css','.html','.jade']
		}
	},
	plugins: [
		new CopyWebpackPlugin([

            // Copy directory contents to {output}/to/directory/
            { from: './src/javascript/vendor', to: './vendor' }

        ], {
            ignore: [
                // Doesn't copy any files with a txt extension
                '*.txt'
            ],

            // By default, we only copy modified files during
            // a watch or webpack-dev-server build. Setting this
            // to `true` copies all files.
            copyUnmodified: true
        })
	]
};
