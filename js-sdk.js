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
    __options: {
	'version': 2,
	'applet': 'login',
	'chain': 'mixer',
	'chain_params': {},
	'embed_target': 'jaycut-editor',
	'embed_width': '100%',
	'embed_height': '100%'
    },
    __flashvars: {},
    __flashparams: {
	wmode: 'window',
	allowScriptAccess: 'always',
	allowFullScreen: 'true',
	bgcolor: '#000000',
    },
    __flashoptions: {
	'noHelp': true,
	'noUpload': true,
	'noPublish': true,
	'noFullscreen': true,
	'noOpenSave': true,
	'noWebcam': true,
	'noMicrophone': true,
	'mix': true,
	'remix': true,
	'redirectOnPublish': true,
	'redirectWindow': true,
	'requireMixName': true,
	'locale': true,
	'helpUri': true
    },

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
    init: function(options) {
	if (options != null) {
	    for (var key in options) {
		if (key == 'flashparams') {
		    for (var k in options['flashparams']) {
			this.__flashparams[k] = options['flashparams'][k]
		    }
		} else if (this.__flashoptions[key] == true) {
		    this.__flashvars[key] = options[key];
		} else {
		    this.__options[key] = options[key]
		}
	    }
	}

	if (this.__loaderUri == null) {
	    this.__loaderUri = 'http://' + this.__options['uri_authority'] + '/assets/flash/ApplicationLoader.swf'
	}

	if (this.__appUri == null) {
	    this.__appUri = 'http://' + this.__options['uri_authority'];
	    this.__appUri += '/applets/' + this.__options['applet'] + '.xml';
	    this.__appUri += '?chain=' + this.__options['chain'];
	    this.__appUri += '&version=' + this.__options['version'];
	    this.__appUri += build_chain_params(this.__options['chain_params']);
	}

	this.__flashvars.applicationUri = encodeURIComponent(this.__appUri);

	if (this.__options['login_uri'] != null) {
	    this.__flashvars.loginUri = encodeURIComponent(this.__options['login_uri']);
	}

	ensureSWFObjectScriptIsLoaded();

	__run_when_swfobject_available(function() {
	    swfobject.embedSWF(_jaycut.__loaderUri, _jaycut.__options['embed_target'],
			       _jaycut.__options['embed_width'], _jaycut.__options['embed_height'], '9.0.0',
			       _jaycut.__loaderUri, _jaycut.__flashvars, _jaycut.__flashparams);
	});
    }
};

var __run_when_swfobject_available = function(func) {
    if (window.swfobject !== undefined)
	func();
    else
	setTimeout(function() { __run_when_swfobject_available(func) }, 50);
}

function isArray(obj) {
    return obj.constructor == Array;
}

function isString(obj) {
    return obj.constructor == String;
}

function build_chain_params(cp_hash) {
    var result = ''
    var parts = __bcps(cp_hash);
    for (var i in parts) {
	result += '&chain_params' + parts[i]
    }
    return result;
}

function __bcps(x) {
    if (isString(x)) {
	return ['=' + x]
    } else if (isArray(x)) {
	var res = new Array()
	for (var elem in x) {
	    var parts = __bcps(x[elem])
	    for (var part in parts) {
		res.push('[]' + parts[part]);
	    }
	}
	return res;
    } else {
	var res = new Array()
	for (var key in x) {
	    var parts = __bcps(x[key])
	    for (var part in parts) {
		res.push('[' + key + ']' + parts[part]);
	    }
	}
	return res;
    }
}

var JC = _jaycut; // shorthand!
