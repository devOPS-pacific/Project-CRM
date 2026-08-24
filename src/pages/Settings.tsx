import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { User, Building2, FileText, DollarSign, Image as ImageIcon, Upload, Trash2, Moon, Sun, Monitor, Calendar, HardDrive } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

type SettingsTab = 'account' | 'workspace' | 'template' | 'finance' | 'appearance';

export function Settings() {
  const { 
    currentUser, 
    organization, 
    updateOrganization,
    invoiceTemplate, 
    updateInvoiceTemplate,
    financeSettings,
    updateFinanceSettings,
    theme,
    setTheme
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [templateForm, setTemplateForm] = useState(invoiceTemplate);
  const [financeForm, setFinanceForm] = useState(financeSettings);
  const [orgName, setOrgName] = useState(organization?.name || '');
  const [orgLogoUrl, setOrgLogoUrl] = useState(organization?.logoUrl || '');
  const [googleConnected, setGoogleConnected] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;
    const unsub = onSnapshot(doc(db, 'googleAuth', currentUser.id), (doc) => {
      setGoogleConnected(doc.exists());
    });
    return () => unsub();
  }, [currentUser?.id]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        const { tokens } = event.data;
        if (currentUser?.id) {
          setDoc(doc(db, 'googleAuth', currentUser.id), {
            userId: currentUser.id,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date,
            scope: tokens.scope,
            updatedAt: new Date().toISOString()
          }).then(() => {
            setGoogleConnected(true);
            alert('Google Services connected successfully!');
          }).catch(error => {
            console.error('Error saving Google tokens:', error);
            alert('Failed to save Google connection.');
          });
        }
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        alert(`Google connection failed: ${event.data.error}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentUser?.id]);

  useEffect(() => {
    setTemplateForm(invoiceTemplate);
  }, [invoiceTemplate]);

  useEffect(() => {
    if (organization?.name) {
      setOrgName(organization.name);
    }
    if (organization?.logoUrl) {
      setOrgLogoUrl(organization.logoUrl);
    }
  }, [organization?.name, organization?.logoUrl]);

  const handleSaveWorkspace = () => {
    if (organization?.id) {
      updateOrganization(organization.id, { 
        name: orgName,
        logoUrl: orgLogoUrl
      });
      alert('Workspace settings saved successfully!');
    }
  };

  const handleWorkspaceLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrgLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTemplateForm(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTemplate = () => {
    updateInvoiceTemplate(templateForm);
    alert('Invoice template saved successfully!');
  };

  const handleConnectGoogle = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      if (!response.ok) {
        throw new Error('Failed to get Google auth URL');
      }
      const { url } = await response.json();
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        url,
        'google_auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (error: any) {
      console.error('Google connection error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleSaveFinance = () => {
    updateFinanceSettings(financeForm);
    alert('Finance settings saved successfully!');
  };

  const tabs = [
    { id: 'account', label: 'Account Settings', icon: User },
    { id: 'workspace', label: 'Workspace Settings', icon: Building2 },
    { id: 'template', label: 'Template Settings', icon: FileText },
    { id: 'finance', label: 'Finance Settings', icon: DollarSign },
    { id: 'appearance', label: 'Appearance', icon: Moon },
  ] as const;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and workspace preferences.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full",
                    activeTab === tab.id 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar fallback={currentUser?.name.charAt(0) || 'U'} size="lg" />
                  <Button variant="outline">Change Avatar</Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <Input defaultValue={currentUser?.name} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input defaultValue={currentUser?.email} disabled />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <Card>
              <CardHeader>
                <CardTitle>Workspace</CardTitle>
                <CardDescription>Manage your organization settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Workspace Logo</label>
                  <div className="flex items-center gap-4">
                    {orgLogoUrl ? (
                      <div className="relative h-20 w-20 rounded-md border border-border overflow-hidden bg-background">
                        <img src={orgLogoUrl} alt="Workspace Logo" className="h-full w-full object-contain" />
                        <button 
                          onClick={() => setOrgLogoUrl('')}
                          className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-1 rounded-bl-md hover:bg-destructive/90"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:border-primary hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pb-2 pt-2">
                          <Upload className="mb-1 h-5 w-5 text-muted-foreground" />
                          <p className="text-[10px] text-muted-foreground">Upload</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleWorkspaceLogoUpload} />
                      </label>
                    )}
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium">Recommended size: 200x200px</p>
                      <p>PNG, JPG or SVG. Max 1MB.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Organization Name</label>
                  <Input 
                    value={orgName} 
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveWorkspace}>Update Workspace</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle>Google Services Integration</CardTitle>
                  <CardDescription>Connect Google Calendar and Drive to sync tasks and manage assets.</CardDescription>
                </div>
                {googleConnected ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 flex gap-1.5 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    Sync Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-muted-foreground">Disconnected</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-background shadow-sm border border-border">
                      <svg viewBox="0 0 24 24" className="h-6 w-6">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Google Workspace</h4>
                      <p className="text-xs text-muted-foreground">
                        {googleConnected 
                          ? 'Successfully connected to your Google account.' 
                          : 'Sync tasks to Calendar and use Drive for assets.'}
                      </p>
                    </div>
                  </div>
                  {googleConnected ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Connected
                    </Badge>
                  ) : (
                    <Button variant="outline" onClick={handleConnectGoogle}>
                      Connect Google
                    </Button>
                  )}
                </div>

                {googleConnected && (
                  <div className="grid gap-4 md:grid-cols-2">
                     <div className="flex items-center gap-3 p-3 border border-border rounded-md bg-background">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Calendar Sync</p>
                        <p className="text-xs text-muted-foreground">Sync deadlines to your calendar</p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <div className="flex items-center gap-3 p-3 border border-border rounded-md bg-background">
                      <HardDrive className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Google Drive</p>
                        <p className="text-xs text-muted-foreground">Manage project assets</p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

          {activeTab === 'template' && (
            <Card>
              <CardHeader>
                <CardTitle>Invoice Template</CardTitle>
                <CardDescription>Configure the default details that appear on your invoices.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Invoice Logo / Image</label>
                  <div className="flex items-center gap-4">
                    {templateForm.logoUrl ? (
                      <div className="relative h-20 w-20 rounded-md border border-border overflow-hidden bg-background">
                        <img src={templateForm.logoUrl} alt="Invoice Logo" className="h-full w-full object-contain" />
                        <button 
                          onClick={() => setTemplateForm(prev => ({ ...prev, logoUrl: '' }))}
                          className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-1 rounded-bl-md hover:bg-destructive/90"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:border-primary hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pb-2 pt-2">
                          <Upload className="mb-1 h-5 w-5 text-muted-foreground" />
                          <p className="text-[10px] text-muted-foreground">Upload</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </label>
                    )}
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium">Recommended size: 200x200px</p>
                      <p>PNG, JPG or SVG. Max 1MB.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Company Name</label>
                    <Input 
                      value={templateForm.companyName} 
                      onChange={(e) => setTemplateForm({ ...templateForm, companyName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tax ID / VAT Number</label>
                    <Input 
                      value={templateForm.taxId || ''} 
                      onChange={(e) => setTemplateForm({ ...templateForm, taxId: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Company Address</label>
                    <Textarea 
                      value={templateForm.companyAddress} 
                      onChange={(e) => setTemplateForm({ ...templateForm, companyAddress: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Default Due Days</label>
                    <Input 
                      type="number" 
                      value={templateForm.defaultDueDays} 
                      onChange={(e) => setTemplateForm({ ...templateForm, defaultDueDays: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Default Notes</label>
                    <Textarea 
                      value={templateForm.notes} 
                      onChange={(e) => setTemplateForm({ ...templateForm, notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Footer Text</label>
                    <Input 
                      value={templateForm.footer} 
                      onChange={(e) => setTemplateForm({ ...templateForm, footer: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveTemplate}>Save Template</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Finance Settings</CardTitle>
                  <CardDescription>Configure global finance and billing preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Currency</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={financeForm.currency}
                        onChange={(e) => setFinanceForm({ ...financeForm, currency: e.target.value })}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="AUD">AUD ($)</option>
                        <option value="CAD">CAD ($)</option>
                        <option value="NZD">NZD ($)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Default Tax Rate (%)</label>
                      <Input 
                        type="number" 
                        step="0.1"
                        value={financeForm.taxRate} 
                        onChange={(e) => setFinanceForm({ ...financeForm, taxRate: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveFinance}>Save Finance Settings</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the platform looks for you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-foreground">Theme</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all",
                        theme === 'light'
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/25"
                      )}
                    >
                      <div className="flex h-12 w-full items-center justify-center rounded-md bg-white shadow-sm border border-slate-200">
                        <Sun className="h-6 w-6 text-slate-900" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Light</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all",
                        theme === 'dark'
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/25"
                      )}
                    >
                      <div className="flex h-12 w-full items-center justify-center rounded-md bg-[#080066] shadow-sm border border-[#4e4775]">
                        <Moon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Dark</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-12 pt-8 border-t border-border flex flex-col items-center gap-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
            <p className="text-xs text-muted-foreground/60">
              © 2026 Nexus Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
