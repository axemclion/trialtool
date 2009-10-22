/**
 * The Main TrialTool Object
 * @param {Object} divs representing various elements in the page
 */
var TrialTool = (function(){
    var currentSelection = null;
    $("a.example-set-name").live("click", function(e){
        var list = $(this).parent().children("ul").toggle();
        if (list.css("display") === "none") {
            $(this).css("background-image", "url('images/closed.png')");
        }
        else {
            $(this).css("background-image", "url('images/opened.png')");
        }
        e.preventDefault();
    });
    
    $("a.example-name").live("click", function(e){
        var example = $(this).parent();
        showCode(example.children("textarea.script").val());
        $("div#docs").html(example.children("div.example-docs").html());
        currentSelection = example;
        e.preventDefault();
        
        $("a.example-name-selected").removeClass("example-name-selected");
        $(this).addClass("example-name-selected");
        
        
    });
    
    
    
    $("ul#toolbar a").live("click", function(e){
        switch ($(this).attr("id")) {
            case "viewdocs":
                showDocs(($("div#docs").css("display") === "none"));
                break;
            case "clearConsole":
                runCode("document.getElementById('console').innerHTML = '';")
                break;
            case "run":
                showDocs(false);
                runCode(editor.getCode());
                
                break;
            case "getDependencies":
                var code = [];
                visitedNodes = {};
                $.each(getDependencies(currentSelection), function(){
                    code.push("/*" + this.module + "*/\n");
                    code.push(this.code);
                    code.push("\n\n\n");
                });
                showCode(code.join(" "));
                break;
        };
        e.preventDefault();
    });
    
    var runCode = function(code){
        var iframe = $("#console-iframe").get(0).contentWindow;
        if (!iframe.eval && iframe.execScript) {
            iframe.execScript("null");
        }
        try {
            iframe.eval(code);
        } 
        catch (e) {
            iframe.writeError(e);
        }
    }
    
    var visitedNodes = {};
    var getDependencies = function(example){
        var result = [];
        var node = (example && typeof(example) === "string") ? $("li.#" + example + ":first") : example;
        if (!node || node.attr("id") in visitedNodes) {
            return;
        }
        visitedNodes[node.attr("id")] = '';
        function add(a){
            result = (a ? result.concat(a) : result);
        };
        
        // Getting the current node's dependencies
        var dependents = (node.parent("ul").parent("li.example-set").attr("depends") || "") + "," + (node.attr("depends") || "");
        //console.log(node.get(0), " depends on ", dependents, visitedNodes);
        $.each(dependents.split(","), function(){
            add(getDependencies(String(this)));
        });
        
        // Adding self to the result
        if (node.hasClass("example-set")) {
            $(node.children("li.example")).each(function(){
                add(getDependencies($(this).attr("id")))
            });
            $(node.children("ul").children("li.example")).each(function(){
                add(getDependencies($(this).attr("id")))
            });
        }
        else {
            result.push({
                "module": node.children("a.example-name").html(),
                "code": node.children("textarea.script").val()
            });
        }
        return result;
    };
    
    var showCode = function(code){
        if (!code) {
            code = $("#code").val();
        }
        editor.setCode(code.replace(/^\s+|\s+$/g, ''));
        editor.reindent();
    }
    
    var showDocs = function(flag){
        $("#console-iframe").toggle(!flag);
        $("div#docs").toggle(flag);
        $("a#viewdocs").html((flag && "View Output") || "View Docs");
    }
    
    /**
     * Uses codemirror to initialize a code editor
     */
    var editor = new CodeMirror(CodeMirror.replace("formattedCode"), {
        parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
        path: "lib/codemirror/js/",
        stylesheet: "lib/codemirror/css/jscolors.css",
        content: document.getElementById("code").value,
        height: "100%"
    });
    
    return {
        /**
         * Adds a new example to
         * @param {Object} example
         */
        loadExamples: function(url){
            $.ajax({
                "type": "GET",
                "datatype": "html",
                "url": url + "?" + Math.random(),
                dataFilter: function(data, type){
                    return data.replace(/<script/g, "<textarea class = 'script' ").replace(/<\/script>/g, "</textarea>");
                },
                "success": function(data){
                    $("#example-sets").append($(data));
                },
                "error": function(data, errorString, m){
                    alert("Could not load " + url);
                }
            });
        }
    };
})();


var url = document.location.href;
url = url.substring((url.indexOf("#") + 1) || url.length);
url = url || "examples/Template.html";
$.each(url.split("&"), function(){
    TrialTool.loadExamples(this);
});
