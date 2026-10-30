const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
const statePath = path.join(__dirname, 'app-state.json');
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

let stateDocument = null;
if (serviceAccountJson) {
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (error) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain valid JSON.');
  }

  const { cert, getApps, initializeApp } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  const firebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
      });
  stateDocument = getFirestore(firebaseApp).collection('application').doc('state');
}

function readLocalState() {
  if (!fs.existsSync(statePath)) return {};
  const raw = fs.readFileSync(statePath, 'utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

async function initializeState() {
  if (!stateDocument) return;
  const snapshot = await stateDocument.get();
  if (!snapshot.exists) {
    await stateDocument.set(readLocalState());
  }
}

async function getState() {
  if (!stateDocument) return readLocalState();
  const snapshot = await stateDocument.get();
  return snapshot.exists ? snapshot.data() : {};
}

async function saveState(nextState) {
  if (!stateDocument) {
    fs.writeFileSync(statePath, JSON.stringify(nextState, null, 2));
    return;
  }
  await stateDocument.set(nextState);
}

module.exports = { getState, initializeState, saveState };