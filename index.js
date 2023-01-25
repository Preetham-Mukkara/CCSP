const pdf = require('pdf-parse');
const prompt = require('prompt-sync')({sigint: true});
const fs = require('fs');

var filePath = prompt("Enter the path to your pdf file: ").trim();
console.log("You entered: " + filePath);
let check = prompt("Is this correct? ");
if(check){
    console.log("WOOOHOOO");
    let dataBuffer = fs.readFileSync(filePath);
    pdf(dataBuffer).then(function(data){
        console.log(data.text);
    }).catch(function(error){
        console.log(error);
    });
}
