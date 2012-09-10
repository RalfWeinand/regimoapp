function signIn() {		
	$.oajax.login(document.getElementById("loginUsername").value, 
				  document.getElementById("loginPassword").value)
					 .done($('#signInPage').dialog('close'))
					 .fail(function(jqXHR, textStatus) {
						 console.log("login "+textStatus);console.log(jqXHR.responseText);
						 $('loginErrorMsg').text("Login failed. Please try again.");
				      });
}

function openPage(page) {
	$.mobile.changePage( page, { transition: "slideup"} );
}

function signUp() {
	var email = $('#email').val();
	var password = $('#password').val();
	var firstName = $('#firstName').val();
	var lastName = $('#lastName').val();
	var image = $('#smallImage').attr("src");
	$.mobile.showPageLoadingMsg();
	$.oajax("/rest/user", { type : "POST", dataType: "json", 
		username: email, email: email, password: password, 
		firstName: firstName, lastName: lastName, image:image })
		.done(function(data) {
			$.mobile.hidePageLoadingMsg();
			alert("Signed up successfully!");
			$.mobile.changePage("index.html");
		});
}

function updateMemberDetails() {
	var id = $('#id').val();
	var email = $('#email').val();
	var password = $('#password').val();
	var firstName = $('#firstName').val();
	var lastName = $('#lastName').val();
	console.log("updateMemberDetails: " + id);
	//console.log($.toJSON($('#smallImage')));
	var image = $('#smallImage').attr("src");
	console.log(image);
	$.mobile.showPageLoadingMsg();
	$.oajax("/rest/user/profile/", { type : "POST", dataType: "json", 
		id: id, username: email, email: email, password: password, 
		firstName: firstName, lastName: lastName, image:image })
		.done(function(data) {
			$.mobile.hidePageLoadingMsg();
			alert("Updated successfully!");
			$.mobile.changePage("index.html");
		});
}

function onPhotoDataSuccess(imageData) {
    var smallImage = $('#smallImage');
  
    smallImage.src = "data:image/jpeg;base64," + imageData;
    smallImage.style.display = 'block';
    console.log(smallImage.src);
}


// Called if something bad happens.
// 
function onFail(message) {
	alert('Failed because: ' + message);
}

function capturePhoto() {
    // Take picture using device camera and retrieve image as base64-encoded string
    navigator.camera.getPicture(onPhotoDataSuccess, onFail, { 
    	  quality : 75, 
    	  destinationType : Camera.DestinationType.DATA_URL, 
    	  sourceType : Camera.PictureSourceType.CAMERA, 
    	  allowEdit : true,
    	  encodingType: Camera.EncodingType.JPEG,
    	  targetWidth: 200,
    	  targetHeight: 200,
    	  saveToPhotoAlbum: false });
}
