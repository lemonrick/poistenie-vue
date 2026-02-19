const js = require('@eslint/js')
const globals = require('globals')
const vuePlugin = require('eslint-plugin-vue')
const vueParser = require('vue-eslint-parser')
const babelParser = require('@babel/eslint-parser')

const appGlobals = {
  ga: 'readonly',
  cordova: 'readonly',
  __statics: 'readonly',
  __QUASAR_SSR__: 'readonly',
  __QUASAR_SSR_SERVER__: 'readonly',
  __QUASAR_SSR_CLIENT__: 'readonly',
  __QUASAR_SSR_PWA__: 'readonly',
  process: 'readonly',
  Capacitor: 'readonly',
  chrome: 'readonly'
}

module.exports = [
  {
    ignores: [
      'dist/**',
      '.quasar/**',
      'node_modules/**',
      'src-bex/www/**',
      'src-capacitor/**',
      'src-cordova/**',
      'babel.config.js'
    ]
  },
  js.configs.recommended,
  ...vuePlugin.configs['flat/essential'],
  {
    files: ['eslint.config.js', 'quasar.config.js', 'babel.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          configFile: false,
          babelrc: false
        },
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...appGlobals
      }
    },
    rules: {
      'prefer-promise-reject-errors': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: babelParser,
        requireConfigFile: false,
        babelOptions: {
          configFile: false,
          babelrc: false
        },
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...appGlobals
      }
    },
    rules: {
      'prefer-promise-reject-errors': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    }
  }
]
