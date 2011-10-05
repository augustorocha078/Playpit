
var mottos = ['実験サイト','勉強サイト','自己満足サイト','砂場', '粒子遊び'];

var siteinfo;
var currentIndex;
var link;
var backgroundColor;
var textColor1;
var textColor2;
var textColor3;
var themeColor;
var subColor1;
var subColor2;
var text;

function update(n){

	//info
	currentIndex = n;
	link = siteinfo[currentIndex].link;
	backgroundColor = siteinfo[currentIndex].backgroundColor;
	textColor1 = siteinfo[currentIndex].textColor1;
	textColor2 = siteinfo[currentIndex].textColor2;
	textColor3 = siteinfo[currentIndex].textColor3;
	themeColor = siteinfo[currentIndex].themeColor;
	subColor1 = siteinfo[currentIndex].subColor1;
	subColor2 = siteinfo[currentIndex].subColor2;
	text = siteinfo[currentIndex].text;
	
	var time = 800;
	
	//header
	$('header>h1>span:eq(0)').stop().animate({color:textColor1}, time);
	$('header>h1>span:eq(1)').stop().animate({color:subColor1}, time);
	$('header>h1>span:eq(2)').stop().animate({color:textColor3}, time);
	$('header>h1>span:eq(3)').stop().animate({color:subColor2}, time);
	$('header>h1>span:eq(4)').stop().animate({color:textColor3}, time);
	
	//next prev
	var prevIdx = (currentIndex==0) ? siteinfo.length-1 : currentIndex-1;
	var nextIdx = (currentIndex==siteinfo.length-1) ? 0 : currentIndex+1;
	$('ul#next_prev_nav>li:eq(0)>a').unbind('click');
	$('ul#next_prev_nav>li:eq(0)>a').click(function(){
		if(currentIndex!=prevIdx){
			$.address.value( String(prevIdx+1) );
		}
		return false;
	});
	$('ul#next_prev_nav>li:eq(1)>a').unbind('click');
	$('ul#next_prev_nav>li:eq(1)>a').click(function(){
		if(currentIndex!=prevIdx){
			$.address.value( String(nextIdx+1) );
		}
		return false;
	});
	
	//heading number
	$('section>h1').text(String(100+n+1).substr(1,2));
	$('section>h1').stop().animate({color:themeColor},1500);

	//border
	$('div#content_info').css({borderLeftColor:textColor3});
	
	//menus
	$.each( siteinfo, function(i, item){
		var a =  $('ul#content_menus>li:eq('+i+')>a' );
		if(i==currentIndex){
			a.animate({color:siteinfo[i].themeColor},time);
			a.hover(
				//mouseover
				function(){ 
					$(this).css({color:siteinfo[i].themeColor});
				},
				//mouseout
				function(){ 
					$(this).css({color:siteinfo[i].themeColor});
				}
			);
		}else{
			a.animate({color:textColor3}, time);
			a.hover(
				//mouseover
				function(){ 
					$(this).css({color:siteinfo[i].themeColor});
				},
				//mouseout
				function(){ 
					$(this).css({color:textColor3});
				}
			);
		}
	})
	
	//text
	$('section>p').text(text).animate({color:textColor2}, time);
	
	//footer
	$('div.tate-line').stop().animate({color:textColor2}, time);
	$('div.copyright').stop().animate({color:textColor3}, time);
	
	//content
		$('<div class="cover_rect"/>')
		.css({backgroundColor:backgroundColor})
		.prependTo($('div#content'))
		.animate({opacity:1}, time, function(){	
			$('body').css({backgroundColor:backgroundColor});
			$('div#content>iframe').remove();
			$('<iframe/>').attr('src', link).appendTo($('div#content'));

			$('iframe').load(function(){
				$('div.cover_rect').delay(100).animate({opacity:0}, time, 'linear', function(){ $(this).remove(); });
			})
			
			
		});
	
	
	//title
	document.title = "playpit | " + $('section>h1').text();
	
	//widon't
	jQuery(function($){
	    $('p').each(
	        function(){
	            $(this).html($(this).html().replace(/([^\s])\s+([^\s]+)\s*$/, '$1&nbsp;$2'));
	        }
	    );
	});
	
	
}


function init(){
	
	//header
	$('header>h1').empty();
	$('<span>playpit</span><br/>').appendTo($('header>h1'));
	$('<span>.</span><span>kowareru</span><br/>').appendTo($('header>h1'));
	$('<span>.</span><span>com</span>').appendTo($('header>h1'));
	
	//next prev
	
	//menus
	$.each( siteinfo, function(i, item){
		var list = $('<li/>');
		var a = $('<a>●</a>').attr("href", item.link);
		a.click(
			function(){
				if(currentIndex!=i){
					$.address.value( String(i+1) );
				}
				return false;
			}
		);
		list.append(a);
		list.appendTo($('#content_menus'));
	})
	
}


$(document).ready(function(d){
	
	if(Math.random()<0.5){
		$('div.tate-line').text( mottos[Math.floor(Math.random()*mottos.length)] );
	}
	
	$.getJSON('index.json', 
		function(data){
			siteinfo = data;
			init();
			
			$.address.init(function(event){
			})

			$.address.change(function(event){
				var n = Number($.address.value().substr(1)) -1;
				if(n==-1){
					n = siteinfo.length-1;
				}
				if(currentIndex!=n) {
					update( n );
				}
			})
			
			var n = Number($.address.value().substr(1) )-1;
			if(n==-1){
				n = siteinfo.length-1;
			}
			update(n);

			
		});
})


