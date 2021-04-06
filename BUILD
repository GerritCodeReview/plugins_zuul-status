load("@npm//@bazel/rollup:index.bzl", "rollup_bundle")
load("//tools/bzl:plugin.bzl", "gerrit_plugin")
load("//tools/bzl:genrule2.bzl", "genrule2")
load("//tools/bzl:js.bzl", "polygerrit_plugin")

gerrit_plugin(
    name = "zuul-status",
    srcs = glob(["src/main/java/**/*.java"]),
    manifest_entries = [
        "Gerrit-PluginName: zuul-status",
        "Gerrit-Module: com.googlesource.gerrit.plugins.zuulstatus.Module",
        "Implementation-Title: Zuul status plugin",
        "Implementation-Vendor: Wikimedia Foundation",
    ],
    resource_jars = [":zuul-status-static"],
    resources = glob(["src/main/**/*"]),
)

genrule2(
    name = "zuul-status-static",
    srcs = [":zuul_status"],
    outs = ["zuul-status-static.jar"],
    cmd = " && ".join([
        "mkdir $$TMP/static",
        "cp -r $(locations :zuul_status) $$TMP/static",
        "cd $$TMP",
        "zip -Drq $$ROOT/$@ -g .",
    ]),
)

polygerrit_plugin(
    name = "zuul_status",
    app = "zuul-status-bundle.js",
    plugin_name = "zuul-status",
)

rollup_bundle(
    name = "zuul-status-bundle",
    srcs = glob(["zuul-status/*.js"]),
    entry_point = "zuul-status/plugin.js",
    format = "iife",
    rollup_bin = "//tools/node_tools:rollup-bin",
    sourcemap = "hidden",
    deps = [
        "@tools_npm//rollup-plugin-node-resolve",
    ],
)
