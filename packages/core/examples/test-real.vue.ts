import * as fs from "fs";
import { convertVue } from "../src/index.js";

const root = "d:/wmh/2026/tools/vue-i18n-assistant";
const original = fs.readFileSync(`${root}/onlineInspectionDetails.vue`, "utf8");
const expected = fs.readFileSync(`${root}/onlineInspectionDetails - 副本.vue`, "utf8");

const actual = convertVue(original);

// 提取所有 $t('xxx') 调用的 key,按出现顺序
function extractKeys(code: string): string[] {
  const keys: string[] = [];
  const re = /\$t\(['"]([^'"]+)['"]\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    keys.push(m[1]);
  }
  return keys;
}

const actualKeys = extractKeys(actual);
const expectedKeys = extractKeys(expected);

console.log(`实际 $t 调用数: ${actualKeys.length}`);
console.log(`预期 $t 调用数: ${expectedKeys.length}`);
console.log("---");

// 逐个对比
let mismatch = 0;
const max = Math.max(actualKeys.length, expectedKeys.length);
for (let i = 0; i < max; i++) {
  const a = actualKeys[i] ?? "(缺失)";
  const e = expectedKeys[i] ?? "(缺失)";
  const ok = a === e ? "✅" : "❌";
  if (a !== e) mismatch++;
  console.log(`[${i + 1}] ${ok} 实际: ${a} | 预期: ${e}`);
}

console.log("---");
console.log(`不匹配数: ${mismatch}`);

// 验证未翻译的中文残留(排除注释和 $t key 本身)
const chineseInActual = actual.match(/[\u4e00-\u9fa5]+/g) || [];
const chineseInExpected = expected.match(/[\u4e00-\u9fa5]+/g) || [];
console.log(`\n实际输出中中文片段数(含 $t key): ${chineseInActual.length}`);
console.log(`预期输出中中文片段数(含 $t key): ${chineseInExpected.length}`);

if (mismatch === 0 && actualKeys.length === expectedKeys.length) {
  console.log("\n✅ 翻译结果与人工完全一致");
}
