/// <reference path='types.d.ts' />

/**
 * TypeScript dependencies.
 */

import AbstractCommand = require('abstract-command');
import closest = require('component-closest');
import RangeIterator = require('range-iterator');
import wrapRange = require('wrap-range');
import unwrapRange = require('unwrap-range');
import DEBUG = require('debug');

var debug = DEBUG('wrap-command');

/**
 * Command implementation based on `wrap-range` and `unwrap-range`.
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
    var next: Node;
    var count: number = 0;
    var iterator = new RangeIterator(range)
      .select(function (node) {
        // void elements, elements with no children, text nodes
        return node.childNodes.length === 0;
      })
      .revisit(false);

    while (next = iterator.next()) {
      count++;
      if (!closest(next, this.nodeName, true)) return false;
    }

    return count > 0;
  }
}

export = WrapCommand;
