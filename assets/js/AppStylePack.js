/*
	Document	: Application Style Package
	Type		: Java Script (JS)
	Author		: Jeshad Khan
	Website		: http://jeshadkhan.com
	Description	: © 2012 - 2015 Jeshad Khan.
*/



/* Go Back To Top Button */

$(document).ready(function () {
    // show or hide the sticky footer
    $(window).scroll(function () {
        if ($(this).scrollTop() > 20) {
            $('.to-top').fadeIn(500);
        }
        else {
            $('.to-top').fadeOut(700);
        }
    });
    // animate the scroll to top
    $('.to-top').click(function (event) {
        event.preventDefault();
        $('HTML, body').animate({ scrollTop: 0 }, 800);
    })
})


/* prettyPhoto Trigger */

$(document).ready(function () {

    $("a[rel^='prettyPhoto']").prettyPhoto({ social_tools: "" });

    $(".gallery:first a[rel^='prettyPhoto']").prettyPhoto({ animation_speed: 'normal', theme: 'light_square', slideshow: 3000, autoplay_slideshow: false, social_tools: "" });
    $(".gallery:gt(0) a[rel^='prettyPhoto']").prettyPhoto({ animation_speed: 'fast', slideshow: 10000, hideflash: true });

});


/* fancyBox Trigger */

$(document).ready(function () {
    $(".fancybox").fancybox({
        openEffect: 'elastic',
        openSpeed: 150,

        closeEffect: 'elastic',
        closeSpeed: 150,

        closeClick: true,
        nextClick: true,

        helpers: {
            media : {},
            buttons : {},
            thumbs: {
                width: 50,
                height: 50
            }
        },

        // count of total image of image
        afterLoad: function () {
            this.title = 'Image ' + (this.index + 1) + ' of ' + this.group.length + (this.title ? ' - ' + this.title : '');
        }
    });
});


/* Elevate Zoom */

$('#elevatezoom-display').elevateZoom({
    tint: true,
    tintColour: '#2196F3',
    tintOpacity: 0.5,

    gallery: 'elevatezoom-gallery',
    cursor: 'pointer',
    galleryActiveClass: 'active',
    imageCrossfade: true,
    loadingIcon: '../img/spinner.gif',

    zoomWindowPosition: 1,
    zoomWindowOffetx: 10,

    zoomWindowFadeIn: 500,
    zoomWindowFadeOut: 750,

    lensFadeIn: 500,
    lensFadeOut: 500,

    easing: true,
    scrollZoom: true
});


/* Preloader */

//$(document).ready(function () {
//    $('header').addClass('hidden');
//    $('section').addClass('hidden');
//    $('footer').addClass('hidden');

//    setTimeout(function () {
//        $('body').addClass('loaded');

//        $('header').removeClass('hidden');
//        $('section').removeClass('hidden');
//        $('footer').removeClass('hidden');
//    }, 3000);
//});
