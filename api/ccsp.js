const pdf = require('pdf-parse');

var data = {
    January: [],
    February: [],
    March: [],
    April: [],
    May: [],
    June: [],
    July: [],
    August: [],
    September: [],
    October: [],
    November: [],
    December: []
}
var transactions = []

async function getInfo(file){
    let options = {
        pagerender: render_page,
        max: 0,
        version: 'v1.9.426'
    }
    data = {January: [],February: [], March: [], April: [], May: [], June: [], July: [], August: [],September: [], October: [],November: [], December: []}

    transactions = []
    await pdf(file,options).then(function(data){
             parseData(data.text)
        }).catch(function(error){
            console.log(error);
        });
    return data
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

function dataAnalyzer(date,location,cost){
    switch(date.slice(0,2)){
        case '01':
            data.January.push([location,cost])
            break;
        case '02':
            data.February.push([location,cost])
            break;
        case '03':
            data.March.push([location,cost])
            break;
        case '04':
            data.April.push([location,cost])
            break;
        case '05':
            data.May.push([location,cost])
            break;
        case '06':
            data.June.push([location,cost])
            break;
        case '07':
            data.July.push([location,cost])
            break;
        case '08':
            data.August.push([location,cost])
            break;
        case '09':
            data.September.push([location,cost])
            break;
        case '10':
            data.October.push([location,cost])
            break;
        case '11':
            data.November.push([location,cost])
            break;
        case '12':
            data.December.push([location,cost])
            break;                        
        default:
            console.log("This was not a valid date!")
    }
}

function parseData(data){
    var lines = data.split("\n");
    for(let i =0; i < lines.length; i++){
        var line = lines[i];
        if(line.indexOf('/') === 2 && line.indexOf(' ') === 5){
            transactions.push(line)
        }
    }
    for(let i =0; i<transactions.length;i++){
        var index = findIndex(transactions[i])
        var date = transactions[i].slice(0,5).trim()
        var location = transactions[i].slice(5,index+1).trim()
        var cost = transactions[i].slice(index+1).trim()
        //only keeping track of payments that cost money (aka a positive cost) and not payments to credit card company (aka negative costs)
        if(cost.charAt(0) !== '-'){
        dataAnalyzer(date,location,cost)
        }
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
            if (lastY === item.transform[5] || !lastY){
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