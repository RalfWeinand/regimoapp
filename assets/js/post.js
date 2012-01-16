$('#postPage').live('pageshow', function(event) {
	$.getJSON(serviceURL + 'wp/post/'+postName+'.json', function (data) {
		var post = data.post;
		$('#title').text(post.postTitle);
		$('#content').html(post.postContent);
	});
});
