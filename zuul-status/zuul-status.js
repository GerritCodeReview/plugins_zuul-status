/**
 * @license
 * Copyright (C) 2021 The Android Open Source Project
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
import {htmlTemplate} from './zuul-status_html.js';

const DEFAULT_UPDATE_INTERVAL_MS = 1000 * 2;
const MAX_UPDATE_INTERVAL_MS = 1000 * 30 * 2;

class ZuulStatus extends Polymer.Element {
  static get is() {
    return 'zuul-status';
  }

  static get template() {
    return htmlTemplate;
  }

  static get properties() {
    return {
      zuulUrl: String,
      zuulTenant: {
        type: String,
        value: null,
      },
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
      _response: Object,
      _updateIntervalMs: {
        type: Number,
        value: DEFAULT_UPDATE_INTERVAL_MS,
      },
      // Start time is the time that this element was loaded,
      // used to determine how long we've been trying to update.
      _startTime: Date,
      _updateTimeoutID: Number,
      zuulDisable: {
        type: Boolean,
        value: false,
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener('visibilitychange', this._handleVisibilityChange);

    if (!this.change || !this.revision) {
      console.warn('element attached without change and revision set.');
      return;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._clearUpdateTimeout();
  }

  /**
   * Reset the state of the element, then fetch and display progress.
   */
  async reload() {
    this._response = null;
    this._startTime = new Date();

    if (window.localStorage.getItem('disable_zuul_status')) {
      this.set('zuulDisable', true);
    } else {
      this.set('zuulDisable', false);
    }

    const project = this.change.project;
    const plugin = this.plugin.getPluginName();
    const config = await this.getConfig(project, plugin);
    if (config && config.zuul_url) {
      this.zuulUrl = config.zuul_url;
      if (config.zuul_tenant) {
        this.zuulTenant = config.zuul_tenant;
        console.info(`zuul-status: Zuul v3 at ${this.zuulUrl}, tenant ${this.zuulTenant}`);
      } else {
        console.info(`zuul-status: Zuul v2 at ${this.zuulUrl}`);
      }
    } else {
      console.info("No config found for plugin zuul-status");
    }
    if (this.zuulUrl) {
      await this._update();
    }
  }

  /**
   * Fetch the config for this plugin
   *
   * @return {Promise} Resolves to the fetched config object,
   *     or rejects if the response is non-OK.
   */
  async getConfig(project, plugin) {
    return await this.plugin.restApi().get(
            `/projects/${encodeURIComponent(project)}` +
            `/${encodeURIComponent(plugin)}~config`);
  }

  /**
   * Fetch current progress state and update properties.
   *
   * @return {Promise} Resolves upon completion.
   */
  async _update() {
    try {
      let response = await this.getZuulStatus(this.change, this.revision);
      response = response.map((results, i) => {
        if (!results || typeof results.jobs[i] === 'undefined')
          return;

        return {
          name: results.jobs[i].pipeline,
          results,
        };
      });

      // We remove undefined keys from the object
      Object.keys(response).forEach(key => {
       if (response && typeof response[key] === 'undefined')
          delete response[key];
      });

      this._response = response;

      this._updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS;
    } catch (err) {
      this._updateIntervalMs = Math.min(
          MAX_UPDATE_INTERVAL_MS,
          (1 + Math.random()) * this._updateIntervalMs * 2);
      console.warn(err);
    }
    this._resetTimeout();
  }

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
  }

  /**
   * Makes a GET request to the zuul server.
   *
   * @param {ChangeInfo} change change The current CL.
   * @param {RevisionInfo} revision The current patchset.
   * @return {Promise} Resolves to a fetch Response object.
   */
  async _getReponse(change, revision) {
    if (!change || !revision) return false;

    const url = this.zuulTenant === null ?
      `${this.zuulUrl}${change._number},${revision._number}` :
      `${this.zuulUrl}/api/tenant/${this.zuulTenant}/status/change/${change._number},${revision._number}`;
    const options = {method: 'GET'};

    return await fetch(url, options);
  }

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
  }

  _clearUpdateTimeout() {
    if (this._updateTimeoutID) {
      window.clearTimeout(this._updateTimeoutID);
      this._updateTimeoutID = null;
    }
  }

  _handleVisibilityChange(e) {
    if (!document.hidden && this._needsUpdate) {
      this._update();
      this._needsUpdate = false;
    }
  }

  _updateTimeoutFired() {
    if (document.hidden) {
      this._needsUpdate = true;
      return;
    }

    this._update();
  }

  /**
   * Return a string to show as the bold title in the UI.
   */
  _computeTitle(response) {
    if (!response) {
      return 'No Zuul Status Results';
    }

    return 'Zuul Status';
  }

  /**
   * Check whether the response contains report_url.
   *
   * @return {String} True when we are done requesting results.
   */
  _computeReportURL(response) {
    if (!response) {
      return '';
    }

    if (this.zuulTenant) {
      // Zuul v3 live streaming URL has to be checked early
      // because `report_url` always contains at least a placeholder
      if (response.result == null &&
          response.url && response.url.startsWith('stream/')) {
        return `${this.zuulUrl}/t/${this.zuulTenant}/${response.url}`;
      }
    }

    if (response.report_url) {
      return response.report_url;
    }

    return '';
  }

  _progressPercent(jobs) {
    if (!jobs || !jobs.elapsed_time && !jobs.remaining_time) {
        return '';
    }

    let progressPercent = 100 * (jobs.elapsed_time / (jobs.elapsed_time +
        jobs.remaining_time));

    this.updateStyles({'--progress-bar-width': `${progressPercent}%`});

    return progressPercent;
  }

  _getResults(jobs, equals, name) {
    if (!jobs) return '';

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
  }

  _renderJobStatusLabel (jobs) {
    if (!jobs) return '';

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
  }

  _handleDisableZuulStatus(e) {
    window.localStorage.setItem('disable_zuul_status', 'yes');

    this.reload();
  }

  _handleEnableZuulStatus(e) {
    window.localStorage.removeItem('disable_zuul_status');

    this.reload();
  }

  _isFailing(results) {
    if (results && results.results &&
        results.results.failing_reasons.length !== 0) {
      return true;
    }

    return false;
  }

  _getTime(ms, words) {
    if (typeof (words) === 'undefined') {
      words = false;
    }
    let seconds = (+ms) / 1000;
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    seconds = Math.floor(seconds % 60);
    minutes = Math.floor(minutes % 60);
    let r = '';
    if (words) {
      if (hours) {
        r += hours + ' hr ';
      }
      r += minutes + ' min';
    } else {
      if (hours < 10) {
        r += '0';
      }
      r += hours + ':';
      if (minutes < 10) {
        r += '0';
      }
      r += minutes + ':';
      if (seconds < 10) {
        r += '0';
      }
      r += seconds;
    }

    return r;
  }

  _getRemainingTime(time) {
    return time === null ?
        'unknown' : this._getTime(time, true);
  }

  _getEnqueueTime(ms) {
    // Special format case for enqueue time to add style
    let now = Date.now();
    let delta = now - ms;

    return this._getTime(delta, true);
  }
}

customElements.define(ZuulStatus.is, ZuulStatus);
