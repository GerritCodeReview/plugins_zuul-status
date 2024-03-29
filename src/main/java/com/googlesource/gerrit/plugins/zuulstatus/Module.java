// Copyright (C) 2019 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.googlesource.gerrit.plugins.zuulstatus;

import static com.google.gerrit.server.project.ProjectResource.PROJECT_KIND;

import com.google.gerrit.extensions.annotations.Exports;
import com.google.gerrit.extensions.registration.DynamicSet;
import com.google.gerrit.extensions.restapi.RestApiModule;
import com.google.gerrit.extensions.webui.JavaScriptPlugin;
import com.google.gerrit.extensions.webui.WebUiPlugin;
import com.google.gerrit.server.config.ProjectConfigEntry;

public class Module extends RestApiModule {
  @Override
  protected void configure() {
    DynamicSet.bind(binder(), WebUiPlugin.class)
        .toInstance(new JavaScriptPlugin("zuul-status.js"));

    get(PROJECT_KIND, "config").to(GetConfig.class);

    // TODO: these annotations only apply to GWT UIs...
    bind(ProjectConfigEntry.class)
	.annotatedWith(Exports.named("url"))
	.toInstance(new ProjectConfigEntry("Top-level Zuul URL", null));

    bind(ProjectConfigEntry.class)
	.annotatedWith(Exports.named("tenant"))
	.toInstance(new ProjectConfigEntry("Zuul v3 tenant name -- leave empty on Zuul v2", null));
  }
}
