const chalk = require('chalk')

module.exports = {
  blue: msg => console.log(chalk.blue(msg)),
  red: msg => console.log(chalk.red(msg)),
  green: msg => console.log(chalk.green(msg)),
}
