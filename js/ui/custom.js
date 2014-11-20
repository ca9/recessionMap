(function ($) {
	$( '#dl-menu' ).dlmenu();
	$('ul.dl-menu li a').smoothScroll();


	//animation
	new WOW().init();

})(jQuery);


$(".btn-toolbar > .btn").click(function(){
	$(this).addClass("active").siblings().removeClass("active");
});