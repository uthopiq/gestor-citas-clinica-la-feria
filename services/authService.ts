
import { supabase } from '../supabase';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const authService = {
  async login(username: string, passwordInput: string): Promise<boolean> {
    // 1. Get user by username
    console.log('Attempting login for:', username);
    const { data, error } = await supabase
      .from('usuarios')
      .select('password_hash')
      .eq('username', username)
      .single();

    if (error) {
        console.error('Supabase Login Error:', error);
        return false;
    }
    if (!data) {
        console.error('User not found in DB');
        return false;
    }

    // 2. Hash input password
    try {
        const hashedInput = await hashPassword(passwordInput);
        console.log('Input Hash:', hashedInput);
        console.log('DB Hash:   ', data.password_hash);
        
        // 3. Compare
        const match = hashedInput === data.password_hash;
        if (!match) console.error('Hash mismatch!');
        return match;
    } catch (e) {
        console.error('Hashing error:', e);
        return false;
    }
  }
};
