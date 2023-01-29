var currentTheme = '';
(function () {
	//设置夜间模式
	$(".toggleTheme").change(function(){
		if (localStorage.getItem('theme') === 'dark-mode') {
	        setTheme('light-mode');
	    } else {
	        setTheme('dark-mode');
	    }
	})
	$(".night_mode_menu").click(function(){
		if (localStorage.getItem('theme') === 'dark-mode') {
	        setTheme('light-mode');
	        $(".toggleTheme").prop("checked",false);
	    } else {
	        setTheme('dark-mode');
	        $(".toggleTheme").prop("checked",true);
	    }
	});

	function setTheme(themeName) {
	    localStorage.setItem('theme', themeName);
	    // document.documentElement.className = themeName;
	    // document.body.className = themeName;
	    document.body.classList[themeName === 'dark-mode' ? 'add' : 'remove']('dark-mode');
	}

	if (localStorage.getItem('theme') === 'dark-mode') {
        $(".toggleTheme").prop("checked",true);
    } else {
        $(".toggleTheme").prop("checked",false);
    }

})();



var popular_scroll = true;//排行榜滚动加载状态，防止重复滚动加载,默认true表示未加载
var language_code = '';
var user_collect = 2;
var user_collect_data = '';//用户收藏数据
var emoji_type_arr = {'B':true,'C':true,'D':true,'E':true,'F':true,'G':true,'H':true,'I':true,'J':true};
var emoji_categories_arr = {2:'B',3:'C',4:'D',5:'E',6:'F',7:'G',8:'H',9:'I',10:'J'};
var emoji_status = 2;
var emoji_image_status = 2;
var emoji_platform_status = 2;
var comment_right_scroll = true;
var image_version_scroll = true;
var categories_status = 2;
var emoji_info_status = true;
var tags_relations_status = true;
var sentiment_position_status = true;
var emoji_mix = 2;
var emoji_mix_like = 2;
var set_mix_select = '';
var set_mix_data = '';
$(function (){
	var url = window.location.href;
	if(url.indexOf('#') != -1){
		url = url.substring(url.indexOf('#'),-1);
	}
	var popular_update = $("#popular_emoji_update").data("update");
	language_code = getUrlFirstParam(url);
	if(url.indexOf('/copy') == -1){
		scrollPopular(popular_update);
		scrollRightComment();
		$(window).scroll(function () {
	        scrollPopular(popular_update);
	        //右侧评论
	        scrollRightComment();
	    });
	}

	//左侧菜单栏点击事件
	$(".stick_sidebar_left .btn_menu").click(function(){
		var _this = $(this);
		var loaded = _this.attr('loaded');
		var categories = _this.data('categories');
		var loading_html = '<img src="/img/translate-loading.svg" alt="" width="16" height="16">';
		if(loaded == 'yes'){
			//已加载过，无需异步
			var className = _this.parents('li').attr('class');
			if(className == 'active'){
				//收起下拉框
				_this.parents('li').removeClass('active');
				_this.parents('li').find('.submenu_toggle>li').css('max-height','0');
				_this.html('<i class="iconfont iconplus-circle text_silver pointer"></i>');
			}else{
				//开启下拉框
				_this.parents('ul').find('.submenu_toggle>li').css('max-height','0');
				_this.parents('ul').find('.btn_menu').html('<i class="iconfont iconplus-circle text_silver pointer"></i>');

				_this.parents('li').addClass('active').siblings().removeClass('active');
				_this.parents('li').find('.submenu_toggle>li').css('max-height','2rem');
				_this.html('<i class="iconfont iconminus-circle text_silver pointer"></i>');
			}
		}else{
			//异步
			if(categories_status == 1 || !categories){
				return false;
			}
			categories_status = 1;
			_this.parents('ul').find('.submenu_toggle>li').css('max-height','0');
			_this.parents('ul').find('.btn_menu').html('<i class="iconfont iconplus-circle text_silver pointer"></i>');
			_this.html(loading_html);
			get_left_categories(categories,_this);
		}
	})
	
	
	get_user_info();

	//用户中心取消收藏,收藏列表页
	$(".cancel_collect,.collect_list").click(function(){
		if(user_collect < 2){
			return false;
		}
		user_collect = 1;
		var _this = $(this);
		var cmt_id = _this.data("cmt_id");
		var type = _this.data("type");
		cancel_collect(cmt_id,type,_this);
	});

	if(url.indexOf('/collect-page/') != -1){
		var id = '';
		var type = $(".collect_type").data("type");
		if(type == 'emoji'){
			//默认只遍历第一个分类下的emoji的收藏状态
			id = 'A'
		}
		get_user_collect(type,id);

		//开始滚动
		$(window).scroll(function () {
			for (var key in emoji_type_arr) {
	        	scrollCollect(key);
			}

	    });
	}
	get_history_record('get');
	//清除历史记录
	$("#selction-ajax .clear_history_record").click(function(){
		get_history_record('clear');
	});

	if(url.indexOf('/search_results') != -1){
		let value = getUrlParam('keywords');
		if(!value) return false;

		let history = localStorage.getItem('history_'+language_code);
		if (history == null) {
			history = [];
		}else {
			//转数组
			history = JSON.parse(history);
		}

		if (history.indexOf(value) != -1) {
            // 如果已经存在：将原来的干掉
            history.splice(history.indexOf(value), 1);
        }

        // 将当前最新的历史记录，放到第一个
        history.unshift(value);
		// 转为对象存入localStorage
        localStorage.setItem('history_'+language_code, JSON.stringify(history));
	}

	//全部emoji列表
	if(url.indexOf('/all-emojis') != -1){
		var type = '';
		if(url.indexOf('?type=') != -1){
			var index = url.indexOf('?type=');
			var type = url.substring(index+6);
		}
		if(emoji_status == 2){
			emoji_status = 1;
			get_emoji_list(type);
		}
		scrollEmoji(type);
		$(window).scroll(function () {
			scrollEmoji(type);
		});

		//点击分类锚点
		$(".emoji_card_nav .card .categories_code").click(function(){
			var categories_code = $(this).data("categories");
			if(emoji_status == 2){
				emoji_status = 1;
				var emoji_categories = $(this).find(".emoji_font").html();
				var loading_html = '<img src="/img/translate-loading.svg" alt="" width="21" height="21">';
				$(this).find(".emoji_font").html(loading_html);
				get_emoji_list(type,categories_code,emoji_categories);
			}else{
				location.hash = '#categories-'+categories_code;
			}
		})
	}
	

	//全部emoji图片列表
	if(url.indexOf('/image-emoji-platform/') != -1){
		var index = url.indexOf('image-emoji-platform/');
		var str = url.substr(index);
		var arr = str.split('/');
		if(emoji_image_status == 2){
			emoji_image_status = 1;
			get_all_image_emoji_platform(arr[1],arr[2]);
		}
			
		scrollEmojiImage(arr[1],arr[2]);
		$(window).scroll(function () {
			scrollEmojiImage(arr[1],arr[2]);
		})
	}

	//emoji平台图片列表
	if(url.indexOf('/platform-') != -1){
		var index = url.indexOf('/platform-');
		var str = url.substr(index);
		var arr = str.split('-');
		if($.inArray(arr[1],['qq','wechat','weibo','baidu','douyin','bilibili','animation']) != -1){
			return false;
		}
		if(emoji_platform_status == 2){
			emoji_platform_status = 1;
			get_platform_image_list(arr[1]);
		}
		scrollPlatformImage(arr[1]);
		$(window).scroll(function () {
			scrollPlatformImage(arr[1]);
		})
	}

	//单版本emoji图片列表
	if(url.indexOf('/image-version-page/') != -1){
		var index = url.indexOf('image-version-page/');
		var str = url.substr(index);
		var arr = str.split('/');
		if(image_version_scroll){
			image_version_scroll = false;
			get_image_version(arr[1],arr[2]);
		}
		scrollImageVserion(arr[1],arr[2]);
		$(window).scroll(function () {
			scrollImageVserion(arr[1],arr[2]);
		})
	}

	//获取emoji信息
	if(url.indexOf('/emoji/') != -1){
		var index = url.indexOf('emoji/');
		var str = url.substr(index);
		var arr = str.split('/');
		// get_emoji_info(arr[1]);
		scrollEmojiSentiment(arr[1],'sentiment');
		scrollEmojiTags(arr[1],'tags');
		$(window).scroll(function () {
			scrollEmojiSentiment(arr[1],'sentiment');
			scrollEmojiTags(arr[1],'tags');
		})
	}

	$("#selectMixOne").click(function(){
		$("#introduceBox").addClass('hide');
		$("#selectImageBox").removeClass('hide');
		set_mix_select = 'selectMixOne';
		set_mix_data = 'one';
	})

	$("#selectMixTwo").click(function(){
		$("#introduceBox").addClass('hide');
		$("#selectImageBox").removeClass('hide');
		set_mix_select = 'selectMixTwo';
		set_mix_data = 'two';
	})

	$("#selectImageBox .col.emoji").click(function(){
		var type = $(this).data('type');
		var text = $(this).data('text');

		var html = '';
		if(type == 'emoji'){
			var emoji_symbol = $(this).find('.fontsize_xyz').text();
			html += '<div class="emoji text_shadow" style="font-size: 2.75rem;">'+emoji_symbol+'</div>';
		}
		if(type == 'image'){
			var src = $(this).find('img').attr('src');
			html += '<img src="'+src+'" alt="" width="50" height="50" style="filter: drop-shadow(4px 4px 4px rgb(0 0 0 / 50%));">';
		}
		$("#"+set_mix_select).html(html);
		$("#emoji_image_mix").attr('data-'+set_mix_data,text);
		$("#introduceBox").removeClass('hide');
		$("#selectImageBox").addClass('hide');
	})

	//图片融合点赞
	$(".mix_like").click(function(){
		if(emoji_mix_like < 2) return false;
		emoji_mix_like = 1;

		var _this = $(this);
		var id = _this.attr('data-id');
		$.ajax({
			url:"/en/emoji-mix-like",
			data:{id:id},
			type:"post",
			dataType:"json",
			success:function(msg){
				if(msg.code == 200){
					_this.find('.number').text(msg.data.like_number);
				}
				set_toast_off('post',msg.msg);
				emoji_mix_like = 2;
			},
			error:function(){
				emoji_mix_like = 2;
			}
		})
	})

	$(".toast-body .iconclose").click(function(){
		$(".toast-body").find("p").text(' ');
		$(".toast").removeClass("on");
		$(".toast").addClass("off");
	})
});

