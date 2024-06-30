const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const express = require('express');
const multer = require('multer');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

const PROJECT = 'all';
const API_URL = 'https://my-api.plantnet.org/v2/identify/all';
const API_KEY = process.env.PLANETNET_API_KEY;
const API_SIMSEARCH_OPTION = '&include-related-images=true';


app.post('/identify-plant', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const formData = new FormData();
        formData.append('images', fs.createReadStream(req.file.path), req.file.filename);

        const response = await axios.post(`${API_URL}?api-key=${API_KEY}${API_SIMSEARCH_OPTION}`, form, {
            headers: formData.getHeaders(),
        });

        fs.unlinkSync(req.file.path);

        res.json(response.data);
    } catch (error) {
        console.error("Error identifying plant:", error);
        res.status(500).send('Error identifying plant');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});