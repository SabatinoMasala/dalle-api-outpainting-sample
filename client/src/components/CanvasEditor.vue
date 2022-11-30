<template>
  <div>
    <div class="d-flex">
      <div>
        <canvas id="stitchCanvas" :width="destinationWidth" :height="destinationHeight"></canvas>
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
        <img width="200" :src="generationFrame.image" v-for="generationFrame in generationFrames" />
        <p>
          By sending this image to the Dall-E API both as an image and as a mask, we ask Dall-E to inpaint the transparent pixels.
          The resulting image will then be stitched in a canvas on the right position.
        </p>
        <div class="panel mt-3" v-if="!generated">
          <p>
            Make sure the server is running & your API key is filled in, then press the button below.
          </p>
          <div class="py-3">
            <textarea v-model="inputPrompt"></textarea>
          </div>
          <button @click="extendVerticalAndHorizontal" :disabled="generationFramesLoading || loading">
            <template v-if="loading">Loading, give it around 20 seconds per iteration</template>
            <template v-else>Extend image</template>
          </button>
        </div>
        <div v-if="topResult">
          <p>Top:</p>
          <img width="200" :src="topGenerationFrame" />
          <img width="200" :src="topResult" />
        </div>
        <div v-if="bottomResult">
          <p>Bottom:</p>
          <img width="200" :src="bottomGenerationFrame" />
          <img width="200" :src="bottomResult" />
        </div>
        <div v-if="leftResult">
          <p>Left:</p>
          <img width="200" :src="leftGenerationFrame" />
          <img width="200" :src="leftResult" />
        </div>
        <div v-if="rightResult">
          <p>Right:</p>
          <img width="200" :src="rightGenerationFrame" />
          <img width="200" :src="rightResult" />
        </div>
      </div>
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
const DEST_HEIGHT = 1200;
const DEST_WIDTH = 1200;
const HALF_DEST_WIDTH = DEST_WIDTH / 2;
const HALF_DEST_HEIGHT = DEST_HEIGHT / 2;

const ORIGINAL_SIZE = 512;
const HALF_ORIGINAL_SIZE = ORIGINAL_SIZE / 2;

const GENERATED_TILE_SIZE = 512;
const HALF_GENERATED_TILE_SIZE = GENERATED_TILE_SIZE / 2;

const API = 'http://localhost:3333'
import $http from 'axios'
export default {
  props: {
    image: String,
    prompt: String
  },
  methods: {
    addGenerationFrame(xOffsetPercentage, yOffsetPercentage, width = 512, height = 512) {
      const rect = new fabric.Rect({
        isGenerationFrame: true,
        left: 0,
        top: 0,
        width,
        height,
        fill: 'rgba(255, 0, 0, 0.1)',
        strokeWidth: 1,
        stroke: '#f00'
      });
      this.stitchCanvas.add(rect);
      this.stitchCanvas.centerObject(rect);
      rect.set({
        left: rect.left + ORIGINAL_SIZE * xOffsetPercentage,
        top: rect.top + ORIGINAL_SIZE * yOffsetPercentage,
      })
      this.stitchCanvas.renderAll();
      return {
        image: this.grabGenerationFrame(rect),
        rect
      };
    },
    grabGenerationFrame(frame) {
      const hiddenObjects = [];
      this.stitchCanvas.forEachObject(o => {
        if (o.isGenerationFrame) {
          o.set({
            visible: false,
          })
          hiddenObjects.push(o);
        }
      })
      this.stitchCanvas.renderAll();
      const res = this.stitchCanvas.toDataURL({
        type: 'png',
        left: frame.left,
        top: frame.top,
        width: frame.width,
        height: frame.height,
      });
      hiddenObjects.forEach(o => {
        o.set({
          visible: true
        })
      });
      this.stitchCanvas.renderAll();
      return res;
    },
    async extendVerticalAndHorizontal() {
      this.loading = true;
      try {
        await Promise.all(this.generationFrames.map(gF => {
          return this.extend(gF.image, gF.rect);
        }))
        this.stitchCanvas.renderAll();

        this.clearAllGenerationFrames();

        this.generationFrames.push(this.addGenerationFrame(-0.5, -0.5));
        this.generationFrames.push(this.addGenerationFrame(0.5, -0.5));
        this.generationFrames.push(this.addGenerationFrame(-0.5, 0.5));
        this.generationFrames.push(this.addGenerationFrame(0.5, 0.5));

        await Promise.all(this.generationFrames.map(gF => {
          return this.extend(gF.image, gF.rect);
        }))
        this.stitchCanvas.renderAll();

        this.clearAllGenerationFrames();

        this.generated = true;
      } catch (error) {
        console.log(error);
        alert('Something went wrong, is the server running? Is your API key filled out? See console for details.')
      }
      this.loading = false;
    },
    clearAllGenerationFrames() {
      this.stitchCanvas.forEachObject(o => {
        if (o.isGenerationFrame) {
          o.canvas.remove(o);
        }
      })

      this.generationFrames = [];
    },
    // Extend the given image and stitch it in at yPosition
    async extend(image, rect) {
      // Make sure the server is running, this will take ~20 seconds on average
      const res = await $http.post(`${API}/inpaint`, {
        prompt: this.inputPrompt,
        image,
      })
      return new Promise((resolve, reject) => {
        // Draw the resulting image in the stitching canvas
        fabric.Image.fromURL(`${API}${res.data}`, (img) => {
          this.stitchCanvas.add(img);
          img.set({
            top: rect.top,
            left: rect.left
          })
          img.setCoords();
          img.sendToBack();
          this.stitchCanvas.renderAll();
          resolve();
        }, { crossOrigin: 'Anonymous' });
      })
    },
  },
  mounted() {
    // Initialize stitchCanvas, this canvas will contain our resulting stitched vertical image
    this.stitchCanvas = new fabric.StaticCanvas('stitchCanvas');
    // Expose on the window object for easy debugging
    window.canvas = this.stitchCanvas;
    // Also draw in the original image on the stitching canvas, centered vertically
    fabric.Image.fromURL(this.image, async (img) => {
      this.stitchCanvas.add(img).renderAll();
      this.stitchCanvas.centerObject(img).renderAll();
      img.set({
        top: HALF_DEST_HEIGHT - HALF_ORIGINAL_SIZE
      }).setCoords();
      this.stitchCanvas.renderAll();
      // Create the generation frames, top, bottom, left and right
      this.generationFrames.push(this.addGenerationFrame(0, -0.5));
      this.generationFrames.push(this.addGenerationFrame(0, 0.5));
      this.generationFrames.push(this.addGenerationFrame(-0.5, 0));
      this.generationFrames.push(this.addGenerationFrame(0.5, 0));
      this.generationFramesLoading = false;
    });
  },
  data() {
    return {
      inputPrompt: this.prompt,
      loading: false,
      generated: false,
      generationFramesLoading: true,
      // Results from API
      bottomResult: false,
      topResult: false,
      leftResult: false,
      rightResult: false,
      // Generation frames cross
      topGenerationFrame: false,
      bottomGenerationFrame: false,
      leftGenerationFrame: false,
      rightGenerationFrame: false,
      // Canvas sizes
      destinationHeight: DEST_HEIGHT,
      destinationWidth: DEST_WIDTH,
      originalSize: ORIGINAL_SIZE,
      generationFrames: []
    }
  }
}
</script>
