/// <reference path='require.d.ts' />

/**
 * TypeScript dependencies.
 */

import Command = require('command');

/**
 * JavaScript dependencies.
 */

var wrapRange = require('wrap-range');
var unwrapRange = require('unwrap-range');
var closest = require('component-closest');
var currentRange = require('current-range');
var currentSelection = require('current-selection');
var debug = require('debug')('wrap-command');

/**
 *
 * ``` js
 * var bold = new WrapCommand('strong');
 * if (bold.queryEnabled()) {
 *   bold.execute();
 * }
 * ```
 *
 * @public
 */

class WrapCommand implements Command {
  public nodeName: string;
  public document: Document;

  constructor(nodeName: string, doc: Document = document) {
    this.document = doc;
    this.nodeName = nodeName;
    debug('created WrapCommand: document %o', this.document);
  }

  execute(range?: Range, value?: any): void {
    var hasRange: boolean = !!(range && range instanceof Range);
    var selection: Selection;

    if (!hasRange) {
      selection = currentSelection(this.document);
      range = currentRange(selection);
    }

    if (this.queryState(range)) {
      unwrapRange(range, this.nodeName);
    } else {
      wrapRange(range, this.nodeName);
    }

    if (!hasRange) {
      // when no Range was passed in then we must reset the document's Selection
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  queryEnabled(range?: Range): boolean {
    if (!range) range = currentRange(this.document);
    return !! range;
  }

  queryState(range?: Range): boolean {
    if (!range) range = currentRange(this.document);
    if (!range) return false;
    var node: HTMLElement = closest(range.commonAncestorContainer, this.nodeName, true);
    return !! node;
  }
}

export = WrapCommand;
