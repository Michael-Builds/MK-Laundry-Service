const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const statePath = path.join(__dirname, 'app-state.json');
const projectId = process.env.FIREBASE_PROJECT_ID || 'laundry';
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!serviceAccountJson) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is required to connect to Firestore.');
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (error) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain valid JSON.');
}

const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert(serviceAccount), projectId });
const firestore = getFirestore(firebaseApp);
const stateDocument = firestore.collection('application').doc('state');

function readLocalState() {
  if (!fs.existsSync(statePath)) return {};
  const raw = fs.readFileSync(statePath, 'utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

async function initializeState() {
  const snapshot = await stateDocument.get();
  if (!snapshot.exists) {
    await stateDocument.set(readLocalState());
  }
}

async function getState() {
  const snapshot = await stateDocument.get();
  return snapshot.exists ? snapshot.data() : {};
}

async function saveState(nextState) {
  await stateDocument.set(nextState);
}

module.exports = { getState, initializeState, saveState };