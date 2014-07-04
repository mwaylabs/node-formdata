var fileUpload = require('./index.js');

// start the server with:
// node server.js to test this example against

var defaultOptions = {
    hostname: '0.0.0.0',
    port: 27372,
    path: '/upload',
    method: 'POST',
    verbose: true,
    file: './file.txt',
    progress: function(){},
    error: function(){}
};

// HTTP
fileUpload(defaultOptions).then(function() {
    console.log('end');
}, function() {
    console.log('error');
}, function( progress ) {
    console.log('upload progress', progress);
});

// HTTP
fileUpload(defaultOptions, 'http');

// HTTPS
fileUpload(defaultOptions, 'https');
