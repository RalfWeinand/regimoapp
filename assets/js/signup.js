var image;

function signUp() {
	var email = $('#email').val();
	var password = $('#password').val();
	var firstName = $('#firstName').val();
	var lastName = $('#lastName').val();
	$.mobile.showPageLoadingMsg();
	$.post(serviceURL +"rest/user", { 
		username: email, email: email, password: password, 
		firstName: firstName, lastName: lastName, image:image },
		function(data) {
			$.mobile.hidePageLoadingMsg();
			alert("Sign up successfully!");
			$.mobile.changePage("index.html");
		});
}

function PictureSourceType() {};
PictureSourceType.PHOTO_LIBRARY = 0;
PictureSourceType.CAMERA = 1;
 
function getPicture(sourceType) {
     var options = { quality: 10 };
     if (sourceType != undefined) {
          options["sourceType"] = sourceType;
     }
     // if no sourceType specified, the default is CAMERA 
     navigator.camera.getPicture(getPicture_Success, null, options);
}
 
function getPicture_Success(imageData) {
	image=imageData;
    $("#test_img").attr("src", "data:image/jpeg;base64," + imageData);
}