(function() {
	"use strict";

	var	allowance_url = 'http://www.systemcontrolcenter.com/stlui/user/allowance_request.html',
		$ = function($) {
			var a = Array.prototype.map.call(document.querySelectorAll($), function(v) {
				return v;
			});

			return a;
		},

		xhr = new XMLHttpRequest(),

		dlzone = new Image(),

		ctx = $('#icon')[0].getContext('2d'),

		highlight = ctx.createLinearGradient(0, 0, 0, 19),
		cylinder = ctx.createLinearGradient(4, 0, 11, 0);

	highlight.addColorStop(0, 'rgba(255, 255, 255, .2)');
	highlight.addColorStop(1, 'rgba(240, 240, 240, .2)');

	cylinder.addColorStop(0, 'rgba(255, 255, 255, .2)');
	cylinder.addColorStop(0.4, 'rgba(255, 255, 255, .6)');
	cylinder.addColorStop(1, 'rgba(240, 240, 240, .1)');

	dlzone.src = '../images/package.png';

	chrome.browserAction.onClicked.addListener(function(tab) {
		chrome.tabs.create({ index: tab.index,  url: allowance_url });
	});

	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4 || xhr.status != 200)
			return;

		$('.hnb')[0].innerHTML = xhr.responseText.replace(/<(meta|img|link)[^>]+>/g, '');

		var offset, hue, t,
		    v    = 40,
		    key  = [ 'throttled', 'maximum', 'daily', 'remaining' ],
		    data = {};

		$('.hnb #info_table td:nth-child(2)').map(function(e, i) {
			var t = e.innerHTML.replace(/^\s+|\s+$/g, '');

			switch (key[i]) {
				case 'throttled':
					t = (t != 'Unthrottled'); break;

				case 'maximum': case 'daily': case 'remaining':
					t = parseInt(t, 10); break;

				default:
					return;
			}

			data[key[i]] = t;
		});

		function sum(a, b) { return a + b; }
		function seconds(n, i) { return (n || 0) * [86400, 3600, 60][i]; }

		data.percentage = data.remaining / data.maximum * 100;
		data.bonus      = /Currently in Bonus Period/.test(xhr.responseText);
		data.bonusIn    = (xhr.responseText.match(/Regular Period Ends in (?:(\d+) days, )?(\d+) hr and (\d+)/) || [])
		                     .slice(1).map(seconds).reduce(sum, 0);
		data.regularIn  = (xhr.responseText.match(/Bonus Period Ends in (?:(\d+) days, )?(\d+) hr and (\d+)/) || [])
		                     .slice(1).map(seconds).reduce(sum, 0);
		data.resetIn    = xhr.responseText.match(/Allowance Resets in (\d+) days, (\d+) hr and (\d+)/)
		                     .slice(1).map(seconds).reduce(sum, 0);


		// TODO: expand this to have reboot detection later
		if (typeof data.maximum != 'number') {
			chrome.browserAction.setTitle({ title: 'HughesNet Allowance Monitor' });
			chrome.browserAction.setIcon({ path: '../images/error.png' });
		}


		ctx.clearRect(0, 0, 19, 19);


		// background
		ctx.shadowBlur = 2;
		ctx.shadowColor = 'rgba(0, 0, 0, .6)';
		ctx.fillStyle = data.throttled ? '#fdd' : '#eee';
		ctx.fillRect(4, 2, 11, 15);

		ctx.shadowBlur = 0;


		// usage fill
		hue = data.percentage < v ? (data.percentage * (80 / v)) : 80;

		ctx.fillStyle = 'hsl(' + hue + ', 90%, 47%)';
		ctx.fillRect(4, 17, 11, -((data.percentage / 100) * 15));


		// highlight
		ctx.fillStyle = highlight;
		ctx.fillRect(11, 2, 2, 15);


		// cylinder shaping
		ctx.fillStyle = cylinder;
		ctx.fillRect(4, 2, 11, 15);


		// time bar
		t = data.resetIn / 86400;
		ctx.fillStyle = '#aaa';
		ctx.fillRect(1, 18, 1, -(17 * (1 - t)));


		// bonus period notification
		if (data.bonus)
			ctx.drawImage(dlzone, 9, 9);

		chrome.browserAction.setTitle({
			title:	(data.throttled ? '!!! Hard-Throttled !!!\n' : '') +
 				(data.bonus ?
				             'Currently in Bonus Period\nRegular Period in: ' +
				             (new Date(data.regularIn * 1000)).toISOString().substr(11, 8) : 'Bonus Period in: ' + (new Date(data.bonusIn * 1000)).toISOString().substr(11, 8)) + '\n' +
				data.percentage.toFixed(2) + '% (' + data.remaining + 'MB/' + data.maximum + 'MB)\n' +
				data.daily + 'MB refill in: ' + (new Date(data.resetIn * 1000)).toISOString().substr(11, 8)
		});

		chrome.browserAction.setIcon({ imageData: ctx.getImageData(0, 0, 19, 19) });
	};

	function check() {
		xhr.open('GET', allowance_url, true);
		xhr.send(null);
	}

	setInterval(check, 60000);
	check();
})();
