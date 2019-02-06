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

import com.google.gerrit.extensions.annotations.PluginName;
import com.google.gerrit.extensions.restapi.RestReadView;
import com.google.gerrit.server.config.PluginConfig;
import com.google.gerrit.server.config.PluginConfigFactory;
import com.google.gerrit.server.project.NoSuchProjectException;
import com.google.gerrit.server.project.ProjectResource;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class GetConfig implements RestReadView<ProjectResource> {

  private final PluginConfigFactory config;
  private final String pluginName;

  @Inject
  public GetConfig(PluginConfigFactory cfgFactory, @PluginName String pluginName) {
    this.config = cfgFactory;
    this.pluginName = pluginName;
  }

  @Override
  public ConfigInfo apply(ProjectResource project) throws NoSuchProjectException {
    PluginConfig cfg = config.getFromProjectConfigWithInheritance(
        project.getNameKey(), pluginName);

    ConfigInfo info = new ConfigInfo();
    info.zuulUrl = cfg.getString("url", null);
    info.zuulTenant = cfg.getString("tenant", null);
    return info;
  }

  public static class ConfigInfo {
    String zuulUrl;
    String zuulTenant;
  }
}
