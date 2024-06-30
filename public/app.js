function errorMessage() {
    var error = document.getElementById('error-message');
    var fileInput = document.getElementById('imageUpload');
    var maxSize = 52428800;
    if (fileInput.files.length === 0) {
        error.textContent = 'No file uploaded!';
    } else if (fileInput.files[0].size > maxSize) {
        error.textContent = 'File size exceeds 50MB! PLease upload a smaller file!';
    } else {
        error.textContent = '';
    }
}