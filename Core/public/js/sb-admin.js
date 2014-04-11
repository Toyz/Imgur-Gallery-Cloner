$(function() {

    $('#side-menu').metisMenu();

});

//Loads the correct sidebar on window load
$(function() {

    $(window).bind("load", function() {
        console.log($(this).width())
        if ($(this).width() < 768) {
            $('div.sidebar-collapse').addClass('collapse')
        } else {
            $('div.sidebar-collapse').removeClass('collapse')
        }
    })
})

var image = $("<img class='img-responsive thumbnail' />");
var created = false;
var id = 0;
var Data = null;

function SortByName(a, b){
    var aName = a.Name.toLowerCase();
    var bName = b.Name.toLowerCase();
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}
function commaSeparateNumber(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
        val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
}


function LoadGallery(Link){
    created = false;
    id = 0;
    $("div#images").attr("data-page", "1");
    $("div#images").empty();
    var f = Link.split("/");

    $("#gname").html(f[2]);
    $("#gname").append('<div class="btn-group pull-right"><button type="button" class="btn btn-default" data-type="dl">Download <span></span></button></div>');
    $("#gname").find("button").on("click", function(){
        var image = $("div#images").find("img").attr("src");
        var win=window.open(image, '_blank');
        win.focus();
    })
    $.get(Link, function(data){
        data = data.replace("<pre>", "").replace(",</pre>", "");

        Data = data.split(",");

        if(!created){
            image.attr("src", "/i" + Data[id]);
            document.location.hash = Data[id];
            image.on("click", function(){
                if(id < Data.length)
                    id = id + 1;
                image.attr("src", "/i" + Data[id]);
                document.location.hash = Data[id];
                var f = Data[id].split("/");
                f = f[2].split(".");
                $("#gname").find("button").find("span").html(f[0]);
            })
            var Div = $('<div class="col-lg-12"></div>');
            var c = $("<center></center>");
            c.append(image);
            Div.append(c);
            $("div#images").append(Div);
            var f = Data[id].split("/");
            f = f[2].split(".");
            $("#gname").find("button").find("span").html(f[0]);
            created = true;
        }
    });
}
/*
 <div class="col-xs-6 col-md-3">
 <a href="#" class="thumbnail">
 <img alt="">
 </a>
 </div>
 */
$(document).ready(function(){
    $("select#galslist").on("change", function(){
        LoadGallery($(this).val());
    });

    if(document.location.hash){
        var f = document.location.hash.substr(1);
        image.attr("src", "/i" + f);

        var Div = $('<div class="col-lg-12"></div>');
        var c = $("<center></center>");
        c.append(image);
        Div.append(c);
        $("div#images").append(Div);
        f = f.split("/");
        $("#gname").html(f[1]);
        $.get("/Gal/" + f[1], function(data){
            data = data.replace("<pre>", "").replace(",</pre>", "");

            Data = data.split(",");
            $("#gname").append('<div class="btn-group pull-right"><button type="button" class="btn btn-default" data-type="dl">Download <span></span></button></div>');
            $("#gname").find("button").on("click", function(){
                var image = $("div#images").find("img").attr("src");
                var win=window.open(image, '_blank');
                win.focus();
            })
            f = f[2].split(".");
            $("#gname").find("button").find("span").html(f[0]);
            created = true;
        });
    }


    $.get("/Gal", function(data){
        var total = 0;
        data.gal = data.gal.sort(SortByName);

        data.gal.forEach(function(item){
            var li = $("<li></li>");
            var a = $("<a></a>");
            a.attr("href", "/Gal/" + item.Name);
            a.html(item.Name + "<span class='pull-right badge'>"  + commaSeparateNumber(item.Size) + "</span>");

            a.on("click", function(e){
                e.preventDefault();
                LoadGallery($(this).attr("href"));
            });

            li.append(a);
            $("ul#gals").append(li);
            $("select#galslist").append("<option value='/Gal/" + item.Name + "'>" + item.Name + " ( " + commaSeparateNumber(item.Size) + " ) </option>");
            total = item.Size + total;
        });

        $("li#total").append("<A href='#'>Total Images<span class='pull-right badge'>" + commaSeparateNumber(total) + "</span></A>");
        $("li#total").find("A").on("click", function(e){
            e.preventDefault();
        })
        $("li#gtotal").append("<A href='#'>Total Galleries<span class='pull-right badge'>" + commaSeparateNumber(data.gal.length) + "</span></A>");
        $("li#gtotal").find("A").on("click", function(e){
            e.preventDefault();
        })
    });


    $(this).keydown(function(e){
        if(created){
            if(Data.length > 0){
                if (e.keyCode == 37) {
                    if(id > 0){
                        id = id - 1;
                    }
                    image.attr("src", "/i" + Data[id]);
                    document.location.hash = Data[id];
                    var f = Data[id].split("/");
                    f = f[2].split(".");
                    $("#gname").find("button").find("span").html(f[0]);
                    return false;
                }

                if (e.keyCode == 39) {
                    if(id < Data.length){
                        id = id + 1;
                    }
                    image.attr("src", "/i" + Data[id]);
                    document.location.hash = Data[id];
                    var f = Data[id].split("/");
                    f = f[2].split(".");
                    $("#gname").find("button").find("span").html(f[0]);
                    return false;
                }
            }
        }
    });
})