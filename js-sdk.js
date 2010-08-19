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
	
	__event_handlers: {},
	__loaderUri: null,
	__appUri:  null,
	__chainUri: null,

	subscribe: function(event_name, func) {
		this.__event_handlers[event_name] = func;
	},
	trigger: function(event_name, data) {
		var func = this.__event_handlers[event_name]; 
		if (func != null) {
			if (data)	
				return func(data);
			else
				return func();
		}		
	},
	overrideLoaderUri: function(uri) {
		this.__loaderUri = uri;		
	},
	overrideApplicationUri: function(uri) {
		this.__appUri = uri;	
	},
	overrideChainUri: function(uri) {
		this.__chainUri = uri;
	},
	init: function(uri_authority, login_uri) {	
		
		if (this.__loaderUri == null)                              
			this.__loaderUri = 'http://' + uri_authority + '/assets/flash/ApplicationLoader.swf'
	    
        if (this.__appUri == null)
			this.__appUri = 'http://' + uri_authority + '/applets/login.xml?chain=mixer';
	    
		var flashvars = {};
		flashvars.applicationUri = encodeURIComponent(this.__appUri);
	    if (login_uri == null)
			// Why does this work?
			flashvars.loginUri = encodeURIComponent(this.__loaderUri);
		else
        	flashvars.loginUri = encodeURIComponent(login_uri);       
        if (this.__chainUri != null)
			flashvars.chainUri = this.__chainUri;

	    var params = {};
	    params.wmode = 'window';
	    params.allowScriptAccess = 'always';
	   	params.allowFullScreen = 'true';
	    params.bgcolor = '#000000';
	  	
		ensureSWFObjectScriptIsLoaded();
		
		__run_when_swfobject_available(function() {
			swfobject.embedSWF(_jaycut.__loaderUri, 'jaycut-editor', '100%', '100%', '9.0.0', _jaycut.__loaderUri, flashvars, params);
		});			
	}
};

var __run_when_swfobject_available = function(func) {
	if (window.swfobject !== undefined)
		func();
	else
		setTimeout(function() { __run_when_swfobject_available(func) }, 50);
} 
 
 
var JC = _jaycut; // shorthand!               


