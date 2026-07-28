import { parse } from "@vue/compiler-sfc";

export interface VueSFCResult {
  template: string | null;
  script: string | null;
  scriptSetup: string | null;
  styles: string[];
}

export function parseVue(code: string): VueSFCResult {
  const { descriptor } = parse(code);

  return {
    template: descriptor.template?.content ?? null,
    script: descriptor.script?.content ?? null,
    scriptSetup: descriptor.scriptSetup?.content ?? null,
    styles: descriptor.styles.map((style) => style.content),
  };
}
