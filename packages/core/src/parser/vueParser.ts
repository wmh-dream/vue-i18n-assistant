import { parse, type SFCBlock, type SFCDescriptor } from "@vue/compiler-sfc";

export interface VueSFCResult {
  template: string | null;
  script: string | null;
  scriptSetup: string | null;
  styles: string[];
}

/**
 * 保留原有 parseVue API,不破坏现有调用方。
 * 仅返回各块 content,不含位置信息。
 */
export function parseVue(code: string): VueSFCResult {
  const { descriptor } = parse(code);

  return {
    template: descriptor.template?.content ?? null,
    script: descriptor.script?.content ?? null,
    scriptSetup: descriptor.scriptSetup?.content ?? null,
    styles: descriptor.styles.map((style) => style.content),
  };
}

/**
 * 带位置信息的 SFC 块描述。
 * - content: 块内源码(不含块标签 <template>...</template>)
 * - contentStart: content 首字符在 SFC 全局源码中的偏移
 *
 * contentStart 计算:@vue/compiler-sfc 的 SFCBlock.loc 指向 content 区域
 * (开始标签 '>' 之后到结束标签 '<' 之前),loc.start.offset 即 content 首字符偏移,
 * 无需再查 '>'。注意:不同版本语义可能不同,此处基于 3.5.x 验证。
 */
export interface SFCBlockWithOffset {
  type: SFCBlock["type"];
  content: string;
  contentStart: number;
}

function resolveBlockWithOffset(
  source: string,
  block: SFCBlock | null
): SFCBlockWithOffset | null {
  if (!block) return null;

  return {
    type: block.type,
    content: block.content,
    contentStart: block.loc.start.offset,
  };
}

export interface VueSFCDescriptorResult {
  descriptor: SFCDescriptor;
  template: SFCBlockWithOffset | null;
  script: SFCBlockWithOffset | null;
  scriptSetup: SFCBlockWithOffset | null;
  styles: SFCBlockWithOffset[];
  customBlocks: SFCBlockWithOffset[];
}

/**
 * 解析 SFC,返回 descriptor + 各块的位置信息。
 *
 * 设计要点:
 * - 同时返回 descriptor 与带 contentStart 的块描述,
 *   供 converter 做局部偏移 → 全局偏移换算。
 * - 保留全部块类型(template/script/scriptSetup/styles/customBlocks),
 *   未做 i18n 的块由 transformer(MagicString)自动原样保留。
 * - 不在此做任何分析/生成,纯解析职责。
 */
export function parseVueDescriptor(code: string): VueSFCDescriptorResult {
  const { descriptor } = parse(code);

  return {
    descriptor,
    template: resolveBlockWithOffset(code, descriptor.template),
    script: resolveBlockWithOffset(code, descriptor.script),
    scriptSetup: resolveBlockWithOffset(code, descriptor.scriptSetup),
    styles: descriptor.styles.map((s) => resolveBlockWithOffset(code, s)!),
    customBlocks: descriptor.customBlocks.map((b) =>
      resolveBlockWithOffset(code, b)!
    ),
  };
}
