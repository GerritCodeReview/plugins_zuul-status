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
    resources = glob(["src/main/**/*"]),
    resource_jars = [":zuul-status-static"],
)

genrule2(
    name = "gr-zuul-status-static",
    srcs = [":zuul-status"],
    outs = ["zuul-status-static.jar"],
    cmd = " && ".join([
        "mkdir $$TMP/static",
        "cp -r $(locations :zuul-status) $$TMP/static",
        "cd $$TMP",
        "zip -Drq $$ROOT/$@ -g .",
    ]),
)

polygerrit_plugin(
    name = "zuul-status",
    srcs = glob([
        "gr-zuul-status-view/*.html",
        "gr-zuul-status-view/*.js",
    ]),
    app = "plugin.html",
)
