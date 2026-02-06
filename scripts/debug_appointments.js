
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkAppointments() {
    console.log("Fetching appointments with FIXED nested JOINs...");
    const { data, error } = await supabase
        .from('citas')
        .select(`
            *,
            clientes ( nombre, apellidos, dni ),
            servicios ( 
                nombre,
                mutuas ( nombre )
            )
        `);

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Found ${data.length} appointments.`);
    if (data.length > 0) {
        console.log("Sample appointment:", JSON.stringify(data[0], null, 2));
    } else {
        console.log("No appointments found. This explains why they don't show up.");
    }
}

checkAppointments();
