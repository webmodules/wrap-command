
var assert = require('assert');
var WrapCommand = require('../');

describe('WrapCommand', function () {
  var div;

  afterEach(function () {
    if (div) {
      // clean up...
      document.body.removeChild(div);
      div = null;
    }
  });

  describe('new WrapCommand("strong")', function () {

    it('should create a `WrapCommand` instance', function () {
      var strong = new WrapCommand('strong');

      assert(strong instanceof WrapCommand);
      assert.equal('strong', strong.nodeName);
      assert(strong.document === document);
    });

    describe('execute()', function () {

      it('should insert a STRONG element around document Selection', function () {
        div = document.createElement('div');
        div.innerHTML = '<p>hello</p><p>world!</p>';
        div.setAttribute('contenteditable', 'true');
        document.body.appendChild(div);

        // set current selection
        var range = document.createRange();
        range.setStart(div.firstChild.firstChild, 1);
        range.setEnd(div.firstChild.firstChild, 4);
        assert.equal('ell', range.toString());

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        var strong = new WrapCommand('strong');

        strong.execute();

        // test that we have the expected HTML at this point
        assert.equal('<p>h<strong>ell</strong>o</p><p>world!</p>', div.innerHTML);

        // test that the Selection remains intact
        sel = window.getSelection();
        range = sel.getRangeAt(0);

        assert.equal('ell', range.toString());
        assert(range.startContainer === div.firstChild.childNodes[1].firstChild);
        assert(range.startOffset === 0);
        assert(range.endContainer === div.firstChild.childNodes[1].firstChild);
        assert(range.endOffset === 3);
      });

      it('should remove STRONG elements within document Selection', function () {
        div = document.createElement('div');
        div.innerHTML = '<p>h<strong>ell</strong>o</p><p>world!</p>';
        div.setAttribute('contenteditable', 'true');
        document.body.appendChild(div);

        // set current selection
        var range = document.createRange();
        range.setStart(div.firstChild.childNodes[1].firstChild, 0);
        range.setEnd(div.firstChild.childNodes[1].firstChild, 3);

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        var strong = new WrapCommand('strong');

        strong.execute();

        // test that we have the expected HTML at this point
        assert.equal('<p>hello</p><p>world!</p>', div.innerHTML);

        // test that the Selection remains intact
        sel = window.getSelection();
        range = sel.getRangeAt(0);

        assert.equal('ell', range.toString());
        assert(range.startContainer === div.firstChild.childNodes[1]);
        assert(range.startOffset === 0);
        assert(range.endContainer === div.firstChild.childNodes[1]);
        assert(range.endOffset === 3);
      });

      it('should insert bold text after execute() call', function () {
        div = document.createElement('div');
        div.innerHTML = '<p>hello world!</p>';
        div.setAttribute('contenteditable', 'true');
        document.body.appendChild(div);

        // set current selection
        var range = document.createRange();
        range.setStart(div.firstChild.firstChild, 3);
        range.setEnd(div.firstChild.firstChild, 3);
        assert(range.collapsed);

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        var strong = new WrapCommand('strong');
        strong.execute();

        assert.equal('<p>hel<strong>\u200B</strong>lo world!</p>', div.innerHTML);

        // using "delete" here since it's the most cross-browser compat
        // command that operates on where the current Range selection is
        document.execCommand('delete', false);
        assert.equal('<p>hello world!</p>', div.innerHTML);
      });

    });

    describe('queryState()', function () {

      it('should return `false` when Selection has no content', function () {
        div = document.createElement('div');
        div.innerHTML = '<p><br></p>';
        div.setAttribute('contenteditable', 'true');
        document.body.appendChild(div);

        // set current selection
        var range = document.createRange();
        range.setStart(div.firstChild, 0);
        range.setEnd(div.firstChild, 0);
        assert(range.collapsed);

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        var strong = new WrapCommand('strong');

        assert.equal(false, strong.queryState());
      });

      it('should return `false` when Selection has no STRONG elements', function () {
        div = document.createElement('div');
        div.innerHTML = '<p>hello world</p>';
        div.setAttribute('contenteditable', 'true');
        document.body.appendChild(div);

        // set current selection
        var range = document.createRange();
        range.setStart(div.firstChild.firstChild, 0);
        range.setEnd(div.firstChild.firstChild, div.firstChild.firstChild.nodeValue.length);
        assert(!range.collapsed);
        assert.equal('hello world', range.toString());

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        var strong = new WrapCommand('strong');

        assert.equal(false, strong.queryState());
      });

      it('should return `true` when all TextNodes in Selection contain STRONG elements', function () {
        div = document.createElement('div');
        div.innerHTML = '<p><strong>hello</strong><strong> world</strong></p>';
        div.setAttribute('contenteditable', 'true');
        document.body.appendChild(div);

        // set current selection
        var range = document.createRange();
        range.setStart(div.firstChild.firstChild.firstChild, 0);
        range.setEnd(div.lastChild.lastChild.lastChild, div.lastChild.lastChild.lastChild.nodeValue.length);
        assert(!range.collapsed);
        assert.equal('hello world', range.toString());

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        var strong = new WrapCommand('strong');

        assert.equal(true, strong.queryState());
      });

    });

  });

});
