require('dotenv').config()
const fs = require('fs')
const { v4: uuidv4 } = require('uuid');
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const app = express()
app.use(cors())
app.use(bodyParser.json({limit: '25mb'}))
const openai = new OpenAIApi(configuration);

app.post('/inpaint', async (req, res) => {
    const base64Image = req.body.image.split(';base64,').pop();
    const path = `img-${uuidv4()}.png`;
    fs.writeFile(path, base64Image, {encoding: 'base64'}, async function(err) {
        const response = await openai.createImageEdit(
            // We send the same image as a base and as a mask
            fs.createReadStream(path),
            fs.createReadStream(path),
            prompt,
            1,
            '512x512'
        );
        const image_url = response.data.data[0].url;
        res.json(image_url)
    });
})

const port = 3333;
app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
