import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
//const FormData = require('form-data');
import axios from 'axios';
//creating an express application
const app = express()//which port number the express function will listen to
const port = process.env.PORT || 3000;

//makes it so that any file within public can be accessed via URL
app.use(express.static(path.join(__dirname, '../public')));


//configure multer to use disk storage
const storage = multer.diskStorage({
	destination: './uploads/',
	// function that determines unique name of file
	filename: function(req, file, cb){
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

//upload initialization
const upload = multer({
	storage: storage,
	limits: {fileSize: 52428800},
	fileFilter: function(req, file, cb){
			checkFileType(file, cb);
		}
}).single('imageUpload');

function checkFileType(file, cb){
	const filetypes = /jpeg|jpg|png|gif/;
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	const mimetype = filetypes.test(file.mimetype);

	if (mimetype && extname){
		return cb(null, true);
	} else {
		cb('Error: Images only!');
	}
}

app.post('/upload', (req, res) => {
	upload(req, res, async (err) => {
		if (err){
			res.status(400).send('Error: ' + err);
		}else {
			if (req.file == undefined){
				res.status(400).send({error: 'No file selected!'});
			}else {
				try {
					const identificationResults = await identifyPlant(req.file.path);
					// creates array for results which can then be passed to display results:
					const processedResults = extractData(identificationResults);

					const result = {
						message: 'File uploaded!',
						file: `uploads/${req.file.filename}`,
						identification: processedResults
					};
					res.send(result);
				} catch (identificationError) {
					res.status(500).send({error: identificationError.message, details: identificationError});
				}
			}
		}
	});
});

async function identifyPlant(imagePath) {
	try {
		const response = await axios.post('https://my.plantnet.org/v2/identify/all',{
			api_key: process.env.PLANT_ID_API_KEY,
			images: [fs.readFileSync(imagePath, {encoding: 'base64'})],
			modifiers: ["similar_images"],
			plant_language: "en",
			plant_organs: ["flower", "leaf", "fruit", "bark", "habit", "other"],
		}, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
		return response.data;
	} catch (error) {
		console.error('PlantNet API error:', error);
		throw new Error('Failed to identify the plant. Please try again.');
	}
}

function extractData(data) {
	return data.results.map(result => ({
		species: result.species.scientificNameWithoutAuthor,
		commonNames: result.species.commonNames,
		family: result.species.family.scientificName,
		genus: result.species.genus.scientificName,
		score: result.score,
		images: result.images.map(image => image.url),
	}));
}

app.listen(port, () => console.log(`Server running on port ${port}`));