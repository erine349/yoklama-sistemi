import React, { useState } from 'react';
import {
  Mail,
  Lock,
  ArrowRight,
  Database,
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface Props {
  onLoginSuccess: () => void;
  onOpenSupabaseModal: () => void;
}

export const LoginPage: React.FC<Props> = ({ onLoginSuccess, onOpenSupabaseModal }) => {
  const { loginWithEmail, availableProfiles } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickFillGuide, setShowQuickFillGuide] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Lütfen e-posta adresinizi giriniz.');
      return;
    }
    if (!password) {
      setErrorMsg('Lütfen şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const success = await loginWithEmail(email, password);
    setLoading(false);

    if (success) {
      onLoginSuccess();
    } else {
      setErrorMsg('Girdiğiniz e-posta veya şifre sistemde kayıtlı bir kullanıcıyla eşleşmedi. Lütfen bilgilerinizi kontrol ediniz.');
    }
  };

  const handleFillAccount = (accountEmail: string) => {
    setEmail(accountEmail);
    setPassword('123456');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* School Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-800 items-center justify-center text-white shadow-lg mb-3 ring-4 ring-emerald-100">
          <span className="font-extrabold text-2xl tracking-tighter">AP</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Özel Akademi Koleji
        </h1>
        <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mt-0.5">
          Okul Yönetim Portalı
        </p>
        <p className="text-xs text-slate-500 mt-1">
          2026-2027 Eğitim Öğretim Yılı · Güvenli Tek Noktadan Giriş
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl rounded-3xl border border-slate-200 space-y-6">
          {/* Information Notice */}
          <div className="text-center pb-2">
            <h2 className="text-sm font-bold text-slate-900">Kullanıcı Girişi</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sistem e-posta adresinize tanımlı yetki düzeyini otomatik algılayacak ve ilgili panele yönlendirecektir.
            </p>
          </div>

          {/* Unified Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-Posta Adresi
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="ornek@akademipro.k12.tr veya veli e-posta"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Şifre</label>
                <button
                  type="button"
                  onClick={() => alert('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.')}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
                >
                  Şifremi Unuttum
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span>Beni Hatırla</span>
              </label>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Doğrulanıyor...' : 'Portala Giriş Yap'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick-Fill Sample Accounts Helper (Expandable / Non-intrusive) */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowQuickFillGuide(!showQuickFillGuide)}
              className="w-full flex items-center justify-between py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                <span>Kayıtlı Test Hesapları (Tıkla ve Doldur)</span>
              </span>
              {showQuickFillGuide ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showQuickFillGuide && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs animate-in fade-in duration-150">
                <p className="text-[10px] text-slate-500 leading-tight">
                  Aşağıdaki hesaplardan birine tıklayarak e-posta ve şifreyi otomatik doldurabilirsiniz:
                </p>

                <div className="space-y-1.5 pt-1">
                  {availableProfiles.map((p) => {
                    const roleLabel =
                      p.role === 'bolge_sorumlusu'
                        ? 'Bölge Sorumlusu'
                        : p.role === 'mudur'
                        ? 'Müdür'
                        : p.role === 'ogretmen'
                        ? 'Öğretmen'
                        : p.role === 'veli'
                        ? 'Veli'
                        : 'Öğrenci';

                    const isBolge = p.role === 'bolge_sorumlusu';

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleFillAccount(p.email)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg border text-left cursor-pointer transition-all group ${
                          isBolge
                            ? 'bg-amber-50/50 hover:bg-amber-50 border-amber-200 hover:border-amber-400'
                            : 'bg-white hover:bg-emerald-50/60 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div>
                          <p
                            className={`font-bold text-[11px] ${
                              isBolge
                                ? 'text-amber-900 group-hover:text-amber-800'
                                : 'text-slate-900 group-hover:text-emerald-800'
                            }`}
                          >
                            {p.full_name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{p.email}</p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            isBolge
                              ? 'bg-amber-100 text-amber-900 font-bold'
                              : 'bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-800 text-slate-600'
                          }`}
                        >
                          {roleLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Security & Database Status Footer */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              256-Bit SSL & KVKK Korumalı
            </span>

            <button
              type="button"
              onClick={onOpenSupabaseModal}
              className="text-slate-500 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Database className="w-3 h-3" />
              <span>{isConfigured ? 'Supabase Bağlı' : 'Veritabanı Yapılandırması'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
