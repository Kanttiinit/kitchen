module.exports = {
  "env": {
    "browser": false,
    "es6": true
  },
  "extends": "eslint:recommended",
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true
    },
    "sourceType": "module"
  },
  "plugins": [],
  "globals": {
    "process": true,
    "console": true,
    "__dirname": true,
    "module": true,
    "require": true
  },
  "rules": {
    "no-console": 0,
    "indent": [
      "error",
      2,
      { "MemberExpression": 0, "SwitchCase": 1 }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ]
  }
};
