//
// Greasemonkey/UserJS script to scrobble vkontakte tracks plays.
// Compatible with Opera and Firefox. Maybe IE in future.
// Tested with Opera 9.5, Opera 10, Firefox3 (GM 0.8).
//
// More info at http://nichtverstehen.de/vkontakte-scrobbler
//
// Author: Cyril Nikolaev <cyril7@gmail.com>
// Licensed under GNU LGPL (http://www.gnu.org/copyleft/lesser.html)
//
// ==UserScript==
// @name          vkontakte-scrobbler
// @namespace     http://nichtverstehen.de/vkontakte-scrobbler
// @version       0.1
// @description   scrobble vkontakte audiotrack plays
//
// @copyright 2009, Cyril Nikolaev (http://nichtverstehen.de)
// @licence LGPL
//
// @include http://vkontakte.ru/audio*
// @include http://vkontakte.ru/id*
// @include http://vkontakte.ru/club*
// @include http://vkontakte.ru/profile.php*
// @include http://vkontakte.ru/images/qmark.gif
// @include http://ext.last.fm/1.0/
// @include http://*.audioscrobbler.com/*
// ==/UserScript==

(function() { /*  begin private namespace */

var log_ = function(s) {
	if (window.opera)
		window.opera.postError(s);
	else if (console && console.log)
		console.log(s);
}

var scrobbler = Scrobbler = {
	fm: null,
	updateInterval: 1000,
	
	track: {},
	playTime: 0,
	scrobbleTime: 0,
	startTime: 0,
	timer: 0,
	
	scrobblerDiv: null,
	lfmIcon: "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%0D%00%00%00%08%08%06%00%00%00%22%26u%CF%00%00%00%04sBIT%08%08%08%08%7C%08d%88%00%00%00%09pHYs%00%00%0D%D7%00%00%0D%D7%01B(%9Bx%00%00%00%19tEXtSoftware%00www.inkscape.org%9B%EE%3C%1A%00%00%00%CEIDAT%18%95m%CF%3F(%C4q%18%06%F0%E7'%E9dP%EA%8A%95%B2%5EF%A3dp%1B%B2%D8%0CJ)%BBl%06%83%C5%84%98%D9%D4%C9%A0%CC%16%251%DEr%C9-%B21%1B%3E%06%DF%AB%EB%F2Lo%EF%F3%A7%E7I%92%60%1AW%E8%A2%83c%8C%16n%02%E7%F8%C0%3EjC%98I%F2%9C%E4%2B%C9z%92%CD%24sIZ%F9%C3v%92F%92%AD%24%B3I~%82%03%5C%A6%0F%18%2F%C9%AB%B8%C0%1D%86%FB%05ohf%00%D8(%DC%14%1E%F1%84%15TA%1B%CB%FF%98%AA%C2%AD%A1%86%5D%BC%E3%248%C2%E9%80a%04%93%D8%C1%03%AA%F2_D7h%E0%1B%7B%E5%5E(U%CE0%86%D7%B2k%097%B8%ED%25%CF%E3%1E%9F%A5%D2ao8%EA%25%E4%05%D7%A8%FF%02%85%7C%FB%15%5BI%1C5%00%00%00%00IEND%AEB%60%82",
	loadIcon: "data:image/gif,GIF89a%0A%00%0A%00%91%03%00%CC%CC%CC%FFff%FF%00%00%FF%FF%FF!%FF%0BNETSCAPE2.0%03%01%00%00%00!%F9%04%05%00%00%03%00%2C%00%00%00%00%0A%00%0A%00%00%02%17%9C'r%06%80%1A%02s'%AE%3Bqk%9A%E2%C3%81%14Gz%D9Q%00%00!%F9%04%05%00%00%03%00%2C%01%00%00%00%08%00%03%00%00%02%0A%9C%136%22%83%03%00S%10%14%00!%F9%04%05%00%00%03%00%2C%00%00%00%00%06%00%06%00%00%02%0C%9C%070%11%A8%7C%A2%11%22%D2X%00%00!%F9%04%05%00%00%03%00%2C%00%00%01%00%03%00%08%00%00%02%0A%1C%608%13%C1%BE%96%10c%16%00!%F9%04%05%00%00%03%00%2C%00%00%04%00%06%00%06%00%00%02%0A%04%86c%C9%1C%E1%A0%10l%16%00!%F9%04%05%00%00%03%00%2C%01%00%07%00%08%00%03%00%00%02%0A%04%86%23b%13%A1Dz%A9%00%00!%F9%04%05%00%00%03%00%2C%04%00%04%00%06%00%06%00%00%02%0C%9C'r%A8%BB%11%06%00%03Jz%0A%00!%F9%04%09%00%00%03%00%2C%07%00%01%00%03%00%08%00%00%02%0A%94f%A3%1A1%BD%00%18r%14%00%3B",
	xIcon: "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%08%00%00%00%08%08%06%00%00%00%C4%0F%BE%8B%00%00%00%04sBIT%08%08%08%08%7C%08d%88%00%00%00%09pHYs%00%00%0D%D7%00%00%0D%D7%01B(%9Bx%00%00%00%19tEXtSoftware%00www.inkscape.org%9B%EE%3C%1A%00%00%00qIDAT%18%95%5D%8EA%0A%C2%40%10%04%8B%90%F8%B7%40n%92%D7%18%3C%04%FC%8A%90C%C0%A0%7F1%DF%F0%AABy%D8M%1C%B6a%60%98%EE.%06%B5SG%95b%06%B5E%BD%9At%09%E69%DF%26%D4Z%9DC%E8%94%F7%9B%DAl%8D%18%DAM%95%8A%A4%2F%F0%E4%AF%15%F8%00l%8414%EF%F1%A7%D2l%D4C%0CU%19%BF%00%7D%C6%BE%81%23%F0%00%5E%3F%EF%97%AF%90%04%8D%25%A8%00%00%00%00IEND%AEB%60%82",
	anonIcon: "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%06%00%00%00%08%08%06%00%00%00%DA%C6%8E8%00%00%00%04sBIT%08%08%08%08%7C%08d%88%00%00%00%09pHYs%00%00%0D%D7%00%00%0D%D7%01B(%9Bx%00%00%00%19tEXtSoftware%00www.inkscape.org%9B%EE%3C%1A%00%00%00kIDAT%08%99M%CC%A1%0D%C2P%00E%D1%D7%04%85%24a%26%12%C2%02%20%11%2C%C0%0A%0D%06%87a%0C%12Tuw%00%16%20%5D%A0%9E%83%F9%D0%7F%93'%EE%15%2FX%A0%C5%0BO%9C%B0%0C.%18%B1%C5%06%03%AE%C1%0Ek%A4%EC%8Ew%AA%10%9C%F1%C1%A1%8E%C7%12%F7H%83%14%BA%24M%92U%92%CC2qK2%FF%5Bu%D5%E3%F1%F3%2Fr%CA~h%99%EC%B9%E7%00%00%00%00IEND%AEB%60%82",
	
	playingDiv: null,
	playingIcon: "data:image/gif,GIF89a%0C%00%0C%00%B3%00%00%FF%FF%FF%D6%D6%D6%CE%CE%CE%BD%BD%BD%B5%B5%B5%AD%AD%AD%A5%A5%A5%9C%9C%9C%94%94%94%8C%8C%8C%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00!%FF%0BNETSCAPE2.0%03%01%00%00%00!%F9%04%04%05%00%FF%00%2C%00%00%00%00%0C%00%0C%00%00%049%10%04B%2B%0D%40%94%5D(7%82!r%9B(%1E%E8a%00%40%8A%220r%B01%9C%20t%0E%24%7C%C2%FA%BB_%EFG%DC%0D%83H%1E%A2%C7%EC!%06%CD%E6%000X6%9F%80%08%00!%F9%04%04%05%00%FF%00%2C%00%00%00%00%0C%00%0C%00%00%048%10%04B%2B%0D%40%94%5D(7%82!r%9B(%1E%E8a%A6(%82%00%C0%01%BBt%F2%02w%9D%ECp%D2%F7%3B%1F%40H%0C%FE%86%40Dp%19D%0C%98%CC%01%60%A0d%3A%01%11%00!%F9%04%04%05%00%FF%00%2C%00%00%00%00%0C%00%0C%00%00%047%10%04B%2B%0D%40%94%5D(7%82!r%9B(%1E%E8a%00%40%8A%220r%B01%9C%D4%B4%9D%ECl%D2%EF%40%1F%40H%04%F6%8E%C3%5Bpy%1B0%83%03%C0%00%C1DD%23%00!%F9%04%04%05%00%FF%00%2C%00%00%00%00%0C%00%0C%00%00%048%10%04B%2B%0D%40%94%5D(7%82!n%00P%88%E2%A1%1EF%B9%AAH%8C%1C%A5%1C'v%5D%26%7C%9F%EC%BB%1E%10%F0%23%0A%89C%1E%C2%C7%C4%0D%9A%BE%01%60%B0d%22%A4%11%00!%F9%04%04%05%00%FF%00%2C%00%00%00%00%0C%00%0C%00%00%048%10%04B%2B%0D%40%94%5D(7%82!r%9B(%1E%E8a%00%40%8A%220r%B01%9C%D4%B4%9D%ECl%D2%F7%3B%1F%40H%0C%FE%86%40Dp%19D%0C%98%CC%01%60%A0d%3A%01%11%00!%F9%04%04%05%00%FF%00%2C%00%00%00%00%0C%00%0C%00%00%048%10%04B%2B%0D%40%94%5D(7%82!r%9B(%1E%E8a%A6(%E2%22%07%00%BCn%82%C8%F7%5C'%BC%9C%F8%BC%E0%0F0%2C%06%7DH%A2M%C8%B4%0D%9A%C2%01%60%80h%22%A4%11%00!%F9%04%04%05%00%FF%00%2C%00%00%00%00%0C%00%0C%00%00%047%10%04B%2B%0D%40%94%5D(7%82!r%9B(%1E%E8a%A6(%82%00%40%EA%CE%C9%0B%D8t%A2%C3%09%CF%EB%3D%40p%08%F4%09%7F%08%A0%12%88%18%2C%97%03%C0%20%B9l%02%22%00!%F9%04%04%05%00%FF%00%2C%00%00%00%00%0C%00%0C%00%00%046%10%04B%2B%0D%40%94%5D(7%82!r%9B(%1E%07%00%98h%8B%20%AA%AB%BE%09%0C%BC%AF%9A%EC%89%EE%03%BC%1E%F0%17%24%EAj%C1dm%A0%0C%0E%00%03%84%12%F1%8C%00%00!%F9%04%04%05%00%FF%00%2C%00%00%00%00%0C%00%0C%00%00%047%10%04B%2B%0D%40%94%5D(7%82!r%9B(%1E%E8a%A6(%82%00%40%EA%CE%C9%0B%CCt%A2%C3%09%CF%EB%3D%40p%08%F4%09%7F%08%A0%12%88%18%2C%97%03%C0%20%B9l%02%22%00!%F9%04%04%05%00%FF%00%2C%00%00%00%00%0C%00%0C%00%00%047%10%04B%2B%0D%40%94%5D(7%82!r%9B(%1E%E8a%A6(%82%00%40%EA%CE%C9%0B%D8v%A2'0%0F%F8%3B%60%AF%B7%1B%FE%88%88%A0%B26X%06%07%80AR%89%80F%00%00!%F9%04%04%05%00%FF%00%2C%00%00%00%00%0C%00%0C%00%00%047%10%04B%2B%0D%40%94%5D(7%82!r%9B(%1E%E8a%A6(%E2%22%07%00%BCnB%CBo%A2'2%0F%F8%3B%60%AF%B7%1B%FE%88%88%A0%D26X%06%07%80AR%89%80F%00%00%3B",
	pauseIcon: "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%0C%00%00%00%0C%08%06%00%00%00Vu%5C%E7%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%04gAMA%00%00%B1%8F%0B%FCa%05%00%00%00%09pHYs%00%00%0E%C3%00%00%0E%C3%01%C7o%A8d%00%00%00%18tEXtSoftware%00Paint.NET%20v3.36%A9%E7%E2%25%00%00%00zIDAT(S%BD%8F1%0E%C0%20%0C%03%FD%7F12%B2222%F2%05F%BE%93%F6*EJ%3B%D0N%B5d%C5Il%11d'%D6Z%D6%7B%DF%12%0F%D0%9C%D3Zk7z8%CEk%AD%86W%08%E73H%1F%F7h%95R%2C%92%A1%E3%B9%A3W%CE%D9%604%B9%F6%5D%ACJ)%DD%021%1C5%3Ex%05%A0c%A7%7F%0Ap%A7%9F%F5V%F1j%8C%F19%80W%7C%16%B1%7B%89%1D%1Ep%00A%F8%BEk%CDQ%3B%5D%00%00%00%00IEND%AEB%60%82",
	scrobbleFailIcon: "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%08%00%00%00%08%08%06%00%00%00%C4%0F%BE%8B%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%04gAMA%00%00%B1%8F%0B%FCa%05%00%00%00%09pHYs%00%00%0E%C3%00%00%0E%C3%01%C7o%A8d%00%00%00%18tEXtSoftware%00Paint.NET%20v3.36%A9%E7%E2%25%00%00%00TIDAT(Sc%60%00%82%9E%9E%9E%18%206%06%B1a%00%24%06f%03%19~%40%FC%1F%88o%C1%14%01%E99P%B1n%98%A2%C3H%8A%D6%A1k%40W%84b%1A%B2%9D0c1%15%20%D9%09r%07%B2u%C60%1F%A0%3B%12%A6h%1D%CC%FEn%2C%DE%9C%03%92%04%00%F2qe%DD%9C%92%3C%AF%00%00%00%00IEND%AEB%60%82",
	scrobbleOkIcon: "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%08%00%00%00%08%08%06%00%00%00%C4%0F%BE%8B%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%04gAMA%00%00%B1%8F%0B%FCa%05%00%00%00%09pHYs%00%00%0E%C3%00%00%0E%C3%01%C7o%A8d%00%00%00%18tEXtSoftware%00Paint.NET%20v3.36%A9%E7%E2%25%00%00%00HIDAT(Sc%60%C0%03zzzxpJ%03%25c%80%B8%8A%01%9B*%A8%E4%7F%98%82*%90%00%CC(%24I%14%05%20%0E%C8H%10%06%B1A%F80X%13%C8%18%24ATI%24c%0Fc%E8Dw%3E%C8H%B8%B1H%92%00jVJ%23%BDZ%E5%24%00%00%00%00IEND%AEB%60%82",
	
	
	initialize: function() {
		this.fm.display = this;
		var t_ = this;
		
		this.scrobblerDiv = document.createElement('a');
		this.scrobblerDiv.setAttribute('style', 'display: block; background-position: center center; background-repeat: no-repeat; width: 17px; height: 16px; border: 1px solid #aaa;');
		this.scrobblerDiv.setAttribute('title', 'Вконтакте-скробблер неактивен. \nКликните, чтоб войти на Last.fm');
		this.scrobblerDiv.setAttribute('href', '#');
		this.scrobblerDiv.setAttribute('target', '_blank');
		this.scrobblerDiv.className = 'vkontakte_scrobbler_inactive';
		this.scrobblerDiv.style.backgroundColor = '#bbb';
		this.scrobblerDiv.style.backgroundImage = 'url("'+this.lfmIcon+'")';
		this.scrobblerDiv.style.borderColor = '#aaa';
		
		var clickHandler = function(e) {
			if (e.target.className == 'vkontakte_scrobbler_inactive' ||
				e.target.className == 'vkontakte_scrobbler_error')
			{
				t_.fm.login();
				e.preventDefault();
			}
			else if (e.target.className == 'vkontakte_scrobbler_logging')
			{
				e.preventDefault();
			}
		};
		this.scrobblerDiv.addEventListener('click', clickHandler, false);
		
		if (location.pathname.indexOf('/audio.php') == 0) {
			if (this.scrobblerDiv.style.styleFloat == undefined) 
				this.scrobblerDiv.style.cssFloat = 'right';
			else this.scrobblerDiv.style.styleFloat = 'right';
			
			document.getElementById('bigSummary').appendChild(this.scrobblerDiv);
		} else if (location.pathname.indexOf('/audiosearch.php') == 0) {
			if (this.scrobblerDiv.style.styleFloat == undefined)
				this.scrobblerDiv.style.cssFloat = 'right';
			else this.scrobblerDiv.style.styleFloat = 'right';
			
			document.getElementById('audioSearch').appendChild(this.scrobblerDiv);
		} else {
			this.scrobblerDiv.style.display = 'block';
			this.scrobblerDiv.style.marginLeft = '52px';
			var sideBar = document.getElementById('sideBar');
			var banner1 = document.getElementById('banner1');
			if (banner1)
				sideBar.insertBefore(this.scrobblerDiv, banner1);
			else
				sideBar.appendChild(this.scrobblerDiv);
		}
	},
	
	scrobblerAnonymous: function() {
		this.scrobblerDiv.setAttribute('href', 'http://www.last.fm/login');
		this.scrobblerDiv.className = 'vkontakte_scrobbler_anonymous';
		this.scrobblerDiv.setAttribute('title', 'Вы не вошли на Last.fm. \nКликните здесь и залогиньтесь.');
		this.scrobblerDiv.style.backgroundColor = '#f4f77c';
		this.scrobblerDiv.style.backgroundImage = 'url("'+this.anonIcon+'")';
		this.scrobblerDiv.style.borderColor = '#f7df6d';
	},
	scrobblerLoginError: function(text) {
		if (!text) text = '';
		this.scrobblerDiv.setAttribute('href', '#');
		this.scrobblerDiv.className = 'vkontakte_scrobbler_error';
		this.scrobblerDiv.setAttribute('title', 'Ошибка '+text+'. \nКликните, чтоб попробовать снова.');
		this.scrobblerDiv.style.backgroundImage = 'url("'+this.xIcon+'")';
		this.scrobblerDiv.style.backgroundColor = '#faa';
		this.scrobblerDiv.style.borderColor = '#f88';
	},
	scrobblerLogging: function() {
		this.scrobblerDiv.setAttribute('href', '');
		this.scrobblerDiv.className = 'vkontakte_scrobbler_logging';
		this.scrobblerDiv.setAttribute('title', 'Вход...');
		this.scrobblerDiv.style.backgroundColor = '#bbb';
		this.scrobblerDiv.style.borderColor = '#aaa';
		this.scrobblerDiv.style.backgroundImage = 'url("'+this.loadIcon+'")';
	},
	scrobblerReady: function(username) {
		this.scrobblerDiv.setAttribute('href', 'http://www.last.fm/user/'+username);
		this.scrobblerDiv.className = 'vkontakte_scrobbler_ready';
		this.scrobblerDiv.setAttribute('title', 'Скробблер готов. \nВы '+username);
		this.scrobblerDiv.style.backgroundImage = 'url("'+this.lfmIcon+'")';
		this.scrobblerDiv.style.backgroundColor = '#517EA6';
		this.scrobblerDiv.style.borderColor = '#205B7F';
	},
	playingUpdate: function() {
		if (!this.playingDiv) {
			this.playingDiv = document.createElement('div');
			this.playingDiv.setAttribute('style', 'float: right; width: 12px; height: 12px; margin: 3px 7px 0px 2px; background-position: center center; background-repeat: no-repeat;');
		}
		var track = this.track;
		if ('id' in track && track.noScrobble == false) {
			var d = document.getElementById('performer'+track.id);
			if (!d) return;
			d = d.parentNode.parentNode;
			
			var pD = d.appendChild(this.playingDiv);
			var now = Math.floor((new Date()).getTime() / 1000);
			var delta = this.startTime>0 ? now-this.startTime : 0;
			var left = this.scrobbleTime - (this.playTime + delta);
			var leftStr = Math.floor(left/60) + ':' + (left%60);
			if (track.playing) {
				pD.style.backgroundImage = 'url("'+this.playingIcon+'")';
				pD.setAttribute('title', 'До отправки ' + leftStr);
			} else {
				pD.style.backgroundImage = 'url("'+this.pauseIcon+'")';
				pD.setAttribute('title', 'Пауза. До отправки ' + leftStr);
			}
		} else {
			var p = this.playingDiv.parentNode;
			if (p) {
				p.removeChild(this.playingDiv);
			}
		}
	},
	showScrobbleStatus: function(id, status) {
		this.playingUpdate();
		
		var d = document.getElementById('performer'+id);
		if (!d) return;
		d = d.parentNode.parentNode;
		
		var sD = document.getElementById('scrobbleStatus'+id);
		if (!sD) {
			sD = d.appendChild(document.createElement('div'));
			sD.setAttribute('id', 'scrobbleStatus'+id);
			sD.setAttribute('style', 'float: right; width: 12px; height: 12px; margin: 5px 7px 0px 1px; background-position: center center; background-repeat: no-repeat;');
		}
		
		if (status) {
			sD.style.backgroundImage = 'url("'+this.scrobbleOkIcon+'")';
			sD.setAttribute('title', 'Трек отправлен');
		} else {
			sD.style.backgroundImage = 'url("'+this.scrobbleFailIcon+'")';
			sD.setAttribute('title', 'Ошибка при отправке трека');
		}
	},
	
	start: function(rid) {
		stop();
		
		var btnE = document.getElementById('imgbutton'+rid);
		if (!btnE) return;
		this.track = {};
		this.track.id = rid;
		var t = /,(\d+)\);$/.exec(btnE.getAttribute('onclick'));
		this.track.len = Number(t[1]);
		this.track.noScrobble = false;
		this.track.artist = document.getElementById('performer'+rid).textContent;
		this.track.title = document.getElementById('title'+rid).textContent;
		this.track.startTime = Math.floor((new Date()).getTime() / 1000);
		if (this.track.len < 30) this.track.noScrobble = true;
		
		this.playTime = 0;
		this.startTime = 0;
		this.scrobbleTime = Math.min(240, Math.floor(this.track.len/2));
		
		var t_ = this;
		this.fm.nowPlaying(this.track, function() { t_.nowPlayingSuccess(rid); }, function() { t_.nowPlayingFail(rid); });
		
		this.play(rid);
		
		log_("Started " + this.track.artist + " - " + this.track.title);
	},
	
	play: function(id) {
		if (id != this.track.id || this.startTime != 0) return;
		this.startTime = Math.floor((new Date()).getTime() / 1000);
		var t_ = this;
		this.track.playing = true;
		window.clearInterval(this.timer); // ensure
		this.timer = window.setInterval(function() { t_.update(id); }, this.updateInterval);
		
		this.playingUpdate();
	},
	
	update: function(id) {
		if (id != this.track.id) return;
		
		var now = Math.floor((new Date()).getTime() / 1000);
		if (this.playTime + (now-this.startTime) >= this.scrobbleTime) {
			this.scrobble(id);
		}
		
		this.playingUpdate();
	},
	
	scrobble: function(id) {
		if (id != this.track.id || this.track.noScrobble) return;
		log_('scrobbler: in scrobble');
		
		this.track.noScrobble = true;
		var t_ = this;
		this.fm.scrobble(this.track, function () { t_.successScrobble(id); }, function (msg) { t_.failScrobble(id); }, function() { t_.failScrobble(id); });
	},
	
	pause: function(id) {
		if (id != this.track.id) return;
		window.clearInterval(this.timer);
		this.track.playing = false;
		
		var now = Math.floor((new Date()).getTime() / 1000);
		this.playTime += now-this.startTime;
		this.startTime = 0;
		
		this.playingUpdate();
		
		log_("paused");
	},
	
	stop: function() {
		this.pause();
		this.track = {};
		window.clearInterval(this.timer);
		
		this.playingUpdate();
		
		log_("stopped");
	},
	
	nowPlayingSuccess: function(id) {
		if (id == this.track.id) {
			// TODO: interface
		}
		log_("scrobbler: Now playing success");
	},
	
	nowPlayingFail: function(id) {
		log_("scrobbler: Now playing fail");
	},
	
	successScrobble: function(id) {
		if (this.track) this.track.scrobbled = 1;
		log_("Scrobble success");
		this.showScrobbleStatus(id, true);
	},
	
	failScrobble: function(id) {
		if (this.track) this.track.error = -1;
		log_("Scrobble failed");
		this.showScrobbleStatus(id, false);
	}
};

scrobbler.fm = {
	conn: null,
	username: '',
	
	display: null,
	
	login:  function(fn) {
		// TODO: use cookie (or GM)
		var t_ = this;
		this.display.scrobblerLogging();
		this.conn.login(
			function(username, session, np_url, scr_url) {
				t_.successLogin(username, session, np_url, scr_url);
				if (fn) fn(); 
			},
			function() { t_.anonymous(); }, function(text) { t_.handleLoginError(text) }, function(text) { t_.handleLoginError(text) }
		);
	},
	
	nowPlaying: function(rtrack, success) {
		var t_ = this;
		var fn = function() { t_.nowPlaying(rtrack, success); }
		if (!this.conn.logged()) {
			this.login(fn); 
		}
		this.conn.nowPlaying(rtrack, success,
			function() { t_.handleBadSession( fn ); } 
		);
	},
	
	scrobble: function(rtrack, success, fail) {
		var t_ = this;
		this.conn.scrobble(rtrack, success,
			function() { 
				t_.handleBadSession( function() { t_.scrobble(rtrack, success, fail); } );
			},
			function() { if (fail) fail(msg); },
			function() { if (fail) fail(0); }
		);
	},
	
	handleBadSession: function(fn) {
		// TODO: clear cookie (or GM)
		log_("FM: Bad session");
		this.login(fn); 
	},
	
	handleLoginError: function(text) {
		log_("FM: login error");
		this.display.scrobblerLoginError(text);
	},
	
	anonymous: function() {
		log_("FM: Anonymous");
		this.display.scrobblerAnonymous();
	},
	
	successLogin: function(username, session, np_url, scr_url) {
		this.username = username;
		log_("FM: Login succeeded");
		this.display.scrobblerReady(username);
		// TODO: save data in cookies
	}
};

if (location.hostname == 'vkontakte.ru' && 
	(location.pathname.indexOf('/audio') == 0 ||
	location.pathname.indexOf('/id') == 0 ||
	location.pathname.indexOf('/profile.php') == 0 ||
	location.pathname.indexOf('/club') == 0)) {
	// vkontakte part
	// Hook up to vkontakte's audio object
	log_('Vkontakte part started: ');
	var win = (typeof unsafeWindow != 'undefined') ? unsafeWindow : window;
	
	var oldHandler = win.AudioObject.stateChanged;
	win.AudioObject.stateChanged = function(id, wall, state, message) {
		log_("stateChanged(id="+id+", wall="+wall+", state="+state+", message="+message+")");
		var r = oldHandler.call(this, id, wall, state, message);
		if (wall) return r;
		
		switch (state) {
		case 'init':
			setTimeout(function(){scrobbler.start(id);}, 0); // bad boys just broke GM security system
			// TODO: think of a better approach
			break;
		case 'playing':
			setTimeout(function(){scrobbler.play(id);}, 0);
			break;
		case 'paused':
			setTimeout(function(){scrobbler.pause(id);},0);
			break;
		case 'finished':
		case 'stopped':
			setTimeout(function(){scrobbler.stop();},0);
			break;
		};
		 
		return r;
	}
	
	var oldPageHandler = win.getPageContent;
	win.getPageContent = function(offset, inTop, afterFunc, obj) {
		log_("getpagecontent");
		setTimeout(function(){scrobbler.stop();},0);
		return oldPageHandler.call(offset, inTop, afterFunc, obj);
	}
	
	window.setTimeout(function(){ scrobbler.initialize(); }, 1000);
}

//  Vkontakte-ff-connection  (browser-specific)
var ff_conn = {
	state: 0, // 0 - no connection, 1 - connecting, 2 - logged in
	session: 0,
	username: '',
	npUrl: '', // http://post.audioscrobbler.com:80/np_1.2
	scrUrl: '', // http://post2.audioscrobbler.com:80/protocol_1.2
	bad: false, // permanent login error (banned, badauth)
	
	clientName: 'tst', // vkf
	clientVer: '1.0',
	
	/* successHandler(username, session, np_url, scr_url), anonymousHandler(), failHandler(message), errorHandler(message) */
	login: function(successHandler, anonymousHandler, failHandler, errorHandler) {
		if (this.bad) {
			return; //TODO: maybe report
		}
		if (this.state == 1)  {
			return; // ignore multiple simultaneus logins
		}
		log_("Conn: Login requested "+this.state);
		this.state = 1;
		
		var loginTime = Math.floor((new Date()).getTime() / 1000);
		
		var t_ = this; // add to closure
		var parser = new DOMParser();
		var username = '';
		
		var cancel = false; var timeout = 0;
		
		var gotError = function(responseDetails) {
			log_('Conn: Error getting token. Code '+responseDetails.status);
			t_.state = 0;
			if (errorHandler) errorHandler('httpLoginError '+responseDetails.status);
		};
		var gotSessionResult = function(responseDetails) {
			if (cancel) return; clearTimeout(timeout); // timeout
			var result = responseDetails.responseText.split('\n');
			var status = result[0];//.trim()
			if (status == 'BANNED' || status == 'BADAUTH') {
				t_.state = 0;
				t_.bad = true;
				errorHandler();
				return;
			}
			if (status == 'BADTIME') {
				t_.state = 0;
				failHandler('BADTIME');
				return;
			}
			if (status.slice(0, 6) == 'FAILED') {
				t_.state = 0;
				failHandler(status.slice(7));
				return;
			}
			var session = result[1];
			var np_url = result[2], scr_url = result[3];
			log_('Conn: Got session id '+session);
			t_.state = 2;
			t_.session = session;
			t_.npUrl = np_url;
			t_.scrUrl = scr_url;
			t_.username = username;
			successHandler(username, session, np_url, scr_url);
		}
		var gotToken = function(responseDetails) {
			if (cancel) return; clearTimeout(timeout); // timeout
			
			var responseXML = parser.parseFromString(responseDetails.responseText, "text/xml");
			if (responseXML.getElementsByTagName('string').length < 1) { gotError(1); return; }
			var token = responseXML.getElementsByTagName('string').item(0).firstChild.textContent;
			log_('Got token '+username+','+token);
			
			GM_xmlhttpRequest({ method: 'GET', url: 'http://post.audioscrobbler.com/?hs=true&p=1.2.1'+
				'&c='+t_.clientName+'&v='+t_.clientVer+'&u='+username+'&t='+loginTime+'&a='+token, 
				onload: gotSessionResult, onerror: gotError});
		};
		var gotLogin = function(responseDetails) {
			if (cancel) return; clearTimeout(timeout); // timeout cancelled request
			
			var responseXML = parser.parseFromString(responseDetails.responseText, "text/xml");
			if (responseXML.getElementsByTagName('string').length < 1) { gotError(1); return; }
			username = responseXML.getElementsByTagName('string').item(0).firstChild.textContent;
			log_('Found username: '+username);
			if (username == 'LFM_ANON') {
				t_.state = 0;
				anonymousHandler();
				return;
			}
			
			GM_xmlhttpRequest({method: 'POST', url: 'http://ext.last.fm/1.0/webclient/xmlrpc.php',
				data: '<methodCall><methodName>getScrobbleAuth</methodName><params><param><value><string>'+username+'</string>'+
					'</value></param><param><value><string>'+loginTime+'</string></value></param></params></methodCall>',
				onload: gotToken, onerror: gotError});
		};
		GM_xmlhttpRequest({ method: 'POST', url: 'http://ext.last.fm/1.0/webclient/xmlrpc.php',
			data: '<methodCall><methodName>getSession</methodName><params /></methodCall>',
			onload: gotLogin, onerror: gotError});
			
		// user defined timeout. See bug http://greasemonkey.devjavu.com/ticket/100
		timeout = setTimeout(function() {
			cancel = true;
			gotError({status: 'timeout'});
		}, 25000);
	},
	
	useSession: function(session, np_url, scr_url) {
		log_("Conn: Use session " + session + " requested");
		
		this.state = 2;
		this.session = session;
		this.npUrl = np_url;
		this.scrUrl = scr_url;
	},
	
	logged: function() {
		return this.state >= 2;
	},
	
	/* successHandler(), badSessionHandler(), errorHandler() */
	nowPlaying: function(track, successHandler, badSessionHandler, errorHandler) {
		log_("Conn: Requested now playing " + track['artist'] + " " + track['title']);
		if (!this.logged()) {
			if (errorHandler) errorHandler();
			return;
		}
		
		var artist = encodeURIComponent(track['artist']);
		var title = encodeURIComponent(track['title']);
		var secs = encodeURIComponent(track['len'] ? track['len'] : '');
		var album = encodeURIComponent(track['album'] ? track['album'] : '');
		var trackn = encodeURIComponent(track['trackn'] ? track['trackn'] : '');
		var mbid = encodeURIComponent(track['mbid'] ? track['mbid'] : '');
		
		var cancel = false; var timeout = 0; // to set from timeout
		var gotError = function(code) { if (errorHandler) errorHandler(); }
		var ok = function(responseDetails){
			if (cancel) return; clearTimeout(timeout); // timeout
			
			log_('Conn: nowPlayng callback');
			var result = responseDetails.responseText.split('\n');
			var status = result[0];
			if (status == 'OK') {
				successHandler();
			}
			else if (status == 'BADSESSION') {
				if (badSessionHandler) badSessionHandler();
			} else gotError();
		};
		var poststring = 's='+this.session+'&a='+artist+'&t='+title+'&b='+album+'&l='+secs+'&n='+trackn+'&m='+mbid;
		GM_xmlhttpRequest({ method: 'POST', url: this.npUrl,
			headers: {'Content-type': 'application/x-www-form-urlencoded', 'Content-Length': poststring.length},
			data: poststring,
			onload: ok, onerror: gotError});
			
		timeout = setTimeout(function() {
			cancel = true;
			gotError('timeout');
		}, 15000);
	},
	
	/* successHandler(), badSessionHandler(), failHandler(message), errorHandler() */
	scrobble: function(track, successHandler, badSessionHandler, failHandler, errorHandler) {
		log_("Conn: Requested scrobble " + track['artist'] + " " + track['title']);
		if (!this.logged()) {
			if (errorHandler) errorHandler();
			return;
		}
		
		var artist = encodeURIComponent(track['artist']);
		var title = encodeURIComponent(track['title']);
		var secs = encodeURIComponent(track['len'] ? track['len'] : '');
		var album = encodeURIComponent(track['album'] ? track['album'] : '');
		var trackn = encodeURIComponent(track['trackn'] ? track['trackn'] : '');
		var mbid = encodeURIComponent(track['mbid'] ? track['mbid'] : '');
		
		var cancel = false; var timeout = 0; // timeout came
		var gotError = function(responseDetails) { if (errorHandler) errorHandler(); }
		var ok = function(responseDetails){
			if (cancel) return; clearTimeout(timeout);
			
			var result = responseDetails.responseText.split('\n');
			log_('Conn: scrobble callback');
			var status = result[0];
			if (status == 'OK') {
				successHandler();
			}
			else if (status == 'BADSESSION') {
				if (badSessionHandler) badSessionHandler();
			} else if (status.slice(0, 6) == 'FAILED') {
				if (failHandler) failHandler(status.slice(7));
			} else gotError();
		};
		
		var poststring = 's='+this.session+'&a[0]='+artist+'&t[0]='+title+'&i[0]='+track['startTime']+
			'&o[0]=P&r[0]=&b[0]='+album+'&l[0]='+secs+'&n[0]='+trackn+'&m[0]='+mbid;
		GM_xmlhttpRequest({ method: 'POST', url: this.scrUrl,
			headers: {'Content-type': 'application/x-www-form-urlencoded', 'Content-Length': poststring.length},
			data: poststring,
			onload: ok, onerror: gotError });
			
		timeout = setTimeout(function() {
			cancel = true;
			gotError('timeout');
		}, 15000);
	}
};
	
//  Vkontakte-opera-connection  (browser-specific)
var opera_conn = {
	state: 0, // 0 - no connection, 1 - connecting, 2 - logged in
	session: 0,
	username: '',
	npUrl: '',
	scrUrl: '',
	bad: false, // permanent login error (banned, badauth)
	
	clientName: 'tst', // vkf
	clientVer: '1.0',
	
	stub_url: 'http://vkontakte.ru/images/qmark.gif',
	
	/* successHandler(username, session, np_url, scr_url), anonymousHandler(), failHandler(message), errorHandler(message) */
	login: function(successHandler, anonymousHandler, failHandler, errorHandler) {
		if (this.bad) {
			return; //TODO: maybe report
		}
		if (this.state == 1)  {
			return; // ignore multiple simultaneus logins
		}
		log_("Conn: Login requested "+this.state);
		this.state = 1;
		
		var loginTime = Math.floor((new Date()).getTime() / 1000);
		var tokenReq = Requester.request('http://ext.last.fm/1.0/#getToken', this.stub_url, loginTime, 20000);
		tokenReq.addErrback(function(errno) {
			log_('Conn: Error getting token. Code '+errno);
		});
		
		var t_ = this; // add to closure
		var gotError = function(status) {
			t_.state = 0;
			if (errorHandler) errorHandler(status);
		};
		var gotSessionResult = function(username, result) {
			var status = result[0];//.trim()
			if (status == 'BANNED' || status == 'BADAUTH') {
				t_.state = 0;
				t_.bad = true;
				return;
			}
			if (status == 'BADTIME') {
				t_.state = 0;
				failHandler('BADTIME');
				return;
			}
			if (status.slice(0, 6) == 'FAILED') {
				t_.state = 0;
				failHandler(status.slice(7));
				return;
			}
			var session = result[1];
			var np_url = result[2], scr_url = result[3];
			log_('Conn: Got session id '+session);
			t_.state = 2;
			t_.session = session;
			t_.npUrl = np_url;
			t_.scrUrl = scr_url;
			t_.username = username;
			successHandler(username, session, np_url, scr_url);
		}
		tokenReq.addCallback(function(result) {
			var username = result[0];
			if (username == 'LFM_ANON') {
				t_.state = 0;
				anonymousHandler();
				return;
			}
			
			var token = result[1];
			log_('Conn: Got username '+username+' token '+token);
			var sessionReq = Requester.request('http://post.audioscrobbler.com/?hs=true&p=1.2.1'+
				'&c='+t_.clientName+'&v='+t_.clientVer+'&u='+username+'&t='+loginTime+'&a='+token, t_.stub_url, [], 10000);
			sessionReq.addCallback(function(result) {
				gotSessionResult(username, result);
			});
			
			sessionReq.addErrback(function(errno) {
				log_('Conn: Error getting sessid. Code '+errno);
				gotError();
			});
		});
		tokenReq.addErrback(function(code) {
			gotError(code);
		});
	},
	
	useSession: function(session, np_url, scr_url) {
		log_("Conn: Use session " + session + " requested");
		
		this.state = 2;
		this.session = session;
		this.npUrl = np_url;
		this.scrUrl = scr_url;
	},
	
	logged: function() {
		return this.state >= 2;
	},
	
	/* successHandler(), badSessionHandler(), errorHandler() */
	nowPlaying: function(track, successHandler, badSessionHandler, errorHandler) {
		log_("Conn: Requested now playing " + track['artist'] + " " + track['title']);
		
		if (!this.logged()) {
			if (errorHandler) errorHandler();
			return;
		}
		
		var artist = track['artist'];
		var title = track['title'];
		var secs = track['len'] ? track['len'] : '';
		var album = track['album'] ? track['album'] : '';
		var trackn = track['trackn'] ? track['trackn'] : '';
		var mbid = track['mbid'] ? track['mbid'] : '';
		
		var req = Requester.request('', this.stub_url, '');
		var reqWin = req.iframe.contentWindow;
		reqWin.document.documentElement.innerHTML = '<html><head></head><body>'+
			'<form action="'+this.npUrl+'" method="post" id="postForm">'+
			'<input type="text" name="s" value="'+this.session+'"/>'+
			'<input type="text" name="a" value="'+artist+'"/>'+
			'<input type="text" name="t" value="'+title+'"/>'+
			'<input type="text" name="b" value="'+album+'"/>'+
			'<input type="text" name="l" value="'+secs+'"/>'+
			'<input type="text" name="n" value="'+trackn+'"/>'+
			'<input type="text" name="m" value="'+mbid+'"/>'+
			'</form></body></html>';
		var form = reqWin.document.getElementById('postForm');
		form.submit();
		
		var gotError = function(code) { if (errorHandler) errorHandler(); }
		req.addErrback(gotError);
		req.addCallback(function(result){
			log_('Conn: nowPlayng callback');
			var status = result[0];
			if (status == 'OK') {
				successHandler();
			}
			else if (status == 'BADSESSION') {
				if (badSessionHandler) badSessionHandler();
			} else gotError();
		});
	},
	
	/* successHandler(), badSessionHandler(), failHandler(message), errorHandler() */
	scrobble: function(track, successHandler, badSessionHandler, failHandler, errorHandler) {
		log_("Conn: Requested scrobble " + track['artist'] + " " + track['title']);
		
		if (!this.logged()) {
			if (errorHandler) errorHandler();
			return;
		}
		
		var artist = track['artist'];
		var title = track['title'];
		var secs = track['len'] ? track['len'] : '';
		var album = track['album'] ? track['album'] : '';
		var trackn = track['trackn'] ? track['trackn'] : '';
		var mbid = track['mbid'] ? track['mbid'] : '';
		
		var req = Requester.request('', this.stub_url, '');
		var reqWin = req.iframe.contentWindow;
		reqWin.document.documentElement.innerHTML = '<html><head></head><body>'+
			'<form action="'+this.scrUrl+'" method="post" id="postForm">'+
			'<input type="text" name="s" value="'+this.session+'"/>'+
			'<input type="text" name="a[0]" value="'+artist+'"/>'+
			'<input type="text" name="t[0]" value="'+title+'"/>'+
			'<input type="text" name="i[0]" value="'+track['startTime']+'"/>'+
			'<input type="text" name="o[0]" value="P"/>'+ //  chosen by user
			'<input type="text" name="r[0]" value=""/>'+ //  no love/ban
			'<input type="text" name="b[0]" value="'+album+'"/>'+
			'<input type="text" name="l[0]" value="'+secs+'"/>'+
			'<input type="text" name="n[0]" value="'+trackn+'"/>'+
			'<input type="text" name="m[0]" value="'+mbid+'"/>'+
			'</form></body></html>';
		var form = reqWin.document.getElementById('postForm');
		form.submit();
		
		var gotError = function(code) { if (errorHandler) errorHandler(); }
		req.addErrback(gotError);
		req.addCallback(function(result){
			log_('Conn: scrobble callback');
			var status = result[0];
			if (status == 'OK') {
				successHandler();
			}
			else if (status == 'BADSESSION') {
				if (badSessionHandler) badSessionHandler();
			} else if (status.slice(0, 6) == 'FAILED') {
				if (failHandler) failHandler(status.slice(7));
			} else gotError();
		});
	}
};

scrobbler.fm.conn = (typeof GM_xmlhttpRequest != 'undefined') ? ff_conn : opera_conn;


var postAudioscrobbler = function() {
	log_('Returning post.audioscrobbler.com data: '+document.documentElement.innerText);
	var r = document.documentElement.innerText.split('\n');
	Requester.returnData(true, r, scrobbler.fm.conn.stub_url);
}
if (location.hostname == 'post.audioscrobbler.com' || location.hostname == 'post2.audioscrobbler.com') {// && location.pathname == '/np_1.2')
	log_('at post.audioscrobbler.com');
	setTimeout(postAudioscrobbler, 0);
}

var createRequestObject = function()
{
	if (window.XMLHttpRequest) 
		try { return new XMLHttpRequest(); } catch (e) { }
	else
		if (window.ActiveXObject) {
			try { return new ActiveXObject('Msxml2.XMLHTTP'); }
			catch (e) {
				try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch (e) { }
			}
		}
	return null;
}
var getToken = function() {
	var loginTime = Requester.getArguments();
	log_('Getting token. Login time: '+loginTime);
	var req = createRequestObject();
	req.open('POST', 'http://ext.last.fm/1.0/webclient/xmlrpc.php', true);
	var gotError = function(code) {
		log_('Request for token failed. Code: '+code);
		Requester.returnData(false, code, scrobbler.fm.conn.stub_url);
	};
	var gotToken = function(username) {
		if (req.responseXML.getElementsByTagName('string').length < 1) { gotError(1); return; }
		var token = req.responseXML.getElementsByTagName('string').item(0).firstChild.textContent;
		log_('Got token '+username+','+token);
		Requester.returnData(true, [username,token], scrobbler.fm.conn.stub_url);
	};
	var gotLogin = function() {
		if (req.responseXML.getElementsByTagName('string').length < 1) { gotError(1); return; }
		var username = req.responseXML.getElementsByTagName('string').item(0).firstChild.textContent;
		log_('Found username: '+username);
		if (username == 'LFM_ANON') {
			log_('LFM_ANON.');
			Requester.returnData(true, [username], scrobbler.fm.conn.stub_url);
			return;
		}
		
		req.open('POST', 'http://ext.last.fm/1.0/webclient/xmlrpc.php', true);
		req.onreadystatechange = function(e) {
			if (req.readyState == 4) {
				if (req.status == 200 && req.responseXML != null) {
					gotToken(username);
				} else gotError('tokenRequestStatus '+req.status);
			}
		};
		req.send('<methodCall><methodName>getScrobbleAuth</methodName><params><param><value><string>'+username+'</string>'+
			'</value></param><param><value><string>'+loginTime+'</string></value></param></params></methodCall>');
	};
	req.onreadystatechange = function(e) {
		if (req.readyState == 4) {
			if (req.status == 200 && req.responseXML != null) {
				gotLogin();
			} else gotError('usernameRequestStatus '+req.status);
		}
	};
	req.send('<methodCall><methodName>getSession</methodName><params /></methodCall>');
}
if (location.href == 'http://ext.last.fm/1.0/#getToken') {
	setTimeout(getToken, 0);
}



/* ============ DEFERRED OBJECT ===========
   used by Requester */
var Deferred = function()
{
	this.cbh_ = [];
	this.ebh_ = [];
	this.fired_ = false;
}
Deferred.prototype = {
	callback: function(data) {
		return this.fire(true, data);
	},
	errback: function(data) {
		return this.fire(false, data);
	},
	fire: function(status, result) {
		if (this.fired_) return false;
		this.fired_ = true;
		this.status_ = status;
		this.result_ = result;
		this.broadcast_();
		return true;
	},
	hasResult: function() {
		return this.fired_;
	},
	addCallback: function(fn) {
		this.cbh_.push(fn);
		this.broadcast_();
		return this;
	},
	addErrback: function(fn) {
		this.ebh_.push(fn);
		this.broadcast_();
		return this;
	},
	broadcast_: function() {
		if (!this.fired_) return;
		this.broadcast_impl_(this.status_ ? this.cbh_ : this.ebh_, this.result_);
		this.cbh_ = [];
		this.ebh_ = [];
	},
	broadcast_impl_: function(list, arg) { // called only from 'broadcast_'
		for(var cb = 0; cb < list.length; ++cb) {
			list[cb].call(this, arg);
		}
	}
};

/* ============ REQUESTER OBJECT ===========
   Incapsulates cross-domain http async requests in userjs
   To make request call Requester.request. Pass data as array.
      It creates an iframe from passed url
   Then the script at that url must aquire its arguments throw Requester.getData()
      and return an array via Requester.returnData() passing a stub url.
   Script running at stub url should just call Requester.runStub().
   
   The data is passed through window.name varible. */
Requester = {
	de_objects_: {},
	default_timeout: 5000,
	
	getDeferred: function(i) {
		if (!(i in this.de_objects_)) return null;
		return this.de_objects_[i];
	},
	
	serializeArray: function(a) {
		if (!(a instanceof Array)) a = [a];
		var r = '[ ';
		for(var i = 0; i < a.length; ++i) {
			r += '\'' + a[i].toString().replace('\'', '\\\'') + '\', ';
		}
		return (r += ']');
	},
	unserializeArray: function(s) {
		return eval(s); // Mind security!
	},
	
	explode: function(s, delim, n) {
		var p = 0;
		var g = [];
		for(var i = 0; n == undefined || i < n-1; ++i) {
			var index = s.indexOf(delim, p);
			if (index == -1) break;
			g[i] = s.slice(p, index);
			p = index+1;
		}
		if (n != undefined || i < n-1) {
			g[i] = s.slice(p);
		}
		
		log_('expl_'+delim+'_'+s+':' + this.serializeArray(g));
		return g;
	},

	request: function (request_url, stub_url, data, timeout)
	{
		if (timeout == undefined) timeout = this.default_timeout;
		
		deferred = new Deferred();
		var req_id = (new Date()).getTime();
		this.de_objects_[req_id] = deferred;
		
		var iframe = document.createElement('iframe');
		deferred.iframe = iframe;
		deferred.req_id = req_id;
		var body = document.getElementsByTagName('body').item(0);
		if (!body) return null;
		body.appendChild(iframe);
		
		log_(req_id + '#' + data);
		iframe.contentWindow.name = req_id + '#' + this.serializeArray(data);
		
		iframe.setAttribute('src', request_url);
		iframe.setAttribute('style', 'width: 1px; height:1px; position: absolute; left: 100px; top: 100px; visibility: hidden;');
		
		window.setTimeout(function() {
			if (req_id in Requester.de_objects_)  {
				de = Requester.de_objects_[req_id];
				if (!de.hasResult()) {
					de.errback(-1);
				}
			}
		}, timeout);
		
		deferred.addCallback(this.disposeFrame);
		deferred.addErrback(this.disposeFrame);
		
		return deferred;
	},
	
	disposeFrame: function() {
		//this.iframe.parentNode.removeChild(this.iframe);
		delete(Requester.de_objects_[this.req_id]);
	},
	
	runStub: function() {
		var args = this.explode(window.name, '#', 3);
		window.name = '';
		
		var de_index = args[0];
		var status = args[1]=='1';
		var data = args[2];
		
		if (!window.parent.Requester) {	
			log_("Requester: Invalid parent window.");
			return;
		}
		deferred = window.parent.Requester.getDeferred(de_index);
		if (!deferred) {
			log_("Requester: Deferred object disappeared.");
			return;
		}
		deferred.fire(status, this.unserializeArray(data));
	},
	
	returnData: function(status, data, stub_url) {
		var args = this.explode(window.name, '#', 2);
		window.name = args[0] + '#' + (status?1:0) + '#' + this.serializeArray(data);
		location.replace(stub_url);
	},
	
	getArguments: function() {
		var args = this.explode(window.name, '#', 2);
		return this.unserializeArray(args[1]);
	}

};
if (location.href == scrobbler.fm.conn.stub_url)
{
	// in stub
	log_('in stub');
	Requester.runStub();
}


// empty connection (logs requests)
var g ={
	/* successHandler(username, session, np_url, scr_url), anonymousHandler(), failHandler(message), errorHandler() */
	login: function(successHandler, anonymousHandler, failHandler, errorHandler) {
		log_("Login requested");
		successHandler();
	},
	
	useSession: function(session, np_url, scr_url) {
		log_("Use session " + session + " requested");
	},
	
	logged: function() {
		return true;
	},
	
	/* successHandler(), badSessionHandler(), errorHandler() */
	nowPlaying: function(track, successHandler, badSessionHandler, errorHandler) {
		log_("Requested now playing " + track['artist'] + " " + track['title']);
		successHandler();
	},
	
	/* successHandler(), badSessionHandler(), failHandler(message), errorHandler() */
	scrobble: function(track, successHandler, badSessionHandler, failHandler, errorHandler) {
		log_("Requested scrobble " + track['artist'] + " " + track['title']);
		successHandler();
	}
};

})();