function get_left_categories(categories,obj){
	$.ajax({
		url:"/"+language_code+"/get-left-categories",
		data:{language_code:language_code,categories:categories},
		type:"post",
		dataType:"json",
		success:function(msg){
			if(msg.code == 200){
				obj.parents('li').append(msg.data);
				obj.attr('loaded','yes');
				obj.html('<i class="iconfont iconminus-circle text_silver pointer"></i>');
				obj.parents('li').addClass('active').siblings().removeClass('active');		
				obj.parents('li').find('.submenu_toggle>li').css('max-height','2rem');
			}
			categories_status = 2;
		}
	})
}

function get_image_version(brand,version){
	$.ajax({
		url:"/"+language_code+"/get-image-version",
		data:{language_code:language_code,brand:brand,version:version},
		type:"post",
		dataType:"json",
		success:function(msg){
			if(msg.code == 200){
				$(".image_version_box").append(msg.data);
				$(".loading_more").addClass('hide');				
			}
			
		},
		error:function(){
			image_version_scroll = true;
		}
	})
}

function get_emoji_info(emoji_symbol,type = ''){
	$.ajax({
		url:"/"+language_code+"/get-emoji-info",
		data:{emoji_symbol:emoji_symbol,type:type},
		type:"get",
		// type:"post",
		dataType:"json",
		success:function(msg){
			if(msg.code == 200){
				if(type == 'tags'){
					$(".tag_cloud_svg").html(msg.data.tag_cloud);
					$(".tag_cloud_url").attr('href',msg.data.tag_url);
					$(".relation_chart_svg").html(msg.data.relation_chart);
					$(".relation_chart_url").attr('href',msg.data.relation_url);
					$(".tag_relation_display").before(msg.data.tag_relation_display);
				}else if(type == 'sentiment'){
					$(".sentiment_position_content").html(msg.data.sentiment);
				}

			}
			
		},
		error:function(){
			emoji_info_status = true;
			if(type == 'tags'){
				tags_relations_status = true;
			}else if(type == 'sentiment'){
				sentiment_position_status = true;
			}
		}
	})
}

