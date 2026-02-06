
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://jevtywepkptyptdxwuwu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldnR5d2Vwa3B0eXB0ZHh3dXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTYxNzksImV4cCI6MjA4NTc5MjE3OX0.ddub70BbFBYEkHh2hNTnx2ci7zR4cPSa8UfAaMviqTg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAdmin() {
    try {
        console.log('Checking existing users...');
        const { data: users, error } = await supabase.from('usuarios').select('*');
        if (error) console.error('Error fetching users:', error);
        else console.log('Users found:', users);

        const password = 'admin';
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        
        console.log(`Resetting 'admin' user password to '${password}' (Hash: ${hashedPassword})...`);
        
        const { error: upsertError } = await supabase.from('usuarios').upsert({
            username: 'admin', // assuming column is username
            password: hashedPassword,
            nombre: 'Administrador Principal',
            role: 'admin' // Best guess, schema dependent.
        }, { onConflict: 'username' });

        if (upsertError) {
             console.error('Upsert failed:', upsertError);
             // If schema mismatch (e.g. no 'role' column), retry without it
             if (upsertError.message.includes('role')) {
                 console.log('Retrying without role...');
                 await supabase.from('usuarios').upsert({
                    username: 'admin',
                    password: hashedPassword,
                    nombre: 'System Admin'
                 }, { onConflict: 'username' });
             }
        } else {
            console.log('Admin user updated successfully.');
        }

    } catch (e) {
        console.error(e);
    }
}

fixAdmin();
