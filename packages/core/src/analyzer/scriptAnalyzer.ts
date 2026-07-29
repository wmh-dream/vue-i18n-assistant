import _traverse, { type NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { parseScript } from "../parser/scriptParser.js";
import { containsChinese } from "../utils/index.js";
import type {
  ChineseScriptLiteralSnippet,
  ChineseSnippet,
  SourceType,
} from "../types/index.js";

// @babel/traverse 在 CJS/ESM 互操作下默认导出形式不稳定,兼容取值
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const traverse = (_traverse as any).default ?? _traverse;

/**
 * Analyzer:遍历 Babel AST,产出 Script 场景的 ChineseSnippet 列表。
 *
 * 设计要点:
 * - 只负责「找出含中文的字面量及其精确位置」,不生成替换文本(generator 职责),
 *   不修改源码(transformer 职责)。
 * - 处理 StringLiteral:含中文即收集(函数参数/数组/对象值/变量赋值/throw 等
 *   全部由 AST 遍历自动覆盖,无需特判)。
 * - 处理 TemplateLiteral:仅当「无表达式插值 + quasis 含中文」时收集,
 *   带表达式的情况 i18n 需拆 key,复杂度高,后续单独实现。
 * - 跳过 import/export 的模块路径:这些是模块标识,不是 UI 文案。
 * - 跳过对象 key:只翻译 value,不翻译 key(对象 key 是标识符语义)。
 * - 变量名是 Identifier,非字面量,天然不会被收集。
 * - source 参数接受任意 SourceType:本函数只产出 snippet,source 透传。
 *   调用方传 'template' 可复用此函数分析 Interpolation 内部 JS 表达式。
 *
 * 不使用正则:全程遍历 AST,通过节点类型与 parentPath 判定上下文。
 *
 * @param code <script> 块或 Interpolation 表达式源码字符串
 * @param source 标识来自哪个 SFC 块,用于 transformer 坐标换算
 */
export function analyzeScript(
  code: string,
  source: SourceType
): ChineseSnippet[] {
  const ast = parseScript(code);
  const result: ChineseScriptLiteralSnippet[] = [];

  traverse(ast, {
    StringLiteral(path: NodePath<t.StringLiteral>) {
      const node = path.node;
      const parent = path.parent;

      // 跳过对象 key:只翻译 value
      if (
        t.isObjectProperty(parent) &&
        parent.key === node &&
        !parent.computed
      ) {
        return;
      }
      if (
        t.isObjectMethod(parent) &&
        parent.key === node &&
        !parent.computed
      ) {
        return;
      }

      // 跳过 import/export 模块路径
      if (
        (t.isImportDeclaration(parent) && parent.source === node) ||
        (t.isExportNamedDeclaration(parent) && parent.source === node) ||
        (t.isExportAllDeclaration(parent) && parent.source === node)
      ) {
        return;
      }

      if (!containsChinese(node.value)) return;

      result.push({
        source,
        case: "script-literal",
        kind: "string",
        text: node.value,
        start: node.start ?? -1,
        end: node.end ?? -1,
      });
    },

    TemplateLiteral(path: NodePath<t.TemplateLiteral>) {
      const node = path.node;

      // 带表达式插值的模板字符串暂不处理(i18n 需拆 key,复杂度高)
      if (node.expressions.length > 0) return;

      const quasi = node.quasis[0];
      if (!quasi) return;

      const raw = quasi.value.raw;
      if (!containsChinese(raw)) return;

      result.push({
        source,
        case: "script-literal",
        kind: "template",
        text: raw,
        start: node.start ?? -1,
        end: node.end ?? -1,
      });
    },
  });

  return result;
}
