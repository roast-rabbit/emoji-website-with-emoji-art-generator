// 不要复制这段话,整个js使用
// https://www.sojson.com/javascriptobfuscator.html
// 加密,






//启动header-stick
// function stickupstart() {
// 	jQuery("header").stickUp({});
// }
//媒体查询下的事件
$(document).ready(function() {

	if ($(window).width() <= 992) {
		//启动search_form_stick，小于992分辨率
		// jQuery(".search_form").stickUp({
		// 	zIndex: 98,
		// 	topMargin: 40,
		// });
	} else {
		//启动sidebar_stick
		jQuery(".sidebar_fix_wraper").stickUp({
			wrapperSelector: ".sidebar",
			zIndex: 98,
			topMargin: 45,
		});
		//启动search_form_stick_max，大于992分辨率
		jQuery(".search_form").stickUp({
			zIndex: 99,
			topMargin: 60,
		});
	}

	// $(window).resize(function () {
	//  if( $(window).width() <= 768 ) {
	//         /* 这里是要执行的代码 */
	//         jQuery(".search_form").stickUp({
	//         zIndex: 98,
	//         topMargin: 40,
	//     });
	//     }else{
	//     jQuery(".sidebar_fix_wraper").stickUp({
	//         wrapperSelector: ".sidebar",
	//         zIndex: 98,
	//         topMargin: 45,
	//     });
	// 	jQuery(".search_form").stickUp({
	// 	    zIndex: 99,
	// 	    topMargin: 60,
	// 	});
	//  }
	//  });


});


//启动锚点，锚点链接需要#go_开头
function SmoothScrollstart() {
	var scroll = new SmoothScroll('a[href*="#go_"]', {
		//		抵消fixed的header的高度
		//		header: 'header',  这里header高度是动态的，用这个会卡顿，就用offset了
		offset: 75,
		speed: 700,
		speedAsDuration: true,
		easing: 'easeInOutQuad',
	});
}


//emoji_copied
function emoji_copyed() {
	$('.emoji_item').click(function() {
		$('.emoji_item').removeClass("active");
		$(this).addClass("active");
	});
}

//change_mode
function change_mode() {
	$('#change_native').click(function() {
		$(this).addClass("active").parent().siblings().children().removeClass("active");
		$('body').addClass("native");
	});
	$('#change_google').click(function() {
		$(this).addClass("active").parent().siblings().children().removeClass("active");
		$('body').removeClass("native");
	});
}


//Clipboard
function emoji_Clipboard() {
	new ClipboardJS('.emoji_symbol');
}
//返回顶部
function scrolltotop() {
	//if(jQuery(window).width() > 768 ){
	//Check to see if the window is top if not then display button
	$(window).scroll(function() {
		if ($(this).scrollTop() > 150) {
			$('.scrollToTop').fadeIn();
		} else {
			$('.scrollToTop').fadeOut();
		}
	});
	//Click event to scroll to top
	$('.to_top').click(function() {
		$('html, body').animate({
			scrollTop: 0
		}, 800);
		return false;
	});
	//}
}

// 启动所有插件
jQuery(document).ready(function() {
	(function($) {
		scrolltotop();
		emoji_copyed();
		emoji_Clipboard();
		// stickupstart();
		// sidebar_fixed();
		// search_form_stick();
		// search_form_stick_max();
		change_mode();
		SmoothScrollstart();

	})(jQuery);
});


//检索
;
$(document).ready(function() {
	setInterval(function() {
		update_search()
	}, 100);
});
var last_search = '';

function update_search() {
	var i = $('#search').prop('value');
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
		$('.emoji_item').each(function() {
			var a = $(this).attr('data-keyword');
			if (a.includes(i))
				e.push(this)
		});
		$(e).show();
		$('.box_wrap').show();
		$('.box_wrap').each(function() {
			var i = $(this).find('.emoji_item:visible');
			if (i.length == 0)
				$(this).hide()
		})
	}
};

















//JS代码贴到页面头部，需要jquery
$(document).ready(function() {
	//屏蔽鼠标右键
	$(document).bind("contextmenu", function(e) {
		return false;
	});
});
$(function() {
	document.addEventListener('keydown', function(e) {
		e = window.event || e;
		var keycode = e.keyCode || e.which;
		if (e.ctrlKey && keycode == 83) {
			//屏蔽Ctrl+s 保存页面
			e.preventDefault();
			window.event.returnValue = false;
		}
		if (e.ctrlKey && keycode == 85) {
			//屏蔽Ctrl+u  查看页面的源代码
			e.preventDefault();
			window.event.returnValue = false;
		}
		if (keycode == 123) {
			//屏蔽F12
			e.preventDefault();
			window.event.returnValue = false;
		}
		if (e.ctrlKey && e.shiftKey && keycode == 73) {
			//屏蔽Ctrl+shift+i   屏蔽调出控制台 和F12一样
			e.preventDefault();
			window.event.returnValue = false;
		}
	});
});

