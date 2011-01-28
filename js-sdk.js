/*
 * Copyright (c) 2011, JayCut AB
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 */

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
    __options: {
        'version': 2,
        'applet': 'login',
        'loader': 'basicLoader',
        'chain': 'mixer',
        'chain_params': {},
        'embed_target': 'jaycut-editor',
        'embed_width': '100%',
        'embed_height': '100%',
        'uri_authority': '',
        'login_uri': '',
        'loader_uri': '',
        'app_uri': '',
        'sitename': '',
        'sitename_in_path': false,
        'api_host': 'api.jaycut.com'
    },
    __flashvars: {},
    __flashparams: {
        wmode: 'window',
        allowScriptAccess: 'always',
        allowFullScreen: 'true',
        bgcolor: '#000000'
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
    init: function(options) {
        for (var key in options) {
            if (key == 'flashparams') {
                for (var k in options['flashparams']) {
                    this.__flashparams[k] = options['flashparams'][k]
                }
            } else if (this.__options[key] != null) {
                this.__options[key] = options[key];
            } else {
                // pass this on as a flashVar, making sure it is camelCase
                this.__flashvars[underscoreToCamel(key)] = options[key];
            }
        }

        // Build the uri_authority from sitename and api-host
        if (options['uri_authority'] == null) {
            this.__options['uri_authority'] = '';
            if (!this.__options['sitename_in_path']) {
                this.__options['uri_authority'] += this.__options['sitename'] + '.'
            }
            this.__options['uri_authority'] += this.__options['api_host'];
        }

        if (options['loader_uri'] == null) {
            this.__options['loader_uri'] = 'http://' + this.__options['uri_authority'] + '/assets/flash/ApplicationLoader.swf'
        }

        if (this.__options['app_uri'] == '') {
            this.__options['app_uri'] = 'http://' + this.__options['uri_authority'];
            if (this.__options['sitename_in_path']) {
                this.__options['app_uri'] += '/sites/' + this.__options['sitename'];
            }
            this.__options['app_uri'] += '/applets/' + this.__options['applet'] + '.xml';
            this.__options['app_uri'] += '?version=' + this.__options['version'];
            this.__options['app_uri'] += '&loader=' + this.__options['loader'];


            if (this.__options['chain'] != false) {
                this.__options['app_uri'] += '&chain=' + this.__options['chain'];

                // Let chained applet use same loader unless otherwise specified
                if (this.__options['chain_params']['loader'] == null) {
                    this.__options['chain_params']['loader'] = this.__options['loader'];
                }

                this.__options['app_uri'] += build_chain_params(this.__options['chain_params']);
            }
        }

        this.__flashvars.applicationUri = encodeURIComponent(this.__options['app_uri']);

        if (this.__options['login_uri'] != null) {
            this.__flashvars.loginUri = encodeURIComponent(this.__options['login_uri']);
        }

        ensureSWFObjectScriptIsLoaded();

        __run_when_swfobject_available(function() {
            swfobject.embedSWF(_jaycut.__options['loader_uri'], _jaycut.__options['embed_target'],
                               _jaycut.__options['embed_width'], _jaycut.__options['embed_height'], '9.0.0',
                               _jaycut.__options['loader_uri'], _jaycut.__flashvars, _jaycut.__flashparams);
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

function underscoreToCamel(str){
    return str.replace(/(_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});
};

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
