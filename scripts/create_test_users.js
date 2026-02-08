
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pkfoduksiohoimvnbxci.supabase.co';
const supabaseKey = 'sb_publishable_fmnZUyKGMJHz7lm1iKznFg_0QnFyhzf';

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
  {
    email: 'admin@smartdarna.com',
    password: 'password123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'seller@smartdarna.com',
    password: 'password123',
    name: 'Seller User',
    role: 'vendeur' // The code normalizes 'seller' to 'vendeur', but let's stick to what the code uses internally
  },
  {
    email: 'user@smartdarna.com',
    password: 'password123',
    name: 'Regular User',
    role: 'user'
  }
];

async function createUsers() {
  console.log('Starting user creation process...');

  for (const user of users) {
    console.log(`\nProcessing user: ${user.email} (${user.role})`);

    // 1. Sign Up (Auth)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });

    if (authError) {
      console.error(`Error creating auth user for ${user.email}:`, authError.message);
      // If user already exists, we might still want to ensure the profile exists
      if (authError.message.includes('already registered')) {
         console.log('User already registered, attempting to check/update profile...');
         // We need to sign in to get the user ID if we don't have it from signUp error (usually we don't)
         // Or we can try to sign in
         const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password
         });
         
         if (signInData.user) {
             await ensureProfile(signInData.user.id, user);
         } else {
             console.error('Could not sign in to get user ID:', signInError);
         }
      }
      continue;
    }

    if (authData.user) {
      console.log(`Auth user created/retrieved. ID: ${authData.user.id}`);
      await ensureProfile(authData.user.id, user);
    }
  }
}

async function ensureProfile(userId, userData) {
    // 2. Create/Update Profile
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (existingProfile) {
        console.log(`Profile already exists for ${userData.email}. Updating role/name...`);
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                name: userData.name,
                role: userData.role
            })
            .eq('id', userId);

        if (updateError) {
            console.error('Error updating profile:', updateError.message);
        } else {
            console.log('Profile updated successfully.');
        }
    } else {
        console.log(`Creating new profile for ${userData.email}...`);
        const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
                id: userId,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                created_at: new Date().toISOString()
            }]);

        if (insertError) {
            console.error('Error creating profile:', insertError.message);
        } else {
            console.log('Profile created successfully.');
        }
    }
}

createUsers().catch(console.error);
