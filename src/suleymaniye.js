const JSDOM = require("jsdom").JSDOM;
const createEPUB = require('./createEPUB')
const {trimAll, getURL, saveFile} = require('./utils')('cache/')

function getSure(url){
    return getURL(url).then(body => {
        let dom = new JSDOM(body)
        let doc = dom.window.document
        var sureName = doc.getElementById('suraNameHeader').innerHTML.trim()
        let ayetElems = doc.getElementsByClassName('col-sm-12 detail-solblokpad bg-white')
        let ayetler = []
        Array.prototype.forEach.call(ayetElems, elem => {
            let id = elem.children[0].id
            if(id == ''){
                id = 0
            }
            let text = elem.querySelector('div.trText').innerHTML.split('<br')[0]
            text = trimAll(text)
            let tefsir = elem.querySelector('div.trText').querySelector('span')
            if(tefsir){
                ['span', 'div', 'p'].forEach( tag => {
                    let elmToRemove = tefsir.querySelector(tag)
                    while(elmToRemove){
                        elmToRemove.outerHTML = elmToRemove.innerHTML
                        elmToRemove = tefsir.querySelector(tag)
                    }
                })

                tefsir = trimAll(tefsir.innerHTML)
            }else{
                tefsir = false
            }
            if(tefsir == '') tefsir = false
            ayetler.push([id, text, tefsir])
        })
        return {name: sureName, ayetler: ayetler}
    });
}


getURL("https://www.suleymaniyevakfimeali.com/").then(body => {
    let dom = new JSDOM(body)
    let sureler = []
    let atags = dom.window.document.getElementsByClassName('col-sm-12 detail-solblokpad')[0].querySelectorAll('a')
    atags.forEach( a => { sureler.push(a.href)})
    let promises = []
    sureler.forEach( sure => {
        if(sure.search('http') == -1){
            sure = 'https://www.suleymaniyevakfimeali.com' + sure
        }
        promises.push(getSure(sure))
    })
    Promise.all(promises).then( sureler => {
        saveFile('output/Süleymaniye.json', JSON.stringify({name:'Süleymaniye', sures: sureler}))
        createEPUB("Süleymaniye Vakfı", sureler, 'output/Süleymaniye Meali.epub')
    })
});