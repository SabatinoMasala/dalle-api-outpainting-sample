# Dall-E API outpainting sample

Outpainting is actually just inpainting within incomplete image frames (called generation frames in Dall-E UI). This repo demonstrates how you can leverage the Dall-E API for outpainting.

![Start image](https://github.com/SabatinoMasala/dalle-api-outpainting-sample/blob/main/sample.png)

Our starting image may look like this:

![Start image](https://github.com/SabatinoMasala/dalle-api-outpainting-sample/blob/main/client/public/demo.jpg)

We want to extend 256px downward, so we shift the image upward and introduce 256px of 'filler' pixels (these will be replaced anyway). By passing resulting image to the Dall-E API both as a source and mask, we get the following result back:

<img src="https://github.com/SabatinoMasala/dalle-api-outpainting-sample/blob/main/client/public/frame.png" width="200"><img src="https://github.com/SabatinoMasala/dalle-api-outpainting-sample/blob/main/client/public/outpaint.png" width="200">

We do the same for the top part, and stitch the result using a canvas element.

# Running the sample

The sample has 2 parts:
- Server
- Client app

## Server

The server will handle the communication with the Dall-E API.
Start by generating an API key on [OpenAI]([url](https://beta.openai.com/account/api-keys)).

Copy `./server/.env.example` to `./server/.env` and fill in the API key here.

In the server directory, run `yarn install` and then `node index.js`. This will start the server.

## Client app

The client app is a simple Vue application, go into the `client` directory, run `yarn install` and then `yarn dev`. Open the URL in your browser, and you'll be presented with the sample application.
![Start image](https://github.com/SabatinoMasala/dalle-api-outpainting-sample/blob/main/sample.png)

# Running the sample

Clone the repo:
```
git clone https://github.com/SabatinoMasala/dalle-api-outpainting-sample.git
```

The sample has 2 parts:
- Server
- Client app

## Server

The server will handle the communication with the Dall-E API. 
Start by generating an API key on [OpenAI]([url](https://beta.openai.com/account/api-keys)).

Copy `./server/.env.example` to `./server/.env` and fill in the API key here.

In the server directory, run `yarn install` and then `node index.js`. This will start the server.

## Client app

The client app is a simple Vue application, go into the `client` directory, run `yarn install` and then `yarn dev`. Open the URL in your browser, and you'll be presented with the sample application.
