import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Plus, Mail, ArrowLeft, Trash2, DollarSign, TrendingUp, TrendingDown, Receipt, Image as ImageIcon, Upload, Printer, Download, Edit } from 'lucide-react';
import { cn } from '../lib/utils';
import { InvoiceItem, Invoice } from '../types';
import html2pdf from 'html2pdf.js';

export function Finances() {
  const { projects, clients, timeEntries, users, invoices, addInvoice, updateInvoice, sendInvoice, invoiceTemplate } = useStore();
  const [view, setView] = useState<'overview' | 'invoices' | 'create-invoice' | 'view-invoice' | 'edit-invoice'>('overview');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Form state for new/edit invoice
  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    projectId: '',
    number: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + (invoiceTemplate?.defaultDueDays || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [] as InvoiceItem[],
    logoUrl: invoiceTemplate?.logoUrl || '',
  });

  useEffect(() => {
    if (view === 'create-invoice') {
      setNewInvoice(prev => ({ ...prev, logoUrl: invoiceTemplate?.logoUrl || '' }));
    }
  }, [invoiceTemplate?.logoUrl, view]);

  const handleAddItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updated.amount = Number(updated.quantity) * Number(updated.rate);
          }
          return updated;
        }
        return item;
      })
    }));
  };

  const handleRemoveItem = (id: string) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleSaveInvoice = () => {
    if (!newInvoice.clientId) return alert('Please select a client');
    
    const total = newInvoice.items.reduce((sum, item) => sum + item.amount, 0);
    
    if (view === 'edit-invoice' && selectedInvoiceId) {
      updateInvoice(selectedInvoiceId, {
        clientId: newInvoice.clientId,
        projectId: newInvoice.projectId || undefined,
        number: newInvoice.number,
        issueDate: new Date(newInvoice.issueDate).toISOString(),
        dueDate: new Date(newInvoice.dueDate).toISOString(),
        items: newInvoice.items,
        total,
        logoUrl: newInvoice.logoUrl,
      });
    } else {
      addInvoice({
        clientId: newInvoice.clientId,
        projectId: newInvoice.projectId || undefined,
        number: newInvoice.number,
        issueDate: new Date(newInvoice.issueDate).toISOString(),
        dueDate: new Date(newInvoice.dueDate).toISOString(),
        items: newInvoice.items,
        total,
        status: 'draft',
        logoUrl: newInvoice.logoUrl,
      });
    }
    
    setView('invoices');
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setNewInvoice({
      clientId: invoice.clientId,
      projectId: invoice.projectId || '',
      number: invoice.number,
      issueDate: new Date(invoice.issueDate).toISOString().split('T')[0],
      dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
      items: invoice.items,
      logoUrl: invoice.logoUrl || '',
    });
    setSelectedInvoiceId(invoice.id);
    setView('edit-invoice');
  };

  const handleViewInvoice = (id: string) => {
    setSelectedInvoiceId(id);
    setView('view-invoice');
  };

  const handleExportPDF = () => {
    if (!invoiceRef.current) return;
    const element = invoiceRef.current;
    const opt = {
      margin: 0.5,
      filename: `invoice-${selectedInvoiceId}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendInvoice = (id: string, clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    const email = prompt('Enter client email address to send invoice:', `billing@${client?.name.toLowerCase().replace(/\s+/g, '')}.com`);
    if (email) {
      sendInvoice(id, email);
      alert(`Invoice sent to ${email}`);
    }
  };

  const calculateProjectFinancials = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const projectTimeEntries = timeEntries.filter(t => t.projectId === projectId);
    
    let actualCost = 0;
    projectTimeEntries.forEach(entry => {
      const user = users.find(u => u.id === entry.userId);
      const rate = user?.hourlyRate || 0;
      actualCost += entry.hours * rate;
    });

    const budget = project?.budget || 0;
    const profit = budget - actualCost;
    const margin = budget > 0 ? (profit / budget) * 100 : 0;

    return { budget, actualCost, profit, margin };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Finances</h1>
          <p className="text-sm text-muted-foreground">Manage budgets, profitability, and invoicing.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            className="flex-1 sm:flex-none"
            variant={view === 'overview' ? 'default' : 'outline'} 
            onClick={() => setView('overview')}
          >
            Overview
          </Button>
          <Button 
            className="flex-1 sm:flex-none"
            variant={view === 'invoices' ? 'default' : 'outline'} 
            onClick={() => setView('invoices')}
          >
            Invoices
          </Button>
        </div>
      </div>

      {view === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                    <h3 className="text-2xl font-bold text-foreground">
                      ${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Invoiced</p>
                    <h3 className="text-2xl font-bold text-foreground">
                      ${invoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                    <Receipt className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overall Profitability</p>
                    <h3 className="text-2xl font-bold text-foreground">
                      {(() => {
                        let totalBudget = 0;
                        let totalCost = 0;
                        projects.forEach(p => {
                          const { budget, actualCost } = calculateProjectFinancials(p.id);
                          totalBudget += budget;
                          totalCost += actualCost;
                        });
                        const margin = totalBudget > 0 ? ((totalBudget - totalCost) / totalBudget) * 100 : 0;
                        return `${margin.toFixed(1)}%`;
                      })()}
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Budgets & Profitability</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-3 font-medium">Project</th>
                      <th className="px-6 py-3 font-medium">Client</th>
                      <th className="px-6 py-3 font-medium text-right">Budget</th>
                      <th className="px-6 py-3 font-medium text-right">Actual Cost</th>
                      <th className="px-6 py-3 font-medium text-right">Profit</th>
                      <th className="px-6 py-3 font-medium text-right">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {projects.map(project => {
                      const client = clients.find(c => c.id === project.clientId);
                      const { budget, actualCost, profit, margin } = calculateProjectFinancials(project.id);
                      
                      return (
                        <tr key={project.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 font-medium text-foreground">{project.name}</td>
                          <td className="px-6 py-4 text-muted-foreground">{client?.name || '-'}</td>
                          <td className="px-6 py-4 text-right">${budget.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">${actualCost.toLocaleString()}</td>
                          <td className={`px-6 py-4 text-right font-medium ${profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                            ${profit.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Badge variant={margin >= 20 ? 'success' : margin > 0 ? 'warning' : 'destructive'}>
                              {margin.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {view === 'invoices' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button className="w-full sm:w-auto" onClick={() => setView('create-invoice')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-3 font-medium">Invoice Number</th>
                      <th className="px-6 py-3 font-medium">Client</th>
                      <th className="px-6 py-3 font-medium">Issue Date</th>
                      <th className="px-6 py-3 font-medium">Due Date</th>
                      <th className="px-6 py-3 font-medium text-right">Amount</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                          No invoices found. Create one to get started.
                        </td>
                      </tr>
                    ) : (
                      invoices.map(invoice => {
                        const client = clients.find(c => c.id === invoice.clientId);
                        
                        return (
                          <tr 
                            key={invoice.id} 
                            className="hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleViewInvoice(invoice.id)}
                          >
                            <td className="px-6 py-4 font-medium text-foreground">{invoice.number}</td>
                            <td className="px-6 py-4 text-muted-foreground">{client?.name}</td>
                            <td className="px-6 py-4 text-muted-foreground">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-muted-foreground">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right font-medium text-foreground">${invoice.total.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <Badge variant={
                                invoice.status === 'paid' ? 'success' : 
                                invoice.status === 'sent' ? 'default' : 
                                invoice.status === 'overdue' ? 'destructive' : 'secondary'
                              }>
                                {invoice.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              {invoice.status === 'draft' && (
                                <Button variant="ghost" size="sm" onClick={() => handleSendInvoice(invoice.id, invoice.clientId)}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send
                                </Button>
                              )}
                              {invoice.status === 'sent' && (
                                <span className="text-xs text-muted-foreground">Sent to {invoice.sentToEmail}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {(view === 'create-invoice' || view === 'edit-invoice') && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setView('invoices')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold text-foreground">
              {view === 'edit-invoice' ? 'Edit Invoice' : 'Create New Invoice'}
            </h2>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Invoice Logo / Image</label>
                  <div className="flex items-center gap-4">
                    {newInvoice.logoUrl ? (
                      <div className="relative h-20 w-20 rounded-md border border-border overflow-hidden bg-white">
                        <img src={newInvoice.logoUrl} alt="Invoice Logo" className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-20 w-20 rounded-md border border-dashed border-border bg-muted/50">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium">Logo is managed in Settings &gt; Invoice Template</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Client</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={newInvoice.clientId}
                    onChange={(e) => setNewInvoice({...newInvoice, clientId: e.target.value})}
                  >
                    <option value="">Select a client...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Project (Optional)</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={newInvoice.projectId}
                    onChange={(e) => setNewInvoice({...newInvoice, projectId: e.target.value})}
                  >
                    <option value="">Select a project...</option>
                    {projects.filter(p => !newInvoice.clientId || p.clientId === newInvoice.clientId).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Invoice Number</label>
                  <Input 
                    value={newInvoice.number}
                    onChange={(e) => setNewInvoice({...newInvoice, number: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Issue Date</label>
                    <Input 
                      type="date"
                      value={newInvoice.issueDate}
                      onChange={(e) => setNewInvoice({...newInvoice, issueDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Due Date</label>
                    <Input 
                      type="date"
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-border">
                <h3 className="text-lg font-medium text-foreground">Line Items</h3>
                
                <div className="space-y-3">
                  {newInvoice.items.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="flex-1">
                        <Input 
                          placeholder="Description" 
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        />
                      </div>
                      <div className="w-24">
                        <Input 
                          type="number" 
                          placeholder="Qty" 
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="w-32">
                        <Input 
                          type="number" 
                          placeholder="Rate" 
                          value={item.rate}
                          onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                        />
                      </div>
                      <div className="w-32 flex items-center h-10 px-3 bg-muted/50 rounded-md border border-input">
                        <span className="text-sm font-medium">${item.amount.toLocaleString()}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button variant="outline" onClick={handleAddItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="flex justify-end pt-6 border-t border-border">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">
                      ${newInvoice.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">
                      ${newInvoice.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button variant="outline" onClick={() => setView('invoices')}>Cancel</Button>
                <Button onClick={handleSaveInvoice}>
                  {view === 'edit-invoice' ? 'Save Changes' : 'Save Draft'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {view === 'view-invoice' && selectedInvoiceId && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between print:hidden">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setView('invoices')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-semibold text-foreground">View Invoice</h2>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                const invoice = invoices.find(i => i.id === selectedInvoiceId);
                if (invoice) handleEditInvoice(invoice);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>

          <Card className="print:shadow-none print:border-none overflow-hidden">
            <div className="bg-background text-foreground p-8 print:p-0" ref={invoiceRef}>
              {(() => {
                const invoice = invoices.find(i => i.id === selectedInvoiceId);
                if (!invoice) return null;
                const client = clients.find(c => c.id === invoice.clientId);
                
                return (
                  <div className="space-y-8">
                    <div className="flex justify-between items-start">
                      <div>
                        {invoice.logoUrl ? (
                          <img src={invoice.logoUrl} alt="Logo" className="h-16 object-contain mb-4" />
                        ) : (
                          <div className="h-16 w-16 rounded-md flex items-center justify-center mb-4 bg-muted">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <h1 className="text-3xl font-bold text-foreground">INVOICE</h1>
                        <p className="mt-1 text-muted-foreground">{invoice.number}</p>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mb-4",
                          invoice.status === 'paid' ? "bg-emerald-100 text-emerald-800" :
                          invoice.status === 'sent' ? "bg-foreground text-background" :
                          invoice.status === 'overdue' ? "bg-red-100 text-red-800" :
                          "bg-muted text-foreground"
                        )}>
                          {invoice.status.toUpperCase()}
                        </span>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p><span className="font-medium text-foreground">Issue Date:</span> {new Date(invoice.issueDate).toLocaleDateString()}</p>
                          <p><span className="font-medium text-foreground">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-border">
                      <h3 className="text-sm font-medium mb-2 text-muted-foreground">Bill To:</h3>
                      <div className="text-foreground">
                        <p className="font-semibold text-lg">{client?.name}</p>
                        {client?.billingAddress && <p>{client.billingAddress}</p>}
                      </div>
                    </div>

                    <div className="mt-8">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                          <tr>
                            <th className="px-4 py-3 font-medium">Description</th>
                            <th className="px-4 py-3 font-medium text-right">Qty</th>
                            <th className="px-4 py-3 font-medium text-right">Rate</th>
                            <th className="px-4 py-3 font-medium text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {invoice.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3 text-foreground">{item.description}</td>
                              <td className="px-4 py-3 text-right text-muted-foreground">{item.quantity}</td>
                              <td className="px-4 py-3 text-right text-muted-foreground">${item.rate.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right font-medium text-foreground">${item.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-border">
                      <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium text-foreground">
                            ${invoice.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-foreground">Total</span>
                          <span className="text-foreground">
                            ${invoice.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
