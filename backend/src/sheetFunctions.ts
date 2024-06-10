import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import fs from 'fs';
import dotenv from "dotenv";

dotenv.config();

const CLIENT_EMAIL : string = process.env.CLIENT_EMAIL as string;
const PRIVATE_KEY : string = process.env.PRIVATE_KEY as string;

const auth = new google.auth.JWT({
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export const appendToSheet = async (spreadsheetId: string, range: string, values: any[][]) => {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });
    console.log('Data successfully appended');
  } catch (error) {
    console.error('Error appending data:', error);
  }
};


// appendToSheet('16GeK7HF6FatEAhsyUCKCZdxyROdpyCF6LbWbllLuMTk', 'AppLabels!A1', [['Hello, world!', "hello world"],['Hello, world!']]);