
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually to get credentials
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
  console.error("Could not read .env.local file. Ensure it exists in the root.");
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const serviciosData = {
    "0": {
        "idServicio": 2645743,
        "nombre": "Consulta Psicologia - Privados",
        "importe": 50,
        "idMutua": 0,
        "idTipoServicio": 245594,
        "duracion": 60
    },
    "2": {
        "idServicio": 2646053,
        "nombre": "Consulta de Oftalmolog\u00eda",
        "importe": 90,
        "idMutua": 0,
        "idTipoServicio": 245788,
        "duracion": 30
    },
    "3": {
        "idServicio": 2646313,
        "nombre": "Consulta Traumatologia - Privados",
        "importe": 80,
        "idMutua": 0,
        "idTipoServicio": 245589,
        "duracion": 15
    },
    "4": {
        "idServicio": 2646344,
        "nombre": "Revision Traumatologia - Privados",
        "importe": 60,
        "idMutua": 0,
        "idTipoServicio": 245589,
        "duracion": 10
    },
    "5": {
        "idServicio": 2646355,
        "nombre": "Infiltraci\u00f3n Traumatolog\u00eda ",
        "importe": 20,
        "idMutua": 0,
        "idTipoServicio": 245589,
        "duracion": 30
    },
    "6": {
        "idServicio": 2646367,
        "nombre": "Infiltraci\u00f3n Acido Hialuronico",
        "importe": 300,
        "idMutua": 0,
        "idTipoServicio": 245589,
        "duracion": 30
    },
    "7": {
        "idServicio": 2654782,
        "nombre": "Consulta Pediatr\u00eda - Privados",
        "importe": 60,
        "idMutua": 0,
        "idTipoServicio": 245584,
        "duracion": 15
    },
    "11": {
        "idServicio": 2723500,
        "nombre": "Consulta Neurolog\u00eda -  Privado",
        "importe": 120,
        "idMutua": 0,
        "idTipoServicio": 245604,
        "duracion": 30
    },
    "12": {
        "idServicio": 2728241,
        "nombre": "Consulta Otorrino - Privado",
        "importe": 80,
        "idMutua": 0,
        "idTipoServicio": 245591,
        "duracion": 15
    },
    "13": {
        "idServicio": 2730813,
        "nombre": "Consulta Medicina General - Privado",
        "importe": 40,
        "idMutua": 0,
        "idTipoServicio": 252190,
        "duracion": 15
    },
    "14": {
        "idServicio": 2730891,
        "nombre": "Consulta de Medicina Interna - Privados",
        "importe": 80,
        "idMutua": 0,
        "idTipoServicio": 245585,
        "duracion": 15
    },
    "15": {
        "idServicio": 2769080,
        "nombre": "Hemograma Completo \/ Edta",
        "importe": 8,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 5
    },
    "16": {
        "idServicio": 2769182,
        "nombre": "Urocultivo \/ Frasco est\u00e9ril",
        "importe": 20,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 15
    },
    "17": {
        "idServicio": 2769198,
        "nombre": "Sangre Oculta en Heces \/ Bote Est\u00e9ril",
        "importe": 30,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 5
    },
    "18": {
        "idServicio": 2811181,
        "nombre": "PRP TRAUMATOLOGIA",
        "importe": 450,
        "idMutua": 0,
        "idTipoServicio": 245589,
        "duracion": 30
    },
    "19": {
        "idServicio": 2855943,
        "nombre": "Anormales + Sedimento  \/ Orina (Bote Est\u00e9ril)",
        "importe": 15,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 15
    },
    "21": {
        "idServicio": 2920097,
        "nombre": "Consulta Urolog\u00eda ",
        "importe": 75,
        "idMutua": 0,
        "idTipoServicio": 272903,
        "duracion": 20
    },
    "33": {
        "idServicio": 3132186,
        "nombre": "Ecocardiograma ",
        "importe": 100,
        "idMutua": 0,
        "idTipoServicio": 292929,
        "duracion": 30
    },
    "34": {
        "idServicio": 3133678,
        "nombre": "Consulta Cardiolog\u00eda + ECG",
        "importe": 100,
        "idMutua": 0,
        "idTipoServicio": 292929,
        "duracion": 30
    },
    "36": {
        "idServicio": 3140655,
        "nombre": "Consulta Cardiolog\u00eda + ECG + Ecocardio - Privado",
        "importe": 180,
        "idMutua": 0,
        "idTipoServicio": 292929,
        "duracion": 30
    },
    "42": {
        "idServicio": 3142913,
        "nombre": "Electrocardiograma - Privados",
        "importe": 20,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 15
    },
    "46": {
        "idServicio": 3154001,
        "nombre": "Perfil B\u00e1sico Completo Mujer",
        "importe": 0,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 10
    },
    "47": {
        "idServicio": 3154335,
        "nombre": "Perfil Anal\u00edtico B\u00e1sico Colesterol",
        "importe": 23.86,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 10
    },
    "48": {
        "idServicio": 3154336,
        "nombre": "Perfil Anal\u00edtico Colesterol Avanzado ",
        "importe": 35,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 10
    },
    "49": {
        "idServicio": 3154503,
        "nombre": "Perfil Anal\u00edtico Anemia Completo",
        "importe": 57.7,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 10
    },
    "50": {
        "idServicio": 3154504,
        "nombre": "Perfil Anal\u00edtico Anemia B\u00e1sico ",
        "importe": 36.43,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 10
    },
    "51": {
        "idServicio": 3154525,
        "nombre": "Perfil Estudio B\u00e1sico Coagulaci\u00f3n",
        "importe": 48.2,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 10
    },
    "52": {
        "idServicio": 3154545,
        "nombre": "Perfil Anal\u00edtico Hep\u00e1tico Completo",
        "importe": 36.57,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 10
    },
    "53": {
        "idServicio": 3154564,
        "nombre": "Peril Anal\u00edtico Diabetes Anual Completo",
        "importe": 66.76,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 10
    },
    "54": {
        "idServicio": 3158114,
        "nombre": "Perfil B\u00e1sico Completo Mujer + Marcadores Tumorales",
        "importe": 122.89,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 10
    },
    "55": {
        "idServicio": 3159665,
        "nombre": "Primera Consulta Androlog\u00eda (sexualidad e infertilidad)",
        "importe": 90,
        "idMutua": 0,
        "idTipoServicio": 272903,
        "duracion": 30
    },
    "56": {
        "idServicio": 3159666,
        "nombre": "Revision Androlog\u00eda (infertilidad y sexualidad)",
        "importe": 75,
        "idMutua": 0,
        "idTipoServicio": 272903,
        "duracion": 30
    },
    "57": {
        "idServicio": 3159667,
        "nombre": "Revision Urolog\u00eda General ",
        "importe": 75,
        "idMutua": 0,
        "idTipoServicio": 272903,
        "duracion": 30
    },
    "58": {
        "idServicio": 3162834,
        "nombre": "Rezum intervenci\u00f3n ",
        "importe": 3900,
        "idMutua": 0,
        "idTipoServicio": 272903,
        "duracion": 60
    },
    "74": {
        "idServicio": 3166114,
        "nombre": "Inyectable - Privado",
        "importe": 5,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 10
    },
    "76": {
        "idServicio": 3169033,
        "nombre": "Perfil B\u00e1sico Completo Hombre + Marcadores Tumorales",
        "importe": 103.42,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 15
    },
    "77": {
        "idServicio": 3169048,
        "nombre": "Perfil B\u00e1sico Completo Hombre",
        "importe": 69.3,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 15
    },
    "78": {
        "idServicio": 3169444,
        "nombre": "Perfil Control Diabetes Anual",
        "importe": 65.59,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 15
    },
    "79": {
        "idServicio": 3169630,
        "nombre": "Test myPrenatal - Premium",
        "importe": 625,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 15
    },
    "94": {
        "idServicio": 3175001,
        "nombre": "Revision Consulta Digestivo - Decesos",
        "importe": 0,
        "idMutua": 0,
        "idTipoServicio": 245587,
        "duracion": 15
    },
    "95": {
        "idServicio": 3175254,
        "nombre": "Primera consulta para valoraci\u00f3n",
        "importe": 0,
        "idMutua": 0,
        "idTipoServicio": 296970,
        "duracion": 20
    },
    "123": {
        "idServicio": 3176470,
        "nombre": "Ecograf\u00eda",
        "importe": 20,
        "idMutua": 0,
        "idTipoServicio": 245587,
        "duracion": 10
    },
    "124": {
        "idServicio": 3176475,
        "nombre": "Consulta Tricolog\u00eda",
        "importe": 60,
        "idMutua": 0,
        "idTipoServicio": 296970,
        "duracion": 20
    },
    "125": {
        "idServicio": 3176480,
        "nombre": "Primer tratamiento con infiltraciones de Dutasteride",
        "importe": 160,
        "idMutua": 0,
        "idTipoServicio": 296970,
        "duracion": 20
    },
    "126": {
        "idServicio": 3176485,
        "nombre": "Seguimiento y tratamiento con infiltraciones de Dutasteride",
        "importe": 120,
        "idMutua": 0,
        "idTipoServicio": 296970,
        "duracion": 20
    },
    "127": {
        "idServicio": 3176491,
        "nombre": "Mesoterapia con PRP",
        "importe": 350,
        "idMutua": 0,
        "idTipoServicio": 296970,
        "duracion": 45
    },
    "128": {
        "idServicio": 3176500,
        "nombre": "Retoque de cirug\u00eda de injerto capilar hasta 1.500 UF",
        "importe": 2100,
        "idMutua": 0,
        "idTipoServicio": 296970,
        "duracion": 6
    },
    "129": {
        "idServicio": 3176506,
        "nombre": "Cirug\u00eda de injerto capilar hasta 3.500 UF",
        "importe": 3400,
        "idMutua": 0,
        "idTipoServicio": 296970,
        "duracion": 8
    },
    "143": {
        "idServicio": 3176790,
        "nombre": "Consulta Traumatolog\u00eda - Decesos",
        "importe": 0,
        "idMutua": 0,
        "idTipoServicio": 245589,
        "duracion": 10
    },
    "158": {
        "idServicio": 3177097,
        "nombre": " Consulta Aparato Digestivo - Privada",
        "importe": 80,
        "idMutua": 0,
        "idTipoServicio": 245587,
        "duracion": 15
    },
    "159": {
        "idServicio": 3177101,
        "nombre": "Revisi\u00f3n Consulta Digestivo - Privada",
        "importe": 70,
        "idMutua": 0,
        "idTipoServicio": 245587,
        "duracion": 15
    },
    "160": {
        "idServicio": 3177102,
        "nombre": "Consulta Aparato Digestivo + Ecograf\u00eda - Privada",
        "importe": 100,
        "idMutua": 0,
        "idTipoServicio": 245587,
        "duracion": 15
    },
    "161": {
        "idServicio": 3177131,
        "nombre": "Revisi\u00f3n Consulta Digestivo + Ecograf\u00eda",
        "importe": 90,
        "idMutua": 0,
        "idTipoServicio": 245587,
        "duracion": 15
    },
    "162": {
        "idServicio": 3177199,
        "nombre": "Estimulaci\u00f3n neuropsicol\u00f3gica",
        "importe": 60,
        "idMutua": 0,
        "idTipoServicio": 245594,
        "duracion": 60
    },
    "163": {
        "idServicio": 3177956,
        "nombre": "Revision Traumatolog\u00eda - Decesos",
        "importe": 0,
        "idMutua": 0,
        "idTipoServicio": 245589,
        "duracion": 10
    },
    "166": {
        "idServicio": 3179869,
        "nombre": "Quiropodia - Decesos",
        "importe": 0,
        "idMutua": 0,
        "idTipoServicio": 245579,
        "duracion": 20
    },
    "200": {
        "idServicio": 3180116,
        "nombre": "Consulta Psicologia - Decesos",
        "importe": 40,
        "idMutua": 0,
        "idTipoServicio": 245594,
        "duracion": 60
    },
    "203": {
        "idServicio": 3190754,
        "nombre": "Test myPrenatal - Basic Plus",
        "importe": 465,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 15
    },
    "223": {
        "idServicio": 3192843,
        "nombre": "Fenciclidina \/ Orina",
        "importe": 9.55,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 5
    },
    "224": {
        "idServicio": 3192854,
        "nombre": "Test 9 Drogas de Abuso \/ Orina",
        "importe": 100,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 15
    },
    "226": {
        "idServicio": 3198838,
        "nombre": "Trastorno depresivo",
        "importe": 100,
        "idMutua": 0,
        "idTipoServicio": 298995,
        "duracion": 45
    },
    "227": {
        "idServicio": 3198840,
        "nombre": "Trastorno P\u00e1nico",
        "importe": 100,
        "idMutua": 0,
        "idTipoServicio": 298995,
        "duracion": 45
    },
    "228": {
        "idServicio": 3198841,
        "nombre": "Fobias",
        "importe": 100,
        "idMutua": 0,
        "idTipoServicio": 298995,
        "duracion": 45
    },
    "229": {
        "idServicio": 3198843,
        "nombre": "Trastorno obsesivo - compulsivo",
        "importe": 100,
        "idMutua": 0,
        "idTipoServicio": 298995,
        "duracion": 45
    },
    "230": {
        "idServicio": 3198844,
        "nombre": "Trastorno del sue\u00f1o",
        "importe": 100,
        "idMutua": 0,
        "idTipoServicio": 298995,
        "duracion": 45
    },
    "231": {
        "idServicio": 3205990,
        "nombre": "Quiropodia - Privados",
        "importe": 33,
        "idMutua": 0,
        "idTipoServicio": 245579,
        "duracion": 20
    },
    "233": {
        "idServicio": 3211675,
        "nombre": "Holter Presi\u00f3n Arterial - Privado",
        "importe": 120,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 15
    },
    "234": {
        "idServicio": 3211680,
        "nombre": "Holter Presi\u00f3n Arterial - Decesos",
        "importe": 95,
        "idMutua": 0,
        "idTipoServicio": 266840,
        "duracion": 15
    },
    "236": {
        "idServicio": 3220176,
        "nombre": "Consulta oftalmolog\u00eda - AXA",
        "importe": 20.5,
        "idMutua": 0,
        "idTipoServicio": 245788,
        "duracion": 20
    },
    "238": {
        "idServicio": 3220178,
        "nombre": "Retinograf\u00eda AXA",
        "importe": 26.62,
        "idMutua": 0,
        "idTipoServicio": 245788,
        "duracion": 20
    },
    "244": {
        "idServicio": 3320305,
        "nombre": "Consulta neurolog\u00eda  - Decesos",
        "importe": 0,
        "idMutua": 0,
        "idTipoServicio": 245604,
        "duracion": 30
    }
};

async function main() {
  console.log('Starting services upsert...');

  const serviciosList = Object.values(serviciosData).map((s) => ({
    id_servicio: s.idServicio,
    nombre: s.nombre.trim(),
    importe: s.importe,
    duracion: s.duracion,
    id_especialidad: s.idTipoServicio,
    id_mutua: s.idMutua === 0 ? null : s.idMutua
  }));

  console.log(`Processing ${serviciosList.length} services...`);

  const { error } = await supabase
    .from('servicios')
    .upsert(serviciosList);

  if (error) {
    console.error('Error upserting services:', error);
  } else {
    console.log('Services upserted successfully!');
  }
}

main().catch(console.error);
