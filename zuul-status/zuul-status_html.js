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

export const htmlTemplate = Polymer.html`
<style include="shared-styles">
  #view-container {
    display: block;
  }
  .container {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
  }
  .header {
    background-color: var(--table-header-background-color);
    justify-content: space-between;
    min-height: 3.2em;
    padding: .5em var(--default-horizontal-margin, 1rem);
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
  }
  .header .label {
    font: inherit;
    font-family: var(--font-family-bold);
    font-size: 1.17em;
    margin-right: 1em;
  }
  .progress {
    overflow: hidden;
    height: 20px;
    margin-bottom: 20px;
    background-color: #ededed;
    border-radius: 1px;
    -webkit-box-shadow: inset 0 1px 2px rgba(0,0,0,.1);
    box-shadow: inset 0 1px 2px rgba(0,0,0,.1);
  }
  .progress-bar {
    float: left;
    width: 0;
    height: 100%;
    font-size: 11px;
    line-height: 20px;
    color: #fff;
    text-align: center;
    background-color: #39a5dc;
    -webkit-box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);
    box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);
    -webkit-transition: width .6s ease;
    -o-transition: width .6s ease;
    transition: width .6s ease;
  }
  #progressBar {
    width: var(--progress-bar-width, 0%);
  }
  #list {
    padding-bottom: 1em;
  }
  .labels {
    display: inline;
    padding: .2em .6em .3em;
    font-size: 100%;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0;
  }
  .label-danger {
    background-color: #c00;
  }
  .label-default {
    background-color: #9c9c9c;
  }
  .label-info {
    background-color: #00659c;
  }
  .label-success {
    background-color: #3f9c35;
  }
  .label-warning {
    background-color: #ec7a08;
  }
  .zuul-job-result {
    float: right;
    width: 90px;
    height: 20px;
    margin: 2px 5px 0;
    padding: 4px;
  }
  a {
    color: var(--primary-text-color);
    cursor: pointer;
    display: inline-block;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  .time, {
    align-items: center;
    color: #757575;
    display: flex;
  }
  #icon {
    margin-right: 0.5em;
  }
</style>
<style include="gr-change-list-styles">
  :host {
    font-size: var(--font-size-normal);
  }
  .padding {
    width: var(--default-horizontal-margin);
    padding: 0.5em;
  }
  #changeList {
    border-collapse: collapse;
    width: 100%;
  }
</style>
<template is="dom-if" if="[[zuulUrl]]">
  <div id="view-container">
    <div class="header container">
      <div class="container">
        <h3 class="labelName">[[_computeTitle(_response)]]</h3>
      </div>
      <div class="container">
        <template is="dom-if" if="[[!zuulDisable]]" restamp="true">
          <gr-button link on-tap="_handleDisableZuulStatus">Disable Zuul Status</gr-button>
        </template>
        <template is="dom-if" if="[[zuulDisable]]" restamp="true">
          <gr-button link on-tap="_handleEnableZuulStatus">Enable Zuul Status</gr-button>
        </template>
      </div>
    </div>
    <template is="dom-if" if="[[!zuulDisable]]" restamp="true">
      <div class="bottom container">
        <table id="changeList">
          <template is="dom-repeat" items=[[_response]] as="response">
            <tbody>
              <tr class="groupHeader">
                <td class="padding">
                  <template is="dom-if" if="[[!_isFailing(response)]]" restamp="true">
                    <span class="fullStatus success">
                      <iron-icon id="icon" icon="gr-icons:check" style="color: #388E3C;"></iron-icon>
                    </span>
                  </template>
                  <template is="dom-if" if="[[_isFailing(response)]]" restamp="true">
                    <span class="fullStatus failed">
                      <iron-icon id="icon" icon="gr-icons:close" style="color: #D32F2F;"></iron-icon>
                    </span>
                  </template>
                </td>
                <td class="cell" colspan="15">[[response.name]]</td>
              </tr>
            </tbody>
            <template is="dom-repeat" items=[[response.results.jobs]] as="jobs">
              <tbody class="groupContent">
                <tr class="groupTitle">
                  <td class="padding"></td>
                  <td class="cell jobName">
                    <iron-icon id="icon" icon="zuul-icons:code"></iron-icon>
                    <a href="[[_computeReportURL(jobs)]]" target="_blank"
                       hidden$="[[!jobs.name]]">
                      [[jobs.name]]
                    </a>
                  </td>
                  <td class="cell">
                    <div class="time">
                      <iron-icon id="icon" icon="zuul-icons:query-builder"></iron-icon>
                      <div class="remainingTime">
                        [[_getRemainingTime(response.results.remaining_time)]]
                      </div>
                    </div>
                  </td>
                  <td class="cell">
                    <div class="time">
                      <iron-icon id="icon" icon="zuul-icons:today"></iron-icon>
                      <div class="enqueueTime">
                        [[_getEnqueueTime(response.results.enqueue_time)]]
                      </div>
                    </div>
                  </td>
                  <td class="cell progressName">
                    <template is="dom-if" if="[[_getResults(jobs, 'true', 'in progress')]]" restamp="true">
                      <div class="progress zuul-job-result">
                        <div class="progress-bar"
                          id="progressBar"
                          role="progressbar"
                          aria-valuenow$="[[_progressPercent(jobs)]]"
                          aria-valuemin="0"
                          aria-valuemax="100"></div>
                      </div>
                    </template>
                    <template is="dom-if" if="[[!_getResults(jobs, 'true', 'in progress')]]" restamp="true">
                      <span class$="zuul-job-result labels [[_renderJobStatusLabel(jobs)]]">
                        [[_getResults(jobs)]]
                      </span>
                    </template>
                  </td>
                </tr>
              </tbody>
            </template>
          </template>
        </table>
      </div>
    </template>
  </div>
</template>
<iron-iconset-svg name="zuul-icons" size="24">
  <svg>
    <defs>
      <!-- This SVG is a copy from iron-icons https://github.com/PolymerElements/iron-icons/blob/master/iron-icons.js -->
      <g id="code"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path></g>
      <!-- This SVG is a copy from iron-icons https://github.com/PolymerElements/iron-icons/blob/master/iron-icons.js -->
      <g id="query-builder"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></g>
      <!-- This SVG is a copy from iron-icons https://github.com/PolymerElements/iron-icons/blob/master/iron-icons.js -->
      <g id="today"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"></path></g>
    </defs>
  </svg>
</iron-iconset-svg>`;
