const { existsSync } = require('fs')
const { join, resolve } = require('path')

const { PNG_STATUS, validatePng } = require('./validate-png')
const { warn } = require('./logger')
const generators = require('../generators')

function die (msg) {
  warn(msg)
  warn()
  process.exit(1)
}

function profile (value) {
  if (value) {
    if (!value.endsWith('.json')) {
      die(`Specified profile (${value}) is not a .json file`)
    }

    const { appDir } = require('./app-paths')

    if (!existsSync(resolve(appDir, value))) {
      die(`Specified profile file (${value}) does not exists`)
    }
  }
}

function mode (value) {
  if (value !== 'all' && !Object.keys(require('../modes')).includes(value)) {
    die(`Invalid mode requested: "${value}"`)
  }
}

function quality (value) {
  const numeric = parseInt(value, 10)
  if (isNaN(numeric)) {
    die(`Invalid quality level number specified`)
  }
  if (numeric < 1 || numeric > 12) {
    die(`Invalid quality level specified (${value}) - should be between 1 - 12`)
  }
}

function filter (value) {
  if (value && !Object.keys(generators).includes(value)) {
    die(`Unknown filter value specified (${value}); there is no such generator`)
  }
}

function icon (value, argv) {
  if (!value) {
    warn(`No source icon file specified, so using the sample one`)

    const { samplesDefinition, getSamplePath } = require('../../samples')
    argv.icon = getSamplePath(samplesDefinition.icon.file)

    return
  }


  const { appDir } = require('./app-paths')

  argv.icon = resolve(appDir, value)

  if (!existsSync(argv.icon)) {
    die(`Path to source icon does not exists: "${value}"`)
  }

  const status = validatePng(argv.icon, [ 1240, 1240 ])

  switch (status) {
    case PNG_STATUS.FORMAT_ERROR:
      die(`Icon source is not a PNG file!`)
    case PNG_STATUS.RESOLUTION_ERROR:
      die(`Icon source file does not have the correct 1240x1240 px size`)
  }
}

function splashscreen (value, argv) {
  if (!['capacitor', 'cordova', 'all'].includes(argv.mode)) {
    return
  }

  if (!value) {
    warn(`No splashscreen source file specified, so using the sample one`)

    const { samplesDefinition, getSamplePath } = require('../../samples')
    argv.splashscreen = getSamplePath(samplesDefinition.splashscreen.file)

    return
  }

  const { appDir } = require('./app-paths')

  argv.splashscreen = resolve(appDir, value)

  if (!existsSync(argv.splashscreen)) {
    die(`Path to splashscreen source file does not exists: "${value}"`)
  }

  const status = validatePng(argv.icon, [ 2436, 2436 ])

  switch (status) {
    case PNG_STATUS.FORMAT_ERROR:
      die(`Splashscreen source is not a PNG file!`)
    case PNG_STATUS.RESOLUTION_ERROR:
      die(`Splashscreen source file does not have the correct 2436x2436 px size`)
  }
}

function type (value) {
  if (!['pure', 'bg', 'overlay'].includes(value)) {
    die(`Invalid algorithm specified: "${value}"`)
  }
}

function bgcolor (value, argv) {
  if (!['capacitor', 'cordova', 'all'].includes(argv.mode)) {
    return
  }

  let hex = value.replace(/^#/, '')

  if (
    (hex.length !== 3 && hex.length !== 6) ||
    /^[0-9A-Fa-f]+$/.test(hex) !== true
  ) {
    die(`Invalid bgcolor specified: "${value}"`)
  }
}

const parsers = {
  profile,
  mode,
  quality,
  filter,
  icon,
  splashscreen,
  type,
  bgcolor
}

module.exports = function (argv, list) {
  list.forEach(name => {
    const fn = parsers[name]
    if (fn === void 0) {
      die(`Invalid command parameter specified (${name})`)
    }

    fn(argv[name], argv)
  })
}
