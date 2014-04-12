/**
 * Created by Travis on 1/10/14.
 */

var request = require('request');
var fs = require("fs");
var path = require("path");
var async = require("async");
var http = require('http');
var logger = require('../Core/Logger');

exports.GetPage = function(page, name, s){
    page = page;
    var fff = this;
    var f = path.join("./Images", name);
    if(!fs.existsSync(f)){
        fs.mkdirSync(f);
    }
    async.forever(function(cb){
       request.get("http://imgur.com/r/" + name + "/new/page/" + page +".json", function(e, r, b){
           var json = JSON.parse(b);

           async.each(json.data, function(item, cb){
               var f = path.join("./Images", name);
               if(!fs.existsSync(path.join(f, item.hash + item.ext))){
                   var file = fs.createWriteStream(path.join(f, item.hash + item.ext));
                   http.get("http://i.imgur.com/" + item.hash + item.ext, function(response) {
                       response.pipe(file);
                       file.on('finish', function() {
                           logger.info("[" + name + "][" + page + "]" + "Saved <a href='/#/" + name + "/" + item.hash + item.ext + "' target='_blank'>" + item.hash + item.ext + "</a>");
                           file.close();
                           fs.appendFileSync("./Files/" + name + ".txt", "/" + name + "/" + item.hash + item.ext + ",");
                           cb();
                       });
                   });
               }else{
                   var ff = fs.statSync(path.join(f, item.hash + item.ext))
                   if(ff.size < 100){
                       var file = fs.createWriteStream(path.join(f, item.hash + item.ext));
                       http.get("http://i.imgur.com/" + item.hash + item.ext, function(response) {
                           response.pipe(file);
                           file.on('finish', function() {
                               logger.info("[Imgur][" + name + "][" + page + "]" + "Saved <a href='/#/" + name + "/" + item.hash + item.ext + "' target='_blank'>" + item.hash + item.ext + "</a>");
                               file.close();
                               fs.appendFileSync("./Files/" + name + ".txt", "/" + name + "/" + item.hash + item.ext + ",");
                               cb();
                           });
                       });
                   }else{
                       //logger.info("[" + name + "][" + page + "]" + "Existed <a href='/#/" + name + "/" + item.hash + item.ext + "' target='_blank'>" + item.hash + item.ext + "</a>");
                       cb();
                   }
               }
               // cb();
           }, function(Err){
               cb("true");
           });
       });
    }, function(){
        page = Math.floor(Math.random()* Math.floor(Math.random()* Math.floor(Math.random()* 200) + 1) + 1 ) + 1;
        fff.GetPage(page, name);
    })
}

exports.DownloadImages = function(link, parent, name, cb){
    request(link).pipe(fs.createWriteStream(path.join("./Images", parent, name)));
    cb();
}
