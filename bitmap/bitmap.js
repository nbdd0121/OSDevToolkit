var canvas;
var context;

// function getPointOnCanvas(x, y) {
// 	var bound = canvas.getBoundingClientRect();
// 	return {
// 		x: x - bound.left * (canvas.width / bound.width),
// 		y: y - bound.top * (canvas.height / bound.height)
// 	};
// }

function imageUploaded(url) {
	var img = new Image();
	img.src = url;
	img.onload = function() {
		canvas.width = img.width;
		canvas.height = img.height;
		context.drawImage(img, 0, 0);
	}
}

function toImageData() {
	return context.getImageData(0, 0, canvas.width, canvas.height);
}

function imageToBlob(data) {
	var arr = data.data;
	var length = arr.buffer.byteLength;
	var buf = new ArrayBuffer(length + 8);
	var lens = new Uint32Array(buf);
	var ptr = 2;
	for (var i = 0; i < length; i += 4) {
		lens[ptr++] = arr[i] << 16 | arr[i + 1] << 8 | arr[i + 2];
	}
	lens[0] = data.width;
	lens[1] = data.height;
	return new Blob([buf], {
		type: 'application/binary'
	});
}

function saveBlob(blob) {
	var url = URL.createObjectURL(blob);
	window.open(url);
}

$(function() {
	canvas = $("#canvas")[0];
	context = canvas.getContext('2d');

	// canvas.click(function(e) {
	// 	var point = getPointOnCanvas(e.pageX, e.pageY);
	// 	var x = point.x,
	// 		y = point.y;
	// 	context.moveTo(x, y);
	// 	context.lineTo(x + 1, y + 1);
	// 	context.stroke();
	// });

	$("#uploader").change(function(e) {
		var file = e.target.files[0],
			imageType = /image.*/;

		if (!file.type.match(imageType))
			return;

		var reader = new FileReader();
		reader.onload = function(e) {
			imageUploaded(e.target.result);
		};
		reader.readAsDataURL(file);
	});

	$("#convert").click(function(e) {
		saveBlob(imageToBlob(toImageData()));
	});
});