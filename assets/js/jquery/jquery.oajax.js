/*
 * OAjax jQuery plugin
 * Perform an asynchronous HTTP (Ajax) request with OAuth
 *
 * @copyright 2012 Polonious Pty Ltd.
 * @website https://github.com/polonious/jquery-oauth/
 * @author Ted Liang <tedliang[dot]email[at]gmail[dot]com>
 * @version 1.0
 *
 * Licensed under the MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Examples:
 * Init
 * 	$.oauth("init", {baseUrl:"http://regimo.poloniouslive.com", client:"cGhvbmVnYXBAcmVnaW1vOnJnbXBnMTBwc3c=", login: function(){console.log("open login dialog...");}});
 * Ajax call
 * 	$.oauth({url: "/rest/user/profile"}).done(function(data){console.log(data);}).fail(function(jqXHR, textStatus){console.log(textStatus);console.log(jqXHR.responseText);});
 * Login
 * 	$.oauth("login", "usernameFromInput", "passwordFromInput").done(function(data){console.log("login successful");console.log(data);}).fail(function(jqXHR, textStatus){console.log("login "+textStatus);console.log(jqXHR.responseText);});
 *
 */
(function($) {

	"use strict";

	var tokens = {}, loginProcess = $.Deferred(), oauth = {
		baseUrl: "",
		tokenUrl: "/oauth/token",
		grantType: "owner"
	}, getUrl = function(path){
		return (oauth.baseUrl && path.indexOf(oauth.baseUrl)==-1) ?
				oauth.baseUrl + path : path;
	}, initLoginProcess = function(){
		loginProcess.credentialProcess = $.Deferred();
		loginProcess.tokenPromise = loginProcess.credentialProcess.pipe(function(credential){
			return tokenProcess(credential);
		}).done(function(token){
			saveToken(token, "owner");
			loginProcess.resolve(token);
		});
		// TODO: implement loginProcess timeout
	}, tokenProcess = function(data){
		return $.ajax({
			url: getUrl(oauth.tokenUrl),
			type: "post",
			dataType: "json",
			data: data,
			headers: {Authorization: "Basic "+oauth.client}
		});
	}, saveToken = function(token, grantType){
		token.timestamp = new Date().valueOf();
		tokens[grantType] = token;
	}, methods = {
		init : function(settings) {
			$.extend(oauth, settings);
			initLoginProcess();
		},
		ajax : function(options, grantType) {
			grantType = (grantType || oauth.grantType).toLowerCase();
			return $.when(function(){
				var token = tokens[grantType];
				if(token && token.expiresIn * 1000 >= (new Date().valueOf() - token.timestamp)){
					return token;
				}
				else if(token && token.refresh_token){
					// handle refreshToken expire?oauth
					return tokenProcess({grant_type: "refresh_token", refresh_token: token.refresh_token});
				}
				else if(grantType=="client"){
					return tokenProcess({grant_type: "client_credentials"});
				}
				else{
					// call the login function, solved loginProcess directly if credential returned
					if($.isFunction(oauth.login)){
						var credential = oauth.login();
						if(credential && credential.username){
							method.login(credential.username, credential.password);
						}
					}
					return loginProcess.tokenPromise;
				}
			}).pipe(function(token){
				if(!token.timestamp) saveToken(token, grantType);
				options.url = getUrl(options.url);
				options.headers =  $.extend(options.headers, {
					Authorization: "Bearer "+token.access_token
				});
		    	return $.ajax(options);
			});
		},
		login : function(username, password) {
			if(loginProcess.credentialProcess.state() != "pending") initLoginProcess();
			loginProcess.credentialProcess.resolve({
				grant_type: "password",
				username: username,
				password: password
			});
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

})(jQuery);