var ConsoleHelper = (function() {
	$("span.log-object, span.log-array").live("click", function(e) {
		e.stopPropagation();
		$(this).children("ul, ol").toggle();
		if ($(this).children("ul, ol").css("display") !== "none") {
			$(this).addClass("log-opened");
		} else {
			$(this).removeClass("log-opened");
		}
	});

	var getDomFromJSON = function(data) {
		var result = [];
		if (Object.prototype.toString.apply(data) === '[object Array]') {
			result = [ "<span class = 'log-array'>&nbsp;<u>[Array : ", data.length, "]</u>&nbsp;" ];
			result.push("<ol start = 0 style = 'display:none'>");
			for ( var i = 0; i < data.length; i++) {
				result.push("<li>");
				try{
					result.push(getDomFromJSON(data[i]));
				}
				catch(e){
					result.push("unknown");
				}
				result.push("</li>")
			}
			result.push("</ol></span>");
		} else if (typeof (data) === "object") {
			result = [ "<span class = 'log-object'>&nbsp;<u>[Object]</u>&nbsp;" ];
			result.push("<ul style = 'display:none'>");
			for (x in data) {
				result.push("<li>" + x);
				try{
					result.push(":" + getDomFromJSON(data[x]));
				} 
				catch(e) {
					result.push(x);
				}
				result.push("</li>")
			}
			result.push("</ul></span>");
		} else {
			result = [ "<span class = 'log-item'>", String(data).replace(/</g, "&lt;").replace(/>/g, "&gt;"), "</span>" ];
		}
		return result.join("");
	}

	var write = function() {
		var text = document.createElement("div");
		var msg = [];
		for ( var i = 0; i < arguments.length; i++) {
			msg.push(getDomFromJSON(arguments[i]));
		}
		text.className = "log";
		text.innerHTML = [ "<span class='log-time'>[", new Date().toLocaleTimeString(), "]&nbsp;</span>" ].join("") + msg.join(" ");
		document.getElementById("console").appendChild(text);
		window.scroll(0, $("#console").height());
		return text;
	};

	var writeError = function(e) {
		if (e && e.name && e.message) {
			e = e.name + ":" + e.message;
		}
		write(e).style.color = "RED";
	}

	// Setting the properties for the global object
	document.write = window.write = write;
	window.writeError = writeError;

	return {
		"write" : write,
		"writeError" : writeError,
		/**
		 * Adds HTML content to the specified parent, in the console
		 * 
		 * @param {Object}
		 *            htmlCode
		 * @param {Object}
		 *            parent
		 */
		"addHtml" : function(htmlCode, parent) {
			if (!parent) {
				parent = "div#console";
			}
			jQuery(parent).append(htmlCode);
		},
		/**
		 * Adds the CSS code to the console
		 * 
		 * @param {Object}
		 *            cssCode
		 */
		"addCss" : function(cssCode) {
			var style = document.createElement('style');
			var rules = document.createTextNode(cssCode);
			style.type = 'text/css';
			if (style.styleSheet)
				style.styleSheet.cssText = rules.nodeValue;
			else
				style.appendChild(rules);
			document.getElementsByTagName('head')[0].appendChild(style);
		},

		runCode : function(src) {
			try {
				if (window.execScript) {
					window.execScript(src);
					return;
				}
				var fn = function() {
					window.eval.call(window, src);
				};
				fn();
			} catch (e) {
				writeError(e);
			}
		},

		"waitFor" : function(varName, callback) {
			var count = 0;
			var timerHandle = window.setInterval(function() {
				try {
					if (!eval(varName)) {
						throw varName + "not defined";
					}
					window.clearInterval(timerHandle);
					callback();
				} catch (e) {
					if (count === 3)
						write(varName, "not defined yet. You may have to run the pre-requisites for this example first.");
					else if (count > 10) {
						write(varName, "not defined even after 10 seconds, so aborting operation");
						write(callback)
						window.clearInterval(timerHandle);
					}
					count++;
					// console.log(varName, window[varName], e)
				}
			}, 1000);
			return timerHandle;
		}
	}
})();
