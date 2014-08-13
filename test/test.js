var fileUpload = require('../index.js');
var server = require('../server.js');
var assert = require('assert');

describe("node-formdata", function() {

    it("upload", function( cb ) {

        var progressCalled = false;

        var options = {
            url: 'http://0.0.0.0:27372/upload',
            method: 'POST',
            verbose: true,
            file: './file.txt',
            fields: {
                name: 'NAME',
                uuid: 'UUID'
            }
        };

        fileUpload(options).then(function(responseData) {
            if( progressCalled ) {
                var data = JSON.parse(responseData);
                assert.strictEqual(data.files.file[0].fieldName, 'file');
                assert.strictEqual(data.files.file[0].originalFilename, 'file.txt');
                assert.strictEqual(data.fields.name[0], 'NAME');
                assert.strictEqual(data.fields.uuid[0], 'UUID');
                cb();
            }
        }, function( e ) {
            cb(e);
        }, function( progress ) {
            progressCalled = true;
        });

    });

//    it("upload progress callback", function( cb ) {
//
//        var progressCalled = false;
//
//        var options = {
//            url: 'http://0.0.0.0:27372/upload',
//            method: 'POST',
//            verbose: true,
//            file: './file.txt',
//            progress: function() {
//                progressCalled = true;
//            },
//            error: function() {
//
//            }, success: function(){
//                if( progressCalled ) {
//                    cb();
//                }
//            }
//        };
//
//        fileUpload(options);
//    });

    it("wrong file promise fail", function( cb ) {

        var options = {
            url: 'http://0.0.0.0:27372/upload',
            file: './fileDoesNotExists.txt'
        };

        fileUpload(options).then(function() {
        }, function( e ) {
            cb();
        }, function( progress ) {
        });

    });

    it("wrong file error callback", function( cb ) {

        var options = {
            url: 'http://0.0.0.0:27372/upload',
            file: './fileDoesNotExists.txt',
            error: function() {
                cb();
            }
        };
        fileUpload(options);

    });

    it("wrong hostname promise fail", function( cb ) {

        var options = {
            hostname: 'http://wrong.host.name:8080'
        };

        fileUpload(options).then(function() {
        }, function() {
            cb();
        });

    });

    it("wrong hostname error callback", function( cb ) {

        var options = {
            url: 'http://wrong.host.name',
            error: function( e ) {
                cb();
            }
        };

        fileUpload(options);

    });

});