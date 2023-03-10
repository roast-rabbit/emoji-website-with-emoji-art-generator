function emoji_copyed() {
    $('.emoji_item').click(function () {
        $('.emoji_item').removeClass("active");
        $(this).addClass("active");
    });
}

function change_mode() {
    $('#change_native').click(function () {
        $(this).addClass("active").parent().siblings().children().removeClass("active");
        $('body').addClass("native");
        $("link[href*='copy-style.css']").remove();
    });
    $('#change_google').click(function () {
        $(this).addClass("active").parent().siblings().children().removeClass("active");
        $('body').removeClass("native");
        $("head").append("<link>");
        add_css = $("head").children(":last");
        add_css.attr({
            class: "copystyle",
            rel: "stylesheet",
            type: "text/css",
            href: "/all/themes/emoji_2020/css/copy-style.css"
        });
    });
}

function emoji_Clipboard() {
    new ClipboardJS('.emoji_symbol');
}
jQuery(document).ready(function () {
    (function ($) {
        emoji_copyed();
        emoji_Clipboard();
        change_mode();
    })(jQuery);
});;
$(document).ready(function () {
    setInterval(function () {
        update_search()
    }, 500);
});
var last_search = '';

function update_search() {
    var i = $('#search').prop('value');
    i = i.toLowerCase();
    if (i == last_search)
        return;
    last_search = i;
    if (i == '') {
        $('.emoji_item').show();
        $('.box_wrap').show();
    } else {
        $('html, body').animate({
            scrollTop: 0
        }, 600);
        $('.emoji_item').hide();
        var e = [];
        $('.emoji_item').each(function () {
            var a = $(this).attr('data-keyword');
            if (a.includes(i))
                e.push(this)
        });
        $(e).show();
        $('.box_wrap').show();
        $('.box_wrap').each(function () {
            var i = $(this).find('.emoji_item:visible');
            if (i.length == 0)
                $(this).hide()
        })
        if (e.length < 1) {
            $('#notice').show();
        } else {
            $('#notice').hide();
        }
    }
};
$(document).ready(function () {
    $(function () {
        $('#emoji_data').val('');
        $('#data-copy').attr('data-clipboard-text', '');
    });
    $('#notice').hide();
    var clipboard = new ClipboardJS('.emoji_symbol');
    $('.emoji_symbol').click(function () {
        var my = $(this).data('clipboard-text');
        var select = $('#emoji_data');
        var now = select.val();
        clipboard.on('success', 
        function (e) {
            now += my;
            select.val(now);
            $('#data-copy').attr('data-clipboard-text', now);
            $('#data-copy').html('??????????');
        });
        clipboard.on('error', 
        function (e) {
            $('.tooltip-inner').text('????????????????????????');
        });
    });
    $('#data-copy').click(function () {
        var clipboards = new ClipboardJS('#data-copy');
        clipboards.on('success', 
        function (e) {
            console.log(e);
            $('#data-copy').html('????????');
            $('#data-copy').attr('data-clipboard-text', '');
        });
        clipboards.on('error', 
        function (e) {
            $('#data-copy').html('???????????????');
        });
        clipboards = null;
    });
    $('#data-del').click(function () {
        $('#emoji_data').val('');
        $('#data-copy').attr('data-clipboard-text', '').html('??????????');
    });
    $("#emoji_data").bind("input", function () {
        $('#data-copy').attr('data-clipboard-text', $(this).val());
        $('#data-copy').html('??????????');
    });
});
$(function () {
    $("#search").bind("input", function () {
        if ($(this).val().length > 0) {
            $(".copy_search .form [type='submit']").val("???");
        } else {
            $(".copy_search .form [type='submit']").val("????");
        }
    });
    $(".copy_search .form [type='submit']").click(function () {
        $("#search").val('');
        $(".copy_search .form [type='submit']").val("????");
        $('#notice').hide();
    });
});