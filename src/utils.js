var MD5 = require('md5');
const request = require('request');
const fs = require('fs')

var cookies = [
    {
        "domain": ".kuranayetleri.net",
        "expirationDate": 1594112960.641275,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__cfduid",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "dcd85ec7e2d88c89c7d1a6348282187cd1562576960",
        "id": 1
    },
    {
        "domain": ".kuranayetleri.net",
        "expirationDate": 1625653207,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_ga",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "GA1.2.913940453.1562576963",
        "id": 2
    },
    {
        "domain": ".kuranayetleri.net",
        "expirationDate": 1562667607,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_gid",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "GA1.2.1460096514.1562576963",
        "id": 3
    }
]
const cookieJar = request.jar()
cookies.forEach( cookie => {
    cookieJar.setCookie(request.cookie(cookie.name + '=' + cookie.value), cookie.domain)
})


cacheDir = 'cache/'

function getCacheFileName(url){
    return MD5(fixURL(url))
}

function fixURL(url){
    if(/^\/\//.test(url)){
        return 'http:' + url
    }
    return url
}

function clearCache(url){
    url = fixURL(url)
    let md = MD5(url)
    let file = this.cacheDir + md
    fs.unlinkSync(file)
}

function getURL(url, passCache = false){
    url = fixURL(url)
    if(passCache == false){
        return checkCache(url).then(
            data => {
                if(data){
                    return data
                }else{
                    return getURL(url, true)
                }
            }
        )
    }

    return new Promise( (resolve, reject) => {
        let req = {
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/74.0.3729.169 Chrome/74.0.3729.169 Safari/537.36'
              },
              timeout: 15000
            }
        if(cookieJar){
            req.jar = cookieJar
        }
        request(req, function (error, response, body) {
            if(error){
                if(error.code !== 'ESOCKETTIMEDOUT'){
                    console.log(error)
                }
                reject(error)
            }
            if(response && response.statusCode == 200){
                saveCache(url, body)
                resolve(body)
                return
            }
            reject('download Error!')
          })
    })
}

function checkCache(url){
    url = fixURL(url)
    let md = MD5(url)
    let file = this.cacheDir + md
    return new Promise( (resolve, reject) => {
        try{
            fs.readFile(file, 'utf8', function(err, contents) {
                if(err){
                    resolve(false)
                    return
                }
                resolve(contents);
            });
        }catch{
            resolve(false)
        }

    })
}

function saveCache(url, data){
    let md = MD5(url)
    let file = this.cacheDir + md
    fs.writeFile(file, data, function(err) {
        if(err) {
            return console.log(err);
        }
    }); 
}

function trimAll(text){
    text = text.replace(/^(\n|\s)*/, '')
    text = text.replace(/(\n|\s)*$/, '')
    return text
}

function saveFile(path, data){
    fs.writeFile(path, data, function(err) {
        if(err) {
            throw err
        }
    }); 
}

module.exports = dir => {
    cacheDir = dir
    return {
        getCacheFileName,
        trimAll,
        getURL,
        clearCache,
        saveFile
    }
}