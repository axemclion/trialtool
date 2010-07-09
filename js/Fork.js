TrialTool.Fork = (function(){
    var isEditingExample = false;
    var loadedJwysiwyg = false;
    
    /**
     * Adds a toolbar to every example that lets you rename or delete the example
     */
    var exampleEdit = function(category){
        var iconButton = function(name, desc){
            return $("<img>", {
                "class": name,
                "title": desc || "",
                "src": "images/fork/" + name + ".png"
            });
        }
        
        var toolbar = $("<span>", {
            "class": "example-edit fork"
        }).hide();
        
        toolbar.append(iconButton("example-move", "Reorder this example"));
        toolbar.append(iconButton("example-rename", "Rename this exaomple"));
        if (category && category === "example-set") {
            toolbar.append(iconButton("example-add", "Add a new example in this category"));
            toolbar.append(iconButton("example-set-add", "Add a new sub category"));
        }
        toolbar.append(iconButton("example-remove", "Delete this example"));
        
        toolbar.append($("<input>").hide());
        toolbar.append(iconButton("example-text", "Accept the new name for this example").hide());
        toolbar.append(iconButton("example-cancel", "Cancel the changes to the example").hide());
        return toolbar;
    }
    
    /**
     * Adds a button to the toolbar at the top
     * @param {Object} name
     * @param {Object} id
     */
    var toolBarButton = function(name, desc){
        return ($("<li>", {
            "class": "fork"
        }).append($("<a>", {
            "id": name.replace(/\W/g, "_"),
            "href": "#" + name.replace(/\W/g, "_"),
            "class": "fork-toolbar-button",
            "title": desc
        }).html(name)));
    };
    
    var documentation = function(content){
        var docs = $("a.example-name-selected").siblings(".example-docs");
        if (docs.length === 0) {
            docs = $("<div>", {
                "class": "example-docs"
            }).insertAfter("a.example-name-selected");
        }
        else if (docs.get(0).nodeName === "LINK") {
            docs = $(docs.attr("href"));
        }
        return content ? docs.html(content) : docs.html();
    };
    
    var saveDocInEditor = function(){
        $("div#console-content>textarea").wysiwyg("setContent", documentation());
    }
    
    
    /**
     * Removes the effect of forking and exports the examples in a new file
     */
    var exportFork = function(){
        var exportWindow = window.open("html/export.html");
        window.axe = exportWindow;
        exportWindow.onload = function(){
            exportWindow.exportedPage($("div#example-sets").html());
        }
    }
    
    /**
     * Starts the forking process
     */
    var startFork = function(){
        toolBarButton("Save Fork", "Save and export this example").appendTo("ul#fork-toolbar");
        toolBarButton("Cancel Fork", "Cancel forking this example and return to the examples").appendTo("ul#fork-toolbar");
        
        $("div#code-area").prepend($("<ul>", {
            "class": "fork toolbar floating-toolbar"
        }).append(toolBarButton("Save Code", "Save the code you edited")));
        
        exampleEdit().insertAfter("a.example-name");
        exampleEdit("example-set").insertAfter("a.example-set-name");
        
        $("div#example-sets").sortable({
            "axis": "y",
            "items": "li.example, li.example-set",
            "handle": "img.example-move",
            "revert": true,
            "forcePlaceholderSize": true,
            "forceHelperSize": true
        });
        
        // Adding editor to the document
        var initDocEditor = function(){
            $("div#console-content>*").hide();
            $("<textarea>", {
                "class": "fork"
            }).insertBefore("div#docs");
            $("div#console-content>textarea").wysiwyg({
                controls: {
                    alertSep: {
                        separator: true
                    },
                    save: {
                        visible: true,
                        exec: function(){
                            documentation($("div#console-content>textarea").wysiwyg("getContent"));
                            window.setTimeout(function(){
                                $("li.saveIcon").css("background", "url('images/fork/saveIcon.png')");
                            }, 1000);
                            $("li.saveIcon").css("background", "url('images/fork/example-text.png')");
                        },
                        className: 'saveIcon'
                    }
                }
            });
            $("li.saveIcon").css("background", "url('images/fork/saveIcon.png')");
            $("div#console-content>textarea").wysiwyg("setContent", $("div#docs").html());
            $("a.example-name").live("click", saveDocInEditor);
        };
        $.getScript("lib/jwysiwyg/jquery.wysiwyg.min.js", initDocEditor);
    }
    
    var endFork = function(){
        $(".fork").remove();
        $("div#docs").show();
        $(".wysiwyg").remove();
        $("a.example-name").die("click", saveDocInEditor);
    };
    
    // This is the initialization function. Should be run only once
    var runOnce = function(){
        var loadCss = function(url){
            //Adding the forking CSS file
            var css = document.createElement("link");
            css.rel = "stylesheet";
            css.type = "text/css";
            css.href = url;
            document.getElementsByTagName("head")[0].appendChild(css);
        }
        
        loadCss("lib/jwysiwyg/jquery.wysiwyg.css");
        loadCss("css/fork.css");
        
        toolBarButton("Fork", "Create a new example based on this example");
        
        // Adding the toolbar where fork buttons will be added 
        $("<ul>", {
            "id": "fork-toolbar"
        }).prependTo("div#examples-title");
        toolBarButton("Fork", "Create a new example based on this example").appendTo("ul#fork-toolbar");
        
        $("a.fork-toolbar-button").live("click", function(e){
            e.preventDefault();
            e.stopPropagation();
            switch ($(this).attr("id")) {
                case "Fork":
                    startFork();
                    $(this).parent().remove();
                    break;
                case "Cancel_Fork":
                    window.location.reload();
                case "Save_Fork":
                    endFork();
                    toolBarButton("Fork", "Create a new example based on this example").appendTo("ul#fork-toolbar");
                    exportFork();
                    break;
                case "Save_Code":
                    $("a.example-name-selected").siblings("textarea.script").val(TrialTool.getCode());
                    var button = $(this);
                    button.html(" Saved &#10003;");
                    window.setTimeout(function(){
                        button.html("Save Code");
                    }, 3000);
                    break;
            }
        });
        
        // Adding mouse events for hover on example
        $("li.example, li.example-set").live("mouseleave", function(e){
            isEditingExample || $(this).children("span.example-edit").hide();
            e.stopPropagation();
        });
        $("a.example-name, a.example-set-name").live("mouseenter", function(e){
            isEditingExample || $(this).siblings("span.example-edit").css("display", "inline");
            e.stopPropagation();
        })
        
        // Adding event listeners to example-edit buttons
        $("span.example-edit img").live("click", function(e){
            e.preventDefault();
            var button = $(this);
            var node = button.parent().parent();
            var a = node.children("a")
            if (button.hasClass("example-remove")) {
                node.remove();
            }
            else if (button.hasClass("example-rename")) {
                button.siblings("input").val(a.text()).attr("title", a.text());
                a.text("");
                button.parent().children().each(function(){
                    $(this).css("display", $(this).css("display") === "none" ? "inline" : "none");
                });
                isEditingExample = true;
            }
            else if (button.hasClass("example-text")) {
                a.text(button.siblings("input").val());
                button.parent().children().toggle();
                isEditingExample = false;
            }
            else if (button.hasClass("example-cancel")) {
                a.text(button.siblings("input").attr("title"));
                button.parent().children().toggle();
                isEditingExample = false;
            }
            else if (button.hasClass("example-add")) {
                var li = $("<li>", {
                    "class": "example",
                    "id": Math.random()
                }).html(["<a class = 'example-name'>Edit example</a>", "<textarea class= 'script'>//Edit Me</textarea>", "<div class = 'example-docs'>Edit Docs<div>"].join(""));
                exampleEdit().insertAfter(li.children("a"));
                node.children("ul").append(li);
            }
            else if (button.hasClass("example-set-add")) {
                var li = $("<li>", {
                    "class": "example-set",
                    "id": Math.random()
                }).html("<a class = 'example-set-name'>Edit example-set</a>").append(exampleEdit("example-set"));
                node.append(li.append("<ul>"));
            }
            return false;
        });
    }
    runOnce();
})();
