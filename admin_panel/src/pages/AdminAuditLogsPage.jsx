import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAuditLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-space-lg p-gutter">
      
      {/* Title Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm">
        <h1 className="font-headline-sm text-headline-sm text-primary font-bold">
          System Audit Trail & Security Ledger
        </h1>
        <p className="text-body-sm text-on-surface-variant">
          Immutable event stream recording privileged administrative operations, ingestion changes, and payment verification.
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/40 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Operator / User</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4">Details Payload</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-mono text-[12px]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-on-surface-variant">
                    Loading security audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-on-surface-variant">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-primary">
                      <span className="bg-surface-container px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="font-bold text-on-surface block">{log.user_name || 'System Worker'}</span>
                      <span className="text-[10px] text-on-surface-variant font-mono uppercase">{log.user_role || 'system'}</span>
                    </td>
                    <td className="py-3 px-4 text-secondary">
                      {log.resource_type} {log.resource_id ? `#${log.resource_id}` : ''}
                    </td>
                    <td className="py-3 px-4 max-w-xs text-on-surface-variant truncate">
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-right text-on-surface-variant">
                      {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
