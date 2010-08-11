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
	__loaderUri = null,
	__appUri = null,

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
	overrideLoaderUri = function(uri) {
		this.__loaderUri = uri;		
	},
	overideApplicationUri = function(uri) {
		this.__appUri = uri;	
	},
	init: function(site_name, login_uri) {	
		
		if (this.__loaderUri == null)                              
			this.__loaderUri = 'http://' + site_name + '.api.jaycut.com/assets/flash/ApplicationLoader.swf'
	    
        if (this.__appUri == null)
			this.__app_Uri = 'http://' + site_name + '.api.jaycut.com/applets/login.xml?chain=mixer';
	    
		var flashvars = {};
		flashvars.applicationUri = encodeURIComponent(this.__app_Uri);
	    flashvars.loginUri = encodeURIComponent(this.__loaderUri);

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
 
 




