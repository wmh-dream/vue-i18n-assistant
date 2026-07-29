import { parseVue } from "./parser/vueParser";
import { convertTemplate } from "./converter/templateConverter";
import { convertScript } from "./converter/scriptConverter";

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
import { ElMessage } from "element-plus"
import { useI18n } from "vue-i18n"

const { t: $t } = useI18n()

const msg = "提交"

const name = "张三"

const arr = ["保存", "取消"]

const config = {
  title: "用户管理",
  success: "操作成功",
  "中文key": "不应被翻译的value"
}

ElMessage.success("保存成功")

throw new Error("失败")

const tpl = \`模板中文\`

const nested = \`前缀\${name}后缀\`

export const exported = "导出的文案"

export { reExport } from "./other"
</script>
`;

const sfc = parseVue(code);

if (!sfc.template) {
  throw new Error("Template 不存在");
}

console.log("=== Template 转换 ===");
console.log(convertTemplate(sfc.template));

if (sfc.scriptSetup) {
  console.log("\n=== Script Setup 转换 ===");
  console.log(convertScript(sfc.scriptSetup, "scriptSetup"));
}

if (sfc.script) {
  console.log("\n=== Script 转换 ===");
  console.log(convertScript(sfc.script, "script"));
}
