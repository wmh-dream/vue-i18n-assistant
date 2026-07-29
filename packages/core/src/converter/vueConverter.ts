import { parseVueDescriptor } from "../parser/vueParser";
import { parseTemplate } from "../parser/templateParser";
import { collectChinese } from "../analyzer/collectChinese";
import { analyzeScript } from "../analyzer/scriptAnalyzer";
import { buildTemplateReplace } from "../generator/templateGenerator";
import { buildScriptReplace } from "../generator/scriptGenerator";
import { applyReplace } from "../transformer/wrapText";
import { shiftReplaceItems } from "../utils";
import type { ReplaceItem } from "../types";

/**
 * 过滤出 script-literal case 的 snippet,供 buildScriptReplace 消费。
 * 提取为内联工具函数,避免在 converter 里重复 type guard 模板。
 */
function filterScriptLiteral(snippets: import("../types").ChineseSnippet[]) {
  return snippets.filter(
    (s): s is Extract<typeof s, { case: "script-literal" }> =>
      s.case === "script-literal"
  );
}

/**
 * Converter:组织 SFC 级国际化 pipeline,修改整个 Vue 源码。
 *
 * 设计要点:
 * - 不调用 convertTemplate()/convertScript():它们返回新字符串会丢失
 *   snippet 坐标,无法做局部→全局换算。这里复用底层 analyzer/generator,
 *   拿到 ReplaceItem 后叠加 contentStart 平移到全局坐标。
 * - template/script/scriptSetup 各自分析+生成,坐标换算后合并。
 * - styles/customBlocks 不做 i18n,但 MagicString 只覆盖指定范围,
 *   未覆盖部分(含块标签、styles、customBlocks)原样保留,不会丢失。
 * - 保持 convertTemplate()/convertScript() 不变:它们仍可用于单块场景,
 *   convertVue() 是 SFC 级入口,二者并存,职责不同。
 *
 * @param code 完整 Vue SFC 源码
 * @returns 修改后的完整 Vue SFC 源码
 */
export function convertVue(code: string): string {
  const { template, script, scriptSetup } = parseVueDescriptor(code);

  const allReplaceItems: ReplaceItem[] = [];

  // Template:复用底层 analyzer/generator,坐标平移
  if (template) {
    const ast = parseTemplate(template.content);
    const snippets = collectChinese(ast);
    const items = buildTemplateReplace(snippets);
    allReplaceItems.push(...shiftReplaceItems(items, template.contentStart));
  }

  // Script(非 setup)
  if (script) {
    const snippets = analyzeScript(script.content, "script");
    const items = buildScriptReplace(filterScriptLiteral(snippets));
    allReplaceItems.push(...shiftReplaceItems(items, script.contentStart));
  }

  // Script setup
  if (scriptSetup) {
    const snippets = analyzeScript(scriptSetup.content, "scriptSetup");
    const items = buildScriptReplace(filterScriptLiteral(snippets));
    allReplaceItems.push(...shiftReplaceItems(items, scriptSetup.contentStart));
  }

  // 一次性在整段 SFC 上 apply 所有 ReplaceItem
  // MagicString 自动保留未覆盖区域(styles/customBlocks/块标签等)
  return applyReplace(code, allReplaceItems);
}
