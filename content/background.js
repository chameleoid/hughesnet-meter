var	$ = function($) {
		var a = Array.prototype.map.call(document.querySelectorAll($), function(v) {
			return v;
		});

		return a;
	},

	xhr = new XMLHttpRequest(),

	ctx = $('#icon')[0].getContext('2d'),

	grad = ctx.createLinearGradient(0,0,0,19);

grad.addColorStop(0, 'rgba(255, 255, 255, .6)');
grad.addColorStop(1, 'rgba(240, 240, 240,  0)');

xhr.onreadystatechange = function() {
	if (xhr.readyState != 4 || xhr.status != 200)
		return;

	$('.hnb')[0].innerHTML = xhr.responseText.replace(/<meta[^>]+>/g, '');

	var grad, hue, t,
	    v = 40,

	    data = $('.hnb table td:nth-child(2) td:nth-child(3)').map(function(e, i) {
		    var t = e.innerHTML.replace(/^\s+|\s+$/g, '');

		    // return first three values in integer form
		    if (i < 3)
		    	return +t;

		    // return time
		    return t;
	    });


	ctx.clearRect(0, 0, 19, 19);


	// background
	ctx.shadowBlur = 2;
	ctx.shadowColor = 'rgba(0, 0, 0, .6)';
	ctx.fillStyle = '#eee';
	ctx.fillRect(4, 2, 11, 15);

	ctx.shadowBlur = 0;


	// usage fill
	hue = data[2] < v ? (data[2] * (80 / v)) : 80;

	ctx.fillStyle = 'hsl(' + hue + ', 90%, 47%)';
	ctx.fillRect(4, 17, 11, -((data[2] / 100) * 15));


	// highlight
	grad = ctx.createLinearGradient(0, 0, 0, 19);
	grad.addColorStop(0, 'rgba(255, 255, 255, .2)');
	grad.addColorStop(1, 'rgba(240, 240, 240, .2)');

	ctx.fillStyle = grad;
	ctx.fillRect(11, 2, 2, 15);


	// more highlighting
	grad = ctx.createLinearGradient(4, 0, 11, 0);
	grad.addColorStop(0, 'rgba(255, 255, 255, .2)');
	grad.addColorStop(0.4, 'rgba(255, 255, 255, .6)');
	grad.addColorStop(1, 'rgba(240, 240, 240, .1)');

	ctx.fillStyle = grad;
	ctx.fillRect(4, 2, 11, 15);


	// time bar
	t = +data[3].split(/:/g).reduce(function(a, b) { return (+a * 60) + (+b) }) / 86400;
	ctx.fillStyle = '#aaa';
	ctx.fillRect(1, 18, 1, -(17 * (1 - t)));


	chrome.browserAction.setTitle({ title: data[2] + '% (' + data[1] + 'MB/' + data[0] + 'MB)\n' + (data[0] / 2) + 'MB refill in: ' + data[3] });
	chrome.browserAction.setIcon({ imageData: ctx.getImageData(0, 0, 19, 19) });
};

setInterval((function() {
	xhr.open('GET', 'http://192.168.0.1/stlui/user/allowance_request.html', true);
	xhr.send(null);
	return arguments.callee;
})(), 15000);
