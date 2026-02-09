import { User } from '../types';
import { supabase } from '../supabase';

async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const authService = {
  async login(username: string, passwordInput: string): Promise<User | null> {
    // 1. Get user by username
    const { data, error } = await supabase
      .from('usuarios')
      .select('id_usuario, username, nombre_completo, role, password_hash')
      .eq('username', username)
      .single();

    if (error || !data) {
        console.error('Login Error:', error);
        return null;
    }

    // 2. Hash input password
    try {
        const hashedInput = await hashPassword(passwordInput);
        
        // 3. Compare
        if (hashedInput === data.password_hash) {
            // Return user without password_hash
            const { password_hash, ...user } = data;
            return user as User;
        }
        return null;
    } catch (e) {
        console.error('Hashing error:', e);
        return null;
    }
  }
};
