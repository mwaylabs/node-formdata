var fileUpload = require('../index.js');
var server = require('../server.js');

describe("node-formdata", function() {

    it("upload", function(cb) {

        var progressCalled = false;

        var defaultOptions = {
            hostname: '0.0.0.0',
            port: 27372,
            path: '/upload',
            method: 'POST',
            verbose: true,
            file: './file.txt',
            progress: function() {

            },
            error: function() {

            }
        };

        fileUpload(defaultOptions).then(function() {
            if(progressCalled){
                cb();
            }
        }, function(e) {
            cb(e);
        }, function( progress ) {
            progressCalled = true;
        });

    });

    it("wrong file promise fail", function(cb) {

        var options = {
            file: './fileDoesNotExists.txt'
        };

        fileUpload(options).then(function() {
        }, function(e) {
            cb();
        }, function( progress ) {
        });

    });

    it("wrong file error callback", function(cb) {

        var options = {
            file: './fileDoesNotExists.txt',
            error: function() {
                cb();
            }
        };

        fileUpload(options);

    });

    it("wrong hostname promise fail", function(cb) {

        var options = {
            hostname: 'wrong.host.name'
        };

        fileUpload(options).then(function() {
        }, function() {
            cb();
        });

    });

    it("wrong hostname error callback", function(cb) {

        var options = {
            hostname: 'wrong.host.name',
            error: function(){
                cb();
            }
        };

        fileUpload(options);

    });

});