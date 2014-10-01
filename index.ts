/// <reference path='require.d.ts' />

/**
 * TypeScript dependencies.
 */

import Command = require('command');

/**
 * JavaScript dependencies.
 */

var setRange = require('selection-set-range');
var isBackward = require('selection-is-backward');
var domIterator = require('dom-iterator');
var contains = require('node-contains');
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
    var backward: boolean;
    var selection: Selection;

    if (!hasRange) {
      selection = currentSelection(this.document);
      backward = isBackward(selection);
      range = currentRange(selection);
    }

    if (this.queryState(range)) {
      unwrapRange(range, this.nodeName, this.document);
    } else {
      wrapRange(range, this.nodeName, this.document);
    }

    if (!hasRange) {
      // when no Range was passed in then we must reset the document's Selection
      setRange(selection, range, backward);
    }
  }

  queryEnabled(range?: Range): boolean {
    if (!range) range = currentRange(this.document);
    return !! range;
  }

  queryState(range?: Range): boolean {
    if (!range) range = currentRange(this.document);
    if (!range) return false;

    var next: Node = range.startContainer;
    var end: Node = range.endContainer;

    var iterator = domIterator(next).revisit(false);

    while (next) {
      var node: Node = closest(next, this.nodeName, true);
      if (!node) return false;
      if (contains(end, next)) break;
      next = iterator.next(3 /* Node.TEXT_NODE */);
    }

    return true;
  }
}

export = WrapCommand;