function get_emoji_list(type,categories_code = '',emoji_categories = ''){
	$.ajax({
		url:"/"+language_code+"/get-all-emoji-list",
		data:{type:type},
		type:"get",
		dataType:"json",
		success:function(msg){
			if(msg.code == 200){
				$(".emoji_list_box").append(msg.data);
				$(".loading_more").addClass('hide');
				
				for(var key in emoji_categories_arr){
					$(".emoji_card_nav li").find(".categories-"+emoji_categories_arr[key]).attr("href","#categories-"+emoji_categories_arr[key]);
				}

				if(categories_code != ''){	
					$(".emoji_card_nav li .categories-"+categories_code).find(".emoji_font").html('<span class="emoji_font line">'+emoji_categories+'</span>');
					location.hash = '#categories-'+categories_code;
				}
			}
			
		},
		error:function(){
			emoji_status = 2;
		}
	})
}

function get_all_image_emoji_platform(brand,type){
	$.ajax({
		url:"/"+language_code+"/get-all-image-emoji-platform",
		data:{brand:brand,type:type,cache:'1d'},
		type:"get",
		dataType:"json",
		success:function(msg){
			if(msg.code == 200){
				$(".emoji_image_box").append(msg.data);
				$(".loading_more").addClass('hide');				
			}
			
		},
		error:function(){
			emoji_image_status = 2;
		}
	})
}

