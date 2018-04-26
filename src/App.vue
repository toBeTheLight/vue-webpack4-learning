<template>
  <div class="app">
    <router-link to="/index">index</router-link>
    <router-link to="/login">login</router-link>
    <router-view></router-view>
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
  border: 1px solid black;
}
</style>
