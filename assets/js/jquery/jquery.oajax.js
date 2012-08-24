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
 * 	$.oajax("init", {tokenUrl:"/oauth/token", client:"cGhvbmVnYXBAcmVnaW1vOnJnbXBnMTBwc3c=", login: function(){console.log("open login dialog...");}});
 * Ajax call
 * 	$.oajax({url: "/rest/user/profile", type: "GET", dataType: "json"}).done(function(data){console.log(data);}).fail(function(jqXHR, textStatus){console.log(textStatus);console.log(jqXHR.responseText);});
 * Login
 * 	$.oajax("login", "usernameFromInput", "passwordFromInput");
 *
 */
(function($) {

	"use strict";
	
	var oajax = {}, token = {}, loginTask = null, getAccessToken = function(data){
		return $.ajax({
			url: oajax.tokenUrl,
			type: "post",
			dataType: "json",
			data: data,
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", "Basic "+oajax.client);
			}
		});
	}, methods = {
		init : function(settings) {
			$.extend(oajax, settings);
		},
		ajax : function(options, grantType) {
			grantType = (grantType || "owner").toLowerCase();
			options.beforeSend = function(xhr){
				xhr.setRequestHeader("Authorization", "Bearer "+token[grantType].access_token);
			};
			if (token[grantType] && token[grantType].access_token) {
				// TODO: handle accessToke expire
				return $.ajax(options);
			} else if (grantType=="client") {
				return getAccessToken.call(this, {grant_type: "client_credentials"}).pipe(function(data) {
			    	token[grantType] = data;
			    	return $.ajax(options);
			    });
			} else {
				loginTask = $.Deferred();
				if($.isFunction(oajax.login)) oajax.login(loginTask);
				return loginTask.pipe(function(credential){
					return getAccessToken.call(this, credential);
				}).pipe(function(data){
			    	token[grantType] = data;
			    	return $.ajax(options);
			    });
			}
		},
		login : function(username, password) {
			if(loginTask){
				loginTask.resolve({
					grant_type: "password",
					username: username, 
					password: password
				});
			}
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