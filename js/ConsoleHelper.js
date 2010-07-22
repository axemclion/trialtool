var ConsoleHelper = (function(){
    $("span.log-object, span.log-array").live("click", function(){
        $(this).children("ul, ol").toggle();
        if ($(this).children("ul, ol").css("display") !== "none") {
            $(this).addClass("log-opened");
        }
        else {
            $(this).removeClass("log-opened");
        }
    });
    
    var getDomFromJSON = function(data){
        var result = [];
        if (Object.prototype.toString.apply(data) === '[object Array]') {
            result = ["<span class = 'log-array'>&nbsp;<u>[Array : ", data.length, "]</u>&nbsp;"];
            result.push("<ol start = 0 style = 'display:none'>");
            for (var i = 0; i < data.length; i++) {
                result.push("<li>");
                result.push(getDomFromJSON(data[i]));
                result.push("</li>")
            }
            result.push("</ol></span>");
        }
        else if (typeof(data) === "object") {
            result = ["<span class = 'log-object'>&nbsp;<u>[Object]</u>&nbsp;"];
            result.push("<ul style = 'display:none'>");
            for (x in data) {
                result.push("<li>" + x);
                result.push(":" + getDomFromJSON(data[x]));
                result.push("</li>")
            }
            result.push("</ul></span>");
        }
        else {
            result = ["<span class = 'log-item'>", String(data).replace(/</g, "&lt;").replace(/>/g, "&gt;"), "</span>"];
        }
        return result.join("");
    }
    
    var write = function(){
        var text = document.createElement("div");
        var msg = [];
        for (var i = 0; i < arguments.length; i++) {
            msg.push(getDomFromJSON(arguments[i]));
        }
        text.innerHTML = ["<span class='log-time'>[", new Date().toLocaleTimeString(), "]&nbsp;</span>"].join("") + msg.join(" ");
        document.getElementById("console").appendChild(text);
        window.scroll(0, $("#console").height());
        return text;
    };
    
    var writeError = function(e){
        write(e.name + ": " + e.message).style.color = "RED";
    }
    
    document.write = window.write = write;
    window.writeError = writeError;
})();
