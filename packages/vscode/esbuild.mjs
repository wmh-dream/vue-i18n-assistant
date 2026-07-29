import * as esbuild from "esbuild";

/**
 * VSCode 扩展打包脚本。
 *
 * 设计要点:
 * - 用 esbuild 把 src/extension.ts + @assistant/core 源码 bundle 成
 *   单文件 out/extension.js,VSCode runtime 直接加载,无需 ts loader。
 * - platform: 'node'、format: 'cjs':VSCode 扩展传统运行时为 Node CJS。
 * - external:
 *   - vscode:由 VSCode runtime 提供
 *   - @vue/compiler-sfc:内嵌 consolidate 模板引擎,含大量动态 require
 *     的可选依赖(handlebars/pug/mustache/...),bundle 时无法解析且
 *     运行时不会实际加载,整体 external 让 Node runtime 处理。
 *     要求 @vue/compiler-sfc 在 vscode 包的运行时依赖树中可见
 *     (通过 @assistant/core 间接依赖,workspace hoist)。
 * - bundle + minify 减小体积,sourceMap 便于调试。
 */
const ctx = await esbuild.context({
  entryPoints: ["src/extension.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node18",
  outfile: "out/extension.js",
  external: ["vscode", "@vue/compiler-sfc"],
  sourcemap: true,
  minify: true,
});

const watch = process.argv.includes("--watch");

if (watch) {
  await ctx.watch();
  console.log("[esbuild] watching...");
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log("[esbuild] build done");
}


