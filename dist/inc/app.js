var _gaq=_gaq||[];_gaq.push(["_setAccount","UA-19810778-1"]),_gaq.push(["_gat._forceSSL"]),_gaq.push(["_trackPageview"]),function(){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src=("https:"==document.location.protocol?"https://ssl":"http://www")+".google-analytics.com/ga.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n)}(),$(".jumbo-card").each(function(t,n){var e,o;return e=$(n),o=$(window),o.scroll(function(){var t,n,r;return r=o.scrollTop(),t=e.height(),t>r?(n=Math.max(Math.floor(.5*r),0),e.css("backgroundPositionY",n)):void 0})}),$(document).ready(function(){var t,n,e,o,r;return t=$(".popover-frame"),e=null,r=function(n){return e?void 0:(e=$("<iframe>").attr("src",n),t.fadeIn().prepend(e))},n=function(){var n;return e?(n=e,e=null,t.fadeOut(function(){return n.remove(),n=null})):void 0},$("a.play-button").click(function(){return r($(this).attr("href")),!1}),$(".popover-frame .close-button").click(function(){return n(),!1}),$(document).keyup(function(t){return 27===t.keyCode?n():void 0}),o=function(){var t;return t=$(".heading").height(),t?$(".main").css("top",t):void 0},o(),$(document).load(o),$(window).resize(o),$(".back-button").click(function(){return document.referrer===this.href?window.history.back():void 0})}),function(){var t;return t=function(){var t,n,e,o,r,c;return n=document.body.clientWidth,e=420,e>n?(c=e,o=(n/e).toFixed(2)):(c="device-width",o="1"),t="width="+c+", initial-scale="+o+", minimum-scale="+o,r=$("viewport"),r.attr("content")!==t?r.attr("content",t):void 0},$(window).on("orientationchange",t),t()}();
//# sourceMappingURL=dist/inc/app.js.map
//# sourceMappingURL=app.js.map