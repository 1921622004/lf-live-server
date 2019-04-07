#! /usr/bin/env node
const program = require('commander');
const Server = require('../Server');
const package = require('../package.json');

const option = {
    port: 4444,
    host: "localhost",
    dir: process.cwd()
}

program.option('-p --port <n>', '')
    .option('-o --host <n>', '')
    .option('-d --dir <n>', '')
    .version(package.version)
    .parse(process.argv)
    .on('--help', function () {
        console.log('aaaa')
    })


const server = new Server({ ...option, ...commander });

server.start()