
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://jevtywepkptyptdxwuwu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldnR5d2Vwa3B0eXB0ZHh3dXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTYxNzksImV4cCI6MjA4NTc5MjE3OX0.ddub70BbFBYEkHh2hNTnx2ci7zR4cPSa8UfAaMviqTg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    try {
        console.log('Reading JSON file...');
        const jsonPath = path.join(__dirname, '../seleccionables-la-feria.json');
        const rawData = await fs.readFile(jsonPath, 'utf-8');
        
        let data;
        try {
            data = JSON.parse(rawData);
        } catch (e) {
            console.log('JSON parse error, attempting to fix concatenated JSON...');
            // Regex to find "}" followed by whitespace and then "{"
            const match = rawData.match(/\}\s*\{/);
            
            if (match && match.index) {
                const cleanJson = rawData.substring(0, match.index + 1);
                console.log(`Found split at ${match.index}. Parsing first block...`);
                data = JSON.parse(cleanJson);
                console.log('Successfully parsed first JSON block.');
            } else {
                 console.log("No split found via Regex.");
                 throw e;
            }
        }

        // 1. Mutuas
        console.log('Upserting Mutuas...');
        const mutuas = data.mutuas.map(m => ({
            id_mutua: m.idProvee,
            nombre: m.nombre.trim()
        }));
        
        const { error: mutuaError } = await supabase
            .from('mutuas')
            .upsert(mutuas, { onConflict: 'id_mutua' });

        if (mutuaError) console.error('Error inserting mutuas:', mutuaError);
        else console.log(`Processed ${mutuas.length} mutuas.`);

        // 2. Especialidades
        console.log('Upserting Especialidades...');
        const especialidades = data.especialidades.map(e => ({
            id_especialidad: e.idTipoServicio,
            nombre: e.nombre.trim()
        }));

        const { error: espError } = await supabase
            .from('especialidades')
            .upsert(especialidades, { onConflict: 'id_especialidad' });

        if (espError) console.error('Error inserting especialidades:', espError);
        else console.log(`Processed ${especialidades.length} especialidades.`);

        // 3. Servicios
        console.log('Upserting Servicios...');
        // Servicios is an object in the JSON
        const servicios = Object.values(data.servicios).map(s => ({
            id_servicio: s.idServicio,
            nombre: s.nombre.trim(),
            importe: s.importe,
            duracion: s.duracion,
            id_especialidad: s.idTipoServicio,
            id_mutua: s.idMutua === 0 ? null : s.idMutua
        }));

        const { error: servError } = await supabase
            .from('servicios')
            .upsert(servicios, { onConflict: 'id_servicio' });

        if (servError) console.error('Error inserting servicios:', servError);
        else console.log(`Processed ${servicios.length} servicios.`);

        console.log('Data import completed!');

    } catch (err) {
        console.error('Script failed:', err);
    }
}

seed();
