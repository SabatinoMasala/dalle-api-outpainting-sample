<template>
  <div class="p-4 text-center cursor-pointer drop-area" ref="dropArea" @click="$refs.file.click()">
    <slot></slot>
    <input multiple type="file" ref="file" class="d-none" @change="updateFile" />
  </div>
</template>

<style scoped>
.drop-area {
  border: 2px #ccc dashed;
}
.drop-area.highlight {
  border-color: #f00;
}
</style>

<script>
export default {
  mounted() {
    const dropArea = this.$refs.dropArea;
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false)
      window.addEventListener(eventName, preventDefaults, false)
    });

    function preventDefaults (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, highlight, false)
      window.addEventListener(eventName, highlight, false)
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, unhighlight, false)
      window.addEventListener(eventName, unhighlight, false)
    });

    const handleDrop = (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      this.$emit('files', files);
    };

    dropArea.addEventListener('drop', handleDrop, false);
    window.addEventListener('drop', handleDrop, false);

    function highlight(e) {
      dropArea.classList.add('highlight');
      dropArea.classList.add('border-success');
    }

    function unhighlight(e) {
      dropArea.classList.remove('highlight');
      dropArea.classList.remove('border-success');
    }
  },
  methods: {
    updateFile(e) {
      this.$emit('files', e.target.files);
    },
  }
}
</script>
