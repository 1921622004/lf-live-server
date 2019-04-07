const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('mz/fs');

class Server {
    constructor(option = {}){
        this.dir = option.dir;
        this.port = option.port;
        this.host = option.host;
        this.handleRequest = this.handleRequest.bind(this);
    }

    handleRequest(req,res){
        
    }

    start(){
        http.createServer(this.handleRequest)
    }
}   

module.exports = Server