import {
  NodeTypes,
  type InterpolationNode,
  type SimpleExpressionNode,
} from "@vue/compiler-dom";
import { analyzeScript } from "./scriptAnalyzer.js";
import type {
  ChineseScriptLiteralSnippet,
  ChineseSnippet,
} from "../types/index.js";

/**
 * Analyzer:分析 Interpolation {{ }} 内部 JS 表达式中的中文字面量。
 *
 * 设计要点:
 * - 复用 analyzeScript:Interpolation 内部是 JS 表达式,字面量识别逻辑与
 *   <script> 块完全一致(跳过对象 key/import/export,收集含中文字面量)。
 *   避免重复实现,符合单一职责。
 * - 坐标换算:analyzeScript 接收独立字符串,产出的 snippet.start/end 是相对
 *   于该字符串的局部偏移。SimpleExpressionNode.loc.start.offset 是表达式
 *   在 SFC 源码中的绝对起点,叠加即得绝对偏移。
 * - source 固定为 'template':snippet 来自 template,坐标换算走 template 分支,
 *   converter 用 template 的 contentStart 平移。
 * - case 复用 'script-literal':替换形态一致('查看' → $t('查看')),
 *   generator 可直接委托 buildScriptReplace,无需新增分支。
 *
 * 不使用正则:全程基于 Babel AST(由 analyzeScript 内部完成)。
 *
 * @param node Vue Template InterpolationNode
 * @returns ChineseSnippet 列表(source 为 'template')
 */
export function analyzeInterpolation(
  node: InterpolationNode
): ChineseSnippet[] {
  // InterpolationNode.content 是 ExpressionNode 联合类型,实际场景下
  // 插值表达式内容都是 SimpleExpressionNode(复合表达式也是 string 形式)。
  // 类型收窄:只处理 SimpleExpressionNode,其他类型(如 CompoundExpression)
  // 在 Vue compiler-dom 的 parse 阶段已合并为 SimpleExpression。
  const content = node.content;
  if (content.type !== NodeTypes.SIMPLE_EXPRESSION) {
    return [];
  }

  const expr = content as SimpleExpressionNode;
  const expressionStart = expr.loc.start.offset;
  const expressionCode = expr.content;

  // 复用 script analyzer:source 传 'template',产出的 snippet.source 即为 'template'
  const snippets = analyzeScript(expressionCode, "template");

  // 局部偏移 → 绝对偏移;类型收窄为 ChineseScriptLiteralSnippet 以访问 start/end
  return snippets
    .filter(
      (s): s is ChineseScriptLiteralSnippet => s.case === "script-literal"
    )
    .map((s) => ({
      ...s,
      source: "template" as const,
      start: s.start + expressionStart,
      end: s.end + expressionStart,
    }));
}
