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
const port = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Uploads directory created:', uploadDir);
} else {
    console.log('Uploads directory exists:', uploadDir);
}

fs.access(uploadDir, fs.constants.W_OK, (err) => {
    if (err) {
        console.error(`Uploads directory is not writable: ${err}`);
    } else {
        console.log('Uploads directory is writable');
    }
});

const upload = multer({ dest: uploadDir });

app.use(express.static(path.join(__dirname, 'public')));

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

        if (!Array.isArray(data.results)) {
            console.error('data.results is not an array:', data);
            return [];
        }

        const results = data.results.map(result => {
            const images = Array.isArray(result.images) ? result.images.map(image => image.url.o) : [];
            return {
                score: result.score,
                species: {
                    scientificName: result.species.scientificName,
                    genus: result.species.genus.scientificName,
                    family: result.species.family.scientificName,
                    commonNames: result.species.commonNames
                },
                images: images
            };
        });
        return results;
    } catch (error) {
        console.error('Error identifying plants:', error);
    }
}

// using Imgur API
async function uploadImage(imagePath) {
    const clientId = process.env.CLIENT_ID_IMGUR;

    try {
        const image = fs.readFileSync(imagePath, { encoding: 'base64'});
        console.log('Uploading image to Imgur')

        const response = await axios.post('https://api.imgur.com/3/image', {
            image: image,
            type: 'base64'
        }, {
            headers: {
                Authorization: `Client-ID ${clientId}`
            }
        }); 

        if (response.data && response.data.data && response.data.data.link) {
            console.log('Imgur API response:', response.data);
            return response.data.data.link;
        } else {
            throw new Error('Failed to get image link from Imgur');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/uploads', upload.single('image'), async (req, res) => {
    const project = 'all';

    const imagePath = req.file.path;
    console.log('Image received:', imagePath)

    try {
        const imageUrl = await uploadImage(imagePath);
        console.log('Image uploaded to Imgur:', imageUrl)

        const result = await identifyPlant(project, imageUrl);
        console.log('Plant identified:', result)

        fs.unlinkSync(imagePath);
        res.json(result);
    } catch (error) {
        console.log('Error in /uploads endpoint:', error);
        fs.unlinkSync(imagePath);
        res.status(500).send('Error identifying plant');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
