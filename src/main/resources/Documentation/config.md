Configuration
=============

The configuration of the @PLUGIN@ plugin is done in the `gerrit.config`
file.

```
[plugin "@PLUGIN@"]
zuulUrl = https://example.org/zuul/status/change/
```

<a id="show-zuul-url">
`plugin.@PLUGIN@.zuulUrl`
:    Url to zuul api.
By default not set.
