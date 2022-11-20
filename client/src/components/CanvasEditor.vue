<template>
  <div>
    <div class="d-flex">
      <div>
        <canvas id="stitchCanvas" width="512" height="910"></canvas>
      </div>
      <div class="pl-3 pr-3">
        <h1>Outpainting example</h1>
        <p>
          Outpainting is actually just inpainting within incomplete image frames (called generation frames in Dall-E UI).
        </p>
        <p>
          Below, the images are shown that have been prepared for inpainting. These images are 512x512px and have a transparency channel.
        </p>
        <img width="200" :src="topPart" />
        <img width="200" :src="bottomPart" />
        <img width="200" :src="leftPart" />
        <img width="200" :src="rightPart" />
        <p>
          By sending this image to the Dall-E API both as an image and as a mask, we ask Dall-E to inpaint the transparent pixels.
          The resulting image will then be stitched in a canvas on the right position.
        </p>
        <div class="panel" v-if="!generated">
          <p>
            Make sure the server is running & your API key is filled in, then press the button below.
          </p>
          <button @click="extendVertical" :disabled="initializing || loading">
            <template v-if="loading">Loading, give it arount 20 seconds</template>
            <template v-else>Extend image</template>
          </button>
        </div>
        <div v-if="bottomResult">
          <img width="200" :src="bottomPart" />
          <img width="200" :src="bottomResult" />
        </div>
        <div v-if="topResult">
          <img width="200" :src="topPart" />
          <img width="200" :src="topResult" />
        </div>
      </div>
    </div>
    <div class="d-none">
      <canvas id="drawCanvas" width="512" height="512"></canvas>
      <canvas id="cropCanvas" width="512" height="512"></canvas>
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
const SIZE = 512;
const HALF_SIZE = 512 / 2;
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
          this.extendTop(),
          this.extendBottom()
        ])
        this.generated = true;
      } catch (error) {
        alert('Something went wrong, is the server running? Is your API key filled out? See console for details.')
      }
      this.loading = false;
    },
    async extendTop() {
      const res = await $http.post(`${API}/inpaint`, {
        prompt: this.prompt,
        image: this.topPart,
      })
      this.topResult = res.data;
      fabric.Image.fromURL(res.data, (img) => {
        this.stitchCanvas.add(img);
        img.set({
          top: 455 - SIZE // 910 destination size, 455 = 910/2
        })
        img.sendToBack();
        this.stitchCanvas.renderAll();
      });
    },
    async extendBottom() {
      const res = await $http.post(`${API}/inpaint`, {
        prompt: this.prompt,
        image: this.bottomPart,
      })
      this.bottomResult = res.data;
      fabric.Image.fromURL(res.data, (img) => {
        this.stitchCanvas.add(img);
        img.set({
          top: 455
        })
        img.sendToBack();
        this.stitchCanvas.renderAll();
      });
    },
    async resize(image, top, left) {
      this.cropCanvas.remove(...this.cropCanvas.getObjects()).renderAll();
      return new Promise((resolve, reject) => {
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
    this.drawCanvas = new fabric.Canvas('drawCanvas');
    this.stitchCanvas = new fabric.StaticCanvas('stitchCanvas');
    this.cropCanvas = new fabric.Canvas('cropCanvas');
    window.drawCanvas = this.drawCanvas;
    fabric.Image.fromURL(this.image, async (img) => {
      this.drawCanvas.add(img).renderAll();
      this.topPart = await this.resize(this.drawCanvas.toDataURL({
        height: HALF_SIZE
      }), HALF_SIZE, 0);
      this.bottomPart = await this.resize(this.drawCanvas.toDataURL({
        top: HALF_SIZE,
        height: HALF_SIZE
      }), 0, 0);
      this.leftPart = await this.resize(this.drawCanvas.toDataURL({
        width: HALF_SIZE
      }), 0, HALF_SIZE);
      this.rightPart = await this.resize(this.drawCanvas.toDataURL({
        left: HALF_SIZE,
        width: HALF_SIZE
      }), 0, 0);
      this.initializing = false;
    });
    fabric.Image.fromURL(this.image, async (img) => {
      this.stitchCanvas.add(img).renderAll();
      img.set({
        top: 455 - HALF_SIZE
      }).setCoords();
      this.stitchCanvas.renderAll();
    });
  },
  data() {
    return {
      loading: false,
      generated: false,
      initializing: true,
      topPart: false,
      topResult: false,
      bottomPart: false,
      bottomResult: false,
      leftPart: false,
      rightPart: false,
    }
  }
}
</script>
