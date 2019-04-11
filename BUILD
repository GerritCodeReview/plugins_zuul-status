load("//tools/bzl:plugin.bzl", "gerrit_plugin")
load("//tools/bzl:genrule2.bzl", "genrule2")
load("//tools/bzl:js.bzl", "polygerrit_plugin")

gerrit_plugin(
    name = "zuul-status",
    srcs = glob(["src/main/java/**/*.java"]),
    manifest_entries = [
        "Gerrit-PluginName: zuul-status",
        "Gerrit-Module: com.googlesource.gerrit.plugins.zuulstatus.Module",
        "Gerrit-HttpModule: com.googlesource.gerrit.plugins.zuulstatus.HttpModule",
        "Implementation-Title: Zuul status plugin",
        "Implementation-Vendor: Wikimedia Foundation",
    ],
    resources = glob(["src/main/**/*"]),
    resource_jars = [":gr-zuul-status-static"],
)

genrule2(
    name = "gr-zuul-status-static",
    srcs = [":gr-zuul-status"],
    outs = ["gr-zuul-status-static.jar"],
    cmd = " && ".join([
        "mkdir $$TMP/static",
        "cp -r $(locations :gr-zuul-status) $$TMP/static",
        "cd $$TMP",
        "zip -Drq $$ROOT/$@ -g .",
    ]),
)

polygerrit_plugin(
    name = "gr-zuul-status",
    srcs = glob([
        "gr-zuul-status-view/*.html",
        "gr-zuul-status-view/*.js",
    ]),
    app = "plugin.html",
)
