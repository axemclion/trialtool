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
            "class": "fork"
        }).html("Add <a class = 'fork-example'>example</a>|<a class = 'fork-example-set'>example-set</a>");
    };
    
    var addToolBarButton = function(name, id){
        $("ul#toolbar").append($("<li>").append($("<a>", {
            "id": id,
            "href": "#" + id,
            "class": "fork-toolbar-button"
        }).html(name)));
    };
    
    /**
     * Removes the effect of forking and exports the examples in a new file
     */
    var saveFork = function(){
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
        
        // Adding event listeners to example and set adder
        $("a.fork-example").live("click", function(e){
            newExample().insertBefore($(this).parent());
        });
        
        $("ul#toolbar a.fork-toolbar-button").live("click", function(e){
        
            switch ($(this).attr("id")) {
                case "fork":
                    $("div#example-sets ul").append(exampleForkButtons());
                    addToolBarButton("Save Fork", "save");
                    $(this).parent().hide();
                    addToolBarButton("Cancel Fork", "cancel");
                    break;
                case "cancel":
                    window.location.reload();
                case "save":
                    $(".fork").remove();
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
        runOnce = true;
    }
})();
