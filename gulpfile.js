// Require our dependencies
const beeper = require('beeper');
const browserSync = require('browser-sync');
const cssnano = require('gulp-cssnano');
const compile = require('gulp-compile-handlebars');
const del = require('del');
const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const image = require('gulp-image');
const log = require('fancy-log');
const mqpacker = require('css-mqpacker');
const newer = require('gulp-newer');
const nodemon = require('gulp-nodemon');
const notify = require('gulp-notify');
const path = require('path');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const postcssPresetEnv = require('postcss-preset-env');
const reload = browserSync.reload;
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const stream = browserSync.stream;
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

// Set assets paths.
const sitename = 'nova';
let outputBase = 'public';
let processEnv = 'development';

const inputPaths = {
  fonts: './src/fonts/**',
  images: './src/images/**',
  markup: './src/html/**',
  views: './src/html/views/*.hbs',
  sass: './src/scss/**/*.scss',
  scripts: './src/javascript/app.js'
};

let outputPaths = {
  markup: `./${outputBase}`,
  fonts: `./${outputBase}/assets/${sitename}/fonts`,
  images: `./${outputBase}/assets/${sitename}/images`,
  css: `./${outputBase}/assets/${sitename}/stylesheets`,
  scripts: `./${outputBase}/assets/${sitename}/javascript`
};

// Set production output variables
gulp.task('set-production', callback => {
  outputBase = 'dist';
  processEnv = 'production';

  outputPaths = {
    markup: `./${outputBase}`,
    fonts: `./${outputBase}/assets/${sitename}/fonts`,
    images: `./${outputBase}/assets/${sitename}/images`,
    css: `./${outputBase}/assets/${sitename}/stylesheets`,
    scripts: `./${outputBase}/assets/${sitename}/javascript`
  };
  callback();
});

/**
 * Delete style.css and style.min.css before we minify and optimize
 */
gulp.task('clean:styles', () =>
  del([outputPaths.css + '/style.css', outputPaths.css + '/style.min.css'])
);

/**
 * Delete bundle.js before we minify and optimize
 */
gulp.task('clean:scripts', () => del([outputPaths.scripts + '/bundle.js']));

/**
 * Delete all markup files created by the build-html task
 */
gulp.task('clean:markup', () =>
  del([
    outputPaths.markup + '/**/*',
    '!./' + outputPaths.markup + '/assets',
    '!./' + outputPaths.markup + '/assets/**/*'
  ])
);

/**
 * Delete all font files created by the build-fonts task
 */
gulp.task('clean:fonts', () => del([outputPaths.fonts + '/**/*']));

/**
 * Delete all image files created by the build-images task
 */
gulp.task('clean:images', () => del([outputPaths.images + '/**/*']));

/**
 * Delete the public site - full cleanse
 */
gulp.task('clean-all', () => del([outputPaths.markup + '/**/*']));

/**
 * Handle errors and alert the user.
 */
function handleErrors() {
  const args = Array.prototype.slice.call(arguments);

  notify
    .onError({
      title: 'Task Failed [<%= error.message %>',
      message: 'See console.',
      sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
    })
    .apply(this, args);

  beeper(); // Beep 'sosumi' again

  // Prevent the 'watch' task from stopping
  this.emit('send');
}

// define the default task and add the watch task to it
gulp.task('default', ['watch']);

// publish fonts
gulp.task('build-fonts', () =>
  gulp
    .src(inputPaths.fonts)
    .pipe(newer(outputPaths.fonts))
    .pipe(gulp.dest(outputPaths.fonts))
);

/**
 * Optimize images for Web use.
 *
 * https://www.npmjs.com/package/gulp-image
 */
gulp.task('build-images', () =>
  gulp
    .src(inputPaths.images)
    .pipe(newer(outputPaths.images))
    .pipe(
      image({
        pngquant: true,
        optipng: false,
        zopflipng: true,
        advpng: true,
        jpegRecompress: false,
        jpegoptim: true,
        mozjpeg: true,
        gifsicle: true,
        svgo: true
      })
    )
    .pipe(gulp.dest(outputPaths.images))
    .pipe(stream())
);

// publish html
gulp.task('build-html', callback => {
  gulp
    .src(inputPaths.markup)
    .pipe(newer(outputPaths.markup))
    .pipe(gulp.dest(outputPaths.markup))
    .pipe(stream());
  callback();
});

/**
 * Compile Sass and run stylesheet through PostCSS.
 *
 * https://www.npmjs.com/package/gulp-sass
 * https://www.npmjs.com/package/gulp-postcss
 * https://www.npmjs.com/package/gulp-autoprefixer
 * https://www.npmjs.com/package/css-mqpacker
 */
