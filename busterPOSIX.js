const buster = require("@4awpawz/buster");

const paramsConfig = {
    command: "bust",
    options: {
        manifest: true
    },
    directives: [
        "./index.html:2:stage",
        "api/*.*:2:stage/api",
        "app/**/*.html:3:stage/app",
        "app/**/*.js:3:stage/app",
        "app/assets/*.*:1:stage/app/assets",
        "app/styles/*.*:3:stage/styles",
        "third-party/**/*.*:3:stage/third-party",
    ]
}

buster(paramsConfig);