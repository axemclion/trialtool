var Fork = (function(){
    var isForking = false;
    //Adding the forking CSS file
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.type = "text/css";
    css.href = "css/fork.css";
    document.getElementsByTagName("head")[0].appendChild(css);
    
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
    var exampleForker = function(){
        return $("<li>", {
            "class": "fork"
        }).html("Add <a class = 'fork-example'>example</a>|<a class = 'fork-example-set'>example-set</a>");
    };
    
    
    // Adding the fork button to the toolbar
    $("ul#toolbar").append($("<li>").append($("<a>", {
        "href": "#fork",
        "id": "fork"
    }).html("Fork").click(function(){
        $("#example-sets ul").append(exampleForker());
        isForking = true;
    })));
    
    // Adding event listeners to example and set adder
    $("a.fork-example").live("click", function(e){
        newExample().insertBefore($(this).parent());
    });
    // Adding event listeners to example and set adder
    $("a.fork-example-set").live("click", function(e){
        var li = $("<li>", {
            "class": "example-set",
            "id": Math.random()
        }).html("<a class = 'example-set-name'>Edit example-set</a>").insertBefore($(this).parent());
        var example = newExample().appendTo($("<ul>").appendTo(li));
        exampleForker().insertAfter(example);
    });
    
})();
