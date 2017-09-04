const assert = require('assert')
const request = require('request-promise')
const Crawler = require('crawler')
const fs = require('fs')
const { blue, green, red } = require('../log')
const { JSDOM } = require('jsdom')

const _parseOptions = (opts) => {
    let lines = []
    for(let i = 0; i < opts.length; i++) {
      const url = opts[i].getAttribute('value').trim()
      const line = opts[i].innerHTML
      if(url && url.length > 0) {
        lines.push({
          name: line, url
        })
      }
    }
    return lines
}
const _parseLinesData = html => {
  const dom = new JSDOM(html)
  const doc = dom.window.document
  const $ = doc.querySelectorAll;
  const context = doc.querySelector('.linha')
  const days = doc.querySelectorAll('h1.dia')

  let result = []
  let last = -1;
  for(let i = 0; i < days.length; i++) {
    result.push({
      group: days[i].innerHTML,
      fromTo: [],
      toFrom: []
    })
    const $lists = doc.querySelectorAll('.novo-lista')
    // obtem a lista proxima
    const toUse = []
    last++
    toUse.push($lists[last])
    last++
    toUse.push($lists[last])
    // adiciona a lista no resultado
    toUse.forEach((used, headIndex) => {
      const query = used.querySelectorAll('li')
      query.forEach((li, index) => {
        if((index+1) % 3 === 0) {
          const ob = {
            hour: query[index-2].innerHTML,
            name: query[index-1].innerHTML.trim(),
            special: li.innerHTML.trim().indexOf('especial') >= 0,
          }
          if (ob.hour.indexOf('<strong') >= 0) {
            return;
          }
          if(headIndex == 0) {
            result[i].fromTo.push(ob)
          } else {
            result[i].toFrom.push(ob)
          }
        }
      })
    })
  }
  return result
}

const fetchLines = (opts = {}) => {

  blue('Fetching lines of Leopoldense');

  let names = []
  request('http://www.leopoldense.com.br')
  .then(res => {
    const dom = new JSDOM(res)
    const doc = dom.window.document
    let element = doc.getElementById('linha')
    let options = element.querySelectorAll('option')
    const lines = _parseOptions(options)
    names = lines
    return lines
  })
  .then(lines => {
    console.log(lines);
    const reqs = lines.map((item) => {
      console.log('prepared request to', item.url);
      return request({
        url: item.url.trim(),
        uri: item.url.trim()
      })
      .then(res => {
        console.log('finished request to', item.url)
        return res
      })
    })
    return reqs
  })
  .then((requests) => {
    return Promise.all(requests)
  })
  .then((lines) => {
    return lines.map(_parseLinesData)
  })
  .then(lines => {
    return lines.map((item, index) => {
      return {
        name: names[index].name,
        groups: item
      }
    })
  })
  .then((linesJson) => {
    const writeFile = require('bluebird').promisify(fs.writeFile)
    green('write file : ./leopoldense-json.json');
    return writeFile('./leopoldense-json.json', JSON.stringify(linesJson), 'utf-8')
    .then(() => linesJson)
  })
  .catch(console.error)

};

module.exports = fetchLines
