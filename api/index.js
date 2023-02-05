const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const info = require('./ccsp')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive','https://www.googleapis.com/auth/drive.file'];
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
async function addTransactions(auth) {
    const t = await info()
    const sheets = google.sheets({version: 'v4', auth});
    var data =[
        {
        range: 'Expenses!V5',
        values:[[t[0][0]]]
    },
    {
        range: 'Expenses!V6:V9',
        values:[['testing2'],['testing3'],['testing4']]
    },
    {
        range: 'Expenses!V10:W10',
        values:[['testing5','testing6']]
    },
    {
        range: 'Expenses!V11:W12',
        values: [['testing7','testing8'],
                ['testing9','testing10']]
    }
]
    var request = {
        spreadsheetId: '188NSYSaTL9s0kzzEyNoygl04NVssI0CUUOHXFmpsDmo',
        resource: {data: data, valueInputOption: "USER_ENTERED"}
    }
    try{
        const response = await sheets.spreadsheets.values.batchUpdate(request)
        console.log(JSON.stringify(response.data.totalUpdatedCells,null,2));
    } catch(err){
        console.error(err)
    }

  }
  


// authorize().then(listTransactions).catch(console.error);
authorize().then(addTransactions).catch(console.error)