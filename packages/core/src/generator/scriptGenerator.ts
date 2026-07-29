import type {
  ChineseScriptLiteralSnippet,
  ReplaceItem,
} from "../types/index.js";

/**
 * Generator:将 Script 场景的 ChineseSnippet 转换为 ReplaceItem。
 *
 * 设计要点:
 * - 只负责「决定替换文本长什么样」,不读取/修改源码(transformer 职责)。
 * - 字符串/模板字面量统一替换为 $t('...'):
 *   整个字面量(含引号/反引号)被替换,引号自然去除,变成函数调用。
 * - 当前 string/template 两种 kind 替换文本相同,但保留分支以便后续差异化
 *   (如带表达式的模板字面量需生成 $t('xxx{name}xxx', { name }) 形式)。
 *
 * 输入已由调用方过滤为 script-literal case,此函数专注该场景。
 */
export function buildScriptReplace(
  list: ChineseScriptLiteralSnippet[]
): ReplaceItem[] {
  return list.map((snippet) => ({
    source: snippet.source,
    start: snippet.start,
    end: snippet.end,
    replace: `$t('${snippet.text}')`,
  }));
}
