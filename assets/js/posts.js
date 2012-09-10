$('#postsPage').live('pageshow', function(event) {
	$.getJSON(serviceURL + 'wp/category/'+slug+'.json', displayPosts);
});

function displayPosts(data) {
	$.each(data.posts, function(index, post) {
		$('#postList').append('<li><a href="javascript:loadPost(\'' + post.postName + '\');">' +
				'<p>' + post.postTitle + '</p></a></li>');
		if (ttsActivated) {
			window.plugins.tts.speak(post.postTitle);
			window.plugins.tts.silence(1000);
		}
	});
	$('#postList').listview('refresh');
}

function loadPost(pn){
	postName=pn;
	$.mobile.changePage("post.html?page=" + pn);
	return false;
}