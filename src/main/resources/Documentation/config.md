Configuration
=============

The configuration of the @PLUGIN@ plugin is done via the `project.config`
stored in each project's `refs/meta/config` branch. Configuration is subject to
inheritance from parent projects as per usual rules.

Zuul v2:
--------

Specify path including the API subdirectory:

```
[plugin "@PLUGIN@"]
url = https://example.org/zuul-v2/status/change/
```

Zuul v3:
--------

Zuul v3 added support for multi-tenancy. The `url` contains just the root path
of the Zuul web application. Use the `tenant` to set the tenant name:

```
[plugin "@PLUGIN@"]
url = https://zuul.example.org/
tenant = public
```

<a id="show-zuul-url">
`plugin.@PLUGIN@.url`
:    URL to Zuul's root (for Zuul v3), or an URL to Zuul v2's API.
By default not set.

<a id="show-zuul-tenant">
`plugin.@PLUGIN@.tenant`
:    Tenant name to be used within Zuul.
Leave this unset on Zuul v2. Set this to a valid tenant name if using Zuul v3.
By default not set.
