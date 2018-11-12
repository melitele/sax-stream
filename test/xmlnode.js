var fs = require('fs');

var xmlnode = require('..');
var memory = require('./memory');

/*global describe, it */


describe('xmlnode', function(){
  it('should parse a single empty node', function(done){
    var result = [];

    fs.createReadStream(__dirname + '/one.xml')
      .pipe(xmlnode({
        tag: 'ITEM'
      }))
      .pipe(memory(result))
      .on('finish', function(err) {
        result.should.have.length(1);
        result[0].should.eql({record: {}, tag: 'ITEM'});
        done(err);
      });
  });

  it('should parse nodes with text', function(done){
    var result = [];

    fs.createReadStream(__dirname + '/two.xml')
      .pipe(xmlnode({
        tag: 'ITEM'
      }))
      .pipe(memory(result))
      .on('finish', function(err) {
        result.should.have.length(2);
        result[0].should.have.property('tag', 'ITEM');
        result[0].should.have.property('record');
        result[0].record.should.have.property('children');
        result[0].record.children.A.should.have.property('value', 'abc');
        result[0].record.children.B.should.have.property('value', '15');
        result[1].record.children.A.should.have.property('value', 'def');
        result[1].record.children.B.should.have.property('value', '16');
        done(err);
      });
  });

  it('should parse nodes with text in strict mode', function(done){
    var result = [];

    fs.createReadStream(__dirname + '/two.xml')
      .pipe(xmlnode({
        strict: true,
        tag: 'item'
      }))
      .pipe(memory(result))
      .on('finish', function(err) {
        result.should.have.length(2);
        result[0].should.have.property('tag', 'item');
        result[0].should.have.property('record');
        result[0].record.should.have.property('children');
        result[0].record.children.a.should.have.property('value', 'abc');
        result[0].record.children.b.should.have.property('value', '15');
        result[1].record.children.a.should.have.property('value', 'def');
        result[1].record.children.b.should.have.property('value', '16');
        done(err);
      });
  });

  it('should parse nodes and attributes in lowercase mode', function(done){
    var result = [];

    fs.createReadStream(__dirname + '/three.xml')
      .pipe(xmlnode({
        lowercase: true,
        tag: 'item'
      }))
      .pipe(memory(result))
      .on('finish', function(err) {
        var item, a, b;

        result.should.have.length(1);

        item = result[0];

        item.should.have.property('tag', 'item');
        item.should.have.property('record');
        a = item.record.children.a;
        b = item.record.children.b;

        a.should.have.length(3);
        b.should.be.type('object');

        a[0].attribs.attr.should.eql('1');

        done(err);
      });
  });

  it('should parse nodes with attributes when configured', function(done){
    var result = [];

    fs.createReadStream(__dirname + '/three.xml')
      .pipe(xmlnode({
        tag: 'ITEM'
      }))
      .pipe(memory(result))
      .on('finish', function(err) {

        var item, a, b;

        result.should.have.length(1);
        item = result[0];

        item.should.have.property('tag', 'ITEM');
        item.should.have.property('record');
        item.record.should.have.property('children');
        item.record.should.not.have.property('attribs');

        a = item.record.children.A;
        b = item.record.children.B;

        a.should.have.length(3);
        b.should.be.type('object');

        a[0].should.have.property('value', 'abc');
        a[0].should.have.property('attribs');
        a[0].attribs.ATTR.should.eql('1');

        a[1].should.have.property('value', 'def');
        a[1].should.have.property('attribs');
        a[1].attribs.ATTR.should.eql('2');

        a[2].should.have.property('value', 'ghi');
        a[2].should.have.property('attribs');
        a[2].attribs.ATTR.should.eql('3');

        b.should.have.property('value', '15');
        b.should.have.property('attribs');
        b.attribs.ATTR.should.eql('4');

        done(err);
      });
  });

  it('should parse nodes with cdata', function(done){
    var result = [];

    fs.createReadStream(__dirname + '/four.xml')
      .pipe(xmlnode({
        tag: 'ITEM'
      }))
      .pipe(memory(result))
      .on('finish', function(err) {
        result.should.have.length(2);
        result[0].should.have.property('record');
        result[0].record.should.have.property('children');
        result[0].record.children.A.should.have.property('value', 'abc');
        result[0].record.children.B.should.have.property('value', '15');
        result[1].record.children.A.should.have.property('value', 'def');
        result[1].record.children.B.should.have.property('value', '16');
        done(err);
      });
  });

  it('should parse nodes with multiple non-nested tags', function(done){
    var result = [];

    fs.createReadStream(__dirname + '/five.xml')
      .pipe(xmlnode({
        tag: ['ITEM', 'HEADER']
      }))
      .pipe(memory(result))
      .on('finish', function(err) {
        result.should.have.length(2);
        result[0].should.have.property('record');
        result[0].should.have.property('tag', 'HEADER');
        result[0].record.should.have.property('children');
        result[0].record.children.V.should.have.property('value', '1');

        result[1].should.have.property('record');
        result[1].should.have.property('tag', 'ITEM');
        result[1].record.should.have.property('children');
        result[1].record.children.A.should.have.property('value', 'abc');
        result[1].record.children.B.should.have.property('value', '15');

        done(err);
      });
  });

  it('should parse nodes with multiple tags, ignoring a node while another tag is active', function(done){
    var result = [];

    fs.createReadStream(__dirname + '/six.xml')
      .pipe(xmlnode({
        tag: ['ITEM', 'SAMPLE']
      }))
      .pipe(memory(result))
      .on('finish', function(err) {
        result.should.have.length(3);
        result[0].should.have.property('record');
        result[0].should.have.property('tag', 'ITEM');
        result[0].record.should.have.property('children');
        result[0].record.children.A.should.have.property('value', 'abc');
        result[0].record.children.B.should.have.property('value', '15');

        result[1].should.have.property('record');
        result[1].should.have.property('tag', 'ITEM');
        result[1].record.should.have.property('children');
        result[1].record.children.A.should.have.property('value', 'abc');
        result[1].record.children.B.should.have.property('value', '15');

        result[2].should.have.property('record');
        result[2].should.have.property('tag', 'SAMPLE');
        result[2].record.should.have.property('children');
        result[2].record.children.C.should.have.property('value', '12');

        done(err);
      });
  });

  it('should parse script elements', function(done) {
    var result = [];

    fs.createReadStream(__dirname + '/page.html')
      .pipe(xmlnode({
        tag: 'SCRIPT',
        trim: true,
        strict: false,
        noscript: true
      }))
      .pipe(memory(result))
      .on('finish', function(err) {
        result.should.have.length(2);
        result[0].record.should.have.property('value', 'var z = 5;');
        result[1].record.should.have.property('value', 'z += 3;');
        done(err);
      });

  });

});
