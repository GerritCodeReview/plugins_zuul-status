/**
 * @license
 * Copyright (C) 2019 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 (function() {
  'use strict';

  /**
   * Wrapper around localStorage to prevent using it if you have it disabled.
   *
   * Temporary until https://gerrit-review.googlesource.com/c/gerrit/+/211472 is merged.
   *
   */
  class ZuulSiteBasedStorage {
    // Returns the local storage.
    _storage() {
      try {
        return window.localStorage;
      } catch (err) {
        console.error('localStorage is disabled with this error ' + err);
        return null;
      }
    }

    getItem(key) {
      if (this._storage() === null) { return null; }
      return this._storage().getItem(key);
    }

    setItem(key, value) {
      if (this._storage() === null) { return null; }
      return this._storage().setItem(key, value);
    }

    removeItem(key) {
      if (this._storage() === null) { return null; }
      return this._storage().removeItem(key);
    }

    clear() {
      if (this._storage() === null) { return null; }
      return this._storage().clear();
    }
  }

  const DEFAULT_UPDATE_INTERVAL_MS = 1000 * 2;
  const MAX_UPDATE_INTERVAL_MS = 1000 * 30 * 2;

  Polymer({
    is: 'zuul-status-view',
    properties: {
      zuulUrl: String,
      plugin: Object,
      change: Object,
      revision: {
        type: Object,
        observer: 'reload',
      },
      _needsUpdate: {
        type: Boolean,
        value: false,
      },
      _response: Array,
      _updateIntervalMs: {
        type: Number,
        value: DEFAULT_UPDATE_INTERVAL_MS,
      },
      // Start time is the time that this element was loaded,
      // used to determine how long we've been trying to update.
      _startTime: Date,
      _updateTimeoutID: Number,
      _storage: {
        type: Object,
        value: new ZuulSiteBasedStorage(),
      },
      zuulDisable: {
        type: Boolean,
        value: false,
      }
    },

    attached() {
      this.listen(document, 'visibilitychange', '_handleVisibilityChange');
      if (!this.change || !this.revision) {
        console.warn('element attached without change and revision set.');
        return;
      }
    },

    detached() {
      this._clearUpdateTimeout();
    },

    /**
     * Reset the state of the element, then fetch and display progress.
     *
     * @return {Promise} Resolves upon completion.
     */
    async reload() {
      this._response = null;
      this._startTime = new Date();

      if (this._storage.getItem('disable_zuul_status')) {
        this.set('zuulDisable', true);
      } else {
        this.set('zuulDisable', false);
      }

      const config = await this.getConfig();
      if (config && config.zuul_url) {
        this.zuulUrl = config.zuul_url;
      } else {
        console.info("No config found for plugin zuul-status at endpoint " +
            "/config/server/info");
      }
      if (this.zuulUrl) {
        await this._update();
      }
    },

    /**
     * Fetch the config for this plugin
     *
     * @return {Promise} Resolves to the fetched config object,
     *     or rejects if the response is non-OK.
     */
    async getConfig() {
      return await this.plugin.restApi().get('/config/server/config');
    },

    /**
     * Fetch current progress state and update properties.
     *
     * If not all Tricium analyzers are finished yet, this will
     * set a timeout to update again later.
     *
     * It is assumed that this will only be called if the Tricium
     * host is configured.
     *
     * @return {Promise} Resolves upon completion.
     */
    async _update() {
      try {
        const response = await this.getZuulStatus(this.change, this.revision);
        this._response = response;
        this._updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS;
      } catch (err) {
        this._updateIntervalMs = Math.min(
            MAX_UPDATE_INTERVAL_MS,
            (1 + Math.random()) * this._updateIntervalMs * 2);
        console.warn(err);
      }
      this._resetTimeout();
    },

    /**
     * Makes a request to the zuul server to get the status on the change.
     *
     * @param {ChangeInfo} change The current CL.
     * @param {RevisionInfo} revision The current patchset.
     * @return {Promise} Resolves to a fetch Response object.
     */
    async getZuulStatus(change, revision) {
      const response = await this._getReponse(change, revision);

      if (response && response.status && response.status === 200) {
        const text = await response.text();
        return await JSON.parse(text);
      }

      return [];
    },

    /**
     * Makes a GET request to the zuul server.
     *
     * @param {ChangeInfo} change change The current CL.
     * @param {RevisionInfo} revision The current patchset.
     * @return {Promise} Resolves to a fetch Response object.
     */
    async _getReponse(change, revision) {
      const url = `${this.zuulUrl}${change._number},${revision._number}`
      const options = {method: 'GET'};
      options.headers = new Headers();
      options.headers.set('Content-Type', 'application/json');

      return await fetch(url, options);
    },

    /**
     * Set a timeout to update again if applicable.
     */
    _resetTimeout() {
      this._clearUpdateTimeout();

      if (this._response === []) {
        return;
      }

      this._updateTimeoutID = window.setTimeout(
          this._updateTimeoutFired.bind(this),
          this._updateIntervalMs);
    },

    _clearUpdateTimeout() {
      if (this._updateTimeoutID) {
        window.clearTimeout(this._updateTimeoutID);
        this._updateTimeoutID = null;
      }
    },

    _handleVisibilityChange(e) {
      if (!document.hidden && this._needsUpdate) {
        this._update();
        this._needsUpdate = false;
      }
    },

    _updateTimeoutFired() {
      if (document.hidden) {
        this._needsUpdate = true;
        return;
      }

      this._update();
    },

    /**
     * Return a string to show as the bold title in the UI.
     */
    _computeTitle(response) {
      if (!response) {
        return 'No Zuul Status Results';
      }

      return 'Zuul Status';
    },

    /**
     * Check whether the response contains report_url.
     *
     * @return {String} True when we are done requesting results.
     */
    _computeReportURL(response) {
      if (!response || !response.report_url) { return ''; }

      return response.report_url;
    },

    _progressPercent(jobs) {
      if (!jobs || !jobs.elapsed_time && !jobs.remaining_time) {
          return '';
      }

      let progressPercent = 100 * (jobs.elapsed_time / (jobs.elapsed_time +
          jobs.remaining_time));

      this.customStyle['--progress-bar-width'] = `${progressPercent}%;`;
      this.updateStyles();

      return progressPercent;
    },

    _getResults(jobs, equals, name) {
      let result = jobs.result ? jobs.result.toLowerCase() : null;
      if (result === null) {
        if (jobs.url === null) {
          result = 'queued'
        } else if (jobs.paused !== null && jobs.paused) {
          result = 'paused'
        } else {
          result = 'in progress'
        }
      }

      if (equals) {
        return result === name;
      } else {
        return result;
      }
    },

    _renderJobStatusLabel (jobs) {
      let result = jobs.result ? jobs.result.toLowerCase() : null;

      let className;

      switch (result) {
        case 'success':
          className = 'label-success'
          break;
        case 'failure':
          className = 'label-danger'
          break;
        case 'unstable':
          className = 'label-warning'
          break;
        case 'skipped':
          className = 'label-info'
          break;
        // 'in progress' 'queued' 'lost' 'aborted' ...
        default:
          className = 'label-default'
      }

      return className;
    },

    _handleDisableZuulStatus(e) {
      this._storage.setItem('disable_zuul_status', 'yes');

      this.reload();
    },

    _handleEnableZuulStatus(e) {
      this._storage.removeItem('disable_zuul_status');

      this.reload();
    },
  });
})();
