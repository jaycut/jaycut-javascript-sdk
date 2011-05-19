"use strict";
/*global swfobject */

/**
 * @license Copyright (c) 2011, JayCut AB
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 */



var _jaycut = {

  __event_handlers: {},
  __options: {
    // Options that are non-flashvars, non-flash parameters, and their default values.
    'version': 2, // Use version 2 as default, 1 is deprecated.
    'applet': 'login',
    'loader': 'basicLoader',
    'chain': 'mixer',
    'chain_params': {},
    'embed_target': 'jaycut-editor', // Target HTML element ID
    'embed_width': '100%',
    'embed_height': '100%',
    'uri_authority': '',
    'login_uri': '',
    'loader_uri': '',
    'app_uri': '',
    'sitename': '',
    'sitename_in_path': false,
    'api_host': 'api.jaycut.com',
    'use_ssl': false
  },

    __flashvars: {
      'bgcolor': '#000000'
    },
    __flashparams: {
        'wmode': 'window',
        'allowScriptAccess': 'always',
        'allowNetworking': 'all',
        'allowFullScreen': 'true'
    },

    'embed_mixer': function(options) {

        var p_target;

        if (options['login_uri'] == null) {
            options['applet'] = 'mixer';
            options['chain'] = false;
            p_target = 'applet_params';
        } else {
            options['applet'] = 'login';
            options['chain'] = 'mixer';
            p_target = 'chain_params';
        }

        // feeds, filter and styles are parameters to the mixer
        // applet so they need to move either into chain_params
        // or applet_params.
        _jaycut.__move_keys(options, ['feeds', 'filter', 'styles'], p_target)

        // Now we're all set to call init
        _jaycut.init(options);
    },

    'embed_uploader': function(options) {

        var p_target;

        if (options['login_uri'] == null) {
            options['applet'] = 'uploader';
            options['chain'] = false;
            p_target = 'applet_params';
        } else {
            options['applet'] = 'login';
            options['chain'] = 'uploader';
            p_target = 'chain_params';
        }

        _jaycut.__move_keys(options, ['styles'], p_target);

        options['embed_width'] = '735px';
        options['embed_height'] = '320px';

        _jaycut.init(options);
    },

    'embed_recorder': function(options) {

        var p_target;

        if (options['login_uri'] == null) {
            options['applet'] = 'recorder';
            options['chain'] = false;
            p_target = 'applet_params';
        } else {
            options['applet'] = 'login';
            options['chain'] = 'recorder';
            p_target = 'chain_params';
        }

        _jaycut.__move_keys(options, ['styles'], p_target);

        options['embed_width'] = '735px';
        options['embed_height'] = '320px';

        _jaycut.init(options);
    },

    'subscribe': function(event_name, func) {
        _jaycut.__event_handlers[event_name] = func;
    },

    'trigger': function(event_name, data) {
        var func = _jaycut.__event_handlers[event_name];
        if (func != null) {
            if (data)
                return func(data);
            else
                return func();
        }
    },

    init: function(options) {

        __ensureSWFObjectScriptIsLoaded();
		__ensureJSONIsAvailable();

        __run_when_all_scripts_available(function() {

	    	for (var key in options) {
	            if (key == 'flashparams') {
	                for (var k in options['flashparams']) {
	                    _jaycut.__flashparams[k] = options['flashparams'][k]
	                }
	            } else if (_jaycut.__options[key] != null) {
	                // If it's part of the existing options, it's not a flashvar, just set it.
	                _jaycut.__options[key] = options[key];
	            } else if (key == 'applet_params') {
	                //these are parameters that should be added to app_uri
	                //leave them alone.
	            } else {
	                // If it's not in __options, it's considered a flashvar.
	                var value = options[key];
	                if (isArray(value)) {
	                  value = JSON.stringify(value);
	                }
					value = encodeURIComponent(value);
	                // pass this on as a flashVar, making sure it is camelCase
	                _jaycut.__flashvars[underscoreToCamel(key)] = value;
	            }
	        }

	        // If no bgcolor set via flashparams, use from flashvars.
	        if (_jaycut.__flashparams['bgcolor'] == null)
	          _jaycut.__flashparams['bgcolor'] = _jaycut.__flashvars['bgcolor'];


	        // Build the uri_authority from sitename and api-host
	        if (options['uri_authority'] == null) {
	            _jaycut.__options['uri_authority'] = '';
	            if (!_jaycut.__options['sitename_in_path']) {
	                _jaycut.__options['uri_authority'] += _jaycut.__options['sitename'] + '.'
	            }
	            _jaycut.__options['uri_authority'] += _jaycut.__options['api_host'];
	        }


	        // Figure out if we're supposed to use https
	        var protocol = _jaycut.__options['use_ssl'] ? 'https' : 'http';

	        if (options['loader_uri'] == null) {
	            _jaycut.__options['loader_uri'] = protocol + '://' + _jaycut.__options['uri_authority'] + '/assets/flash/ApplicationLoader.swf'
	        }

	        if (_jaycut.__options['app_uri'] == '') {
	            _jaycut.__options['app_uri'] = protocol + '://' + _jaycut.__options['uri_authority'];
	            if (_jaycut.__options['sitename_in_path']) {
	                _jaycut.__options['app_uri'] += '/sites/' + _jaycut.__options['sitename'];
	            }
	            _jaycut.__options['app_uri'] += '/applets/' + _jaycut.__options['applet'] + '.xml';
	            _jaycut.__options['app_uri'] += '?version=' + _jaycut.__options['version'];
	            _jaycut.__options['app_uri'] += '&loader=' + encodeURIComponent(_jaycut.__options['loader']);

	            //Add any explicitly stated query parameters to app_uri
	            var extra_params = hash_to_querystring(options['applet_params']);
	            if (extra_params != "") {
	                _jaycut.__options['app_uri'] += '&' + extra_params
	            }

	            if (_jaycut.__options['chain'] != false) {
	                _jaycut.__options['app_uri'] += '&chain=' + _jaycut.__options['chain'];

	                // Let chained applet use same loader unless otherwise specified
	                if (_jaycut.__options['chain_params']['loader'] == null) {
	                    _jaycut.__options['chain_params']['loader'] = _jaycut.__options['loader'];
	                }

	                _jaycut.__options['app_uri'] += '&' + hash_to_querystring({ 'chain_params': _jaycut.__options['chain_params'] });
	            }
	        }

	        _jaycut.__flashvars.applicationUri = encodeURIComponent(_jaycut.__options['app_uri']);

	        if (_jaycut.__options['login_uri'] != null) {
	            _jaycut.__flashvars.loginUri = encodeURIComponent(_jaycut.__options['login_uri']);
	        }

            swfobject.embedSWF(_jaycut.__options['loader_uri'], _jaycut.__options['embed_target'],
                               _jaycut.__options['embed_width'], _jaycut.__options['embed_height'], '9.0.0',
                               _jaycut.__options['loader_uri'], _jaycut.__flashvars, _jaycut.__flashparams
                                                           );
        });
    },

    /**
     * Forces the mixer out of any fullscreen mode.
     **/
    leaveFullscreen: function() {
      _jaycut.__flashElement().leaveFullscreen();
    },

    /**
     * Restructure hash by making the specified keys
     *  subkeys to new_parent
     **/
    __move_keys: function(hash, keys, new_parent) {
        for (var i=0; i < keys.length; i++) {
            if (hash[keys[i]] != null) {
                // initialize the new parent if it's missing
                if (hash[new_parent] == null)
                    hash[new_parent] = {};

                // move the value into the new position
                hash[new_parent][keys[i]] = hash[keys[i]]
                delete hash[keys[i]]
            }
        }
    },

    /**
     * Returns the actual flash element (the SWF). Mainly used to call
     * methods in Flex from JS.
     */
    __flashElement: function() {
        return document.getElementById(_jaycut.__options.embed_target);
    }
};



