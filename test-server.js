
/*
 *  Adapted from http://blog.kevinchisholm.com/javascript/node-js/making-a-simple-http-server-with-node-js-part-iv/
 */

var http = require('http');
var path = require('path');
var fs = require('fs');

var extensions = {
  ".html" : "text/html",
  ".css" : "text/css",
  ".js" : "application/javascript",
  ".json" : "application/json",
  ".png" : "image/png",
  ".gif" : "image/gif",
  ".jpg" : "image/jpeg"
};
 
//helper function handles file verification
function getFile(filePath, res, mimeType){
  //does the requested file exist?
  fs.exists(filePath,function(exists){

    if(!exists) {
      //if the requested file was not found
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end("file not found");
      console.warn('file not found');
      return;
    }

    fs.readFile(filePath,function(err,contents){
      if(!err){
        //if there was no error
        //send the contents with the default 200/ok header
        res.writeHead(200,{
          "Content-type" : mimeType,
          "Content-Length" : contents.length
        });
        res.end(contents);
      }
      else {
        console.dir(err);
      }
    })
  })
}
 
//a helper function to handle HTTP requests
function requestHandler(req, res) {
  var fileName = path.basename(req.url) || 'test/index.html';
  var dirName = path.dirname(req.url);
  var ext = path.extname(fileName);
  var fullPath = path.join(__dirname, dirName, fileName);

  console.log('request at ' + fullPath);
 
  //do we support the requested file type?
  if(!extensions[ext]){
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end("The requested file type is not supported");
    return;
  }
 
  //find a file or sent a 404
  getFile(fullPath, res, extensions[ext]);
}
 
http.createServer(requestHandler).listen(3000)