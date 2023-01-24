const prompt = require('prompt-sync')();
const fs = require('fs');
const pdf = require('pdf-parse');



var filePath = prompt("What is the path to your pdf file?");
console.log("You entered: " + filePath);
var check = prompt("Is this correct?");
if(check){
    console.log("WOOOHOOO");
    let rawData = fs.readFileSync(filePath);
    pdf(rawData).then(function(data){
        //num pages
        console.log(data.numpages);
        //num rendered pages
        console.log(data.numrender);
        //PDF info
        console.log(data.info);
        //PDF metadata
        console.log(data.metadata);
        //PDF.js version
        console.log(data.version);
        //PDF text
        console.log(data.text);
    });
}
