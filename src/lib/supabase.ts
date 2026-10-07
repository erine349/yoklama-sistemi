import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase configuration provided by the user
const DEFAULT_SUPABASE_URL = 'https://erynemfytryhoktxunhi.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_Wk88KWRiTUc5D93YMgucmQ_bpBxPjJX';

// Get Supabase configuration from environment, localStorage override, or default keys
export const getSupabaseConfig = () => {
  const envUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    (import.meta.env as any).NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const envKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    (import.meta.env as any).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    (import.meta.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('akademipro_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('akademipro_supabase_key') : null;

  const url = localUrl || envUrl || DEFAULT_SUPABASE_URL;
  const anonKey = localKey || envKey || DEFAULT_SUPABASE_KEY;

  return {
    url: url.trim(),
    anonKey: anonKey.trim(),
  };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 10);
};

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey } = getSupabaseConfig();
  if (url && anonKey && url.startsWith('http') && anonKey.length > 10) {
    if (!supabaseInstance) {
      try {
        supabaseInstance = createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        });
      } catch (err) {
        console.warn('Supabase client creation error:', err);
        return null;
      }
    }
    return supabaseInstance;
  }
  return null;
};

export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase istemcisi başlatılamadı.' };
  }
  try {
    const { data, error } = await client.from('classes').select('count', { count: 'exact', head: true });
    if (error) {
      // If table doesn't exist yet, it's connected but migration needed
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Supabase bağlantısı başarılı! Tabloların oluşması için migration SQL dosyasını Supabase SQL Editor’de çalıştırmalısınız.',
        };
      }
      return { success: false, message: `Bağlantı hatası: ${error.message}` };
    }
    return { success: true, message: 'Supabase veritabanına ve tablolara başarıyla bağlanıldı!' };
  } catch (err: any) {
    return { success: false, message: `Bağlantı hatası: ${err.message || 'Bilinmeyen hata'}` };
  }
};

export const saveSupabaseCredentials = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('akademipro_supabase_url', url.trim());
    localStorage.setItem('akademipro_supabase_key', anonKey.trim());
    supabaseInstance = null; // Reset so getSupabaseClient re-instantiates
  }
};

export const clearSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('akademipro_supabase_url');
    localStorage.removeItem('akademipro_supabase_key');
    supabaseInstance = null;
  }
};
