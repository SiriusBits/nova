// Require our dependencies
const autoprefixer  = require( 'autoprefixer' );
const bourbon       = require( 'bourbon' ).includePaths;
const browserSync   = require( 'browser-sync' );
const cssnano       = require( 'gulp-cssnano' );
const compile       = require( 'gulp-compile-handlebars' );
const del           = require( 'del' );
const eslint        = require( 'gulp-eslint' );
const gulp          = require( 'gulp' );
const gutil         = require( 'gulp-util' );
const image         = require( 'gulp-image');
const mqpacker      = require( 'css-mqpacker' );
const neat          = require( 'bourbon-neat' ).includePaths;
const nodemon       = require( 'gulp-nodemon' );
const notify        = require( 'gulp-notify' );
const path          = require( 'path' );
const plumber       = require( 'gulp-plumber' );
const postcss       = require( 'gulp-postcss' );
const reload        = browserSync.reload;
const rename        = require( 'gulp-rename' );
const sass          = require( 'gulp-sass' );
const sassdoc       = require( 'sassdoc');
const sassLint      = require( 'gulp-sass-lint' );
const source        = require( 'vinyl-source-stream' );
const sourcemaps    = require( 'gulp-sourcemaps' );
const sort          = require( 'gulp-sort' );
const stream        = browserSync.stream;
const uglify        = require( 'gulp-uglify' );
const webpack       = require( 'webpack' );
const webpackConfig = require( './webpack.config.js' );


// Set assets paths.
const sitename = 'nova';

const inputPaths = {
  'fonts'   : './src/fonts/**',
  'images'  : './src/images/**',
  'markup'  : './src/html/**',
  'views'   : './src/html/views/*.hbs',
  'sass'    : './src/scss/**/*.scss',
  'scripts' : './src/javascript/app.js',
};

const outputPaths = {
  'markup'      : './public',
  'fonts'       : './public/assets/' + sitename + '/fonts',
  'images'      : './public/assets/' + sitename + '/images',
  'css'         : './public/assets/' + sitename + '/stylesheets',
  'scripts'     : './public/assets/' + sitename + '/javascript',
  'dist'        : './dist',
  'distfonts'   : './dist/assets/' + sitename + '/fonts',
  'distimg'     : './dist/assets/' + sitename + '/images',
  'distcss'     : './dist/assets/' + sitename + '/stylesheets',
  'distscripts' : './dist/assets/' + sitename + '/javascript',
};

const  sassdocOptions = {
  dest           : './public/assets/' + sitename + '/sassdoc'
  };

/**
 * Delete style.css and style.min.css before we minify and optimize
 */
gulp.task( 'clean:styles', function () {
  return del( [ outputPaths.css + '/style.css', outputPaths.css + '/style.min.css',
                outputPaths.distcss + '/style.css', outputPaths.distcss + '/style.min.css' ] );
} );

/**
 * Delete bundle.js before we minify and optimize
 */
gulp.task( 'clean:scripts', function () {
  return del( [ outputPaths.scripts + '/bundle.js',
                outputPaths.distscripts + '/bundle.js'  ] );
} );

/**
 * Delete all markup files created by the build-html task
 */
gulp.task( 'clean:markup', function () {
  return del( [ outputPaths.markup + '/**/*', '!./public/assets', '!./public/assets/**/*',
                outputPaths.distmarkup + '/**/*', '!./dist/assets', '!./dist/assets/**/*' ] );
} );

/**
 * Delete all font files created by the build-fonts task
 */
gulp.task( 'clean:fonts', function () {
  return del( [ outputPaths.fonts + '/**/*',
                outputPaths.distfonts + '/**/*' ] );
} );

/**
 * Delete all image files created by the build-images task
 */
gulp.task( 'clean:images', function () {
  return del( [ outputPaths.images + '/**/*',
                outputPaths.distimages + '/**/*' ] );
} );

/**
 * Delete the public site - full cleanse
 */
gulp.task( 'clean:all', function () {
  return del( [ outputPaths.markup + '/**/*',
                outputPaths.distmarkup + '/**/*' ] );
} )

/**
 * Handle errors and alert the user.
 */
function handleErrors () {
  var args = Array.prototype.slice.call( arguments );

  notify.onError( {
    'title': 'Task Failed [<%= error.message %>',
    'message': 'See console.',
    'sound': 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
  } ).apply( this, args );

  gutil.beep(); // Beep 'sosumi' again

  // Prevent the 'watch' task from stopping
  this.emit( 'end' );
}


