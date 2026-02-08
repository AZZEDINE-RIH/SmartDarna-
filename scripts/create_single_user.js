
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pkfoduksiohoimvnbxci.supabase.co';
const supabaseKey = 'sb_publishable_fmnZUyKGMJHz7lm1iKznFg_0QnFyhzf';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSingleUser() {
  const email = `admin_${Date.now()}@smartdarna.com`;
  const password = 'password123';
  
  console.log(`Attempting to create user: ${email}`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    console.error('Sign up error:', error);
  } else {
    console.log('Sign up successful:', data);
    if (data.user) {
        // Try to insert profile
        const { error: profileError } = await supabase.from('profiles').insert([{
            id: data.user.id,
            email: email,
            name: 'Test Admin',
            role: 'admin',
            created_at: new Date().toISOString()
        }]);
        if (profileError) console.error('Profile creation error:', profileError);
        else console.log('Profile created successfully');
    }
  }
}

createSingleUser();
