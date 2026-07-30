import { parse } from "@babel/parser";
import _traverse, { type NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import {
  NodeTypes,
  type DirectiveNode,
  type ElementNode,
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
 * Analyzer:分析 ElementNode 的 v-bind 指令(:attr="expr")内部
 * JS 表达式中的中文字面量。
 *
 * 设计要点:
 * - 只处理 v-bind 指令(name === 'bind'):如 :data="{ status: '进行中' }"、
 *   :descriptions="{ key: '中文' }"、:title="msg + '提示'" 等。
 *   v-on/v-model/v-if 等指令的值不含 UI 文案,不处理。
 * - 指令值是 JS 表达式,用 Babel parse + traverse 解析,复用与
 *   interpolationAnalyzer 相同的字面量识别逻辑(跳过对象 key/i18n 调用)。
 * - 用 (expr) 包装绕过 Babel directive 机制(与 interpolationAnalyzer 一致)。
 * - 坐标换算:traverse 产出的 node.start/end 是相对于包装字符串的局部偏移,
 *   减去包装前缀长度(1 个 '(')得原表达式偏移,再叠加
 *   SimpleExpressionNode.loc.start.offset 得 SFC 绝对偏移。
 * - source 固定为 'template':case 复用 'script-literal',generator
 *   直接委托 buildScriptReplace,与 interpolation 场景替换形态一致。
 *
 * 不使用正则:全程基于 Babel AST。
 *
 * @param element Vue Template ElementNode
 * @returns ChineseSnippet 列表(source 为 'template')
 */
export function analyzeDirectives(
  element: ElementNode
): ChineseSnippet[] {
  const result: ChineseScriptLiteralSnippet[] = [];

  for (const prop of element.props) {
    // 只处理指令节点
    if (prop.type !== NodeTypes.DIRECTIVE) continue;

    const directive = prop as DirectiveNode;
    // 只处理 v-bind(含缩写 :attr),其他指令(v-on/v-model/v-if/...)跳过
    if (directive.name !== "bind") continue;

    // v-bind 的值是 SimpleExpressionNode(JS 表达式)
    const exp = directive.exp;
    if (!exp || exp.type !== NodeTypes.SIMPLE_EXPRESSION) continue;

    const exprNode = exp as SimpleExpressionNode;
    const expressionCode = exprNode.content;
    if (!containsChinese(expressionCode)) continue;

    const expressionStart = exprNode.loc.start.offset;

    // 包成 (expr) 避免 Babel 把孤立字符串当 directive
    const WRAP_PREFIX = "(";
    const wrapped = `${WRAP_PREFIX}${expressionCode})`;

    const ast = parse(wrapped, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
      tokens: false,
    });

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
  }

  return result;
}