// define the default task and add the watch task to it
gulp.task('default', ['watch']);

// publish fonts
gulp.task('build-fonts', [ 'clean:fonts' ], function () {
  return gulp.src(inputPaths.fonts)
    .pipe(gulp.dest(outputPaths.fonts))
    .pipe(gulp.dest(outputPaths.distfonts));
});

/**
 * Optimize images for Web use.
 *
 * https://www.npmjs.com/package/gulp-image
 */
gulp.task('build-images', [ 'clean:images' ], function () {
  return gulp.src(inputPaths.images)
    .pipe(image({
      pngquant: true,
      optipng: false,
      zopflipng: true,
      advpng: true,
      jpegRecompress: false,
      jpegoptim: true,
      mozjpeg: true,
      gifsicle: true,
      svgo: true
    }))
    .pipe(gulp.dest(outputPaths.distimg))
    .pipe(gulp.dest(outputPaths.images));
});

// publish html
gulp.task('build-html', [ 'clean:markup' ], function () {
  return gulp.src(inputPaths.markup)
    .pipe(gulp.dest(outputPaths.markup))
    .pipe(browserSync.stream());
});

/**
 * Compile Sass and run stylesheet through PostCSS.
 *
 * https://www.npmjs.com/package/gulp-sass
 * https://www.npmjs.com/package/gulp-postcss
 * https://www.npmjs.com/package/gulp-autoprefixer
 * https://www.npmjs.com/package/css-mqpacker
 */
gulp.task( 'postcss', [ 'clean:styles' ], function () {
  return gulp.src( inputPaths.sass )

  // Deal with errors.
  .pipe( plumber( {'errorHandler': handleErrors} ) )

  // Wrap tasks in a sourcemap.
  .pipe( sourcemaps.init() )

    // Compile Sass using LibSass.
    .pipe( sass( {
      'includePaths': [].concat( bourbon, neat ),
      'errLogToConsole': true,
      'outputStyle': 'expanded' // Options: nested, expanded, compact, compressed
    } ) )

    // Parse with PostCSS plugins.
    .pipe( postcss( [
      autoprefixer( {
        'browsers': [ 'last 2 version' ]
      } ),
      mqpacker( {
        'sort': true
      } )
    ] ) )

  // Create sourcemap.
  .pipe( sourcemaps.write() )

  // Create styles.css.
  .pipe( gulp.dest( outputPaths.distcss) )
  .pipe( gulp.dest( outputPaths.css) )
  .pipe( browserSync.stream() );
} );

/**
 * Minify and optimize style.css.
 *
 * https://www.npmjs.com/package/gulp-cssnano
 */
gulp.task( 'build-css', [ 'postcss' ], function () {
  return gulp.src( outputPaths.css + 'styles.css' )
  .pipe( plumber( {'errorHandler': handleErrors} ) )
  .pipe( cssnano( {
    'safe': true // Use safe optimizations
  } ) )
  .pipe( rename( 'style.min.css' ) )
  .pipe( gulp.dest( outputPaths.distcss ) )
  .pipe( gulp.dest( outputPaths.css ) )
  .pipe( browserSync.stream() );
} );

/**
 * Sass Documenting.
 *
 * https://www.npmjs.com/package/gulp-sassdoc
 */
gulp.task('sassdoc', function () {
  return gulp
    .src(inputCss)
    .pipe(sassdoc(sassdocOptions))
    .resume();
});

/**
 * Sass linting.
 *
 * https://www.npmjs.com/package/sass-lint
 */
gulp.task( 'sass:lint', function () {
  return gulp.src( [
    inputCss,
    '!src/scss/bootstrap/**',
    '!src/scss/_bootstrap*.scss',
    '!node_modules/**'
  ] )
  .pipe( sassLint() )
  .pipe( sassLint.format() )
  .pipe( sassLint.failOnError() );
} );

/**
 * Compile and bundle JavaScript
 *
 * https://www.npmjs.com/package/webpack
 */
