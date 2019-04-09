const http = require('http');
const path = require('path');
const chalk = require('chalk');
const mime = require('mime');
const url = require('url');
const fs = require('mz/fs');
const ejs = require('ejs');
const DIR = 'dir';

const template = fs.readFileSync(path.join(__dirname,'./template.html'), 'utf-8');
const favIconPath = 'file:' + path.join(__dirname, 'favicon.ico');

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
    try {
      const statObj = await fs.stat(currentPath);
      if (statObj.isDirectory()) {
        const files = await fs.readdir(currentPath);
        const promiseAry = files.map(file => {
          const absPath = path.join(currentPath, file);
          return new Promise((resolve, reject) => {
            fs.stat(absPath, (err, stats) => {
              if (stats.isDirectory()) {
                resolve({
                  type: DIR,
                  name: file,
                  link: path.join(pathname, file)
                })
              } else {
                resolve({
                  type: mime.getType(absPath),
                  name: file,
                  link: path.join(pathname, file)
                })
              }
            })
          });
        });
        const fileList = await Promise.all(promiseAry);
        let renderResult = ejs.render(this.template, { fileList, favIconPath });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html;charset=utf-8');
        res.end(renderResult);
      } else {
        this.sendFile(req, res, currentPath, statObj);
      }
    } catch (err) {
      this.sendError(req, res, currentPath);
    }
  }

  sendError(req, res, currentPath) {
    res.statusCode = 404;
    res.end(`can not found ${currentPath}`);
  }

  isCache(req, res, statObj) {
    const ifModifiedSince = req.headers['if-modified-since'];
    const ifNoneMatch = req.headers['if-none-match'];
    const lastModified = statObj.cTime + '';
    const eTag = statObj.size + '';
    const expireTime = new Date(Date.now() + 180 * 1000);
    if (eTag === ifNoneMatch) {
      return true
    };
    if (lastModified === ifModifiedSince) {
      return true
    };
    res.setHeader('Cache-Control', 'max-age=180');
    res.setHeader('ETag', eTag);
    res.setHeader('Last-Modified', lastModified);
    res.setHeader('Expires', `${expireTime.toUTCString()}`);
    return false
  }

  sendFile(req, res, currentPath, statObj) {
    if (this.isCache(req, res, statObj)) {
      res.statusCode = 304;
      res.end();
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', `${mime.getType(currentPath)};charset=utf-8`);
      fs.createReadStream(currentPath).pipe(res);
    }
  }

  start() {
    http.createServer(this.handleRequest).listen(this.port, () => {
      console.log(chalk.green(`live server start at ${this.port}`))
    })
  }
}

module.exports = Server