function get_platform_image_list(brand){
	$.ajax({
		url:"/"+language_code+"/get-platform-image-list",
		data:{brand:brand,cache:'1d'},
		type:"get",
		// type:"post",
		dataType:"json",
		success:function(msg){
			if(msg.code == 200){
				$(".emoji_image_box").append(msg.data);
				$(".loading_more").addClass('hide');				
			}
			
		},
		error:function(){
			emoji_platform_status = 2;
		}
	})
}

function get_popular_emoji(update){
	var timestamp = Date.parse(new  Date());
	$.ajax({
		url:"/"+language_code+"/get-popular-emoji",
		data:{cache:'4h'},
		type:"get",
		dataType:"json",
		success:function(msg){
			if(msg.code == 200){
				$(".popular_emoji .popular_list").html(msg.data.emojis);
				$(".popular_list a").attr("title",msg.data.alert);
				$("#popular_emoji_update").attr("data-update",msg.data.update);
				$("#popular_emoji_update").text(msg.data.alert);
				popular_scroll = false;
			}
		},
		error:function() {
			popular_scroll = true;
		}
	})
}

function get_user_info(){
	var timestamp = Date.parse(new  Date());
	$.ajax({
		url:"/"+language_code+"/get-user-info",
		data:{timestamp:timestamp},
		type:"post",
		dataType:"json",
		success:function(msg){
			if(msg.code == 200){
				$(".nav_switch_box a.user_center").html(msg.data.emoji_head);
				$(".nav_switch_box a.user_center").addClass("online");
				$(".nav_switch_box details summary").html(msg.data.emoji_head);
				$(".nav_switch_box details").addClass("online");
			}else{
				$(".nav_switch_box a.user_center").html('<i class="iconfont iconuser"></i>');
				$(".nav_switch_box a.user_center").removeClass("online");
				$(".nav_switch_box details summary").html('<i class="iconfont iconuser no-rotate"></i>');
				$(".nav_switch_box details").removeClass("online");
			}
			$(".nav_switch_box a.user_center").attr("href",msg.data.href);
			$(".nav_switch_box>details>ul>div").before(msg.data.html);
		}
	})
}

