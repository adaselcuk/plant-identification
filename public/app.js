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



// document.getElementById('uploadForm').addEventListener('submit', async (event) => {
//     event.preventDefault();

//     console.log('Form submitted');
//     var fileInput = document.getElementById('imageUpload');
//     var errorMessageElement = document.getElementById('error-message');

// 	errorMessageElement.textContent= '';

//     if (fileInput.files.length == 0) {
// 		errorMessageElement.textContent = 'Please upload a file before submitting the form';
// 		return;
// 	}
// 	const formData = new FormData(event.target);
	

// 	try{ 
// 		const response = await fetch('/uploads', {
// 			method: 'POST',
// 			body: formData
// 		});

// 		if (!response.ok) {
// 			throw new Error('Network response was not ok');
// 		}

// 		const result = await response.json();
// 		document.getElementById('result').textContent = JSON.stringify(result, null, 2);
// 	}
// 	catch (error) {
// 		console.error('Fetch error:', error);
// 		errorMessageElement.textContent = 'Failed to upload the file. Please try again.';
// 	}
// });


// Function to upload file
function uploadFile(formData) {
    fetch('/upload', { // Assuming '/upload' is the endpoint
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            // If server responds with an error status, throw an error
            return response.json().then(error => { throw Error(error.error); });
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message); // Success message
        // Additional success handling here
    })
    .catch(error => {
        console.error(error.message); // Display error message
        // Additional error handling here
    });
}

function validateFileSelection() {
    const fileInput = document.getElementById('imageUpload');
    const errorMessageElement = document.getElementById('error-message');
    if (!fileInput.files[0]) {
        errorMessageElement.textContent = 'No file selected!';
        return false; // Prevent form submission
    } else {
        errorMessageElement.textContent = ''; // Clear previous error message
        return true; // Allow form submission if needed
    }
}

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting in the traditional way
	const isValid = validateFileSelection();

	if (!isValid) {
		return;
	}

	const formData = new FormData();
	const fileInput = document.getElementById('imageUpload');
    if (fileInput.files[0]) {
        formData.append('file', fileInput.files[0]);
        uploadFile(formData);
    } else {
        console.error('No file selected!'); // Handle case where no file is selected
    }
});