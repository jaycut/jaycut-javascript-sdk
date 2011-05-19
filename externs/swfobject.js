var swfobject = {};

/**
 * @param {string} swfUrlStr
 * @param {string} replaceElemIdStr
 * @param {string} widthStr
 * @param {string} heightStr
 * @param {string} swfVersionStr
 * @param {string} xiSwfUrlStr
 * @param {Object=} flashvarsObj
 * @param {Object=} parObj
 * @param {Object=} attObj
 * @param {function()=} callbackFn
 */
swfobject.embedSWF = function(swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {};

/* This stops window.swfobject from being mangled */
Window.prototype.swfobject = function() {};
