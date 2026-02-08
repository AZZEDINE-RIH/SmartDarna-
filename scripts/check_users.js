
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pkfoduksiohoimvnbxci.supabase.co';
const supabaseKey = 'sb_publishable_fmnZUyKGMJHz7lm1iKznFg_0QnFyhzf';

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
  {
    email: 'admin@smartdarna.com',
    password: 'password123',
    role: 'admin'
  },
  {
    email: 'seller@smartdarna.com',
    password: 'password123',
    role: 'vendeur'
  },
  {
    email: 'user@smartdarna.com',
    password: 'password123',
    role: 'user'
  }
];

async function checkUsers() {
  console.log('Checking users...');

  for (const user of users) {
    console.log(`\nChecking user: ${user.email}`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    });

    if (error) {
      console.log(`Login failed: ${error.message}`);
    } else {
      console.log(`Login successful. User ID: ${data.user.id}`);
      
      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
          console.log(`Profile fetch failed: ${profileError.message}`);
          // Try to create profile if it's missing but login worked
          console.log('Attempting to create missing profile...');
           const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
                id: data.user.id,
                email: user.email,
                name: user.email.split('@')[0], // simple name
                role: user.role,
                created_at: new Date().toISOString()
            }]);
            
            if (insertError) console.log(`Profile creation failed: ${insertError.message}`);
            else console.log('Profile created.');
            
      } else {
          console.log(`Profile found: Name=${profile.name}, Role=${profile.role}`);
          if (profile.role !== user.role) {
              console.log(`Updating role from ${profile.role} to ${user.role}...`);
               await supabase
                .from('profiles')
                .update({ role: user.role })
                .eq('id', data.user.id);
          }
      }
    }
  }
}

checkUsers().catch(console.error);
