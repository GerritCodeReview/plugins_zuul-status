@PLUGIN@ Build
==============

This plugin can be built with Bazel.

Bazel
----

This plugin is built with Bazel. Only the Gerrit in-tree build is
supported.

Clone or link this plugin to the plugins directory of Gerrit's source
tree, and issue the command:

```
  bazel build plugins/@PLUGIN@
```

The output is created in

```
  bazel-genfiles/plugins/@PLUGIN@/@PLUGIN@.jar
```
