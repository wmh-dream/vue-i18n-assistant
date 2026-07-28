import { parseVue } from "./parser/vueParser";

const code = `
<template>
  <div>你好</div>

  <el-button>提交</el-button>
</template>

<script setup lang="ts">
const name = "张三"

const arr = [
  "待审核",
  "已完成"
]
</script>

<style scoped>
.red{
    color:red;
}
</style>
`;

const result = parseVue(code);

console.log(result);
