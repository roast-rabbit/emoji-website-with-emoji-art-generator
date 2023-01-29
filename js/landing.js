

$(document).ready(function() {

	// RUN YOUR JQUERY FUNCTION
	InitMyCustomJQuery();

});

//  PLACE  YOUR CUSTOM JQUERY IN FUNCTION
function InitMyCustomJQuery() {

	//// your custom jquery here ///



	
	
	//owlCarousel slider01
	$('.slider01').owlCarousel({
		loop:true,
		responsiveClass:true,
		responsive:{
			0:{
				items:1,
				nav:true,
				loop:true
			},
			600:{
				items:3,
				nav:false
			},
			1000:{
				items:5,
				nav:true,
				loop:true
			}
		}
	});
	
	
}

