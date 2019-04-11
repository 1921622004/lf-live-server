const fs = require('fs');
const { promisify } = require('util');

module.exports = {
    readFileSync: fs.readFileSync,
    stat: promisify(fs.stat),
    readdir: promisify(fs.readdir)
}