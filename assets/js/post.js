$('#postPage').live('pageshow', function(event) {
	$.getJSON(serviceURL + 'wp/post/'+postName+'.json', function (data) {
		var post = data.post;
		$('#title').text(post.postTitle);
		$('#content').html(post.postContent);

		if (ttsActivated) {
			window.plugins.tts.speak(post.postTitle);
			window.plugins.tts.silence(800);
			window.plugins.tts.speak($('#content').text());
		}
	});
});
