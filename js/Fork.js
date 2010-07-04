TrialTool.Fork = (function(){
    var runOnce = false;
    /**
     * Adds a new example li node in the parent node
     * @param {Object} parent
     */
    var newExample = function(){
        var li = $("<li>", {
            "class": "example",
            "id": Math.random()
        }).html(["<a class = 'example-name'>Edit example</a>", "<textarea class= 'script'>//Edit Me</textarea>", "<div class = 'example-docs'>Edit Docs<div>"].join(""));
        return li;
    };
    
    /**
     * Adds an LI to the example-set using which the user can add more examples or sets
     */
    var exampleForkButtons = function(){
        return $("<li>", {
            "class": "fork fork-buttons"
        }).html("Add <a class = 'fork-example'>example</a>|<a class = 'fork-example-set'>example-set</a>");
    };
    
    /**
     * Adds a toolbar to every example that lets you rename or delete the example
     */
    var exampleEdit = function(){
        var iconButton = function(name, desc){
            return $("<img>", {
                "class": name,
                "title": desc || "",
                "src": "images/" + name + ".png"
            });
        }
        
        var toolbar = $("<span>", {
            "class": "example-edit fork"
        });
        
        toolbar.append(iconButton("example-rename", "Rename this exaomple"));
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
        $("div#example-sets a.example-name").parent().append(exampleEdit());
        $("div#example-sets ul").append(exampleForkButtons());
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
        
        // Adding event listeners to example and set adder
        $("a.fork-example").live("click", function(e){
            newExample().insertBefore($(this).parent());
        });
        
        $("ul#toolbar a.fork-toolbar-button").live("click", function(e){
            switch ($(this).attr("id")) {
                case "fork":
                    startFork();
                    $(this).parent().hide();
                    break;
                case "cancel":
                    window.location.reload();
                case "save":
                    $(".fork").remove();
                    addToolBarButton("Fork", "fork");
                    exportFork();
            }
            e.preventDefault();
        });
        
        // Adding event listeners to example and set adder
        $("a.fork-example-set").live("click", function(e){
            var li = $("<li>", {
                "class": "example-set",
                "id": Math.random()
            }).html("<a class = 'example-set-name'>Edit example-set</a>").insertBefore($(this).parent());
            var example = newExample().appendTo($("<ul>").appendTo(li));
            exampleForkButtons().insertAfter(example);
        });
        
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
                button.parent().children().toggle();
            }
            else if (button.hasClass("example-text")) {
                a.text(button.siblings("input").val());
                button.parent().children().toggle();
            }
            else if (button.hasClass("example-cancel")) {
                a.text(button.siblings("input").attr("title"));
                button.parent().children().toggle();
            }
            
            return false;
        });
        
        runOnce = true;
    }
    
    // All other initialization logic
})();
