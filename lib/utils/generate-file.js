const { green, grey } = require('chalk')
const { ensureFileSync } = require('fs-extra')

const { log } = require('./logger')
const getFileSize = require('./get-file-size')
const generators = require('../generators')

module.exports = function generateFile (file, opts) {
  // ensure that the file (and its folder) exists
  ensureFileSync(file.absoluteName)

  // use the appropriate generator to handle the file creation
  generators[file.handler](file, opts, () => {
    const size = `(${getFileSize(file.absoluteName)})`
    const type = (file.handler + ':').padEnd(13, ' ')
    log(`Generated ${type} ${green(file.relativeName)} ${grey(size)}`)
  })
}
