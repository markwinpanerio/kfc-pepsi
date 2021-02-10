const { src, dest, watch, series, parallel } = require('gulp');
const compileSass = require('gulp-sass');
const minifyCss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const terser = require('gulp-terser');
const csso = require('gulp-csso');
const mode = require('gulp-mode')();
const webpack = require('webpack-stream');
const babel = require('gulp-babel');
const del = require('del');
const browserSync = require('browser-sync').create();
const ejs = require('gulp-ejs');
var log = require('fancy-log');

compileSass.compiler = require('node-sass');

const clean = () => {
  return del(['docs']);
}

const cleanImages = () => {
  return del(['docs/images']);
}

const cleanDependecies = () => {
  return del(['docs/dependencies']);
}

const copyImages = () => {
  return src('src/images/**/*.{jpg,jpeg,png,gif,svg}')
    .pipe(dest('docs/images'));
}

const copyDependencies = () => {
  return src('src/dependecies/**/*')
    .pipe(dest('docs/dependecies'));
}

const copyPages = () => {
  return src('src/pages/**/*')
    .pipe(dest('docs'));
}

const js = () => {
  return src('src/js/**/*.js')
    .pipe(babel({
      presets: ["@babel/env"]
    }))
    .pipe(dest('./docs/js'))
    .pipe(mode.development( browserSync.stream() ));
}


const css = () => {
  return src('./src/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(compileSass().on('error', compileSass.logError))
    .pipe(autoprefixer())
    .pipe(mode.production( csso() ))
    .pipe(minifyCss())
    .pipe(sourcemaps.write())
    .pipe(dest('./docs/css'))
}

const html = () => {
  return src('./src/*.ejs')
    .pipe(ejs({
      msg: 'Hello Gulp!'
    }, { ext: '.html' }))
    .pipe(dest('./docs'))
}

const watchForChanges = () => {
  browserSync.init({
    server: {
      baseDir: './docs'
    }
  });

  watch('src/sass/**/*.scss', css);
  watch('src/**/*.js', js);
  watch('src/pages/**/*', copyPages);
  watch('**/*.html').on('change', browserSync.reload);
  watch('src/images/**/*.{png,jpg,jpeg,gif,svg}', series(cleanImages, copyImages));
  watch('src/dependencies/**/*', series(cleanDependecies, copyDependencies));
}

exports.default = series(clean, parallel(css, js, copyPages, copyImages, copyDependencies), watchForChanges);
exports.build = series(clean, parallel(css, js, copyPages, copyImages, copyDependencies));