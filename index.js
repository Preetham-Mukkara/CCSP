const pdf = require('pdf-parse');
const prompt = require('prompt-sync')({sigint: true});
const fs = require('fs');
let options = {
    pagerender: render_page,
    max: 0,
    version: 'v1.9.426'
}

getFilename();
function getFilename(){
    var filePath = prompt("Enter the path to your pdf file: ").trim();
    console.log("You entered: " + filePath);
    let check = prompt("Is this correct? ");
    if(check){
        console.log("WOOOHOOO");
        let dataBuffer = fs.readFileSync(filePath);
        pdf(dataBuffer,options).then(function(data){
            console.log(data.text);
        }).catch(function(error){
            console.log(error);
        });
    }
}


function render_page(pageData){
    let render_options = {
        //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
        normalizeWhitespace: false,
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

