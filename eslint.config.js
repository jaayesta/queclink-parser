'use strict'

const neostandard = require('neostandard')
const prettier = require('eslint-config-prettier')

module.exports = [
  { ignores: ['coverage/**', '.nyc_output/**', 'example.js'] },
  ...neostandard({ noStyle: true, env: ['mocha'] }),
  prettier,
  {
    rules: {
      'no-console': ['error']
    }
  }
]
