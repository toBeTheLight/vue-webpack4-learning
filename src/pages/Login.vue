<template>
<div>
  <TotalHeader />
  <p>It's login</p>
  <div class="img img-in-css">
    img-css-background
  </div>
</div>
</template>

<script>
import TotalHeader from '../cmpts/TotalHeader.vue'

export default {
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
div.img-in-css {
  background: url('../assets/cat.png');
  background-size: cover;
}
</style>
