const { createClient } = require('@supabase/supabase-js');

//   Correct: Passed as a string literal
const supabaseUrl = 'https://supabase.co'
const supabaseKey = 'sb_publishable_vY94uPH0vLi825SKoJ33GA_KUAg5mdL' 

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase }