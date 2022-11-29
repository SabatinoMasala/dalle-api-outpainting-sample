<template>
  <div>
    <img width="100" :src="sample.image" v-for="(sample, index) in examples" @click="currentSampleIndex = index" />
    <CanvasEditor :key="currentSample.image" :image="currentSample.image" :prompt="currentSample.prompt" />
  </div>
</template>
<script>
import CanvasEditor from './components/CanvasEditor.vue';
export default {
  components: {
    CanvasEditor
  },
  computed: {
    currentSample() {
      return this.examples[this.currentSampleIndex];
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
