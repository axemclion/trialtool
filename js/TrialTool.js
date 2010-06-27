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
        currentSelection = example;
        $("a.example-name-selected").removeClass("example-name-selected");
        $(this).addClass("example-name-selected");
        var docs = example.children(".example-docs");
        if (docs.get(0).nodeName === "LINK") {
            $("div#docs").html($(docs.attr("href")).html());
        }
        else {
            $("div#docs").html(docs.html());
            
        }
        //$("div#docs").attr("scrollTop", 0);
        
        e.preventDefault();
    });
    
    $("ul#toolbar>li>a, #console-toolbar li").live("click", function(e){
        e.preventDefault();
        switch ($(this).attr("id")) {
            case "viewdocs":
                showDocs(true);
                break;
            case "viewoutput":
                showDocs(false);
                break;
            case "run":
                showDocs(false);
                runCode(editor.getCode());
                break;
            case "clearConsole":
                runCode("document.getElementById('console').innerHTML = '';")
                break;
            case "getDependencies":
                var code = [];
                visitedNodes = [];
                $.each(getDependencies(currentSelection), function(){
                    code.push("/*" + this.module + "*/\n");
                    code.push(this.code);
                    code.push("\n\n\n");
                });
                showCode(code.join(" "));
                break;
        };
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
    
    var visitedNodes = [];
    var getDependencies = function(example){
        var result = [];
        var node = (example && typeof(example) === "string") ? $("li.#" + example.replace(/^\s+|\s+$/g, '') + ":first") : example;
        
        // If the node does not exist, simply return
        if (!node) 
            return;
        // if node exists in the visited nodes array, then also return
        for (var i = 0; i < visitedNodes.length; i++) {
            if (node.get(0) === visitedNodes[i]) 
                return;
        }
        
        // Node is visited the first time, so let us process this node
        visitedNodes.push(node.get(0));
        function add(a){
            result = (a ? result.concat(a) : result);
        };
        //console.group(node.get(0));
        
        // Getting the dependencies of the ancestors of this node
        var dependents = [];
        $.each(node.parent("ul").parents("li.example-set"), function(){
            dependents.push("," + ($(this).attr("depends") || ""));
        });
        // Getting the current node's dependencies
        dependents.push("," + (node.attr("depends") || ""));
        
        $.each(dependents.join("").split(","), function(i){
            var currentDepends = String(this);
            if (currentDepends) {
                //console.log("Depends = ", i, currentDepends);
                add(getDependencies(currentDepends));
            }
        });
        
        // Adding self to the result
        if (node.hasClass("example-set")) {
            $(node.children("ul").children("li.example, li.example-set")).each(function(i){
                //console.log("Child node = ", i, this);
                add(getDependencies($(this)));
            });
        }
        else {
            //console.log("Added result ", node);
            result.push({
                "module": node.children("a.example-name").html(),
                "code": node.children("textarea.script").val()
            });
        }
        //console.groupEnd();
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
        $("div#console-toolbar>ul>li").css("background-image", "url('images/tab-closed.png')");
        $("li#view" + (flag ? "docs" : "output")).css("background-image", "url('images/tab.png')");
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
                    $("div#example-sets").append($(data));
                    $("div#example-sets ul, div#example-sets li, div#example-sets a").show();
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
