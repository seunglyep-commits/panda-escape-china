import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eisbuxstuqjqzxokomeq.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_QdBHqueOzcCmghyywjPmsQ_PRxz7OGM';

export function getPlayerCredentials(): { uid: string; token: string } {
  let uid = localStorage.getItem('panda_escape_uid');
  let token = localStorage.getItem('panda_escape_token');
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem('panda_escape_uid', uid);
  }
  if (!token) {
    token = crypto.randomUUID() + '-' + crypto.randomUUID();
    localStorage.setItem('panda_escape_token', token);
  }
  return { uid, token };
}

export function createRoomSupabaseClient(roomCode?: string) {
  const { uid, token } = getPlayerCredentials();
  const headers: Record<string, string> = {
    'x-player-uid': uid,
    'x-player-token': token,
  };
  if (roomCode) {
    headers['x-room-code'] = roomCode.toUpperCase().trim();
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers,
    },
  });
}

export const supabase = createRoomSupabaseClient();
