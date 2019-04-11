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
    resource_jars = [":zuul-status-ui-static"],
)

genrule2(
    name = "zuul-status-ui-static",
    srcs = [":zuul-status-ui"],
    outs = ["zuul-status-ui-static.jar"],
    cmd = " && ".join([
        "mkdir $$TMP/static",
        "cp -r $(locations :zuul-status-ui) $$TMP/static",
        "cd $$TMP",
        "zip -Drq $$ROOT/$@ -g .",
    ]),
)

polygerrit_plugin(
    name = "zuul-status-ui",
    srcs = glob([
        "src/main/resources/static/*.html",
        "src/main/resources/static/*.js",
    ]),
    app = "src/main/resources/static/zuul-status.html",
)
