
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      if (key.trim() === 'VITE_SUPABASE_URL') supabaseUrl = value.trim();
      if (key.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseKey = value.trim();
    }
  });
} catch (e) {
  console.error("Could not read .env.local file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Verifying Privado (id_mutua IS NULL) services...');

  // 1. Get all specialties
  const { data: specialties } = await supabase.from('especialidades').select('*');
  
  if (!specialties) {
      console.log('No specialties found.');
      return;
  }

  // 2. For each specialty, get Privado services
  for (const spec of specialties) {
      const { data: services, error } = await supabase
          .from('servicios')
          .select('id_servicio, nombre, importe')
          .eq('id_especialidad', spec.id_especialidad)
          .is('id_mutua', null);
      
      if (error) {
          console.error(`Error for ${spec.nombre}:`, error);
          continue;
      }

      if (services && services.length > 0) {
          console.log(`\n--- ${spec.nombre} (${services.length} services) ---`);
          services.forEach(s => console.log(`- [${s.id_servicio}] ${s.nombre} (${s.importe}€)`));
      }
  }
}

main().catch(console.error);
