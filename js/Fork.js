TrialTool.Fork = (function(){
    var runOnce = false;
    var isEditingExample = false;
    
    /**
     * Adds a toolbar to every example that lets you rename or delete the example
     */
    var exampleEdit = function(category){
        var iconButton = function(name, desc){
            return $("<img>", {
                "class": name,
                "title": desc || "",
                "src": "images/" + name + ".png"
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
    var addToolBarButton = function(name, id, desc){
        $("ul#toolbar").append($("<li>", {
            "class": "fork"
        }).append($("<a>", {
            "id": id,
            "href": "#" + id,
            "class": "fork-toolbar-button",
            "title": desc
        }).html(name)));
    };
    
    /**
     * Removes the effect of forking and exports the examples in a new file
     */
    var exportFork = function(){
        $(".fork").remove();
    }
    
    /**
     * Starts the forking process
     */
    var startFork = function(){
        addToolBarButton("Save Fork", "save", "Save and export this example");
        addToolBarButton("Cancel Fork", "cancel", "Cancel forking this example and return to the examples");
        
        exampleEdit().insertAfter("a.example-name");
        exampleEdit("example-set").insertAfter("a.example-set-name");
        
        $("li.example-set, li.example").draggable({
            "axis": "y",
            "containment": "div#example-sets",
            "scope": "example-reorder",
            "handle": "img.example-move",
            "revert": "true",
            "helper": "clone",
            "start": function(e, ui){
                isEditingExample = true;
            },
            "stop": function(){
                isEditingExample = false;
            }
        });
        $("a.example-name, a.example-set-name").droppable({
            "hoverClass": "example-reorder-hover",
            "scope": "example-reorder",
            "greedy": "false",
            "accept": "li.example-set, li.example",
            "drop": function(e, ui){
                if ($(this).hasClass("example-set-name")) {
                    $(ui.draggable).appendTo($(this).siblings("ul"));
                }
                else {
                    $(ui.draggable).insertAfter($(this).parent());
                }
                
            }
        });
    }
    
    var endFork = function(){
        $(".fork").remove();
    }
    
    // This is the initialization function. Should be run only once
    if (!runOnce) {
        //Adding the forking CSS file
        var css = document.createElement("link");
        css.rel = "stylesheet";
        css.type = "text/css";
        css.href = "css/fork.css";
        document.getElementsByTagName("head")[0].appendChild(css);
        addToolBarButton("Fork", "fork");
        
        $("ul#toolbar a.fork-toolbar-button").live("click", function(e){
            switch ($(this).attr("id")) {
                case "fork":
                    startFork();
                    $(this).parent().hide();
                    break;
                case "cancel":
                    window.location.reload();
                case "save":
                    endFork();
                    addToolBarButton("Fork", "fork");
                    exportFork();
                    break;
            }
            e.preventDefault();
            e.stopPropagation();
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
        
        runOnce = true;
    }
    
    // All other initialization logic
})();
