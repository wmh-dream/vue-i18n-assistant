import { parse, type ParserOptions } from "@babel/parser";

/**
 * Parser:将 <script> 块字符串解析为 Babel AST。
 *
 * 设计要点:
 * - 只负责解析,不做任何遍历/分析/输出(遵循「Parser 不负责业务」)。
 * - 同时兼容 TS / JSX:lang="ts" 在 Vue SFC 中常见,JSX 用于 TSX 场景,
 *   一次配置覆盖 Vue2/Vue3 + script setup + JSX。
 * - sourceType: 'module' 支持ESM(import/export)。
 * - tokens: false 不需要 token 流,只用 AST 节点的 loc 做定位。
 */
const BABEL_OPTIONS: ParserOptions = {
  sourceType: "module",
  plugins: ["typescript", "jsx"],
  tokens: false,
};

export function parseScript(code: string) {
  return parse(code, BABEL_OPTIONS);
}
