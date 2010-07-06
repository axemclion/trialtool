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
    var toolBarButton = function(name, desc){
        $("ul#fork-toolbar").append($("<li>", {
            "class": "fork"
        }).append($("<a>", {
            "id": name.replace(/\W/g, "_"),
            "href": "#" + name.replace(/\W/g, "_"),
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
        toolBarButton("Save Fork", "Save and export this example");
        toolBarButton("Cancel Fork", "Cancel forking this example and return to the examples");
        
        $("div#code-area").append($("<ul>", {
            "class": "fork toolbar floating-toolbar"
        }).append(toolBarButton("Save Code", "Save this code")));
        
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
    }
    
    var endFork = function(){
        $(".fork").remove();
    }
    
    // This is the initialization function. Should be run only once
    var runOnce = function(){
        //Adding the forking CSS file
        var css = document.createElement("link");
        css.rel = "stylesheet";
        css.type = "text/css";
        css.href = "css/fork.css";
        document.getElementsByTagName("head")[0].appendChild(css);
        toolBarButton("Fork", "Create a new example based on this example");
        
        // Adding the toolbar where fork buttons will be added 
        $("<ul>", {
            "id": "fork-toolbar"
        }).appendTo("div#examples-title");
        toolBarButton("Fork", "Create a new example based on this example");
        
        $("a.fork-toolbar-button").live("click", function(e){
            switch ($(this).attr("id")) {
                case "Fork":
                    startFork();
                    $(this).parent().remove();
                    break;
                case "Cancel_Fork":
                    window.location.reload();
                case "Save_Fork":
                    endFork();
                    exportFork();
                    toolBarButton("Fork", "Create a new example based on this example");
                    break;
                case "Save_Code":
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
    }
    runOnce();
})();
