var cluster = require('cluster');
var logger = require('./Core/Logger');
var fs = require("fs");
if(cluster.isMaster){
    var cpuCount = require('os').cpus().length;
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    cluster.on('disconnect', function(worker) {
        console.log('The worker #' + worker.id + ' has disconnected');
    });

    cluster.on('exit', function (worker) {
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();
    });

    /*setInterval(function(){
        var ff = fs.statSync("./debug.log");
        if(ff.size < 512000){
           fs.unlinkSync("./debug.log");
            logger.info("[System]Dumped old log");
        }
    }, 120000)*/
}else{
    var path = require("path");
    var express = require('express');
    var http = require('http');
    var app = express();
    var s = {Cache: false};
    app.use(express.static(path.join(__dirname, 'Core/public')));

    app.get("/", function(req, res){
        var d = fs.readFileSync("./Core/index2.html", "utf8");
        res.send(d);
    });

    app.get('/exceptions', function(req, res){
        res.send("<pre>" + fs.readFileSync("./exceptions.log", "utf8") + "</pre>");
    });

    app.get("/Settings.json", function(req, res){
        res.send(s);
    })

    app.get("/Gal", function(req, res){
        var files =  fs.readdirSync("./Files");

        var send = new Array();
        for(var i in files) {
            var name = files[i].split(".");
            var f = fs.readFileSync("./Files/" + files[i], "utf8");
            var ddd = f.replace("<pre>").replace(",</pre>").split(",")
           send.push({Name: name[0], Size: ddd.length} );
        }

        res.send({gal: send});
    })

    app.get("/Gal/:Key", function(req, res){
        if(fs.existsSync("./Files/" + req.params["Key"] + ".txt")){
            res.send("<pre>" + fs.readFileSync("./Files/" + req.params["Key"] + ".txt", "utf8") + "</pre>");
        }else{
            res.send("No Gallery!");
        }
    })

    app.get("/i/:G/:Image", function(req, res){
        var path = require("path");
        var image = req.params["Image"];
        var g = req.params["G"];
        var f = path.join("./Images", g, image);
        console.log(f);
        if(fs.existsSync(f)){
            fs.createReadStream(f).pipe(res);
        }else{
            res.send("This is not a image!");
        }
    })

    app.get("/AddCat/:Cats", function(req, res){
        var i = req.params["Cats"].split("+");

        var js = fs.readFileSync("./config.json", "utf8");
        var j = JSON.parse(js);
        var gals = j.gallery;
        for(var f = 0; f<i.length;f++){
            if(gals.indexOf(i[f]) === -1){
                gals.push(i[f]);
            }
        }

        fs.writeFileSync("./config.json", JSON.stringify({gallery: gals}));
        res.send("Safe to restart now 'forever start app.js'!");

    })
    if(!fs.existsSync("./Images"))
        fs.mkdirSync("./Images");
    if(!fs.existsSync("./Files"))
        fs.mkdirSync("./Files");

    http.createServer(app).listen(3000);
    var dara = fs.readFileSync("config.json", "utf8");
    var f = JSON.parse(dara);

    f.gallery.forEach(function(item){
        var page = Math.floor(Math.random()* Math.floor(Math.random()* Math.floor(Math.random()* 200) + 1) + 1 ) + 1;
        require("./Core").GetPage(page, item, s);
    })
}