gulp.task('postcss', () =>
  gulp
    .src(inputPaths.sass)
    .pipe(newer(outputPaths.css))
    // Deal with errors.
    .pipe(plumber({ errorHandler: handleErrors }))

    // Wrap tasks in a sourcemap.
    .pipe(sourcemaps.init())

    // Compile Sass using LibSass.
    .pipe(
      sass({
        includePaths: [],
        errLogToConsole: true,
        outputStyle: 'expanded' // Options: nested, expanded, compact, compressed
      })
    )

    // Parse with PostCSS plugins.
    .pipe(
      postcss([
        postcssPresetEnv(),
        mqpacker({
          sort: true
        })
      ])
    )

    // Create sourcemap.
    .pipe(sourcemaps.write())

    // Create styles.css.
    .pipe(gulp.dest(outputPaths.css))
    .pipe(stream())
);

/**
 * Minify and optimize style.css.
 *
 * https://www.npmjs.com/package/gulp-cssnano
 */
gulp.task('build-css', ['postcss'], () =>
  gulp
    .src(`${outputPaths.css}styles.css`)
    .pipe(newer(outputPaths.css))
    .pipe(plumber({ errorHandler: handleErrors }))
    .pipe(
      cssnano({
        safe: true // Use safe optimizations
      })
    )
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest(outputPaths.css))
    .pipe(stream())
);

/**
 * Compile and bundle JavaScript
 *
 * https://www.npmjs.com/package/webpack
 */
gulp.task('build-js', callback => {
  // modify some webpack config options
  const myConfig = Object.create(webpackConfig);
  myConfig.output = {
    path: path.resolve(outputPaths.scripts),
    filename: 'bundle.js',
    publicPath: outputBase
  };
  myConfig.mode = processEnv;
  myConfig.entry = {
    app: './src/javascript/app.js'
  };
  myConfig.plugins = myConfig.plugins.concat(
    new webpack.DefinePlugin({
      'process.env': {
        // This has effect on the react lib size
        NODE_ENV: JSON.stringify(processEnv)
      }
    })
  );

  // run webpack
  webpack(myConfig, (err, stats) => {
    if (err)
      log(
        '[webpack:build]',
        stats.toString({
          colors: true
        })
      );
    callback();
  });
});

/**
 * Process tasks and reload browsers on file changes.
 *
 * https://www.npmjs.com/package/browser-sync
 */
gulp.task('watch', ['server'], () => {
  // Kick off BrowserSync.
  browserSync({
    open: false, // Open project in a new tab?
    injectChanges: true, // Auto inject changes instead of full reload
    proxy: 'localhost:3030', // Use http://_s.com:3000 to use BrowserSync
    watchOptions: {
      debounceDelay: 1500 // Wait 1.5 seconds before injecting
    }
  });

  // Run tasks when files change.
  gulp.watch(inputPaths.fonts, ['fonts']);
  gulp.watch(inputPaths.sass, ['styles']);
  gulp.watch(inputPaths.scripts, ['scripts']);
  gulp.watch(inputPaths.images, ['images']);
  gulp.watch(inputPaths.markup, ['markup']);
});

/**
 * Starts up an express server with nodemon.
 *
 * https://www.npmjs.com/package/express
 * https://www.npmjs.com/package/gulp-nodemon
 *
 */
gulp.task('start-server', cb => {
  let called = false;
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
    .on('start', () => {
      if (!called) {
        called = true;
        cb();
      }
    })
    .on('restart', () => {
      setTimeout(() => {
        reload({ stream: false });
      }, 1000);
    });
});

// Publish the markup for compilation.
// Then set the assets to deploy to production.
gulp.task('publish-static', () =>
  gulp
    .src('./src/html/pages/**/*.hbs')
    .pipe(newer(outputPaths.markup))
    .pipe(
      compile(
        {},
        {
          ignorePartials: true,
          batch: ['./src/html/partials']
        }
      )
    )
    .pipe(
      rename({
        extname: '.html'
      })
    )
    .pipe(gulp.dest(outputPaths.markup))
);

/**
 * Create individual tasks.
 */
gulp.task('server', ['start-server']);
gulp.task('markup', ['build-html']);
gulp.task('scripts', ['build-js']);
gulp.task('styles', ['build-css']);
gulp.task('fonts', ['build-fonts']);
gulp.task('images', ['build-images']);
gulp.task(
  'clean:ship',
  [
    'clean:fonts',
    'clean:styles',
    'clean:scripts',
    'clean:images',
    'clean:markup'
  ],
  () => {}
);
gulp.task('build-assets', ['fonts', 'styles', 'scripts', 'images'], () => {});
gulp.task(
  'build-all',
  ['fonts', 'styles', 'scripts', 'images', 'markup'],
  () => {}
);
gulp.task(
  'ship',
  gulpSequence(
    'build-html',
    'set-production',
    'clean:ship',
    'build-assets',
    'publish-static'
  )
);
