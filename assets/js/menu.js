//var serviceURL = "http://regimo.poloniouslive.com/";
var serviceURL = "http://192.168.2.3:8080/";
//var serviceURL = "http://192.168.0.101:8080/";

var terms;
var slug;
var postName;
		
function toggleMainMenu() {
	$( "#main-menu" ).toggle( 'clip', null, 200);
	return false;
};

$( "#main-menu" ).hide();

$('#menuListPage').bind('pageinit', function(event) {
	$.support.cors=true;
	$.mobile.allowCrossDomainPages = true;
	getMenuList();
});

function getMenuList() {
	$.getJSON(serviceURL + 'wp.json', function(data) {
		$('#menuList li').remove();
		terms = data.menu;
		$.each(terms, function(index, term) {
			$('#menuList').append('<li><a href="javascript:loadPosts(\'' + term.slug + '\');">' +
					'<h4>' + term.name + '</h4></a></li>');
		});
		$('#menuList').listview('refresh');
	});
}

function loadPosts(s){
	slug=s;
	$.mobile.changePage("posts.html");
	return false;
}
