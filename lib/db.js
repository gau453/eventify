/**
 * EVENTIFY — Universal Database Adapter
 * Dual-Mode Architecture:
 * 1. Supabase PostgreSQL & Storage Mode (when SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY are set).
 * 2. Standalone / Local JSON Mode (fallback to data/*.json when credentials are not configured).
 */

const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config();
} catch (e) {}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_SERVICE_ROLE_KEY && 
  !SUPABASE_URL.includes('your-project-id') &&
  !SUPABASE_SERVICE_ROLE_KEY.includes('your-supabase-service-role-key')
);

let supabase = null;
if (isSupabaseConfigured) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
}

// Local JSON File Paths (for fallback / local standalone runs)
const ROOT_DIR = path.resolve(__dirname, '..');
const USERS_FILE = path.join(ROOT_DIR, 'data', 'users.json');
const EVENTS_FILE = path.join(ROOT_DIR, 'data', 'events.json');
const REGISTRATIONS_FILE = path.join(ROOT_DIR, 'data', 'registrations.json');

// --- LOCAL JSON HELPERS ---
function readJsonSafe(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return fallback;
  }
}

function writeJsonSafe(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing file:', filePath, err);
  }
}

// ==========================================
// 1. USERS REPOSITORY
// ==========================================
async function getUsers() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return (data || []).map(u => ({
      id: u.id,
      role: u.role,
      email: u.email,
      name: u.name,
      college: u.college,
      organisation: u.organisation,
      phone: u.phone,
      passwordHash: u.password_hash,
      createdAt: u.created_at
    }));
  }
  return readJsonSafe(USERS_FILE, []);
}

async function getUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    return {
      id: data.id,
      role: data.role,
      email: data.email,
      name: data.name,
      college: data.college,
      organisation: data.organisation,
      phone: data.phone,
      passwordHash: data.password_hash,
      createdAt: data.created_at
    };
  }

  const users = readJsonSafe(USERS_FILE, []);
  return users.find(u => u.email.toLowerCase() === cleanEmail) || null;
}

async function createUser(user) {
  if (isSupabaseConfigured) {
    const record = {
      id: user.id,
      role: user.role,
      email: user.email.toLowerCase().trim(),
      name: user.name,
      college: user.college || null,
      organisation: user.organisation || null,
      phone: user.phone || null,
      password_hash: user.passwordHash,
      created_at: user.createdAt || new Date().toISOString()
    };
    const { data, error } = await supabase.from('users').insert(record).select().single();
    if (error) throw error;
    return user;
  }

  const users = readJsonSafe(USERS_FILE, []);
  users.push(user);
  writeJsonSafe(USERS_FILE, users);
  return user;
}

async function updateUserPassword(userId, newPasswordHash) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);
    if (error) throw error;
    return true;
  }

  const users = readJsonSafe(USERS_FILE, []);
  const user = users.find(u => u.id === userId);
  if (user) {
    user.passwordHash = newPasswordHash;
    writeJsonSafe(USERS_FILE, users);
    return true;
  }
  return false;
}

// ==========================================
// 2. EVENTS REPOSITORY
// ==========================================
async function getEvents(filter = {}) {
  if (isSupabaseConfigured) {
    let query = supabase.from('events').select('*').order('created_at', { ascending: false });

    if (filter.organiserEmail) {
      query = query.ilike('organiser_email', filter.organiserEmail.trim().toLowerCase());
    } else if (filter.organiserId) {
      query = query.eq('organiser_id', filter.organiserId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category,
      dates: e.dates,
      startTime: e.start_time,
      endTime: e.end_time,
      venue: e.venue,
      address: e.address,
      type: e.type,
      capacity: e.capacity,
      registeredCount: e.registered_count,
      attendedCount: e.attended_count,
      status: e.status,
      thumbnail: e.thumbnail,
      tags: e.tags,
      eligibility: e.eligibility,
      agenda: e.agenda,
      organiser: e.organiser,
      organiserEmail: e.organiser_email,
      organiserId: e.organiser_id,
      createdAt: e.created_at
    }));
  }

  let events = readJsonSafe(EVENTS_FILE, []);
  if (filter.organiserEmail) {
    events = events.filter(e => e.organiserEmail && e.organiserEmail.toLowerCase() === filter.organiserEmail.toLowerCase());
  } else if (filter.organiserId) {
    events = events.filter(e => e.organiserId === filter.organiserId);
  }
  return events;
}

