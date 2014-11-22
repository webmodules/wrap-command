/// <reference path='types.d.ts' />

/**
 * TypeScript dependencies.
 */

import AbstractCommand = require('abstract-command');
import closest = require('component-closest');
import contains = require('node-contains');
import DomIterator = require('dom-iterator');
import wrapRange = require('wrap-range');
import unwrapRange = require('unwrap-range');
import DEBUG = require('debug');

var debug = DEBUG('wrap-command');

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

class WrapCommand extends AbstractCommand {
  nodeName: string;

  constructor(nodeName: string, doc: Document = document) {
    super(doc);
    this.nodeName = nodeName;
    debug('created WrapCommand: nodeName %o', nodeName);
  }

  protected _execute(range: Range, value?: any): void {
    if (this.queryState(range)) {
      unwrapRange(range, this.nodeName, null, this.document);
    } else {
      wrapRange(range, this.nodeName, this.document);
    }
  }

  protected _queryState(range: Range): boolean {
    var next: Node = range.startContainer;
    var end: Node = range.endContainer;
    var iterator = new DomIterator(next).revisit(false);

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
