# Dall-E API outpainting sample

Outpainting is actually just inpainting within incomplete image frames (called generation frames in Dall-E UI). This repo demonstrates how you can leverage the Dall-E API for outpainting.

Our starting image may look like this:

![Start image](https://github.com/SabatinoMasala/dalle-api-outpainting-sample/blob/main/client/public/demo.jpg)

We want to extend 256px downward, so we shift the image upward and introduce 256px of 'filler' pixels (these will be replaced anyway). By passing resulting image to the Dall-E API both as a source and mask, we get the following result back:

<img src="https://github.com/SabatinoMasala/dalle-api-outpainting-sample/blob/main/client/public/frame.png" width="200"><img src="https://github.com/SabatinoMasala/dalle-api-outpainting-sample/blob/main/client/public/outpaint.png" width="200">

Finally, we can stitch everything together in a canvas element and get our final results.