//用户中心取消收藏
function cancel_collect(cmt_id,type,obj){
	var timestamp = Date.parse(new  Date());
	$.ajax({
		url:"/en/collect",
		data:{timestamp:timestamp,act:'post',cmt_id:cmt_id,page_type:type},
		type:"post",
		dataType:"json",
		success:function(msg){
			if(msg.code == 200){
				if(obj.hasClass('cancel_collect')){
					obj.parents(".col.mb_1").remove();
				}else if(obj.hasClass('collect_list')){
					if(msg.data.is_collect == 1){
						var text = '<i class="emoji_font line" style="filter: grayscale(0);">⭐️</i>';
					}else{
						var text = '<i class="emoji_font line" style="filter: grayscale(1);">⭐️</i>';
					}
					obj.find("div").html(text);
				}
			}
			set_toast_off('post',msg.msg);
			user_collect = 2;
		}
	})
}

function get_user_collect(type,id){
	$.ajax({
		url:"/"+language_code+"/get-user-collect",
		data:{type:type},
		type:"post",
		dataType:"json",
		success:function(msg){
			if(msg.code == 200){
				user_collect_data = msg.data;
				set_collect_select(msg.data,id);
			}
		}
	})
}

//设置收藏状态
function set_collect_select(data,id=''){
	if(id){
		$(".categories-"+id+" .collect_list").each(function(){
			var _this = $(this);
			var cmt_id = $(this).data("cmt_id");
			cmt_id += '';
			if($.inArray(cmt_id,data) != -1){
				_this.find("i").attr("style","filter: grayscale(0);");
			}
		})
	}else{
		$(".collect_list").each(function(){
			var _this = $(this);
			var cmt_id = $(this).data("cmt_id");
			cmt_id += '';
			if($.inArray(cmt_id,data) != -1){
				_this.find("i").attr("style","filter: grayscale(0);");
			}
		})
	}
}

function get_history_record(act){
	if(act == 'clear'){
		localStorage.removeItem('history_'+language_code);
		$("#selction-ajax .history_record_box").addClass('hide');
		$("#selction-ajax .history_record").empty();
	}
	if(act == 'get'){
		var history = localStorage.getItem('history_'+language_code);
        if (history === null) {
        	$("#selction-ajax .history_record_box").addClass('hide');
			$("#selction-ajax .history_record").empty();
        	return false;
        }

        // 转换数据
        history = JSON.parse(history);
        
        var html = '';
        history.forEach((item) => {
	        html += '<a class="p-x0y0 radius_1 mr_1 text_silver" href="/'+language_code+'/search_results?keywords='+encodeURI(item)+'"><span class="emoji_font line">'+item+'</span></a>';
	    });
	    $("#selction-ajax .history_record_box").removeClass('hide');
	    $("#selction-ajax .history_record").html(html);
	}

    /*$.ajax({
		url:"/"+language_code+"/get-history-record",
		data:{act:act,language_code:language_code},
		type:"post",
		dataType:"json",
		success:function(msg){
			if(msg.data){
				$("#selction-ajax .history_record_box").removeClass('hide');
				$("#selction-ajax .history_record").html(msg.data);
			}else{
				$("#selction-ajax .history_record_box").addClass('hide');
				$("#selction-ajax .history_record").empty();
			}
		}
	})*/
}

function get_right_comment(){
	var date = new Date();  
	$.ajax({
		url:"/en/get-right-comment",
		data:{language_code:language_code,cache:'1h'},
		type:"get",
		dataType:"json",
		success:function(msg){
			if(msg.code == 200){
				$(".widget_comment_box").html(msg.data);
				var href = '/'+language_code+'/comment_lists?t='+date.getTime();
				$(".widget_comment_box").parent().prev().find('a').attr("href",href)
				comment_right_scroll = false;
			}
		},
		error:function() {
			comment_right_scroll = true;
		}
	})
}

