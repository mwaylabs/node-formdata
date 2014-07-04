var http = require('http');
var fs = require('fs');
var path = require('path');
var Q = require('q');

/**
 * Uploads a file to a server via http form data
 * @param options
 * see the http option for http.request
 * hostname: the host to call against
 * port: the port to connect to
 * path: the path to the server upload api
 * method: POST
 *
 * verbose: true: don't log anything, false: log will be shown
 * file: the filepath to upload
 * progress: callback that gets called when a progess happens
 * error: error callback
 * @returns {promise|*|Q.promise}
 */
function upload( options ) {

    var deferred = Q.defer();

    options = options || {};
    options.hostname = options.hostname || '0.0.0.0';
    options.port = options.port || 27372;
    options.path = options.path || '/upload';
    options.method = options.method || 'POST';
    var verbose = options.verbose || true;

    var filePath = options.file || './file.txt';
    filePath = path.normalize(filePath);

    var fileName = path.basename(filePath);
    var formName = path.basename(filePath, path.extname(filePath));

    var progress = options.progress || function( progress, chunk, totalFileSize ) {
        if(!verbose){
            console.log('upload progress', progress, '%', 'uploaded', chunk, 'totalFileSize', totalFileSize);
        }
    };
    var error = options.error || function( e ) {
        if(!verbose){
            console.log('problem with request: ' + e.message);
        }
    };

    if(!fs.existsSync(filePath)){
        var e = 'Error: ENOENT, no such file or directory' + filePath;
        error(e);
        deferred.reject(e);
        return deferred.promise;
    }

    delete options.file;
    delete options.progress;
    delete options.error;
    delete options.verbose;

    var boundaryKey = Math.random().toString(16); // random string
    var chunk = 0;
    var fsStat = fs.statSync(filePath);
    var totalFileSize = fsStat.size;

    var request = http.request(options, function( res ) {
        //console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function( chunk ) {
            //console.log('BODY: ' + chunk);
            deferred.resolve();
        });
        res.on('error', function( e ) {
            console.log('error on res');
            deferred.reject(e);
        });
    });

    request.setHeader('Content-Type', 'multipart/form-data; boundary="' + boundaryKey + '"');

    var content = '';
    content += '--' + boundaryKey + '\r\n';
    content += 'Content-Type: application/octet-stream\r\n';
    content += 'Content-Disposition: form-data; name="' + formName + '"; filename="' + fileName + '"\r\n' + 'Content-Transfer-Encoding: binary\r\n\r\n';

    // the header for the one and only part (need to use CRLF here)
    request.write(content);

    request.on('error', function( e ) {
        console.log('error', e);
        error(e);
        deferred.reject(e);
    });

    var fileStream = fs.createReadStream(filePath, { bufferSize: 4 * 1024 });

    fileStream.on('error', function(e) {
        console.log('error on filestream');
        deferred.reject(e);
    });

    fileStream.on('end', function() {
        // mark the end of the one and only part
        request.end('\r\n--' + boundaryKey + '--');
    });

    fileStream.on('data', function( data ) {
        // mark the end of the one and only part
        chunk += data.length;
        var percentage = Math.floor((100 * chunk) / totalFileSize);
        progress(percentage, chunk, totalFileSize);
        deferred.notify(percentage);
    });

    // set "end" to false in the options so .end() isn't called on the request
    fileStream.pipe(request, { end: false });

    return deferred.promise;
}

module.exports = upload;