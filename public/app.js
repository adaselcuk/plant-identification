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

document.getElementById('uploadForm').onsubmit = async function(event) {
    event.preventDefault();
    if (!errorMessage()) {
        return;
    }
    
    const formData = new FormData();
    const response = await fetch('/uploads', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    displayResults(data);
};

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    data.forEach(result => {
        const speciesInfo = `
        <h2>Identification Results</h2>
        <p>Scientific Name: ${result.species.scientificName}</p>
        <p>Genus: ${result.species.genus}</p>
        <p>Family: ${result.species.family}</p>
        <p>Common Names: ${result.species.commonNames.join(', ')}</p>
        <p>Score: ${result.score}</p>
        <h3>Images</h3>
        ${result.images.map(image => `<img src="${image}" alt="species image" />`).join('')}
        <hr>
        `;
        resultsDiv.innerHTML += speciesInfo;
    });
}