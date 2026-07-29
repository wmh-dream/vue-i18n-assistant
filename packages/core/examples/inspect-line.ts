import * as fs from "fs";
import { convertVue } from "../src/index.js";

const root = "d:/wmh/2026/tools/vue-i18n-assistant";
const code = fs.readFileSync(`${root}/onlineInspectionDetails.vue`, "utf8");
const out = convertVue(code);

const lines = out.split(/\r?\n/);
lines.forEach((l, i) => {
  if (l.includes("isExpand") && (l.includes("查看") || l.includes("收起") || l.includes("$t"))) {
    console.log(`行${i + 1}: ${l.trim()}`);
  }
});
