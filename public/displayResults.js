// result is the id for results page

var resultContainer = document.getElementById('result');

function displayResults() {

	if (!resultContainer) {
		console.error('Result container not found');
		return;
	}

	resultContainer.innerHTML = '';

	result.forEach(plant => {
		const plantDiv = document.createElement('div');
		plantDiv.className = 'plant';

		const speciesName = document.createElement('h3');
		speciesName.textContent = plant.species;
		plantDiv.appendChild(speciesName);

		const commonNames = document.createElement('p');
		commonNames.textContent = 	`Common names: ${plant.common_names.join(', ')}`;
		plantDiv.appendChild(commonNames);

		const family = document.createElement('p');
		family.textContent = `Family: ${plant.family}`; 	
		plantDiv.appendChild(family);

		const genus = document.createElement('p');
		genus.textContent = `Genus: ${plant.genus}`;
		plantDiv.appendChild(genus);

		const score = document.createElement('p');
		score.textContent = `Confidence Score: ${(plant.score * 100).toFixed(2)}%`;
		plantDiv.appendChild(score);

		const imagesDiv = document.createElement('div');
		imagesDiv.className = 'images';
		plant.images.forEach(url => {
			const img = document.createElement('img');
			img.src = url;
			imagesDiv.appendChild(img);
		});
		plantDiv.appendChild(imagesDiv);

		resultContainer.appendChild(plantDiv);
	});
}
