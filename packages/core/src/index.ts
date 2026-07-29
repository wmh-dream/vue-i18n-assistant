import { parseVue } from "./parser/vueParser";
import { convertTemplate } from "./converter/templateConverter";

const code = `
<template>
  <div>提交</div>

  <el-button>保存</el-button>

  <div>123</div>

  <div>abc</div>

  <span>{{ name }}</span>

  <div>审核通过</div>

  <div>  带空白的中文  </div>

  <el-input placeholder="请输入姓名" />

  <el-table empty-text="暂无数据" />

  <img alt="头像" />

  <div class="容器" data-tip="提示">白名单外属性不应被改</div>
</template>

<script setup lang="ts">
const name = "张三"
</script>
`;

const sfc = parseVue(code);

if (!sfc.template) {
  throw new Error("Template 不存在");
}

const newTemplate = convertTemplate(sfc.template);

console.log("转换后：");
console.log(newTemplate);
