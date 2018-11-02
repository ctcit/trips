const buster = require("@4awpawz/buster");

const paramsConfig = {
    command: "bust",
    options: {
        manifest: true
    },
    directives: [
        "./index.html:2:stage",
        "api/*.*:2:stage",
        "app/**/*.html:3:stage",
        "app/**/*.js:3:stage",
        "app/assets/*.*:1:stage",
        "app/styles/*.*:3:stage",
        "third-party/**/*.*:3:stage",
    ]
}

buster(paramsConfig);