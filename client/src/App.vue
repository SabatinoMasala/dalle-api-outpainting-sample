<template>
  <div>
    <div class="d-flex p-3">
      <img class="mr-3" width="100" height="100" :src="sample.image" v-for="(sample, index) in examples" @click="currentSampleIndex = index" />
      <DropUpload @files="handleFiles">
        <p>Drop 512x512 image here or <button class="btn btn-primary">Choose image</button></p>
      </DropUpload>
    </div>
    <CanvasEditor :key="currentSample.image" :image="currentSample.image" :prompt="currentSample.prompt" />
  </div>
</template>
<script>
import CanvasEditor from './components/CanvasEditor.vue';
import DropUpload from './components/DropUpload.vue';
export default {
  components: {
    DropUpload,
    CanvasEditor
  },
  computed: {
    currentSample() {
      return this.examples[this.currentSampleIndex];
    }
  },
  methods: {
    handleFiles(files) {
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = () => {
          this.examples.push({
            image: reader.result,
            prompt: 'person standing on the beach'
          });
          this.currentSampleIndex = this.examples.length - 1;
        };
        reader.readAsDataURL(files[i]);
      }
    }
  },
  data() {
    return {
      examples: [{
        image: '/woman.png',
        prompt: 'a woman with glasses smiling at the camera with a sunset in the background behind her and a blurry background, by George Lambourn'
      }, {
        image: '/dog.jpg',
        prompt: 'Husky dog'
      }],
      currentSampleIndex: 0
    }
  }
}
</script>
