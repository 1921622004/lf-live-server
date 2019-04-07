const http = require('http');
const path = require('path');
const chalk = require('chalk');
const mime = require('mime');
const url = require('url');
const fs = require('mz/fs');
const ejs = require('ejs');

const template = fs.readFileSync('./template.html','utf-8');

class Server {
    constructor(option = {}) {
        this.dir = option.dir;
        this.port = option.port;
        this.host = option.host;
        this.template = template;
        this.handleRequest = this.handleRequest.bind(this);
    }

    async handleRequest(req, res) {
        const { pathname } = url.parse(req.url);
        const currentPath = path.join(this.dir, pathname);
        const statObj = await fs.stat(currentPath);
        if (statObj.isDirectory()) {
            const files = await fs.readdir(currentPath);
            let renderResult = ejs.render(this.template, { files });
            res.statusCode = 200;
            res.setHeader('Content-Type','text/html;charset=utf-8');
            res.end(renderResult);
        } else {
            this.sendFile(req, res, currentPath)
        }
    }

    sendError() {

    }

    sendFile(req, res, currentPath) {
        res.statusCode = 200;
        res.setHeader('Content-Type', `${mime.getType(currentPath)};charset=utf-8`);
        fs.createReadStream(currentPath).pipe(res);
    }

    start() {
        http.createServer(this.handleRequest).listen(this.port, () => {
            console.log(chalk.green(`live server start at ${this.port}`))
        })
    }
}

module.exports = Server