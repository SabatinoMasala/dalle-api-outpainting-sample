require('dotenv').config()
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { Configuration, OpenAIApi } = require('openai')

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const app = express()
app.use(cors())
app.use(bodyParser.json({limit: '25mb'}))
const openai = new OpenAIApi(configuration)
const axios = require('axios')

app.post('/inpaint', async (req, res) => {
    const base64Image = req.body.image.split(';base64,').pop();
    const path = `img-${uuidv4()}.png`;
    fs.writeFile(path, base64Image, {encoding: 'base64'}, async function(err) {
        const response = await openai.createImageEdit(
            // We send the same image as a base and as a mask
            fs.createReadStream(path),
            fs.createReadStream(path),
            req.body.prompt,
            1,
            '512x512'
        );
        fs.unlink(path, () => {
            console.log(`Deleted file ${path}`)
        });

        // Download & proxy image to mitigate CORS
        const imgPath = `static/${uuidv4()}.png`;
        await axios({
            method: 'get',
            url: response.data.data[0].url,
            responseType: 'arraybuffer',
        }).then(response => {
            fs.writeFileSync(imgPath, response.data);
        });

        res.json(`/${imgPath}`)
    });
})

const port = 3333;
app.use('/static', express.static('static'))
app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
