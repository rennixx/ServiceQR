'use client';

import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Save, X, QrCode, UtensilsCrossed, Download, Printer } from 'lucide-react';
import { Restaurant, Table } from '@/src/types/database';
import { GlassCard } from '@/components/ui/GlassCard';
import { createTable, updateTable, deleteTable } from '@/lib/table';
import { generateQRCodeDataURL, downloadQRCode } from '@/lib/qr';

interface TablesClientProps {
  restaurant: Restaurant;
  initialTables: Table[];
}

interface EditingTable {
  id: string | null;
  table_number: string;
  qr_code_id: string;
}

interface QRCodeModal {
  table: Table | null;
  dataURL: string;
}

export default function TablesClient({ restaurant, initialTables }: TablesClientProps) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTable, setEditingTable] = useState<EditingTable>({ id: null, table_number: '', qr_code_id: '' });
  const [saveMessage, setSaveMessage] = useState<'saved' | 'error' | null>(null);
  const [qrModal, setQrModal] = useState<QRCodeModal>({ table: null, dataURL: '' });
  const [showAllQrModal, setShowAllQrModal] = useState(false);
  const [allQrCodes, setAllQrCodes] = useState<Array<{ tableNumber: string; dataURL: string }>>([]);

  const handleCreate = () => {
    setIsCreating(true);
    setEditingTable({ id: null, table_number: '', qr_code_id: `${restaurant.slug}-table-${Date.now()}` });
  };

  const handleEdit = (table: Table) => {
    setEditingId(table.id);
    setEditingTable({ id: table.id, table_number: table.table_number, qr_code_id: table.qr_code_id });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setEditingTable({ id: null, table_number: '', qr_code_id: '' });
  };

  const handleSave = async () => {
    if (!editingTable.table_number || !editingTable.qr_code_id) {
      alert('Please fill in all fields');
      return;
    }

    try {
      if (isCreating) {
        const result = await createTable(restaurant.id, editingTable.table_number, editingTable.qr_code_id);
        if (result.success) {
          setTables([...tables, result.data as Table]);
          setIsCreating(false);
          showSaveMessage('saved');
        } else {
          alert(result.error);
        }
      } else {
        const result = await updateTable(editingTable.id!, editingTable.table_number, editingTable.qr_code_id);
        if (result.success) {
          setTables(tables.map(t => t.id === editingTable.id ? result.data as Table : t));
          setEditingId(null);
          showSaveMessage('saved');
        } else {
          alert(result.error);
        }
      }
      setEditingTable({ id: null, table_number: '', qr_code_id: '' });
    } catch (error) {
      alert('An error occurred');
    }
  };

  const handleDelete = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    try {
      const result = await deleteTable(tableId);
      if (result.success) {
        setTables(tables.filter(t => t.id !== tableId));
        showSaveMessage('saved');
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  const showSaveMessage = (type: 'saved' | 'error') => {
    setSaveMessage(type);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleShowQR = async (table: Table) => {
    const url = `${window.location.origin}/table/${restaurant.slug}/${table.qr_code_id}`;
    const dataURL = await generateQRCodeDataURL(url);
    setQrModal({ table, dataURL });
  };

  const handleDownloadQR = (dataURL: string, tableNumber: string) => {
    downloadQRCode(dataURL, `table-${tableNumber}-qr.png`);
  };

  const handleShowAllQRCodes = async () => {
    const baseUrl = window.location.origin;
    const codes = await Promise.all(
      tables.map(async (table) => {
        const url = `${baseUrl}/table/${restaurant.slug}/${table.qr_code_id}`;
        const dataURL = await generateQRCodeDataURL(url);
        return {
          tableNumber: table.table_number,
          dataURL,
        };
      })
    );
    setAllQrCodes(codes);
    setShowAllQrModal(true);
  };

  const handlePrintAllQRCodes = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - ${restaurant.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .qr-container {
              display: inline-block;
              margin: 20px;
              padding: 20px;
              border: 2px solid #000;
              text-align: center;
              page-break-inside: avoid;
            }
            .qr-image { width: 200px; height: 200px; }
            h2 { margin: 0 0 10px 0; }
            p { margin: 5px 0 0 0; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <h1 style="text-align: center;">QR Codes for ${restaurant.name}</h1>
          ${allQrCodes.map(qr => `
            <div class="qr-container">
              <h2>Table ${qr.tableNumber}</h2>
              <img src="${qr.dataURL}" class="qr-image" />
              <p>Scan to request service</p>
            </div>
          `).join('')}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getTableUrl = (qrCodeId: string) => {
    return `${window.location.origin}/table/${restaurant.slug}/${qrCodeId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_var(--primary)]">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Table Management</h1>
                <p className="text-slate-400 mt-1">{restaurant.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{tables.length}</div>
                <div className="text-xs text-slate-400">Tables</div>
              </div>

              {tables.length > 0 && (
                <button
                  onClick={handleShowAllQRCodes}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_var(--secondary)]"
                >
                  <QrCode className="w-5 h-5" />
                  All QR Codes
                </button>
              )}

              <button
                onClick={handleCreate}
                disabled={isCreating || editingId !== null}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_var(--primary)] disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                Add Table
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Creating New Table */}
          {isCreating && (
            <GlassCard className="p-6 border-2 border-primary/50">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Table Number</label>
                  <input
                    type="text"
                    value={editingTable.table_number}
                    onChange={(e) => setEditingTable({ ...editingTable, table_number: e.target.value })}
                    placeholder="e.g., 1, A1, Patio-1"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">QR Code ID</label>
                  <input
                    type="text"
                    value={editingTable.qr_code_id}
                    onChange={(e) => setEditingTable({ ...editingTable, qr_code_id: e.target.value })}
                    placeholder="Unique identifier for QR code"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Existing Tables */}
          {tables.map((table) => (
            <GlassCard key={table.id} className={`p-6 ${editingId === table.id ? 'border-2 border-primary/50' : ''}`}>
              {editingId === table.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Table Number</label>
                    <input
                      type="text"
                      value={editingTable.table_number}
                      onChange={(e) => setEditingTable({ ...editingTable, table_number: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">QR Code ID</label>
                    <input
                      type="text"
                      value={editingTable.qr_code_id}
                      onChange={(e) => setEditingTable({ ...editingTable, qr_code_id: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_var(--primary)]">
                      <QrCode className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShowQR(table)}
                        disabled={isCreating || editingId !== null}
                        className="p-2 bg-primary/50 hover:bg-primary rounded-lg transition-colors disabled:opacity-50"
                        title="View QR Code"
                      >
                        <QrCode className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleEdit(table)}
                        disabled={isCreating || editingId !== null}
                        className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Pencil className="w-4 h-4 text-slate-300" />
                      </button>
                      <button
                        onClick={() => handleDelete(table.id)}
                        disabled={isCreating || editingId !== null}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-2xl font-bold text-white">Table {table.table_number}</div>
                    <div className="text-sm text-slate-400 font-mono mt-1">{table.qr_code_id}</div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <a
                      href={getTableUrl(table.qr_code_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      {getTableUrl(table.qr_code_id)}
                    </a>
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>

        {/* Empty State */}
        {tables.length === 0 && !isCreating && (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mx-auto mb-6">
              <UtensilsCrossed className="w-12 h-12 text-slate-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">No Tables Yet</h2>
            <p className="text-slate-400 text-lg mb-6">Create your first table to get started</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_var(--primary)]"
            >
              <Plus className="w-5 h-5" />
              Add Your First Table
            </button>
          </div>
        )}

        {/* Info Card */}
        <GlassCard className="mt-12 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2">Table Management</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Add new tables with unique table numbers and QR code IDs</li>
                <li>• Click the QR icon to view and download the QR code for each table</li>
                <li>• Use "All QR Codes" to generate and print all codes at once</li>
                <li>• Print QR codes and place them at each table for customers to scan</li>
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* Save Message */}
        {saveMessage === 'saved' && (
          <div className="fixed bottom-6 right-6 px-6 py-3 bg-green-500 text-white rounded-xl shadow-lg flex items-center gap-2">
            <Save className="w-5 h-5" />
            Changes saved successfully!
          </div>
        )}

        {/* Single QR Code Modal */}
        {qrModal.table && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-sm w-full p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Table {qrModal.table.table_number}</h3>
              <p className="text-slate-400 mb-6">Scan to request service</p>

              <div className="bg-white p-4 rounded-2xl inline-block mb-6">
                <img src={qrModal.dataURL} alt="QR Code" className="w-64 h-64" />
              </div>

              <div className="text-xs text-slate-500 mb-6 break-all font-mono">
                {qrModal.table && getTableUrl(qrModal.table.qr_code_id)}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDownloadQR(qrModal.dataURL, qrModal.table?.table_number || '')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
                <button
                  onClick={() => setQrModal({ table: null, dataURL: '' })}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* All QR Codes Modal */}
        {showAllQrModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-4xl w-full max-h-[90vh] overflow-auto p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">All QR Codes</h3>
                <button
                  onClick={() => setShowAllQrModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                {allQrCodes.map((qr) => (
                  <div key={qr.tableNumber} className="text-center">
                    <div className="bg-white p-4 rounded-xl inline-block mb-2">
                      <img src={qr.dataURL} alt={`Table ${qr.tableNumber}`} className="w-32 h-32" />
                    </div>
                    <div className="text-sm font-semibold text-white">Table {qr.tableNumber}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePrintAllQRCodes}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all"
                >
                  <Printer className="w-5 h-5" />
                  Print All
                </button>
                <button
                  onClick={() => setShowAllQrModal(false)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  );
}
