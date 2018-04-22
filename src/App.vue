<template>
  <div class="app">
    <p>{{msg}}</p>
    <img src="./assets/cat.png" alt="">
  </div>
</template>

<script>
export default {
  data () {
    return {
      msg: '挂载成功'
    }
  }
}
</script>

<style scoped lang="less">
.app {
  background-color: royalblue;
  box-shadow: 1px 1px 1px black;
}
</style>