/**
 * Includes SWFObject if it's not already loaded on the page.
 **/
function __ensureSWFObjectScriptIsLoaded() {
    if (window.swfobject !== undefined) {
        // Already loaded on the calling domain, don't include twice.
        return;
    }
	__loadExternalScript('swfObjectScript',
			     'https://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js');
}

/**
 * Some browsers doesn't include the JSON object, and in those cases
 * we need to load it externally. Thank you, cdnjs.com!
 **/
function __ensureJSONIsAvailable() {
    if (typeof(JSON) != 'undefined') {
        // Already present (IE8+) no need to load.
        return;
    }
	__loadExternalScript('json2Script',
			     'http://ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js');
}

function __loadExternalScript(id, url) {
	var head = document.getElementsByTagName("head")[0];
    var script = document.createElement('script');
    script.id = id;
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
}

/**
 * Patiently waits until dependencies is loaded,
 * then calls the passed function func. Make sure you call
 * __ensureSWFObjectScriptIsLoaded and __ensureJSONIsAvailable before calling this!
 *
 * @param {function()} func The closure to call when all dependencies is loaded.
 *
 **/
var __run_when_all_scripts_available = function(func) {
    if (window.swfobject !== undefined && typeof(JSON) != 'undefined')
        func();
    else
        setTimeout(function() { __run_when_all_scripts_available(func) }, 50);
}

function isArray(obj) {
    return obj.constructor == Array;
}

function isString(obj) {
    return obj.constructor == String;
}

function underscoreToCamel(str){
    return str.replace(/(_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});
};

function hash_to_querystring(hash) {
    var parts = __query_parts(hash, true);

    var result = parts[0];

    for (var i=1; i < parts.length; i++) {
        result += '&' + parts[i];
    }
    return result;
}

function __query_parts(x, root) {
    if (x == null) {
        return [''];
    } else if (isString(x) || typeof(x) == 'number') {
        return ['=' + x]
    } else if (isArray(x)) {
        var res = new Array()
        for (var i = 0; i < x.length; i++) {
            var parts = __query_parts(x[i], false)
            for (var j = 0; j < parts.length; j++) {
                res.push('[]' + parts[j]);
            }
        }
        return res;
    } else {
        var res = new Array()
        for (var key in x) {
            var parts = __query_parts(x[key], false)
            for (var i = 0; i < parts.length; i++) {
                if ( !root) {
                    res.push('[' + key + ']' + parts[i]);
                } else {
                    res.push(key + parts[i]);
                }
            }
        }
        return res;
    }
}

//var JC = _jaycut; // shorthand!
window['JC'] = _jaycut;
