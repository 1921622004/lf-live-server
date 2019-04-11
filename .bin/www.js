#! /usr/bin/env node
const program = require('commander');
const Server = require('../Server');
const package = require('../package.json');

const option = {
    port: 4444,
    dir: process.cwd()
}

program.option('-p --port <n>', '设置端口号 默认4444')
    .option('-d --dir <n>', '静态服务目录，默认当前目录')
    .version(package.version)
    .parse(process.argv)


const server = new Server({ ...option, ...program });

server.start()