//当页面被整个盗取到本地的时候，本地打开一片空白，需要jquery
function authentication() {
	var suffix = "com",
		main = "emoji",
		red = "all",
		dot = ".";
	var d = (main + red).toString() + dot + suffix;
	if (window.location.host.indexOf(d) < 0) {
		$("body").remove();
		return false
	}
	return true
}

$(function() {
	if (!authentication()) return;
	// 执行授权方法，检查一下当前页面域名
});

//以及相同的一个思路
//如果当前浏览器域名不是 copy.emojiall.com 将跳转到 copy.emojiall.com 对应的页面
if (document.location.host != "copy.emojiall.com") {
	location.href = location.href.replace(document.location.host, 'copy.emojiall.com');
} else {
	//加载css开关
	$("head").append("<link>");
	a = $("head").children(":last");
	a.attr({
		rel: "stylesheet",
		type: "text/css",
		href: "../css/css.css"
	});

}


// 多重复制
// cokie部分-开始
$(document).ready(function() {
	function setCookie(name, value) {
		var date = new Date();
		date.setTime(date.getTime() + 24 * 60 * 60 * 1); //cookie保存1天
		document.cookie = name + "=" + value + ";expires=" + date.toGMTString() + ";path=emojikeyboard/";
	}

	function getCookie(name) {
		var aCookie = document.cookie.split("; ");
		for (var i = 0; i < aCookie.length; i++) {
			var aCrumb = aCookie[i].split("=");
			if (name == aCrumb[0]) return unescape(aCrumb[1]);
		}
		return null;
	}

	$(function() {
		var nowCookie = getCookie('emojiall');
		if (nowCookie && nowCookie != 'null') {
			$('#emoji_wrap').removeClass('hidden').fadeIn(300);
			$('#emoji_data').val(nowCookie);
			$('#data-copy').attr('data-clipboard-text', nowCookie);
		} else {
			$('#emoji_data').val('');
			$('#data-copy').attr('data-clipboard-text', '');
		}

	});
	// cokie部分-结束	

	var clipboard = new ClipboardJS('.emoji_symbol');
	$('.emoji_symbol').click(function() {
		var my = $(this).data('clipboard-text');
		var select = $('#emoji_data');
		var now = select.val();
		clipboard.on('success',
			function(e) {
				now += my;
				select.val(now);
				$('#data-copy').attr('data-clipboard-text', now);
				setCookie('emojiall', now); //如果不需要cookie功能，可以注释这句和上面那段cookie部分
				$('#data-copy').html('✂️💾');
			});
		clipboard.on('error',
			function(e) {
				$('.tooltip-inner').text('复制失败，请重试');
			});
	});

	$('#data-copy').click(function() {
		//var my = $(this);
		var clipboards = new ClipboardJS('#data-copy');
		clipboards.on('success',
			function(e) {
				console.log(e);
				$('#data-copy').html('😍👏');
				$('#data-copy').attr('data-clipboard-text', '');
			});
		clipboards.on('error',
			function(e) {
				$('#data-copy').html('❎复制失败');
			});
			clipboards=null;
	});

	$('#data-del').click(function() {
		$('#emoji_data').val('');
		setCookie('emojiall', '');
		$('#data-copy').attr('data-clipboard-text', '').html('✂️💾');
	});
	
	
	$("#emoji_data").bind("input", function() {
		$('#data-copy').attr('data-clipboard-text', $(this).val());
		$('#data-copy').html('✂️💾');
	});

	// $("#emoji_data").bind('input propertychange',function() {
	//         $('#data-copy').html('😑复制');
	//         var newCookie = $(this).val();
	//         $('#data-copy').attr('data-clipboard-text', newCookie);
	//         setCookie('emojiall', newCookie);
	//       });

});


// 左上角搜索框的叉叉
$(function() {
	$("#search").bind("input", function() {
		if ($(this).val().length > 0) {
			$(".search_form .form [type='submit']").val("❌");
		} else {
			$(".search_form .form [type='submit']").val("🔎");
		}
	});

	

	$(".search_form .form [type='submit']").click(function() {
		$("#search").val('');
		$(".search_form .form [type='submit']").val("🔎");
	});
});
