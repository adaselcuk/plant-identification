document.getElementById('uploadLabel').addEventListener('click', function() {
	document.getElementById('imageUpload').click();
})

document.getElementById('imageUpload').addEventListener('change', function() {
	var fileName = this.files[0] ? this.files[0].name : "";

	if (fileName) {
		document.getElementById('uploadLabel').textContent = "File selected: " + fileName;
	}
	else {
		document.getElementById('uploadLabel').textContent = "Please choose a file";
	}
});