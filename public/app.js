function errorMessage() {
    var error = document.getElementById('error-message');
    var fileInput = document.getElementById('imageUpload');
    var maxSize = 52428800;
    if (fileInput.files.length === 0) {
        error.textContent = 'No file uploaded!';
        return false;
    } else if (fileInput.files[0].size > maxSize) {
        error.textContent = 'File size exceeds 50MB! PLease upload a smaller file!';
        return false;
    } else {
        error.textContent = '';
        return true;
    }
}

document.getElementById('imageUpload').addEventListener('change', function() {
    var fileInput = document.getElementById('imageUpload');
    var label = document.getElementById('uploadLabel');

    if (fileInput.files.length > 0) {
        label.textContent = 'File selected: ' + fileInput.files[0].name;
    } else {
        label.textContent = 'Choose a file';
    }
});

document.getElementById('uploadForm').onsubmit = async function(event) {
    event.preventDefault();
    if (!errorMessage()) {
        return;
    }
    
    const formData = new FormData();
    const fileInput = document.getElementById('imageUpload');

    if (fileInput.files.length > 0) {
        formData.append('image', fileInput.files[0]);
    }

    const response = await fetch('/uploads', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        console.error('Failed to upload image');
        return;
    }

    const data = await response.json();
    displayResults(data);
};

function displayResults(data) {
    const resultsDiv = document.getElementById('result');
    resultsDiv.innerHTML = '';

    data.forEach(result => {
        const speciesInfo = `
        <h2>${result.species.scientificName}</h2>
        <p>Genus: ${result.species.genus}</p>
        <p>Family: ${result.species.family}</p>
        <p>Common Names: ${result.species.commonNames.join(', ')}</p>
        <p>Confidence Score: ${(result.score * 100).toFixed(2)}%</p>
        <h3>Images</h3>
        ${result.images.slice(0, 2).map(image => {
            console.log('Image URL:', image); // Log the image URLs
            return `<img src="${image}" alt="species image" class="rounded" />`;
        }).join('')}
        <hr>
        `;
        resultsDiv.innerHTML += speciesInfo;
    });
}