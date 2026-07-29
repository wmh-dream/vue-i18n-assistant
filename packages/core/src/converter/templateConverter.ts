import { parseTemplate } from "../parser/templateParser.js";
import { collectChinese } from "../analyzer/collectChinese.js";
import { buildTemplateReplace } from "../generator/templateGenerator.js";
import { applyReplace } from "../transformer/wrapText.js";

export function convertTemplate(template: string) {
  const ast = parseTemplate(template);

  const chinese = collectChinese(ast);

  const replaceItems = buildTemplateReplace(chinese);

  return applyReplace(template, replaceItems);
}
