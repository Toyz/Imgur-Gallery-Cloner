var cluster = require('cluster');
var logger = require('./Core/Logger');

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

    var fs = require("fs");

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
    app.use(express.static(path.join(__dirname, 'Core/public')));

    app.get("/", function(req, res){
        var d = require("fs").readFileSync("./Core/index2.html", "utf8");
        res.send(d);
    })
    app.get("/Beta", function(req, res){
        var d = require("fs").readFileSync("./Core/index2.html", "utf8");
        res.send(d);
    })

    app.get('/debug', function(req, res){
        var d = require("fs").readFileSync("./Core/log.html", "utf8");
        res.send(d);
    })

    app.get('/debug/tail', function(req, res){
        /*var d = require("fs").readFileSync("./debug.log", "utf8")
        res.send("<pre>" + d + "</pre>");*/
        if(require("fs").existsSync("./debug.log")){
            Tail = require('tail').Tail;

            tail = new Tail("./debug.log");

            tail.on("line", function(data) {
                res.send("<pre>" + data + "</pre>");
            });
        }else{
            res.send("<pre>[System] - Error: Log does not exist yet!</pre>");
        }
    });

    app.get('/exceptions', function(req, res){
        res.send("<pre>" + require("fs").readFileSync("./exceptions.log", "utf8") + "</pre>");
    });

    app.get("/Gal", function(req, res){
        var fs = require("fs");
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
        var fs = require("fs");
        if(fs.existsSync("./Files/" + req.params["Key"] + ".txt")){
            res.send("<pre>" + require("fs").readFileSync("./Files/" + req.params["Key"] + ".txt", "utf8") + "</pre>");
        }else{
            res.send("No Gallery!");
        }
    })

    app.get("/i/:G/:Image", function(req, res){
        var fs = require("fs");
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

        var js = require("fs").readFileSync("./config.json", "utf8");
        var j = JSON.parse(js);
        var gals = j.gallery;
        for(var f = 0; f<i.length;f++){
            if(gals.indexOf(i[f]) === -1){
                gals.push(i[f]);
            }
        }

        require("fs").writeFileSync("./config.json", JSON.stringify({gallery: gals}));
        res.send("Safe to restart now 'forever start app.js'!");

    })
    require("fs").mkdirSync("./Images");
    require("fs").mkdirSync("./Files");

    http.createServer(app).listen(3000);
    var dara = require("fs").readFileSync("config.json", "utf8");
    var f = JSON.parse(dara);

    f.gallery.forEach(function(item){
        var page = Math.floor(Math.random()* Math.floor(Math.random()* Math.floor(Math.random()* 200) + 1) + 1 ) + 1;
        require("./Core").GetPage(page, item);
    })
}