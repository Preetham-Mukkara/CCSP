import promptSync from 'prompt-sync';
import fs from 'fs';
import {PdfReader} from 'pdfreader';

const prompt = new promptSync();
var filePath = prompt("Enter the path to your pdf file: ");
console.log("You entered: " + filePath);
var check = prompt("Is this correct? ");
if(check){
    console.log("WOOOHOOO");
    let rawData = fs.readFileSync(filePath);
    var l = await readPDFPages(rawData);
    console.log(l);

}

function readPDFPages (buffer) {
    const reader = new PdfReader();
    return new Promise((resolve,reject) =>{
        let pages = [];
        reader.parseBuffer(buffer,(err,item) =>{
            if(err) reject(err)
            else if(!item) resolve(pages);
            else if(item.page) pages.push({});
            else if (item.text){
                const row = pages[pages.length-1][item.y] || [];
                row.push(item.text);
                pages[pages.length-1][item.y] = row;
            }
        });
    });
}