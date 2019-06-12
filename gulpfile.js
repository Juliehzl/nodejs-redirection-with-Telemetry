const gulp = require("gulp");
const tsc = require("gulp-typescript");

// compile mocked vscode module
gulp.task("mockVSCode", () => {
    return gulp.src("src/vscode.ts")
    .pipe(tsc())
    .pipe(gulp.dest("node_modules"));
});
