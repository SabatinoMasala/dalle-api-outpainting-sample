<template>
  <div>
    <div class="d-flex">
      <div>
        <canvas id="stitchCanvas" :width="originalSize" :height="destinationHeight"></canvas>
      </div>
      <div class="pl-3 pr-3">
        <h1>
          Outpainting example
        </h1>
        <p>
          Outpainting is actually just inpainting within so-called 'generation frames'
        </p>
        <p>
          Below, the images are shown that have been prepared for inpainting. These images are 512x512px and have a transparency channel.
        </p>
        <img width="200" :src="topGenerationFrame" />
        <img width="200" :src="bottomGenerationFrame" />
        <img width="200" :src="leftGenerationFrame" />
        <img width="200" :src="rightGenerationFrame" />
        <p>
          By sending this image to the Dall-E API both as an image and as a mask, we ask Dall-E to inpaint the transparent pixels.
          The resulting image will then be stitched in a canvas on the right position.
        </p>
        <div class="panel" v-if="!generated">
          <p>
            Make sure the server is running & your API key is filled in, then press the button below.
          </p>
          <button @click="extendVertical" :disabled="generationFramesLoading || loading">
            <template v-if="loading">Loading, give it around 20 seconds</template>
            <template v-else>Extend image</template>
          </button>
        </div>
        <div v-if="topResult">
          <img width="200" :src="topGenerationFrame" />
          <img width="200" :src="topResult" />
        </div>
        <div v-if="bottomResult">
          <img width="200" :src="bottomGenerationFrame" />
          <img width="200" :src="bottomResult" />
        </div>
      </div>
    </div>
    <div class="d-none">
      <canvas id="drawCanvas" :width="originalSize" :height="originalSize"></canvas>
      <canvas id="cropCanvas" :width="originalSize" :height="originalSize"></canvas>
    </div>
  </div>
</template>
<style scoped>
canvas {
  border: 1px #000 solid;
}
img {
  background-image: linear-gradient(45deg, #00000011 25%, transparent 25%), linear-gradient(-45deg, #00000011 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #00000011 75%), linear-gradient(-45deg, transparent 75%, #00000011 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  margin-right: 15px;
}
</style>
<script>
const DEST_HEIGHT = 910;
const HALF_DEST_HEIGHT = DEST_HEIGHT / 2;

const ORIGINAL_SIZE = 512;
const HALF_ORIGINAL_SIZE = ORIGINAL_SIZE / 2;

const API = 'http://localhost:3333'
import $http from 'axios'
export default {
  props: {
    image: String,
    prompt: String
  },
  methods: {
    async extendVertical() {
      this.loading = true;
      try {
        await Promise.all([
            this.extend(this.topGenerationFrame, HALF_DEST_HEIGHT - ORIGINAL_SIZE).then(url => {
              this.topResult = url;
            }),
            this.extend(this.bottomGenerationFrame, HALF_DEST_HEIGHT).then(url => {
              this.bottomResult = url;
            })
        ])
        this.generated = true;
      } catch (error) {
        alert('Something went wrong, is the server running? Is your API key filled out? See console for details.')
      }
      this.loading = false;
    },
    // Extend the given image and stitch it in at yPosition
    async extend(image, yPosition) {
      // Make sure the server is running, this will take ~20 seconds on average
      const res = await $http.post(`${API}/inpaint`, {
        prompt: this.prompt,
        image,
      })
      return new Promise((resolve, reject) => {
        // Draw the resulting image in the stitching canvas
        fabric.Image.fromURL(res.data, (img) => {
          this.stitchCanvas.add(img);
          img.set({
            top: yPosition
          })
          img.sendToBack();
          this.stitchCanvas.renderAll();
          resolve(res.data);
        });
      })
    },
    async generationFrame(image, top, left) {
      // Clear the canvas
      this.cropCanvas.remove(...this.cropCanvas.getObjects()).renderAll();
      return new Promise((resolve, reject) => {
        // Load the image, set the position, and resolve the promise with the resulting image
        fabric.Image.fromURL(image, (img) => {
          this.cropCanvas.add(img).renderAll();
          img.set({
            left,
            top,
          })
          this.cropCanvas.renderAll();
          resolve(this.cropCanvas.toDataURL());
        });
      })
    }
  },
  mounted() {
    // Initialize drawCanvas, this canvas will contain our original drawing / image
    this.drawCanvas = new fabric.Canvas('drawCanvas');
    // Initialize stitchCanvas, this canvas will contain our resulting stitched vertical image
    this.stitchCanvas = new fabric.StaticCanvas('stitchCanvas');
    // Initialize cropCanvas, this canvas will be used for chopping the image up and creating the generation frames
    this.cropCanvas = new fabric.Canvas('cropCanvas');
    // Start by loading in the image
    fabric.Image.fromURL(this.image, async (img) => {
      this.drawCanvas.add(img).renderAll();
      // Create the generation frames, top, bottom, left and right
      this.topGenerationFrame = await this.generationFrame(this.drawCanvas.toDataURL({
        height: HALF_ORIGINAL_SIZE
      }), HALF_ORIGINAL_SIZE, 0);
      this.bottomGenerationFrame = await this.generationFrame(this.drawCanvas.toDataURL({
        top: HALF_ORIGINAL_SIZE,
        height: HALF_ORIGINAL_SIZE
      }), 0, 0);
      this.leftGenerationFrame = await this.generationFrame(this.drawCanvas.toDataURL({
        width: HALF_ORIGINAL_SIZE
      }), 0, HALF_ORIGINAL_SIZE);
      this.rightGenerationFrame = await this.generationFrame(this.drawCanvas.toDataURL({
        left: HALF_ORIGINAL_SIZE,
        width: HALF_ORIGINAL_SIZE
      }), 0, 0);
      this.generationFramesLoading = false;
    });
    // Also draw in the original image on the stitching canvas, centered vertically
    fabric.Image.fromURL(this.image, async (img) => {
      this.stitchCanvas.add(img).renderAll();
      img.set({
        top: HALF_DEST_HEIGHT - HALF_ORIGINAL_SIZE
      }).setCoords();
      this.stitchCanvas.renderAll();
    });
  },
  data() {
    return {
      loading: false,
      generated: false,
      generationFramesLoading: true,
      // Results from API
      bottomResult: false,
      topResult: false,
      // Generation frames
      topGenerationFrame: false,
      bottomGenerationFrame: false,
      leftGenerationFrame: false,
      rightGenerationFrame: false,
      // Canvas sizes
      destinationHeight: DEST_HEIGHT,
      originalSize: ORIGINAL_SIZE,
    }
  }
}
</script>
