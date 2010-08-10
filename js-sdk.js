function ensureSWFObjectScriptIsLoaded() {
  if (window.swfobject !== undefined) { 
	// Already loaded on the calling domain, don't include twice.
    return;
  }
  var head = document.getElementsByTagName("head")[0];
  script = document.createElement('script');
  script.id = 'swfObjectScript';
  script.type = 'text/javascript';
  script.src = "http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js";
  head.appendChild(script);
}

var _jaycut = {
	__event_handlers: [],
	subscribe: function(event_name, func) {
		// TODO: Validate event name
		_jaycut.__event_handlers[event_name] = func;
	},
	trigger: function(event_name, data) {
		if (this.__event_handlers[event_name] != null) {
			var func = _jaycut.__event_handlers[event_name];
			func(data);
		}		
	},
	init: function(site_name, login_uri) {	
		var loaderUrl = 'http://' + site_name + '.api.jaycut.com/assets/flash/ApplicationLoader.swf'
	    var flashvars = {};

		var app_url = 'http://' + site_name + '.api.jaycut.com/applets/login.xml?chain=mixer';
	    flashvars.applicationUri = encodeURIComponent(app_url);
	    flashvars.loginUri = encodeURIComponent(login_uri);

	    var params = {};
	    params.wmode = 'window';
	    params.allowScriptAccess = 'always';
	   	params.allowFullScreen = 'true';
	    params.bgcolor = '#000000';
	  	
		ensureSWFObjectScriptIsLoaded();
		
		__run_when_swfobject_available(function() {
			swfobject.embedSWF(loaderUrl, 'jaycut-editor', '100%', '100%', '9.0.0', loaderUrl, flashvars, params);
		});			
	}	
};

var __run_when_swfobject_available = function(func) {
	if (window.swfobject !== undefined)
		func();
	else
		setTimeout(function() { __run_when_swfobject_available(func) }, 50);
} 
 
 




