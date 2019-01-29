load("//tools/bzl:plugin.bzl", "gerrit_plugin")
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
    resources = glob(["src/main/**/*"]),
)

polygerrit_plugin(
    name = "zuul_status_ui",
    srcs = glob([
        "src/main/resources/static/*.html",
        "src/main/resources/static/*.js",
    ]),
    app = "src/main/resources/static/zuul-status.html",
)
