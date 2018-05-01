<template>
<div>
  <TotalHeader />
  <p>It's index</p>
  <div class="img">
    img-src
    <img src="../assets/cat.png" alt="">
  </div>
</div>
</template>

<script>
import TotalHeader from '../cmpts/TotalHeader.vue'

export default {
  name: 'index',
  components: {
    TotalHeader
  }
}
</script>

<style scoped>
div.img {
  width: 100px;
  height: 100px;
}
</style>
