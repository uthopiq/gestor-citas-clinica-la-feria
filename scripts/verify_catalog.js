
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jevtywepkptyptdxwuwu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldnR5d2Vwa3B0eXB0ZHh3dXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTYxNzksImV4cCI6MjA4NTc5MjE3OX0.ddub70BbFBYEkHh2hNTnx2ci7zR4cPSa8UfAaMviqTg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    try {
        // Test 1: Private Services Exist
        console.log('Test 1: Check Private Services (id_mutua is null)');
        const { data: privateServices, error: pError } = await supabase.from('servicios').select('*').is('id_mutua', null);
        if (pError) throw pError;
        console.log(`Found ${privateServices.length} private services.`);
        
        if (privateServices.length > 0) {
            console.log(`Sample: ${privateServices[0].nombre} (ID: ${privateServices[0].id_servicio})`);
        }

        // Test 2: 'Todas' behavior for Adeslas (ID 192942)
        // Should fetch Adeslas-specific + Private services
        console.log('\nTest 2: "Todas" behavior for Adeslas (192942)');
        const { data: adeslasServices, error: aError } = await supabase.from('servicios')
            .select('*')
            .or(`id_mutua.eq.192942,id_mutua.is.null`); // Logic in service uses this OR
        
        console.log(`Found ${adeslasServices?.length} services available for Adeslas.`);
        
        // Count breakdown
        const specific = adeslasServices?.filter(s => s.id_mutua === 192942).length;
        const inherited = adeslasServices?.filter(s => s.id_mutua === null).length;
        console.log(`- Specific: ${specific}`);
        console.log(`- Private (Inherited): ${inherited}`);
        
        if (inherited !== privateServices.length) {
            console.warn('WARNING: Inherited count matches private count? ' + (inherited === privateServices.length));
        }

    } catch (e) {
        console.error('Verification failed:', e);
    }
}

verify();
