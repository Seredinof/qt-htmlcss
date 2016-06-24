var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    fs = require("fs"),
    path = require('path'),
    url = require('gulp-css-url-adjuster'),
    autoprefixer = require('autoprefixer'),
    postcss = require('gulp-postcss'),
    sass = require('gulp-sass'),
    jade = require('gulp-jade'),
    cssBase64 = require('gulp-css-base64');

var nameProject = 'main',
    dirBundles = fs.readdirSync(nameProject+'.bundles/'),
    fileBundles = [];

dirBundles.map(function(item){
    var dirName = nameProject + '.bundles/' + item;
    if(dirName.indexOf('.html') !== -1){
        fileBundles.push(dirName);
    }
});

var params={
        out: nameProject + '.bundles',
        htmlSrc: fileBundles,
        levels: ['common.blocks', nameProject + '.blocks']
    },
    getFileNames = require('html2bl').getFileNamesOfArray(params);

gulp.task('default', ['server', 'build']);

gulp.task('server', function(){
    browserSync.init({
        server: './'
    });

    gulp.watch([nameProject+'.bundles/*.jade'], ['html']);

    gulp.watch(params.levels.map(function(level){
        var cssGlob = level + '/**/*.scss';
        return cssGlob;
    }), ['css']);

    gulp.watch(params.levels.map(function(level){
        var jsGlob = level + '/**/*.js';
        return jsGlob;
    }), ['js']);
});

gulp.task('build', ['html', 'css', 'images', 'js']);

gulp.task('html', ['jade'], function(){
    gulp.src(params.htmlSrc)
        .pipe(reload({stream:true}));
});

gulp.task('css', function(){
    getFileNames.then(function(files){
        gulp.src(files.css)
            .pipe(concat('styles.scss'))
            .pipe(sass().on('error', sass.logError))
            .pipe(postcss([autoprefixer]))
            .pipe(url({prepend:'../images/'}))
            .pipe(gulp.dest(params.out+'/css'))
            .pipe(reload({stream:true}));
    }).done()
});

gulp.task('images', function(){
    getFileNames.then(function(sourse){
        gulp.src(sourse.dirs.map(function(dir){
                var imgGlob=dir + '/*.{jpg,png,svg,gif}';
                return imgGlob;
            }))
            .pipe(gulp.dest(path.join(params.out, 'images')));

    }).done()
});

gulp.task('js', function() {
    getFileNames.then(function(src) {
        return src.dirs.map(function(dirName) {
            var jsGlob = path.resolve(dirName) + '/*.js';
            return jsGlob;
        });
    }).then(function(jsGlobs) {
        gulp.src(jsGlobs)
            .pipe(concat('app.js'))
            .pipe(gulp.dest(params.out+'/js'))
            .pipe(reload({stream:true}));
    }) .done();
});

gulp.task('jade', function(){
    return gulp.src([params.out + '/*.jade', '!' + params.out + '/_*.jade'])
        .pipe(jade({
            pretty: true
        }))
        .on('error', console.log)
        .pipe(gulp.dest(params.out));
});

gulp.task('fonts', function () {
    return gulp.src(['main.blocks/fonts/fonts-woff.css', 'main.blocks/fonts/fonts-woff2.css'])
        .pipe(cssBase64({
            maxWeightResource: 62768
        }))
        .pipe(gulp.dest('main.bundles/css/'));
});


