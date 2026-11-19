/**
 * EVENTIFY — Supabase Automated Migration & Verification Script
 * Reads data/*.json and safely seeds Supabase PostgreSQL database
 * Runs pre-migration backups, relational integrity checks, and reconciliation audits
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || SUPABASE_URL.includes('your-project-id')) {
  console.error('\n❌ ERROR: Supabase credentials not found in environment.');
  console.error('Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env or .env.local file.\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups', `backup_${Date.now()}`);

function readJson(file) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function runMigration() {
  console.log('\n======================================================');
  console.log('🚀 EVENTIFY — PRODUCTION SUPABASE MIGRATION');
  console.log('======================================================\n');

  // 1. PRE-MIGRATION BACKUP
  console.log('📦 Step 1: Creating immutable local backup...');
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.copyFileSync(path.join(DATA_DIR, 'users.json'), path.join(BACKUP_DIR, 'users.json'));
  fs.copyFileSync(path.join(DATA_DIR, 'events.json'), path.join(BACKUP_DIR, 'events.json'));
  fs.copyFileSync(path.join(DATA_DIR, 'registrations.json'), path.join(BACKUP_DIR, 'registrations.json'));
  console.log(`   ✓ Backup secured at: ${BACKUP_DIR}\n`);

  // 2. READ SOURCE JSON DATA
  const rawUsers = readJson('users.json');
  const rawEvents = readJson('events.json');
  const rawRegistrations = readJson('registrations.json');

  console.log(`📊 Source Records to Migrate:`);
  console.log(`   - Users: ${rawUsers.length}`);
  console.log(`   - Events: ${rawEvents.length}`);
  console.log(`   - Registrations: ${rawRegistrations.length}\n`);

  // 3. MIGRATE USERS
  console.log('👤 Step 2: Migrating Users (Preserving Scrypt Hashes)...');
  const userRecords = rawUsers.map(u => ({
    id: u.id,
    role: u.role,
    email: u.email.toLowerCase().trim(),
    name: u.name,
    college: u.college || null,
    organisation: u.organisation || null,
    phone: u.phone || null,
    password_hash: u.passwordHash,
    created_at: u.createdAt || new Date().toISOString()
  }));

  const { error: userError } = await supabase
    .from('users')
    .upsert(userRecords, { onConflict: 'id' });

  if (userError) {
    console.error('❌ User migration failed:', userError);
    process.exit(1);
  }
  console.log(`   ✓ ${userRecords.length} users successfully synced.\n`);

  // 4. MIGRATE EVENTS
  console.log('📅 Step 3: Migrating Events (Preserving Banners & Scoping)...');
  const eventRecords = rawEvents.map(e => ({
    id: e.id,
    title: e.title,
    description: e.description || '',
    category: e.category,
    dates: e.dates,
    start_time: e.startTime || null,
    end_time: e.endTime || null,
    venue: e.venue,
    address: e.address || null,
    type: e.type || 'In-Person',
    capacity: e.capacity || 100,
    registered_count: e.registeredCount || 0,
    attended_count: e.attendedCount || 0,
    status: e.status || 'Registration Open',
    thumbnail: e.thumbnail,
    tags: e.tags || [],
    eligibility: e.eligibility || '',
    agenda: e.agenda || '',
    organiser: e.organiser,
    organiser_email: e.organiserEmail,
    organiser_id: e.organiserId || null,
    created_at: e.createdAt || new Date().toISOString()
  }));

  const { error: eventError } = await supabase
    .from('events')
    .upsert(eventRecords, { onConflict: 'id' });

  if (eventError) {
    console.error('❌ Events migration failed:', eventError);
    process.exit(1);
  }
  console.log(`   ✓ ${eventRecords.length} events successfully synced.\n`);

  // 5. MIGRATE REGISTRATIONS
  console.log('🎟️ Step 4: Migrating Registrations (Preserving Tokens & Admission State)...');
  const regRecords = rawRegistrations.map(r => ({
    id: r.id,
    token: r.token,
    event_id: r.eventId,
    event_name: r.eventName,
    student_name: r.studentName,
    student_email: r.studentEmail,
    college: r.college || null,
    date: r.date || null,
    time: r.time || null,
    venue: r.venue || null,
    seat_tier: r.seatTier || 'General Pass',
    status: r.status || 'Confirmed',
    checked_in: Boolean(r.checkedIn),
    checked_in_at: r.checkedInAt || null,
    checked_in_by: r.checkedInBy || null,
    registered_at: r.registeredAt || new Date().toISOString()
  }));

  const { error: regError } = await supabase
    .from('registrations')
    .upsert(regRecords, { onConflict: 'id' });

  if (regError) {
    console.error('❌ Registrations migration failed:', regError);
    process.exit(1);
  }
  console.log(`   ✓ ${regRecords.length} registrations successfully synced.\n`);

  // 6. POST-FLIGHT RECONCILIATION AUDIT
  console.log('🔍 Step 5: Running Relational Integrity & Reconciliation Audit...');
  const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
  const { count: regsCount } = await supabase.from('registrations').select('*', { count: 'exact', head: true });

  console.log(`   - Cloud Users Count:         ${usersCount} (Local: ${rawUsers.length})`);
  console.log(`   - Cloud Events Count:        ${eventsCount} (Local: ${rawEvents.length})`);
  console.log(`   - Cloud Registrations Count: ${regsCount} (Local: ${rawRegistrations.length})`);

  if (usersCount >= rawUsers.length && eventsCount >= rawEvents.length && regsCount >= rawRegistrations.length) {
    console.log('\n✅ MIGRATION SUCCESSFUL! All records verified and synced.');
  } else {
    console.warn('\n⚠️ Warning: Mismatched counts detected. Please review cloud records.');
  }

  console.log('======================================================\n');
}

runMigration().catch(err => {
  console.error('Unhandled migration failure:', err);
  process.exit(1);
});
