import { parse } from "@babel/parser";
import _traverse, { type NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import {
  NodeTypes,
  type InterpolationNode,
  type SimpleExpressionNode,
} from "@vue/compiler-dom";
import { containsChinese, isI18nCall } from "../utils/index.js";
import type {
  ChineseScriptLiteralSnippet,
  ChineseSnippet,
} from "../types/index.js";

// @babel/traverse CJS/ESM 互操作兼容
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const traverse = (_traverse as any).default ?? _traverse;

/**
 * Analyzer:分析 Interpolation {{ }} 内部 JS 表达式中的中文字面量。
 *
 * 设计要点:
 * - 独立使用 Babel parse + traverse(不走 parseScript):因为 Interpolation
 *   内部是「表达式」而非「模块」,需要绕过 Babel 的 directive 机制。
 *   Babel 在 parse/parseScript 的 module/script 模式下,会把文件级首条
 *   字符串字面量(如 '提示')解析为 Directive 而非 ExpressionStatement,
 *   traverse 默认不进入 directives,导致 StringLiteral visitor 收不到。
 *   解决方案:把表达式包成 (expr),括号表达式不会被当作 directive。
 * - 字面量识别逻辑与 scriptAnalyzer 一致(跳过对象 key),但表达式场景
 *   不会有 import/export,逻辑更简单。
 * - 坐标换算:traverse 产出的 node.start/end 是相对于包装字符串的局部偏移,
 *   需减去包装前缀长度(1 个字符的 '(')得原表达式偏移,再叠加
 *   SimpleExpressionNode.loc.start.offset 得 SFC 绝对偏移。
 * - source 固定为 'template':snippet 来自 template,坐标换算走 template 分支。
 * - case 复用 'script-literal':替换形态一致,generator 可直接委托 buildScriptReplace。
 *
 * 不使用正则:全程基于 Babel AST。
 *
 * @param node Vue Template InterpolationNode
 * @returns ChineseSnippet 列表(source 为 'template')
 */
export function analyzeInterpolation(
  node: InterpolationNode
): ChineseSnippet[] {
  const content = node.content;
  if (content.type !== NodeTypes.SIMPLE_EXPRESSION) {
    return [];
  }

  const expr = content as SimpleExpressionNode;
  const expressionStart = expr.loc.start.offset;
  const expressionCode = expr.content;

  // 包成 (expr) 避免 Babel 把孤立字符串当 directive
  // 包装前缀长度为 1(即 '('),用于后续 offset 修正
  const WRAP_PREFIX = "(";
  const wrapped = `${WRAP_PREFIX}${expressionCode})`;

  const ast = parse(wrapped, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
    tokens: false,
  });

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

      // 跳过 i18n 调用参数:避免对 $t('xxx') 重复包裹,保证幂等性
      if (t.isCallExpression(parent) && isI18nCall(parent.callee)) {
        return;
      }

      if (!containsChinese(node.value)) return;

      // node.start/end 是相对于 wrapped 的偏移,减去 WRAP_PREFIX 长度得原表达式偏移
      const localStart = (node.start ?? -1) - WRAP_PREFIX.length;
      const localEnd = (node.end ?? -1) - WRAP_PREFIX.length;

      result.push({
        source: "template",
        case: "script-literal",
        kind: "string",
        text: node.value,
        start: localStart + expressionStart,
        end: localEnd + expressionStart,
      });
    },

    TemplateLiteral(path: NodePath<t.TemplateLiteral>) {
      const node = path.node;
      if (node.expressions.length > 0) return;

      const quasi = node.quasis[0];
      if (!quasi) return;

      const raw = quasi.value.raw;
      if (!containsChinese(raw)) return;

      const localStart = (node.start ?? -1) - WRAP_PREFIX.length;
      const localEnd = (node.end ?? -1) - WRAP_PREFIX.length;

      result.push({
        source: "template",
        case: "script-literal",
        kind: "template",
        text: raw,
        start: localStart + expressionStart,
        end: localEnd + expressionStart,
      });
    },
  });

  return result;
}
