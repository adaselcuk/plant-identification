console.log('Script loaded');

document.getElementById('uploadLabel').addEventListener('click', function() {
	document.getElementById('imageUpload').click();
})

document.getElementById('imageUpload').addEventListener('change', function() {
	var fileName = this.files[0] ? this.files[0].name : "";

	if (this.files.length > 0) {
		console.log("File selected: " + fileName);
	}

	if (fileName) {
		document.getElementById('uploadLabel').textContent = "File selected: " + fileName;
	}
	else {
		document.getElementById('uploadLabel').textContent = "Please choose a file";
	}
});

document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    console.log('Form submitted');
    var fileInput = document.getElementById('imageUpload');
    var errorMessageElement = document.getElementById('error-message');

	errorMessageElement.textContent= '';

    if (fileInput.files.length == 0) {
		errorMessageElement.textContent = 'Please upload a file before submitting the form';
		return;
	}
	const formData = new FormData(event.target);
	

	try{ 
		const response = await fetch('/upload', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			throw new Error('Network response was not ok');
		}

		const result = await response.json();
		document.getElementById('result').textContent = JSON.stringify(result, null, 2);
	}
	catch (error) {
		console.error('Fetch error:', error);
		errorMessageElement.textContent = 'Failed to upload the file. Please try again.';
	}
});