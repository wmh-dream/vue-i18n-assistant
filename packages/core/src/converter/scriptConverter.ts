import { analyzeScript } from "../analyzer/scriptAnalyzer";
import { buildScriptReplace } from "../generator/scriptGenerator";
import { applyReplace } from "../transformer/wrapText";
import type { SourceType } from "../types";

/**
 * Converter:组织 Script 国际化 pipeline。
 *
 * 流程:analyze → generate → transform
 * (parse 由 analyzer 内部调用 scriptParser,保持 analyzer 自包含)
 *
 * @param code <script> 块源码字符串
 * @param source 标识来自哪个 SFC 块(script / scriptSetup),
 *               透传至 snippet.source,供 transformer 坐标换算
 */
export function convertScript(
  code: string,
  source: Extract<SourceType, "script" | "scriptSetup">
): string {
  const snippets = analyzeScript(code, source);
  const replaceItems = buildScriptReplace(
    snippets.filter(
      (s): s is Extract<typeof s, { case: "script-literal" }> =>
        s.case === "script-literal"
    )
  );
  return applyReplace(code, replaceItems);
}
