const { blue, green, red } = require('../log')
const request = require('request-promise')
const { JSDOM } = require('jsdom')

module.exports = () => {

  blue('Fetching lines Sinoscap');
  let names = []
  request('http://www.sinoscap.com.br/php/mostra.php?op=horarios')
  .then(html => {
    const dom = new JSDOM(html)
    const doc = dom.window.document
    const body = doc.getElementById('corpo')
    const aAll = body.querySelectorAll('a')

    let res = []
    for(let i = 0; i < aAll.length; i++) {
      let name = aAll[i].innerHTML.trim()
      let url = aAll[i].getAttribute('href')
      url = url.replace('../', 'http://www.sinoscap.com.br/')
      res.push({
        url, name
      })
    }
    return res
  })
  .then(everyLine => {
    return everyLine.map(item => {
      return request({ url: item.url })
    })
  })
  .then((everyLine) => Promise.all(everyLine))
  .then(pdfs => {
    console.log(pdfs);
  })
  .catch(console.error)

}
