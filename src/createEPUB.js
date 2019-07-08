const Epub = require("epub-gen")

function ayetsToText(ayetler, sureNo, besmele){
    let text = ""
    
    //Check if besmele exists Add it if it is not (Except Fatiha and Tevbe)
    if(sureNo !== undefined && besmele !== undefined && sureNo != 1 && sureNo !=9 && ayetler[0][0] > 0){
        ayetler.unshift([0, besmele, false])
    }

    ayetler.forEach( ayet => {
        if(ayet[2]){
            marginBottom = '0.95'
        }else{
            marginBottom = '0.38'
        }
        text += '<p style="margin-top:0.38em; margin-bottom:' +marginBottom+ 'em;">'
        if(ayet[0] > 0){
            text += '<b>' + ayet[0] + '</b>. '
        }
        text += ayet[1]
        if(ayet[2]){
            text += '<br /><span style="font-size:80%;">' + ayet[2] + '</span>'
        }
        text += '</p>'
    })
    return text
}

function createEPUB(author, sureler, output){
    let content = []
    let i = 1
    let besmele = sureler[0].ayetler[0][1] 
    sureler.forEach( sure => {
        content.push({
            title: i + '. ' + sure.name + ' Suresi',
            data: ayetsToText(sure.ayetler, i, besmele)
        })
        i++
    })

    let options = {
        title: author + ' Kuranı Kerim Meali',
        author: author,
        output: output,
        lang: 'tr',
        tocTitle: 'SURELER',
        content: content,
        customOpfTemplatePath: 'templates/epub3/content.opf.ejs',
        customNcxTocTemplatePath: 'templates/toc.ncx.ejs',
        customHtmlTocTemplatePath: 'templates/epub3/toc.xhtml.ejs' // toc itself removed from toc
    }
    return new Epub(options).promise.then(
        () => {return true},
	    err => {return Promise.reject("Failed to generate Ebook because of: " + err)}
    );
}

module.exports = createEPUB