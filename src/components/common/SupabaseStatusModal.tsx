import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertTriangle, Key, Copy, Download, RefreshCw, X, ExternalLink, Activity } from 'lucide-react';
import { isSupabaseConfigured, saveSupabaseCredentials, clearSupabaseCredentials, getSupabaseConfig, testSupabaseConnection } from '../../lib/supabase';
import { useSchool } from '../../context/SchoolContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { resetToSeedData } = useSchool();
  const currentConfig = getSupabaseConfig();
  const configured = isSupabaseConfigured();

  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && anonKey.trim()) {
      saveSupabaseCredentials(url, anonKey);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleTest = async () => {
    setTestingConnection(true);
    setTestResult(null);
    const res = await testSupabaseConnection();
    setTestingConnection(false);
    setTestResult(res);
  };

  const handleClear = () => {
    clearSupabaseCredentials();
    const cfg = getSupabaseConfig();
    setUrl(cfg.url);
    setAnonKey(cfg.anonKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const copySqlLocation = () => {
    navigator.clipboard.writeText('supabase/migrations/20261007_init_school_system.sql');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">Supabase PostgreSQL Bağlantısı</h3>
              <p className="text-xs text-slate-500">Cloud Veritabanı & RLS Entegrasyonu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="my-5 p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/60 text-sm">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-950">Canlı Supabase Projeniz Bağlandı</p>
              <p className="text-emerald-800 text-xs mt-1 font-mono break-all">
                URL: {url}
              </p>
              <p className="text-emerald-700 text-xs mt-1">
                Kullanıcı tarafından sağlanan Supabase anahtarları sisteme başarıyla tanımlandı ve istemci aktif edildi.
              </p>
            </div>
          </div>
        </div>

        {/* Test Connection Button */}
        <div className="mb-5 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Canlı Bağlantı Durumu</span>
            <span className="text-[11px] text-slate-500">Supabase API uç noktasına anlık istek atarak doğrula</span>
          </div>
          <button
            type="button"
            onClick={handleTest}
            disabled={testingConnection}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{testingConnection ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}</span>
          </button>
        </div>

        {testResult && (
          <div
            className={`mb-5 p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{testResult.success ? 'Bağlantı Başarılı' : 'Bağlantı Uyarısı'}</p>
              <p className="mt-0.5 opacity-90">{testResult.message}</p>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              SUPABASE URL (NEXT_PUBLIC_SUPABASE_URL)
            </label>
            <input
              type="url"
              placeholder="https://erynemfytryhoktxunhi.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              SUPABASE PUBLISHABLE / ANON KEY (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="sb_publishable_..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-xs"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Public anon veya publishable anahtardır. Client-side güvenlidir.
            </p>
          </div>

          {savedSuccess && (
            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Ayarlar başarıyla kaydedildi!
            </p>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              Bağlantıyı Yenile & Kaydet
            </button>
          </div>
        </form>

        {/* Database Migration Reference */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">PostgreSQL Migration Dosyası</span>
            <button
              onClick={copySqlLocation}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedSql ? 'Yol Kopyalandı' : 'Dosya Yolunu Kopyala'}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Projede tam şema (<code className="font-mono text-emerald-700">supabase/migrations/20261007_init_school_system.sql</code>) ve test tohumu (<code className="font-mono text-emerald-700">supabase/seed.sql</code>) mevcuttur. Supabase Dashboard &gt; SQL Editor içerisine yapıştırarak tabloları ve RLS kurallarını tek tıkla oluşturabilirsiniz.
          </p>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={resetToSeedData}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Demo Verilerini Sıfırla (Fabrika Ayarları)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
