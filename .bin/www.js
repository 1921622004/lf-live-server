#! /usr/bin/env node
const program = require('commander');
const Server = require('../Server');
const package = require('../package.json');
const detectPort = require('detect-port');
const inquirer = require('inquirer');

const option = {
  port: 4444,
  dir: process.cwd()
}

program.option('-p --port <n>', '设置端口号 默认4444')
  .option('-d --dir <n>', '静态服务目录，默认当前目录')
  .version(package.version)
  .parse(process.argv)

const finalOption = { ...option, ...program };
detectPort(finalOption.port, (err, port) => {
  if (err) {
    console.log(err);
    return
  };
  if (finalOption.port !== port) {
    inquirer.prompt({
      type: "confirm",
      name: "swtichToAnotherPort",
      message: `${finalOption.port}端口已被占用，是否在${port}端口启动服务`
    }).then(({ swtichToAnotherPort }) => {
      if (swtichToAnotherPort) {
        const server = new Server({ ...finalOption, port });
        server.start()
      } else {
        process.exit(1);
      }
    })
  } else {
    const server = new Server(finalOption);
    server.start()
  }
})


