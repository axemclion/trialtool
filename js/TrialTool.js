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
        selectExample(this);
        e.preventDefault();
    });
    
    $("ul#toolbar>li>a, #console-toolbar>li>a").live("click", function(e){
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
        }
    });
    
    /**
     * Selects an example
     * @param {Object} exampleNode
     */
    var selectExample = function(exampleNode){
        var example = $(exampleNode).parent();
        showCode(example.children("textarea.script").val());
        currentSelection = example;
        $("a.example-name-selected").removeClass("example-name-selected");
        $(exampleNode).addClass("example-name-selected");
        var docs = example.children(".example-docs");
        if (docs.length > 0) {
            if (docs.get(0).nodeName === "LINK") {
                $("div#docs").html($(docs.attr("href")).html());
            }
            else {
                $("div#docs").html(docs.html());
            }
        }
        else {
            $("div#docs").html("No documentation provided");
        }
        var selector = $(exampleNode).parent().attr("id");
        urlHelper.setKey("selected", (selector) ? ("#" + selector) : $(exampleNode).html().replace(/^\s+|\s+$/g, ''));
    }
    
    var runCode = function(code){
        TrialTool.executeInWindow(code, $("#console-iframe").get(0).contentWindow);
    }
    
    var visitedNodes = [];
    var getDependencies = function(example){
        var result = [];
        var node = (example && typeof(example) === "string") ? $("li.#" + example.replace(/^\s+|\s+$/g, '') + ":first") : example;
        
        // If the node does not exist, simply return
        if (!node)             
            return [];
        // if node exists in the visited nodes array, then also return
        for (var i = 0; i < visitedNodes.length; i++) {
            if (node.get(0) === visitedNodes[i])                 
                return [];
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
                "module": node.children("a.example-name").contents().filter(function(){
                    return this.nodeType == 3;
                }).text(),
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
        $("ul#console-toolbar>li.tab").css("background-image", "url('images/tab-closed.png')");
        $("a#view" + (flag ? "docs" : "output")).parent().css("background-image", "url('images/tab.png')");
    }
    
    /**
     * Function to resize the panes
     * @param {Object} elems
     * @param {Object} d
     */
    var resizePanes = function(elems, d){
        var axis = {
            "a": "top",
            "b": "height"
        };
        if (d == "x") {
            axis = {
                "a": "left",
                "b": "width"
            };
        }
        var divider = elems[1].offset()[axis.a] - elems[1].parent().offset()[axis.a];
        elems[0].css(axis.b, divider);
        elems[2].css(axis.b, elems[1].parent()[axis.b].call(elems[1].parent()) - (divider + elems[1][axis.b].call(elems[1])));
        elems[2].css(axis.a, divider + elems[1][axis.b].call(elems[1]));
        $("div#vertical-thumb").height($("div#vertical-thumb").parent().height());
    }
    
    // Left right resizing
    $("div#vertical-thumb").draggable({
        "iframeFix": true,
        "axis": "x",
        "containment": [200, 0, window.innerWidth - 300, window.innerHeight],
        "drag": function(event, ui){
            resizePanes([$("div#examples"), $("div#vertical-thumb"), $("div#code-area")], "x");
        },
        "stop": function(event, ui){
            resizePanes([$("div#examples"), $("div#vertical-thumb"), $("div#code-area")], "x");
        }
    }).height($("div#vertical-thumb").parent().height());
    
    // Top-Down resizing
    $("div#horizontal-thumb").draggable({
        "iframeFix": true,
        "axis": "y",
        "containment": [0, 200, window.innerWidth, window.innerHeight - 200],
        "drag": function(event, ui){
            resizePanes([$("div#top-pane"), $("div#horizontal-thumb"), $("div#console")], "y");
        },
        "stop": function(event, ui){
            resizePanes([$("div#top-pane"), $("div#horizontal-thumb"), $("div#console")], "y");
        }
    });
    
    var resizeAllPanes = function(){
        resizePanes([$("div#examples"), $("div#vertical-thumb"), $("div#code-area")], "x");
        resizePanes([$("div#top-pane"), $("div#horizontal-thumb"), $("div#console")], "y");
    }
    resizePanes([$("div#top-pane"), $("div#horizontal-thumb"), $("div#console")], "y");
    
    /**
     * Loads a new example from a URL
     * @param {Object} example
     */
    var loadExamples = function(urls, callback){
        if (typeof(urls) === "string") {
            urls = [urls];
        }
        var remainingUrls = urls.length, errorCount = 0;
        if (!urls.length) {
            callback(true);
            return;
        }
        $.each(urls, function(i){
            $.ajax({
                "type": "GET",
                "datatype": "html",
                "url": this + "?" + Math.random(),
                dataFilter: function(data, type){
                    return data.replace(/<script/g, "<textarea class = 'script' ").replace(/<\/script>/g, "</textarea>");
                },
                "success": function(data){
                    $("div#example-sets").append($(data));
                    $("div#example-sets *").hide();
                    $("div#example-sets ul, div#example-sets li, div#example-sets a").show();
                },
                "complete": function(xhr, status){
                    (status === "error") && (errorCount++);
                    remainingUrls--;
                    if (!remainingUrls && typeof(callback) === "function") {
                        callback(urls.length === errorCount);
                    }
                }
            });
        });
    }
    
    /**
     * Parsing the
     */
    var urlHelper = (function(){
        var qMap = {}, location, q;
        var init = function(){
            var url = document.location.href;
            var start = Math.min(url.indexOf("?") < 0 ? Infinity : url.indexOf("?"), url.indexOf("#") < 0 ? Infinity : url.indexOf("#"));
            location = url.substring(0, start);
            q = url.substring(start + 1);
            var qParams = q.split("&");
            qMap = {
                "example": []
            };
            for (var i = 0; i < qParams.length; i++) {
                var key = qParams[i].substring(0, qParams[i].indexOf("="));
                if (key === "example") {
                    qMap.example.push(qParams[i].substring(qParams[i].indexOf("=") + 1))
                }
                else {
                    qMap[key] = qParams[i].substring(qParams[i].indexOf("=") + 1);
                }
            }
        }
        init();
        return {
            getKey: function(key){
                return qMap[key];
            },
            setKey: function(key, value){
                qMap[key] = value;
                var params = ["#"];
                for (key in qMap) {
                    var value = (key === "example" ? (qMap[key].join("&example")) : qMap[key]);
                    key && value && params.push([key, "=", value, "&"].join(""));
                }
                document.location = location + params.join("")
            },
            refresh: function(){
                init();
            }
        }
    })();
    
    /**
     * First function that is called to initialize TrialTool
     */
    var init = function(){
        // Loading the examples from 
        var exampleLoadSequence = [urlHelper.getKey("example"), ["examples/default.html"], ["examples/Template.html"]];
        var loadExampleFromSequence = function(i){
            if (i >= exampleLoadSequence.length) {
                return;
            }
            loadExamples(exampleLoadSequence[i], function(hasFailed){
                console.log(hasFailed);
                if (hasFailed) {
                    loadExampleFromSequence(i + 1);
                }
                else {
                    // Selecting example if sepcified
                    var selector = urlHelper.getKey("selected");
                    if (selector && selector.indexOf("#") === 0) {
                        selectExample($(selector).children("a:first"));
                    }
                    else if (selector) {
                        $("a.example-name").each(function(){
                            if ($(this).html().replace(/^\s+|\s+$/g, '') === selector) {
                                selectExample(exampleName);
                            }
                        });
                    }
                }
            });
            (i >= exampleLoadSequence.length - 1) && urlHelper.setKey("fork", true);
        };
        loadExampleFromSequence(0);
        
        //Fork if the flag is set
        if (urlHelper.getKey("fork")) {
            $.getScript("js/Fork.js");
        }
    }
    init();
    /**
     * Uses codemirror to initialize a code editor
     */
    var editor = null;
    $.getScript("lib/codemirror/js/codemirror.js", function(){
        $.getScript("lib/codemirror/js/mirrorframe.js", function(){
            editor = new CodeMirror(CodeMirror.replace("formattedCode"), {
                parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
                path: "lib/codemirror/js/",
                stylesheet: "lib/codemirror/css/jscolors.css",
                content: document.getElementById("code").value,
                height: "100%"
            });
        });
    });
    return {
        executeInWindow: function(code, contentWindow){
            try {
                if (!contentWindow.eval && contentWindow.execScript) {
                    contentWindow.execScript("null");
                }
                contentWindow.eval(code);
            } 
            catch (e) {
                contentWindow.writeError(e);
            }
        },
        getCode: function(){
            return editor.getCode();
        }
    };
})();
