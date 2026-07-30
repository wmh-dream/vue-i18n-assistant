import * as esbuild from "esbuild";

/**
 * esbuild 插件:把 @vue/compiler-sfc 内嵌 consolidate 模板引擎的动态
 * require 标记为 external。
 *
 * 背景:@vue/compiler-sfc 把 consolidate 源码内联进 dist,consolidate 对
 * 每个支持的模板引擎(handlebars/pug/mustache/...)都有 try/catch 的
 * lazy require。bundle 时 esbuild 尝试解析这些 require,因项目未安装
 * 这些引擎而报错。标记 external 后,require 保留在 bundle 中,运行时
 * 因 try/catch 且只用 parse() 不渲染模板,不会触发。
 */
const consolidateEnginesPlugin = {
  name: "consolidate-engines-external",
  setup(build) {
    // consolidate 支持的全部模板引擎名(含历史遗留)
    const engines = [
      "atpl", "bracket-template", "dot", "dustjs-linkedin", "eco", "ect",
      "ejs", "haml-coffee", "hamlet", "hamljs", "handlebars", "hogan.js",
      "htmling", "jade", "jazz", "jqtpl", "just", "liquid", "liquor",
      "lodash", "marko", "mote", "mustache", "nunjucks", "plates", "pug",
      "qejs", "ractive", "react", "react-dom/server", "slm", "swig",
      "teacup/lib/express", "templayed", "toffee", "twig", "underscore",
      "vash", "velocityjs", "walrus", "whiskers", "babel-core",
      "coffee-script", "squirrelly", "twing",
    ];
    const engineSet = new Set(engines);
    build.onResolve({ filter: /.*/ }, (args) => {
      if (engineSet.has(args.path)) {
        return { path: args.path, external: true };
      }
    });
  },
};

/**
 * VSCode 扩展打包脚本。
 *
 * 设计要点:
 * - 用 esbuild 把 src/extension.ts + @assistant/core 源码 bundle 成
 *   单文件 out/extension.js,VSCode runtime 直接加载,无需 ts loader。
 * - platform: 'node'、format: 'cjs':VSCode 扩展传统运行时为 Node CJS。
 * - external: vscode 由 VSCode runtime 提供,必须 external。
 * - @vue/compiler-sfc 内嵌 consolidate(动态 require 大量模板引擎),
 *   用 consolidateEnginesPlugin 拦截这些引擎名标记 external,避免
 *   bundle 时解析失败;运行时因 try/catch 不触发。
 * - bundle + minify 减小体积,sourceMap 便于调试。
 */
const ctx = await esbuild.context({
  entryPoints: ["src/extension.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node18",
  outfile: "out/extension.js",
  external: ["vscode"],
  plugins: [consolidateEnginesPlugin],
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
