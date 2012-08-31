/*
 * OAjax jQuery plugin  
 * Perform an asynchronous HTTP (Ajax) request with OAuth
 *
 * @copyright 2012 Polonious Pty Ltd.
 * @website https://github.com/polonious/jquery-oajax/
 * @author Ted Liang <tedliang[dot]email[at]gmail[dot]com>
 * @version 1.0
 *  
 * Licensed under the MIT License
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Examples:
 * Init
 * 	$.oajax("init", {baseUrl:"http://regimo.poloniouslive.com", client:"cGhvbmVnYXBAcmVnaW1vOnJnbXBnMTBwc3c=", login: function(){console.log("open login dialog...");}});
 * Ajax call
 * 	$.oajax({url: "/rest/user/profile"}).done(function(data){console.log(data);}).fail(function(jqXHR, textStatus){console.log(textStatus);console.log(jqXHR.responseText);});
 * Login
 * 	$.oajax("login", "usernameFromInput", "passwordFromInput");
 *
 */
(function($) {

	"use strict";
	
	var tokens = {}, loginProcess = null, oajax = {
		baseUrl: "",
		tokenUrl: "/oauth/token",
	}, getUrl = function(path){
		return (oajax.baseUrl && path.indexOf(oajax.baseUrl)==-1) ? oajax.baseUrl + path : path;
	}, isTokenExpired = function(token){
		return (new Date().valueOf() - token.timestamp) > token.expiresIn * 1000;
	}, initLoginProcess = function(){
		loginProcess = $.Deferred();
		loginProcess.tokenPromise = loginProcess.pipe(function(credential){
			return tokenProcess(credential);
		});
	}, tokenProcess = function(data){
		return $.ajax({
			url: getUrl(oajax.tokenUrl),
			type: "post",
			dataType: "json",
			data: data,
			headers: {Authorization: "Basic "+oajax.client}
		});
	}, saveToken = function(grantType, token){
		if(token){
			token.timestamp = new Date().valueOf();
			tokens[grantType] = token;
    	}
	}, resourceProcess = function(options, token){
		options.url = getUrl(options.url);
		options.headers =  $.extend(options.headers, {
			Authorization: "Bearer "+token.access_token
		});
    	return $.ajax(options);
	}, methods = {
		init : function(settings) {
			$.extend(oajax, settings);
			initLoginProcess();
		},
		ajax : function(options, grantType) {
			grantType = (grantType || "owner").toLowerCase();

			var token = tokens[grantType];
			if (token && token.access_token) {
				if (isTokenExpired(token)) {
					// TODO: handle accessToke expire, obtain new accessToke by refreshToken
					// handle refreshToken expire?
					return tokenProcess({
							grant_type: "refresh_token", 
							refresh_token: token.refresh_token
						}).pipe(function(token) {
							saveToken(grantType, token);
							return resourceProcess(options, token);
						});
				} else {
					return resourceProcess(options, token);
				}
			} else if (grantType=="client") {
				return tokenProcess({
						grant_type: "client_credentials"
					}).pipe(function(token) {
						saveToken(grantType, token);
						return resourceProcess(options, token);
					});
			} else {
				// call the login function, solved loginProcess directly if credential returned
				if($.isFunction(oajax.login)){
					var credential = oajax.login();
					if(credential) method.login(credential.username, credential.password);
				}

				return loginProcess.tokenPromise.pipe(function(token){
					saveToken(grantType, token);
					return resourceProcess(options, token);
				});
			}
		},
		login : function(username, password) {
			if(username){
				if(loginProcess.state() != "pending") initLoginProcess();
				loginProcess.resolve({
					grant_type: "password",
					username: username, 
					password: password
				});
			}
			return loginProcess.tokenPromise;
		}
	};

	$.oajax = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(
					arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.ajax.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.oajax');
		}
	};

	// load configuration from attribute data-oajax-config in script tag if exist
	var config = $("script[data-oajax-config]").first().attr("data-oajax-config");
	if( config ) $.extend(oajax, eval("({" + config + "})"));
		

})(jQuery);