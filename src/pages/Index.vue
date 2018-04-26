<template>
<div>
  <TotalHeader />
  <p>It's index</p>
  <div class="img">
    img-src
    <img src="../assets/cat.png" alt="">
  </div>
  <div class="img img-in-css">
    img-css-background
  </div>
</div>
</template>

<script>

export default {
  components: {
    TotalHeader: () => import('../cmpts/TotalHeader.vue')
  }
}
</script>

<style>
div.img {
  width: 100px;
  height: 100px;
}
div.img-in-css {
  background: url('../assets/cat.png');
  background-size: cover;
}
</style>
