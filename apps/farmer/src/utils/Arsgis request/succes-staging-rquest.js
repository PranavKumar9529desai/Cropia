var https = require('follow-redirects').https;
var fs = require('fs');

var options = {
    'method': 'GET',
    'hostname': 'geocode.arcgis.com',
    'path': '/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=Kalawade%252C%2520Karad%252C%2520Satara%252C%2520Maharashtra%2520415539%252C%2520India&maxLocations=1&token=AAPTxy8BH1VEsoebNVZXo8HurCLQxQLzwm-zk4LpIoRjCHFQ1nFGMtQhlfEt6JLrIHVcmJp_did-HduD4O_D8AjeYWMqQrfn87hQN69YZntaT6k8d3zIZ7C3aPHuhebGr3kbEFwUyyjtrb4H6iOOXx9__s7SunRFdLfxyKrab9hUe_H70okE8iAf3W2gRGCN6wW_-lgc0DT4eexFMc5EbFU5c76SiCVm7MFY9zY2D_T_D_f2JVMxXngK-VthHmkxMYLZAT1_VMXMY5ka',
    'headers': {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'origin': 'https://staging-cropia-farmer.vercel.app',
        'pragma': 'no-cache',
        'priority': 'u=1, i',
        'referer': 'https://staging-cropia-farmer.vercel.app/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'
    },
    'maxRedirects': 20
};

var req = https.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
        chunks.push(chunk);
    });

    res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
    });

    res.on("error", function (error) {
        console.error(error);
    });
});

req.end();