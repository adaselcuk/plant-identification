//importing libraries
//express is used to build web applications for Node.js
//require is used to load modules
const express = require('express');
//multer is used to handle multipart/form-data and uploading files
const multer = require('multer');
//path is used to handle file paths
const path = require('path');

//creating an express application
const app = express();
//which port number the express function will listen to
const port = 3000;

//makes it so that any file within public can be accessed via URL
app.use(express.static('public'));

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
	upload(req, res, (err) => {
		if (err){
			res.status(400).send('Error: ' + err);
		}else {
			if (req.file == undefined){
				res.status(400).send({error: 'No file selected!'});
			}else {
				res.send({
					message:'File uploaded!',
					file: `uploads/${req.file.filename}`
				});
			}
		}
	});
});

app.listen(port, () => console.log('Server running on port ${port}'));