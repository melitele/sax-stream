[![Build Status](https://img.shields.io/travis/code42day/sax-stream.svg)](http://travis-ci.org/code42day/sax-stream)
[![Dependency Status](https://img.shields.io/gemnasium/code42day/sax-stream.svg)](https://gemnasium.com/code42day/sax-stream)
[![NPM version](https://img.shields.io/npm/v/sax-stream.svg)](https://www.npmjs.org/package/sax-stream)

# sax-stream

[Transform stream][transform-stream] for parsing large XML files. It is using SAX module internally. Emits objects:
one object per each selected node.

## Installation

	  $ npm install sax-stream


## Usage

Use as any transform stream: pipe request or file stream to it, pipe it to downstream another
transform stream or writeable handle `data` event.

```javascript
var saxStream = require('sax-stream');


request('http://blog.npmjs.org/rss')
  .pipe(saxStream({
    tag: 'item'
  })
  .on('data', function(item) {
    console.log(item);
  });

```

## API

Create passing options object.

`tag` - name of the tag to select objects from XML file

## TODO

- pass more options to `Transform` stream and to `sax` parser (currently `highWaterMark` is hard
 coded at 350)

# License

MIT

[transform-stream]: http://nodejs.org/api/stream.html#stream_class_stream_transform