function scrollCollect(id){
	//滚动到指定位置
	var res = scrollfun(".categories-"+id,200);
	if(!res) return false;

	//防止重复遍历
	if(emoji_type_arr[id]){
		emoji_type_arr[id] = false;
		set_collect_select(user_collect_data,id);
	}
}

function scrollPopular(popular_update){
	var res = scrollfun(".popular_emoji",200);
	if(res && popular_scroll) {
		popular_scroll = false;
    	get_popular_emoji(popular_update);
	}
}

function scrollRightComment(){
    var res = scrollfun('.widget_comment_box',200);
	if(res && comment_right_scroll) {
		comment_right_scroll = false;
    	get_right_comment();
	}
}

function scrollEmoji(){
	var res = scrollfun('.get_emoji_list',100);
	if(res && emoji_status == 2){
		emoji_status = 1;
		$(".loading_more").removeClass('hide');
		get_emoji_list();
	}
}

function scrollEmojiImage(brand,type){
	var res = scrollfun('.get_emoji_list',100);
	if(res && emoji_image_status == 2){
		emoji_image_status = 1;
		$(".loading_more").removeClass('hide');
		get_all_image_emoji_platform(brand,type);
	}
}

function scrollPlatformImage(brand){
	var res = scrollfun('.get_emoji_list',100);
	if(res && emoji_platform_status == 2){
		emoji_platform_status = 1;
		$(".loading_more").removeClass('hide');
		get_platform_image_list(brand);
	}
}

function scrollImageVserion(brand,version){
	var res = scrollfun('.get_emoji_list',100);
	if(res && image_version_scroll){
		image_version_scroll = false;
		$(".loading_more").removeClass('hide');
		get_image_version(brand,version);
	}
}

function scrollEmojiSentiment(emoji,type){
	var res = scrollfun('.sentiment_position_content',100);
	if(res && sentiment_position_status){
		sentiment_position_status = false;
		get_emoji_info(emoji,type);
	}
}

function scrollEmojiTags(emoji,type){
	var res = scrollfun('.tag_relation_display',100);
	if(res && tags_relations_status){
		tags_relations_status = false;
		get_emoji_info(emoji,type);
	}
}

/*var a,b,c;
 a=$(element).offset().top;//元素相对于窗口的距离
 b=$(window).scrollTop(); //监控窗口已滚动的距离;
 c=$(document).height();//整个文档的高度
 d=$(window).height();//浏览器窗口的高度
 element  标签
 offset  相对于窗口的距离
 */
function scrollfun(element, offset = 100) {
    var a, b, c, d;
    d = $(element).offset().top; //元素相对于窗口的距离
    a = eval(d - offset);
    b = $(window).scrollTop(); //监控窗口已滚动的距离
    c = $(window).height(); //浏览器窗口的高度
	
    if (b + c > a) {
    	return true;
    }else{
    	return false;
    }
}

function getUrlFirstParam(value){
    if(value!==null || value !==''){
        const str = value.split("https://");
        const index = str[1].indexOf("/")+1;
        var param = str[1].substring(index);
        if(param.indexOf('/') == -1){
            if(param.indexOf('?') == -1){
                return param;
            }else{
                return param.split('?')[0]; 
            }
        }else{
            return param.split('/')[0]; 
        }
   }
   return null;
}

//获取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return decodeURI(r[2]); 
    return null; //返回参数值
}


//弹框
function set_toast_off(act,message = ''){
	if(message == ''){
		return false;
	}
	var arr = ['post','like','report','edit','del'];
	if($.inArray(act,arr) != -1){
		$(".toast-body").find("p").text(message);
		$(".toast").removeClass("off");
		$(".toast").addClass("on");
		setTimeout(function() {
		   	$(".toast-body").find("p").text(' ');
			$(".toast").removeClass("on");
			$(".toast").addClass("off");
		}, 2000); 
	}
}