gulp.task('build-js', [ 'clean:scripts' ], function(callback) {
  // modify some webpack config options
  var myConfig = Object.create(webpackConfig);
  myConfig.output = {
      path: path.resolve(outputPaths.scripts),
      filename: "bundle.js",
      publicPath: "public"
  };
  myConfig.plugins = myConfig.plugins.concat(
    new webpack.DefinePlugin({
      "process.env": {
        // This has effect on the react lib size
        "NODE_ENV": JSON.stringify("production")
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  );

  // run webpack
  webpack(myConfig, function(err, stats) {
    if(err) throw new gutil.PluginError("webpack:build", err);
    gutil.log("[webpack:build]", stats.toString({
      colors: true
    }));
    callback();
  });
});

/**
 * Compile and bundle JavaScript
 *
 * https://www.npmjs.com/package/webpack
 */
gulp.task('build-distjs', [ 'clean:scripts' ], function(callback) {
  // modify some webpack config options
  var myConfig = Object.create(webpackConfig);
  myConfig.output = {
      path: path.resolve(outputPaths.distscripts),
      filename: "bundle.js",
      publicPath: "dist"
  };
  myConfig.plugins = myConfig.plugins.concat(
    new webpack.DefinePlugin({
      "process.env": {
        // This has effect on the react lib size
        "NODE_ENV": JSON.stringify("production")
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  );

  // run webpack
  return webpack(myConfig, function(err, stats) {
    if(err) throw new gutil.PluginError("webpack:build", err);
    gutil.log("[webpack:build]", stats.toString({
      colors: true
    }));
  });
});

/**
 * Javascript linting.
 *
 * https://www.npmjs.com/package/gulp-eslint
 */
gulp.task( 'js:lint', function () {
  return gulp.src( [
    inputJs,
    '!src/javascript/bootstrap*.js',
    '!src/javascript/bootstrap/*.js',
    '!src/javascript/vendor/*.js',
    '!gulpfile.js',
    '!node_modules/**'
  ] )
  .pipe( eslint() )
  .pipe( eslint.format() )
  .pipe( eslint.failAfterError() );
} );


/**
 * Process tasks and reload browsers on file changes.
 *
 * https://www.npmjs.com/package/browser-sync
 */
gulp.task( 'watch', ['server'], function () {
  // Kick off BrowserSync.
  browserSync( {
    'open': false,             // Open project in a new tab?
    'injectChanges': true,     // Auto inject changes instead of full reload
    'proxy': 'localhost:3030',    // Use http://_s.com:3000 to use BrowserSync
    'watchOptions': {
      'debounceDelay': 1500  // Wait 1 second before injecting
    }
  } );

  // Run tasks when files change.
  gulp.watch( inputPaths.fonts, [ 'fonts' ] );
  gulp.watch( inputPaths.sass, [ 'styles' ] );
  gulp.watch( inputPaths.scripts, [ 'scripts' ] );
  gulp.watch( inputPaths.images, [ 'images' ] );
  gulp.watch( inputPaths.markup, [ 'markup' ] );
} );

/**
 * Starts up an express server with nodemon.
 *
 * https://www.npmjs.com/package/express
 * https://www.npmjs.com/package/gulp-nodemon
 * 
 */
gulp.task('start-server', function (cb) {
  var called = false;
  return nodemon({
    script: 'bin/www',
    ignore: [
      'gulpfile.js',
      'webpack.config.js',
      'src/',
      'dist/',
      'node_modules/'
    ]
  })
  .on('start', function () {
    if (!called) {
      called = true;
      cb();
    }
  })
  .on('restart', function () {
    setTimeout(function () {
      reload({ stream: false });
    }, 1000);
  });
});

gulp.task('publish-static', ['build:all', 'build-distjs'], function () {
  return gulp.src('./src/html/pages/**/*.hbs')
    .pipe(compile({}, {
      ignorePartials: true,
      batch: ['./src/html/partials']
    }))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest(outputPaths.dist));
});

/**
 * Create individual tasks.
 */
gulp.task( 'server', [ 'start-server' ] );
gulp.task( 'markup', [ 'build-html' ] );
gulp.task( 'scripts', [ 'build-js' ] );
gulp.task( 'styles', [ 'build-css' ] );
gulp.task( 'fonts', [ 'build-fonts' ] );
gulp.task( 'images', [ 'build-images' ] );
gulp.task( 'lint', [ 'sass:lint', 'js:lint' ] );
gulp.task( 'build:all', [ 'fonts', 'styles', 'scripts', 'images', 'markup'], function () { return; });
gulp.task( 'ship', [ 'publish-static' ] );

