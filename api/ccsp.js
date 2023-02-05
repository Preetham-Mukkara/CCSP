const pdf = require('pdf-parse');
const prompt = require('prompt-sync')({sigint: true});
const fs = require('fs');
var transactions = Array()
var dates = Array()
var locations = Array()
var costs = Array()
let options = {
    pagerender: render_page,
    max: 0,
    version: 'v1.9.426'
}

async function getInfo(){
    var filePath = prompt("Enter the path to your pdf file: ").trim();
    console.log("You entered: " + filePath);
    //let check = prompt("Is this correct? ");
    if(1){
        console.log("WOOOHOOO");
        let dataBuffer = fs.readFileSync(filePath);
        await pdf(dataBuffer,options).then(function(data){
             parseData(data.text)
        }).catch(function(error){
            console.log(error);
        });
    }
    return [dates,locations,costs]
}

function findIndex(str){
    var regex = /^[a-zA-Z]+$/
    let index = -1
    for(let i =0; i < str.length;i++){
        if(str.charAt(i).match(regex)){
            index = i;
        }
    }
    return index
}

function parseData(data){
    var lines = data.split("\n");
    for(let i =0; i < lines.length; i++){
        var line = lines[i];
        if(line.indexOf('/') == 2 && line.indexOf(' ') == 5){
            transactions.push(line)
        }
    }
    for(let i =0; i<transactions.length;i++){
        var index = findIndex(transactions[i])
        dates.push(transactions[i].slice(0,5).trim())
        locations.push(transactions[i].slice(5,index+1).trim())
        costs.push(transactions[i].slice(index+1).trim())
    }
}


function render_page(pageData){
    let render_options = {
        //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
        normalizeWhitespace: true,
        //do not attempt to combine same line TextItem's. The default value is `false`.
        disableCombineTextItems: false
    }
    return pageData.getTextContent(render_options)
    .then(function(textContent) {
        let lastY, text = '';
        for (let item of textContent.items) {
            if (lastY == item.transform[5] || !lastY){
                text += item.str;
            }  
            else{
                text += '\n' + item.str;
            }    
            lastY = item.transform[5];
        }
        return text;
    });
}

module.exports = getInfo