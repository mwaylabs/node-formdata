# node formdata

Uploads a file to a server via http formdata

## Install

```
git clone https://github.com/mwaylabs/node-formdata.git
cd node-formdata
npm install
```

or

```
npm install node-formdata
```

## Usage
start the server with: `node server.js` to test this example against.

```
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

fileUpload(defaultOptions).then(function() {
    console.log('end');
}, function() {
    console.log('error');
}, function( progress ) {
    console.log('upload progress', progress);
});

```

## Test

```
mocha
```