<template>
  <div>
    <CanvasEditor image="/demo.jpg" :prompt="prompt" />
  </div>
</template>
<script>
import CanvasEditor from './components/CanvasEditor.vue';
export default {
  components: {
    CanvasEditor
  },
  data() {
    return {
      prompt: 'dog stylized minimalist, loftis, cory behance hd by jesper ejsing, by rhads, makoto shinkai and lois van baarle, ilya kuvshinov, rossdraws global illumination'
    }
  }
}
</script>
