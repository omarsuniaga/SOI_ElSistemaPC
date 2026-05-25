import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function getEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const fallbackPath = path.resolve(process.cwd(), '.env');
  
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  } else if (fs.existsSync(fallbackPath)) {
    content = fs.readFileSync(fallbackPath, 'utf8');
  } else {
    throw new Error('No .env or .env.local file found');
  }

  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  });
  return env;
}

async function diagnose() {
  try {
    console.log('🔄 Loading environment...');
    const env = getEnv();
    
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not found in env files');
    }

    console.log(`📡 Connecting to Supabase at: ${supabaseUrl}`);
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('🔍 Checking if "schedule_runs" table exists in Supabase...');
    const { count, error } = await supabase
      .from('schedule_runs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('relation "public.schedule_runs" does not exist') || error.code === '42P01') {
        console.log('❌ DIAGNOSTICO: La tabla "schedule_runs" NO existe en Supabase.');
        console.log('💡 La migración SQL "20260524_schedule_runs.sql" no se ha ejecutado en Supabase.');
      } else {
        console.log(`⚠️ ERROR DE SUPABASE: ${error.message} (Código: ${error.code})`);
      }
    } else {
      console.log(`✅ DIAGNOSTICO: La tabla "schedule_runs" existe con éxito en Supabase. Registros actuales: ${count}`);
    }

    console.log('\n🔍 Checking if "maestros" table has the "disponibilidad" column...');
    const { data: teacher, error: teacherErr } = await supabase
      .from('maestros')
      .select('id, disponibilidad')
      .limit(1)
      .maybeSingle();

    if (teacherErr) {
      console.log(`❌ ERROR AL LEER "maestros": ${teacherErr.message}`);
    } else {
      console.log('✅ DIAGNOSTICO: La tabla "maestros" es accesible.');
      if (teacher && 'disponibilidad' in teacher) {
        console.log('✅ DIAGNOSTICO: La columna "disponibilidad" existe en la tabla "maestros".');
      } else if (teacher) {
        console.log('❌ DIAGNOSTICO: La columna "disponibilidad" NO existe en la tabla "maestros"!');
      } else {
        console.log('ℹ️ DIAGNOSTICO: No hay registros de maestros en la DB para confirmar columnas, pero la consulta no arrojó error de columna.');
      }
    }

  } catch (err) {
    console.error('💥 Error fatal en el diagnóstico:', err.message);
  }
}

diagnose();
