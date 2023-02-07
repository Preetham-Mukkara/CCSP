const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const info = require('./ccsp')


const categories = Object.freeze({
    Housing: 'Housing',
    Transportation: 'Transportation',
    EatingOut: 'Eating Out',
    Groceries: 'Groceries',
    Utilities: 'Utilities',
    Clothing: 'Clothing',
    Medical: 'Medical',
    Insurance: 'Insurance',
    HouseholdSupplies: 'HouseHold Supplies',
    Personal: 'Personal',
    Investing: 'Investing',
    Gifts: 'Gifts',
    Entertainment: 'Entertainment'
})


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function listTransactions(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '188NSYSaTL9s0kzzEyNoygl04NVssI0CUUOHXFmpsDmo',
    range: 'Expenses!A2:AA',
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  console.log('Place, Cost:');
  rows.forEach((row) => {
    if(row[5] != null || row[6] != null){
    // Print columns A and E, which correspond to indices 0 and 4.
        console.log(`${row[5]}, ${row[6]}`);
    }
  });
}

/**
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function getCategoryKeys(auth) {
  try{
        const sheets = google.sheets({version: 'v4', auth});
        const categoryKeys = []
        var month = ''
        let character = 'A'.charCodeAt(0)
        //note: spreadsheet is constrained to A1:Z60, will have to find a way to dynamically update this to reflect changing spreadsheet
        const res = await sheets.spreadsheets.values.get({
          spreadsheetId: '188NSYSaTL9s0kzzEyNoygl04NVssI0CUUOHXFmpsDmo',
          range: 'Expenses!A1:Z60',
        });
        const rows = res.data.values;
        
        //checks if spreadsheet is loaded correctly
        if (!rows || rows.length === 0) {
          console.log('No data found.');
          return;
        }

        //going through each column and row to find keys of the different types of budgeting categories
        for(let i = 0; i< rows.length;i++){
          for(let j =0; j<rows[i].length;j++){
              const key = rows[i][j]
              //checking if the key is one of the categories
              if(categories[key]){
                //checking if the entire row is empty in spreadsheet, 
                //alternatively could use rows[i+1][j] if wanted to check after individual category
                //but must make sure all previous uses have atleast one value if want to update that way
                if(rows[i+1] === undefined || rows[i+1].length === 0){
                  //note: this only works if the month is in the same column and two rows above in the spreadsheet (should be enforced as a requirement in spreadsheet)
                  if(key === 'Housing'){
                    month = rows[i-2][j]
                  }
                    var row = "" + (i+1)
                    var column = "" + String.fromCharCode(character+j)
                    //Pushing values of unused keys of the categories
                    categoryKeys.push([key,column,row])
                }
              }
          }
        }
        return [month,categoryKeys]
}catch(err){
  return err
}
}

function etHelper(set,type,transaction){
  set.forEach((value)=>{
    if(transaction.includes(value)){
      console.log(`${type} transaction found: ${transaction}`)
      return true
    }
  })
  return false
}

//Attempting to sort Transactions
function evaluateTransaction(transaction){
  let transportation =['Transportation', new Set(["UBER","TOLLWAY","VENTRA","PARK"])]
  let utilities = ['Utilities',new Set(["COMED","AT&T"])]
  let eatingOut = ['Eating Out',new Set([])]
  let clothing = ['Clothing',new Set([])]
  let housing = ['Hosuing',new Set([])]
  let groceries = ['Groceries',new Set([])]
  let medical = ['Medical',new Set([])]
  let insurance = ['Insurance',new Set([])]
  let householdSupplies = ['Household Supplies',new Set([])]
  let personal = ['Personal',new Set([])]
  let investing = ['Investing',new Set([])]
  let gifts = ['Gifst',new Set([])]
  let entertainment = ['Entertainment',new Set([])]
  let categories = [transportation,utilities,eatingOut,clothing,householdSupplies,housing,groceries,medical,insurance,investing,personal,gifts,entertainment]
  for(let i =0; i<categories.length;i++){
    etHelper(categories[i][1],categories[i][0],transaction)
   }
}


/**
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function generateData(transactions,auth){
  try{
        var data = []
        const values = await getCategoryKeys(auth)
        const month = values[0].trim()
        const categoryKeys = values[1]
       // console.log(categoryKeys)


        //Mapped to column and row cells of the 'Housing' Key, assignment will only work if Housing has no values under it in spreadsheet
        var col = categoryKeys[0][1]
        var row = parseInt(categoryKeys[0][2])

        //Going through the transactions for the month and creating all the data required for entry of the transactions
        //TODO: Divide values by category and update accordingly, currently all values will come under Housing category
        for(let i =0; i < transactions[month].length;i++){
                var entry = {range: '', values: [], }
                evaluateTransaction(transactions[month][i][0])
                entry.range = `Expenses!${col}${row+1}:${String.fromCharCode(col.charCodeAt(0)+1)}${row+1}`
                entry.values.push(transactions[month][i])
                data.push(entry)
                row++
        }
          //console.log(data)
          return data
}catch(err){
  return err
}
}


/**
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function addTransactions(file,auth) {
  try{
        let transactions = (await info(file))
        const sheets = google.sheets({version: 'v4',auth});
        var data = await generateData(transactions,auth)
        var request = {
            spreadsheetId: '188NSYSaTL9s0kzzEyNoygl04NVssI0CUUOHXFmpsDmo',
            resource: {data: data, valueInputOption: "USER_ENTERED"},
        }
        try{
            const response = await sheets.spreadsheets.values.batchUpdate(request)
            return JSON.stringify(response.data.totalUpdatedCells,null,2);
        } catch(err){
            return err
        }
  }catch(err){
      return err
  }
  }
  

async function runUpdates(file){
  try{
        const auth = await authorize()
        const numUpdatedCells = await addTransactions(file,auth).catch(console.error)
        return numUpdatedCells
  } catch(err){
        return err
  }
}
  
module.exports = {runUpdates}
