const Promise = require('bluebird');
global.Promise = Promise;

const leopoldense = require('./fetchLeopoldense')
const feitoria = require('./fetchFeitoria')

Promise.all([
    leopoldense(),
    feitoria(),
]).then((results) => {
    console.info('Finished');
}).catch((err) => {
    console.error(err);
});