async function getEventById(id) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      dates: data.dates,
      startTime: data.start_time,
      endTime: data.end_time,
      venue: data.venue,
      address: data.address,
      type: data.type,
      capacity: data.capacity,
      registeredCount: data.registered_count,
      attendedCount: data.attended_count,
      status: data.status,
      thumbnail: data.thumbnail,
      tags: data.tags,
      eligibility: data.eligibility,
      agenda: data.agenda,
      organiser: data.organiser,
      organiserEmail: data.organiser_email,
      organiserId: data.organiser_id,
      createdAt: data.created_at
    };
  }

  const events = readJsonSafe(EVENTS_FILE, []);
  return events.find(e => e.id === id) || null;
}

async function createEvent(event) {
  if (isSupabaseConfigured) {
    const record = {
      id: event.id,
      title: event.title,
      description: event.description || null,
      category: event.category,
      dates: event.dates,
      start_time: event.startTime || null,
      end_time: event.endTime || null,
      venue: event.venue,
      address: event.address || null,
      type: event.type || 'In-Person',
      capacity: event.capacity || 100,
      registered_count: event.registeredCount || 0,
      attended_count: event.attendedCount || 0,
      status: event.status || 'Registration Open',
      thumbnail: event.thumbnail || null,
      tags: event.tags || [],
      eligibility: event.eligibility || null,
      agenda: event.agenda || null,
      organiser: event.organiser,
      organiser_email: event.organiserEmail,
      organiser_id: event.organiserId || null,
      created_at: event.createdAt || new Date().toISOString()
    };
    const { data, error } = await supabase.from('events').insert(record).select().single();
    if (error) throw error;
    return event;
  }

  const events = readJsonSafe(EVENTS_FILE, []);
  events.unshift(event);
  writeJsonSafe(EVENTS_FILE, events);
  return event;
}

async function updateEvent(id, fields) {
  if (isSupabaseConfigured) {
    const updateObj = {};
    if (fields.thumbnail !== undefined) updateObj.thumbnail = fields.thumbnail;
    if (fields.title !== undefined) updateObj.title = fields.title;
    if (fields.status !== undefined) updateObj.status = fields.status;
    if (fields.registeredCount !== undefined) updateObj.registered_count = fields.registeredCount;
    if (fields.attendedCount !== undefined) updateObj.attended_count = fields.attendedCount;

    const { data, error } = await supabase.from('events').update(updateObj).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  const events = readJsonSafe(EVENTS_FILE, []);
  const event = events.find(e => e.id === id);
  if (event) {
    Object.assign(event, fields);
    writeJsonSafe(EVENTS_FILE, events);
    return event;
  }
  return null;
}

async function deleteEvent(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  let events = readJsonSafe(EVENTS_FILE, []);
  events = events.filter(e => e.id !== id);
  writeJsonSafe(EVENTS_FILE, events);
  return true;
}

// ==========================================
// 3. REGISTRATIONS & GATE VERIFICATION
// ==========================================
async function getRegistrations(filter = {}) {
  if (isSupabaseConfigured) {
    let query = supabase.from('registrations').select('*').order('registered_at', { ascending: false });

    if (filter.eventId) query = query.eq('event_id', filter.eventId);
    if (filter.studentEmail) query = query.ilike('student_email', filter.studentEmail.trim().toLowerCase());

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(r => ({
      id: r.id,
      token: r.token,
      eventId: r.event_id,
      eventName: r.event_name,
      studentName: r.student_name,
      studentEmail: r.student_email,
      college: r.college,
      date: r.date,
      time: r.time,
      venue: r.venue,
      seatTier: r.seat_tier,
      status: r.status,
      checkedIn: r.checked_in,
      checkedInAt: r.checked_in_at,
      checkedInBy: r.checked_in_by,
      registeredAt: r.registered_at
    }));
  }

  let regs = readJsonSafe(REGISTRATIONS_FILE, []);
  if (filter.eventId) regs = regs.filter(r => r.eventId === filter.eventId);
  if (filter.studentEmail) regs = regs.filter(r => r.studentEmail && r.studentEmail.toLowerCase() === filter.studentEmail.toLowerCase());
  return regs;
}

async function getRegistrationByToken(token) {
  if (!token) return null;
  const cleanToken = token.trim();

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .or(`token.eq.${cleanToken},id.eq.${cleanToken}`)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    return {
      id: data.id,
      token: data.token,
      eventId: data.event_id,
      eventName: data.event_name,
      studentName: data.student_name,
      studentEmail: data.student_email,
      college: data.college,
      date: data.date,
      time: data.time,
      venue: data.venue,
      seatTier: data.seat_tier,
      status: data.status,
      checkedIn: data.checked_in,
      checkedInAt: data.checked_in_at,
      checkedInBy: data.checked_in_by,
      registeredAt: data.registered_at
    };
  }

  const regs = readJsonSafe(REGISTRATIONS_FILE, []);
  return regs.find(r => r.token === cleanToken || r.id === cleanToken) || null;
}

