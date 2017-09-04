const { blue, green, red } = require('../log')
const request = require('request-promise')
const { JSDOM } = require('jsdom')

const _parseLines = (links) => {
  let res = []
  for(let i = 0; i < links.length; i++) {
    const item = links[i]
    res.push({
      name: item.getAttribute('title'),
      url: item.getAttribute('href')
    })
  }
  console.log(res);
  return res
}

const _parseTable = (table) => {
  const head = table.querySelectorAll('tr')[0].querySelector('td')[0].innerHtml
  return head
}

module.exports = () => {

  blue('Fetching lines Feitoria');
  let names = []
  request('http://www.feitoriatem.com.br/')
  .then(html => {
    const dom = new JSDOM(html)
    const doc = dom.window.document
    const body = doc.getElementById('content')
    const aAll = body.querySelectorAll('.vcex-blog-entry-media a')
    return _parseLines(aAll)
  })
  .then(everyLine => {
    return everyLine.map(item => {
      return request({ url: item.url })
    })
  })
  .then((everyLine) => Promise.all(everyLine))
  .then(everyLine => {
    return everyLine.map(item => {
      const dom = new JSDOM(item)
      const context = dom.window.document.getElementById('content').querySelector('table.table')
      return _parseTable(context)
    })
  })
  .then(console.log)
  .catch(console.error)

}
