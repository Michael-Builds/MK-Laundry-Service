const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_vY94uPH0vLi825SKoJ33GA_KUAg5mdL';
const supabase = createClient(supabaseUrl, supabaseKey);
const statePath = path.join(__dirname, 'app-state.json');

function getState() {
  try {
    if (!fs.existsSync(statePath)) {
      return {};
    }

    const raw = fs.readFileSync(statePath, 'utf8').trim();
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveState(nextState) {
  fs.writeFileSync(statePath, JSON.stringify(nextState, null, 2));
}

module.exports = { supabase, getState, saveState };