(function () {
    $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip();
        $(".navbar-nav li").on("click", function () {
            $(".navbar-nav li").removeClass("active");
            $(this).addClass("active");
        });
    });   
})();
