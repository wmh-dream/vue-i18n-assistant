import * as t from "@babel/types";

/**
 * i18n 调用识别工具。
 *
 * 设计要点:
 * - 纯 AST 判定工具,不依赖源码字符串,不修改节点。
 * - 识别 $t(...) / t(...) / i18n.t(...) 等常见 i18n 调用形态,
 *   用于 analyzer 跳过其字符串参数,避免对已翻译内容重复包裹(幂等性)。
 *
 * 判定规则:
 * - $t('xxx'):Identifier 名为 $t 或 t
 * - this.$t('xxx'):MemberExpression,object 为 this,property 为 $t 或 t
 * - i18n.t('xxx'):MemberExpression,object 为 Identifier,property 为 $t 或 t
 *
 * @param node Babel 节点
 * @returns 是否为 i18n 调用
 */
export function isI18nCall(node: t.Node | null | undefined): boolean {
  if (!node) return false;

  // $t('xxx') / t('xxx')
  if (t.isIdentifier(node)) {
    return node.name === "$t" || node.name === "t";
  }

  // this.$t('xxx') / i18n.t('xxx') / ctx.$t('xxx')
  if (t.isMemberExpression(node)) {
    const prop = node.property;
    if (!t.isIdentifier(prop)) return false;
    return prop.name === "$t" || prop.name === "t";
  }

  return false;
}
