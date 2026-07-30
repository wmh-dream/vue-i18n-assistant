import { convertVue } from "../src/index.js";
import { convertTemplate } from "../src/index.js";
import { convertScript } from "../src/index.js";

/**
 * 功能测试套件:覆盖所有 i18n 场景。
 * 每个用例断言「输入 → 期望输出」,失败则打印实际输出。
 */

interface Case {
  name: string;
  input: string;
  expected: string;
  fn: (code: string) => string;
}

const cases: Case[] = [
  // ========== Template TextNode ==========
  {
    name: "TextNode 纯中文",
    input: `<template><div>提交</div></template>`,
    expected: `<template><div>{{ $t('提交') }}</div></template>`,
    fn: convertVue,
  },
  {
    name: "TextNode 带前后空白",
    input: `<template><div>  提交  </div></template>`,
    expected: `<template><div>  {{ $t('提交') }}  </div></template>`,
    fn: convertVue,
  },
  {
    name: "TextNode 混合非中文(数字+中文+英文)",
    input: `<template><div>123提交abc</div></template>`,
    expected: `<template><div>123{{ $t('提交') }}abc</div></template>`,
    fn: convertVue,
  },
  {
    name: "TextNode 多段中文",
    input: `<template><div>提交并保存</div></template>`,
    expected: `<template><div>{{ $t('提交并保存') }}</div></template>`,
    fn: convertVue,
  },
  {
    name: "TextNode 无中文不动",
    input: `<template><div>no chinese</div></template>`,
    expected: `<template><div>no chinese</div></template>`,
    fn: convertVue,
  },

  // ========== Template Attribute ==========
  {
    name: "Attribute placeholder",
    input: `<template><el-input placeholder="请输入姓名" /></template>`,
    expected: `<template><el-input :placeholder="$t('请输入姓名')" /></template>`,
    fn: convertVue,
  },
  {
    name: "Attribute title",
    input: `<template><div title="提示文字">x</div></template>`,
    expected: `<template><div :title="$t('提示文字')">x</div></template>`,
    fn: convertVue,
  },
  {
    name: "Attribute label",
    input: `<template><div label="标签">x</div></template>`,
    expected: `<template><div :label="$t('标签')">x</div></template>`,
    fn: convertVue,
  },
  {
    name: "Attribute alt",
    input: `<template><img alt="头像" /></template>`,
    expected: `<template><img :alt="$t('头像')" /></template>`,
    fn: convertVue,
  },
  {
    name: "Attribute empty-text",
    input: `<template><el-table empty-text="暂无数据" /></template>`,
    expected: `<template><el-table :empty-text="$t('暂无数据')" /></template>`,
    fn: convertVue,
  },
  {
    name: "Attribute confirm-button-text",
    input: `<template><el-popconfirm confirm-button-text="确认" /></template>`,
    expected: `<template><el-popconfirm :confirm-button-text="$t('确认')" /></template>`,
    fn: convertVue,
  },
  {
    name: "Attribute cancel-button-text",
    input: `<template><el-popconfirm cancel-button-text="取消" /></template>`,
    expected: `<template><el-popconfirm :cancel-button-text="$t('取消')" /></template>`,
    fn: convertVue,
  },
  {
    name: "白名单外属性不翻译",
    input: `<template><div class="容器" data-tip="提示">x</div></template>`,
    expected: `<template><div class="容器" data-tip="提示">x</div></template>`,
    fn: convertVue,
  },
  {
    name: "动态属性不翻译(已绑定)",
    input: `<template><el-input :placeholder="msg" /></template>`,
    expected: `<template><el-input :placeholder="msg" /></template>`,
    fn: convertVue,
  },

  // ========== Template Interpolation ==========
  {
    name: "Interpolation 简单变量不动",
    input: `<template><div>{{ name }}</div></template>`,
    expected: `<template><div>{{ name }}</div></template>`,
    fn: convertVue,
  },
  {
    name: "Interpolation 三元字符串字面量",
    input: `<template><div>{{ !flag ? '查看' : '收起' }}</div></template>`,
    expected: `<template><div>{{ !flag ? $t('查看') : $t('收起') }}</div></template>`,
    fn: convertVue,
  },
  {
    name: "Interpolation 字符串拼接",
    input: `<template><div>{{ '前缀' + name + '后缀' }}</div></template>`,
    expected: `<template><div>{{ $t('前缀') + name + $t('后缀') }}</div></template>`,
    fn: convertVue,
  },
  {
    name: "Interpolation 函数调用参数",
    input: `<template><div>{{ fn('参数文案') }}</div></template>`,
    expected: `<template><div>{{ fn($t('参数文案')) }}</div></template>`,
    fn: convertVue,
  },
  {
    name: "Interpolation 数字不动",
    input: `<template><div>{{ 123 }}</div></template>`,
    expected: `<template><div>{{ 123 }}</div></template>`,
    fn: convertVue,
  },

  // ========== Template 混合 ==========
  {
    name: "文本+插值混合(只翻译文本中文)",
    input: `<template><div>时间:{{ value }}</div></template>`,
    expected: `<template><div>{{ $t('时间') }}:{{ value }}</div></template>`,
    fn: convertVue,
  },
  {
    name: "文本+属性+插值混合",
    input: `<template><el-input placeholder="请输入">{{ '提示' }}</el-input></template>`,
    expected: `<template><el-input :placeholder="$t('请输入')">{{ $t('提示') }}</el-input></template>`,
    fn: convertVue,
  },

  // ========== Script ==========
  {
    name: "Script 变量赋值",
    input: `<script>const msg = "提交"</script>`,
    expected: `<script>const msg = $t('提交')</script>`,
    fn: convertVue,
  },
  {
    name: "Script setup 变量赋值",
    input: `<script setup>const msg = "提交"</script>`,
    expected: `<script setup>const msg = $t('提交')</script>`,
    fn: convertVue,
  },
  {
    name: "Script lang=ts",
    input: `<script lang="ts">const msg: string = "提交"</script>`,
    expected: `<script lang="ts">const msg: string = $t('提交')</script>`,
    fn: convertVue,
  },
  {
    name: "Script 函数调用参数",
    input: `<script>ElMessage.success("保存成功")</script>`,
    expected: `<script>ElMessage.success($t('保存成功'))</script>`,
    fn: convertVue,
  },
  {
    name: "Script throw new Error",
    input: `<script>throw new Error("失败")</script>`,
    expected: `<script>throw new Error($t('失败'))</script>`,
    fn: convertVue,
  },
  {
    name: "Script 数组",
    input: `<script>const arr = ["保存", "取消"]</script>`,
    expected: `<script>const arr = [$t('保存'), $t('取消')]</script>`,
    fn: convertVue,
  },
  {
    name: "Script 对象 value(不翻译 key)",
    input: `<script>const c = { 标题: "用户管理" }</script>`,
    expected: `<script>const c = { 标题: $t('用户管理') }</script>`,
    fn: convertVue,
  },
  {
    name: "Script 单引号字符串",
    input: `<script>const x = '提交'</script>`,
    expected: `<script>const x = $t('提交')</script>`,
    fn: convertVue,
  },
  {
    name: "Script 模板字面量(无插值)",
    input: "<script>const x = `模板中文`</script>",
    expected: "<script>const x = $t('模板中文')</script>",
    fn: convertVue,
  },
  {
    name: "Script 模板字面量(带插值,跳过)",
    input: "<script>const x = `前缀${name}后缀`</script>",
    expected: "<script>const x = `前缀${name}后缀`</script>",
    fn: convertVue,
  },
  {
    name: "Script import 路径不翻译",
    input: `<script>import { foo } from "./中文路径"</script>`,
    expected: `<script>import { foo } from "./中文路径"</script>`,
    fn: convertVue,
  },
  {
    name: "Script export 路径不翻译",
    input: `<script>export { foo } from "./中文路径"</script>`,
    expected: `<script>export { foo } from "./中文路径"</script>`,
    fn: convertVue,
  },
  {
    name: "Script export const value 翻译",
    input: `<script>export const msg = "导出文案"</script>`,
    expected: `<script>export const msg = $t('导出文案')</script>`,
    fn: convertVue,
  },
  {
    name: "Script 无中文不动",
    input: `<script>const msg = "english"</script>`,
    expected: `<script>const msg = "english"</script>`,
    fn: convertVue,
  },
  {
    name: "Script 注释不动",
    input: `<script>// 注释中的中文\nconst x = 1</script>`,
    expected: `<script>// 注释中的中文\nconst x = 1</script>`,
    fn: convertVue,
  },

  // ========== SFC 整体 ==========
  {
    name: "SFC 保留 style",
    input: `<template><div>提交</div></template>\n<style>.a{color:red}</style>`,
    expected: `<template><div>{{ $t('提交') }}</div></template>\n<style>.a{color:red}</style>`,
    fn: convertVue,
  },
  {
    name: "SFC 保留 customBlock",
    input: `<template><div>提交</div></template>\n<docs>文档中文</docs>`,
    expected: `<template><div>{{ $t('提交') }}</div></template>\n<docs>文档中文</docs>`,
    fn: convertVue,
  },
  {
    name: "SFC template+script 双块",
    input: `<template><div>{{ '提交' }}</div></template>\n<script>const x = "保存"</script>`,
    expected: `<template><div>{{ $t('提交') }}</div></template>\n<script>const x = $t('保存')</script>`,
    fn: convertVue,
  },

  // ========== 兼容性 ==========
  {
    name: "convertTemplate 仍可用",
    input: `<div>提交</div>`,
    expected: `<div>{{ $t('提交') }}</div>`,
    fn: convertTemplate,
  },
  {
    name: "convertScript 仍可用",
    input: `const msg = "提交"`,
    expected: `const msg = $t('提交')`,
    fn: convertScript,
  },
];

// 运行
let pass = 0;
let fail = 0;
const failures: { name: string; input: string; expected: string; actual: string }[] = [];

for (const c of cases) {
  let actual: string;
  try {
    actual = c.fn(c.input);
  } catch (e) {
    actual = `ERROR: ${(e as Error).message}`;
  }

  if (actual === c.expected) {
    pass++;
  } else {
    fail++;
    failures.push({ name: c.name, input: c.input, expected: c.expected, actual });
  }
}

console.log(`\n=== 测试结果 ===`);
console.log(`通过: ${pass}/${cases.length}`);
console.log(`失败: ${fail}/${cases.length}`);

if (failures.length > 0) {
  console.log(`\n--- 失败用例 ---`);
  for (const f of failures) {
    console.log(`\n[${f.name}]`);
    console.log(`  输入: ${f.input}`);
    console.log(`  预期: ${f.expected}`);
    console.log(`  实际: ${f.actual}`);
  }
} else {
  console.log(`\n✅ 全部通过`);
}
