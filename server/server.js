require('dotenv').config();

//importing libraries
//express is used to build web applications for Node.js
//require is used to load modules
const express = require('express');
//multer is used to handle multipart/form-data and uploading files
const multer = require('multer');
//path is used to handle file paths
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

//creating an express application
const app = express();
//which port number the express function will listen to
const port = process.env.PORT || 3000;

//makes it so that any file within public can be accessed via URL
app.use(express.static('public'));

//function to send image to PLantNet API
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
	limits: {fileSize: 1000000},
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
					res.send({
						message:'File uploaded!',
						file: `uploads/${req.file.filename}`,
						identification: identificationResults
				});
				} catch (identificationError) {
					res.status(500).send({error: identificationError.message, details: identificationError});
				}
			}
		}
	});
});

app.listen(port, () => console.log(`Server running on port ${port}`));