import React, { useState } from 'react';
import { FileText, Search, Filter, ShieldCheck, CheckCircle2, User, Clock } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const MudurAuditLog: React.FC = () => {
  const { activityLogs } = useSchool();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredLogs = activityLogs.filter((log) => {
    if (roleFilter !== 'all' && log.user_role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.user_name.toLowerCase().includes(q) ||
        log.target_entity.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Sistem Aktivite Günlüğü (Audit Trail)</h2>
          <p className="text-xs text-slate-500">
            Müdür ve öğretmenlerin gerçekleştirdiği tüm kayıt, yoklama ve müfredat işlemleri
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Kayıtlar Değiştirilemez & Saklanır</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Aktivite, kullanıcı veya işlem ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700 cursor-pointer w-full sm:w-auto"
        >
          <option value="all">Tüm Roller</option>
          <option value="mudur">Müdür İşlemleri</option>
          <option value="ogretmen">Öğretmen İşlemleri</option>
        </select>
      </div>

      {/* Activity Log List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Toplam {filteredLogs.length} İşlem Kaydı</span>
          <span>Son İşlemler Önce</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">Aramaya uygun aktivite bulunamadı.</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{log.user_name}</span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {log.user_role}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">{log.created_at}</span>
                  </div>

                  <p className="text-xs font-semibold text-emerald-800 mt-1">{log.target_entity}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{log.details}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
