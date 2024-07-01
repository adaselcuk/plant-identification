import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

//GET request from PlantNet API
async function identifyPlant(project, imageUrl) {
    const apiKey = process.env.PLANTNET_API_KEY;
    const url = new URL(`https://my-api.plantnet.org/v2/identify/${project}`);

    url.searchParams.append('images', imageUrl);
    url.searchParams.append('organs', 'auto');
    url.searchParams.append('include-related-images', 'true');
    url.searchParams.append('no-reject', 'false');
    url.searchParams.append('lang', 'en');
    url.searchParams.append('type', 'kt')
    url.searchParams.append('api-key', apiKey);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        console.log('Success:', JSON.stringify(data, null, 2));

        const results = data.results.map(result => ({
            score: result.score,
            species: {
                scientificName: result.species.scientificName,
                genus: result.species.genus.scientificName,
                family: result.species.family.scientificName,
                commonNames: result.species.commonNames
            },
            images: result.images.map(image => image.url.o)
    }));
    return results;
    } catch (error) {
        console.error('Error:', error);
    }
}

// using Imgur API
async function uploadImage(imagePath) {
    const clientId = process.env.IMGUR_CLIENT_ID;

    try {
        const image = fs.readFileSync(imagePath, { encoding: 'base64'});

        const response = await axios.post('https://api.imgur.com/3/image', {
            image: image,
            type: 'base64'
        }, {
            headers: {
                Authorization: `Client-ID ${clientId}`
            }
        }); 

        if (response.data && response.data.data && response.data.data.link) {
            return response.data.data.link;
        } else {
            throw new Error('Failed to upload image');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/uploads', upload.single('image'), async (req, res) => {
    const project = 'all';

    const imagePath = req.file.path;

    try {
        const imageUrl = await uploadImage(imagePath);
        const result = await identifyPlant(project, imageUrl);

        fs.unlinkSync(imagePath);
        res.json(result);
    } catch (error) {
        fs.unlinkSync(imagePath);
        res.status(500).send('Error identifying plant');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
