
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

  const { data: specialties, error: specError } = await supabase.from('especialidades').select('*');
  
  if (specError || !specialties) {
      console.log('No specialties found or error:', specError);
      return;
  }

  for (const spec of specialties) {
      // Check for services with id_mutua IS NULL (Privado)
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
          services.forEach(s => console.log(`- ${s.nombre} (${s.importe}€)`));
      } else {
        // console.log(`\n--- ${spec.nombre} (0 services) ---`);
      }
  }
}

main().catch(console.error);
