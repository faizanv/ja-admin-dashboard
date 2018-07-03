var gulp = require('gulp');
// Requires the gulp-sass plugin
var sass = require('gulp-sass');

gulp.task('sass', function(){
  return gulp.src('css/custom/*.scss')
    .pipe(sass()) // Converts Sass to CSS with gulp-sass
    .pipe(gulp.dest('css/custom/generated'));
});

gulp.task('default', ['sass']);

gulp.watch('css/custom/*.scss', ['sass']);