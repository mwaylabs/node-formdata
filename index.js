// don't care if the certificate of an https is valid
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// node modules
var fs = require('fs');
var path = require('path');
// Promises
var Q = require('q');
// Request library
var Request = require('request');
// send always cookies
var request = Request.defaults({jar: true});

/**
 * Uploads a file to a server via http form data
 * @param options, requestObj
 * see the request option for further option params
 * option.hostname: the host to call against
 * option.port: the port to connect to
 * option.path: the path to the server upload api
 * option.method: POST
 *
 * option.verbose: true: don't log anything, false: log will be shown
 * option.file: the filepath to upload
 * option.progress: callback that gets called when a progess happens
 * option.error: error callback
 * requestObj - a request object default: require('request');
 * @returns {promise|*|Q.promise}
 */
function upload( options, requestObj ) {

    var deferred = Q.defer();

    // default: true -> do not log
    var verbose = true;
    var callbackCalled = false;

    // use other request implementation
    if( typeof requestObj === 'function' || typeof requestObj === 'object' ) {
        request = requestObj;
    }

    // configure the options
    options = options || {};

    // do set headers
    options.headers = options.headers || {};
    // configure verbose
    verbose = options.verbose || verbose;
    // delete to be require option ready
    delete options.verbose;

    var filePath = options.file || './file.txt';
    // delete to be require option ready
    delete options.file;
    filePath = path.normalize(filePath);
    var fileName = path.basename(filePath);
    var formName = path.basename(filePath, path.extname(filePath));

    var progress = options.progress || function( progress, chunk, totalFileSize ) {
        log('upload progress', progress, '%', 'uploaded', chunk, 'totalFileSize', totalFileSize);
    };

    var error = options.error || function( e ) {
        log('problem with request: ' + e.message);
    };
    // delete to be require option ready
    delete options.error;

    /**
     * Call error callback only once
     * If an async call throws an error after an error accoures do not fire it.
     * @param arguments
     */
    var errorCallback = function(arguments){
        if(!callbackCalled){
            callbackCalled = true;
            error(arguments);
        }
    };

    /**
     * Use console.log with verbose option.
     */
    var log = function() {
        if( !verbose ) {
            console.log.apply(console, arguments);
        }
    };

    // delete to be require option ready
    delete options.progress;

    // return if the file doesn't exist
    if( !fs.existsSync(filePath) ) {
        var e = 'Error: ENOENT, no such file or directory' + filePath;
        errorCallback(e);
        deferred.reject(e);
        return deferred.promise;
    }

    // random string
    var boundaryKey = Math.random().toString(16);
    // total chunk size
    var chunk = 0;
    var fsStat = fs.statSync(filePath);
    var totalFileSize = fsStat.size;

    // formdata content
    var content = '';
    content += '--' + boundaryKey + '\r\n';
    content += 'Content-Type: application/octet-stream\r\n';
    content += 'Content-Disposition: form-data; name="' + formName + '"; filename="' + fileName + '"\r\n' + 'Content-Transfer-Encoding: binary\r\n\r\n';

    // the header for the one and only part (need to use CRLF here)

    var r = request.post(options, function( e, http, response ) {

        if( e ) {
            log('error', e);
            errorCallback(e);
            deferred.reject(e);
            return;
        }

        if( http.statusCode >= 300 ) {
            errorCallback(http.statusCode);
            deferred.reject(http.statusCode);
            return;
        }
        return deferred.resolve(response);
    });

    try {
        // set the correct header
        r.setHeader('Content-Type', 'multipart/form-data; boundary="' + boundaryKey + '"');
        // write the content
        r.write(content);

        r.on('error', function( e ) {
            log('error', e);
            errorCallback(e);
            deferred.reject(e);
        });

        var fileStream = fs.createReadStream(filePath, { bufferSize: 4 * 1024 });

        fileStream.on('error', function( e ) {
            log('error on filestream', e);
            errorCallback(e);
            deferred.reject(e);
        });

        fileStream.on('end', function() {
            // mark the end of the one and only part
            r.end('\r\n--' + boundaryKey + '--');
        });

        fileStream.on('data', function( data ) {
            // mark the end of the one and only part
            chunk += data.length;
            var percentage = Math.floor((100 * chunk) / totalFileSize);
            progress(percentage, chunk, totalFileSize);
            deferred.notify(percentage);
        });

        // set "end" to false in the options so .end() isn't called on the request
        fileStream.pipe(r, { end: false });
    } catch( e ) {
        log('error', e);
        errorCallback(e);
        deferred.reject(e);
    }

    return deferred.promise;
}

// API
module.exports = upload;