// Atomic Admission Check-in with Duplicate Rejection
async function checkInAttendee(token, checkedInBy = 'Organiser Gate 1') {
  const cleanToken = token.trim();

  if (isSupabaseConfigured) {
    // 1. Fetch current ticket
    const current = await getRegistrationByToken(cleanToken);
    if (!current) return { found: false };

    if (current.checkedIn) {
      return {
        found: true,
        alreadyCheckedIn: true,
        checkedInAt: current.checkedInAt,
        registration: current
      };
    }

    // 2. Perform atomic update where checked_in is FALSE
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('registrations')
      .update({
        checked_in: true,
        checked_in_at: nowIso,
        checked_in_by: checkedInBy
      })
      .or(`token.eq.${cleanToken},id.eq.${cleanToken}`)
      .eq('checked_in', false)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      // Race condition caught: another gate scanned simultaneously
      const refreshed = await getRegistrationByToken(cleanToken);
      return {
        found: true,
        alreadyCheckedIn: true,
        checkedInAt: refreshed.checkedInAt,
        registration: refreshed
      };
    }

    // Increment event attended_count atomically
    try {
      await supabase.rpc('increment_event_attended', { p_event_id: current.eventId });
    } catch (e) {}

    return {
      found: true,
      alreadyCheckedIn: false,
      checkedInAt: nowIso,
      registration: {
        ...current,
        checkedIn: true,
        checkedInAt: nowIso,
        checkedInBy
      }
    };
  }

  // Local JSON Mode
  const regs = readJsonSafe(REGISTRATIONS_FILE, []);
  const reg = regs.find(r => r.token === cleanToken || r.id === cleanToken);
  if (!reg) return { found: false };

  if (reg.checkedIn) {
    return {
      found: true,
      alreadyCheckedIn: true,
      checkedInAt: reg.checkedInAt,
      registration: reg
    };
  }

  const nowIso = new Date().toISOString();
  reg.checkedIn = true;
  reg.checkedInAt = nowIso;
  reg.checkedInBy = checkedInBy;
  writeJsonSafe(REGISTRATIONS_FILE, regs);

  // Update event attended count
  const events = readJsonSafe(EVENTS_FILE, []);
  const event = events.find(e => e.id === reg.eventId);
  if (event) {
    event.attendedCount = (event.attendedCount || 0) + 1;
    writeJsonSafe(EVENTS_FILE, events);
  }

  return {
    found: true,
    alreadyCheckedIn: false,
    checkedInAt: nowIso,
    registration: reg
  };
}

// ==========================================
// 4. PASSWORD RESET TOKENS
// ==========================================
async function savePasswordResetToken(userId, tokenHash, expiresAt) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('password_reset_tokens').insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt
    });
    if (error) throw error;
    return true;
  }
  // Local fallback can store in a temp map/file
  return true;
}

// ==========================================
// 5. BANNER STORAGE
// ==========================================
async function uploadBannerToStorage(fileName, fileBuffer, mimeType) {
  if (isSupabaseConfigured) {
    const storagePath = `banners/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '')}`;
    const { data, error } = await supabase.storage
      .from('event-banners')
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) throw error;

    const { data: pubData } = supabase.storage
      .from('event-banners')
      .getPublicUrl(storagePath);

    return pubData.publicUrl;
  }

  // Fallback in local dev: return data URL
  const base64 = fileBuffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

module.exports = {
  isSupabaseConfigured,
  getUsers,
  getUserByEmail,
  createUser,
  updateUserPassword,
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getRegistrations,
  getRegistrationByToken,
  checkInAttendee,
  savePasswordResetToken,
  uploadBannerToStorage
};
