 $('.properties_slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        adaptiveHeight: true,
        responsive: [
            {
                breakpoint: 480, // Mobile breakpoint
                settings: {
                    vertical: false,
                    verticalSwiping: false,
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });

