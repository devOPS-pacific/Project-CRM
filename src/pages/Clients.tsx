import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Search, X, Globe, Building2, Trash2 } from 'lucide-react';

export function Clients() {
  const navigate = useNavigate();
  const { clients, addClient, removeClient } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<any>(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('');
  const [newClient, setNewClient] = useState<{
    name: string;
    industry: string;
    companySize: string;
    website: string;
    headquartersLocation: string;
    country: string;
    timezone: string;
    linkedinCompanyPage: string;
    companyDescription: string;
    clientType: 'Prospect' | 'Active' | 'Past' | '';
    clientTier: 'Strategic' | 'Standard' | 'Small' | '';
    leadSource: string;
    accountOwnerId: string;
    billingAddress: string;
    shippingAddress: string;
    taxNumber: string;
    legalEntityName: string;
    // Contact fields
    contactFirstName: string;
    contactLastName: string;
    contactJobTitle: string;
    contactDepartment: string;
    contactEmail: string;
    contactPhone: string;
    contactLinkedin: string;
    contactIsDecisionMaker: boolean;
    contactIsInfluencer: boolean;
    contactIsBudgetOwner: boolean;
    contactIsTechnicalContact: boolean;
    contactIsDayToDayContact: boolean;
    contactPreferredMethod: 'Email' | 'Phone' | 'LinkedIn' | 'Other' | '';
    contactTimezone: string;
    contactLanguage: string;
    contactPersonalNotes: string;
    contactLastContactDate: string;
    contactRelationshipScore: string;
  }>({
    name: '',
    industry: '',
    companySize: '',
    website: '',
    headquartersLocation: '',
    country: '',
    timezone: '',
    linkedinCompanyPage: '',
    companyDescription: '',
    clientType: '',
    clientTier: '',
    leadSource: '',
    accountOwnerId: '',
    billingAddress: '',
    shippingAddress: '',
    taxNumber: '',
    legalEntityName: '',
    contactFirstName: '',
    contactLastName: '',
    contactJobTitle: '',
    contactDepartment: '',
    contactEmail: '',
    contactPhone: '',
    contactLinkedin: '',
    contactIsDecisionMaker: false,
    contactIsInfluencer: false,
    contactIsBudgetOwner: false,
    contactIsTechnicalContact: false,
    contactIsDayToDayContact: false,
    contactPreferredMethod: '',
    contactTimezone: '',
    contactLanguage: '',
    contactPersonalNotes: '',
    contactLastContactDate: '',
    contactRelationshipScore: '',
  });

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;

    const {
      contactFirstName,
      contactLastName,
      contactJobTitle,
      contactDepartment,
      contactEmail,
      contactPhone,
      contactLinkedin,
      contactIsDecisionMaker,
      contactIsInfluencer,
      contactIsBudgetOwner,
      contactIsTechnicalContact,
      contactIsDayToDayContact,
      contactPreferredMethod,
      contactTimezone,
      contactLanguage,
      contactPersonalNotes,
      contactLastContactDate,
      contactRelationshipScore,
      ...clientData
    } = newClient;

    addClient(
      {
        ...clientData,
        clientType: clientData.clientType || null,
        clientTier: clientData.clientTier || null,
      },
      {
        firstName: contactFirstName,
        lastName: contactLastName,
        role: contactJobTitle,
        department: contactDepartment,
        email: contactEmail,
        phone: contactPhone,
        linkedin: contactLinkedin,
        isDecisionMaker: contactIsDecisionMaker,
        isInfluencer: contactIsInfluencer,
        isBudgetOwner: contactIsBudgetOwner,
        isTechnicalContact: contactIsTechnicalContact,
        isDayToDayContact: contactIsDayToDayContact,
        preferredContactMethod: contactPreferredMethod || null,
        timezone: contactTimezone,
        language: contactLanguage,
        personalNotes: contactPersonalNotes,
        lastContactDate: contactLastContactDate,
        relationshipStrengthScore: contactRelationshipScore ? parseInt(contactRelationshipScore) : null,
      }
    );
    setIsModalOpen(false);
    setNewClient({
      name: '',
      industry: '',
      companySize: '',
      website: '',
      headquartersLocation: '',
      country: '',
      timezone: '',
      linkedinCompanyPage: '',
      companyDescription: '',
      clientType: '',
      clientTier: '',
      leadSource: '',
      accountOwnerId: '',
      billingAddress: '',
      shippingAddress: '',
      taxNumber: '',
      legalEntityName: '',
      contactFirstName: '',
      contactLastName: '',
      contactJobTitle: '',
      contactDepartment: '',
      contactEmail: '',
      contactPhone: '',
      contactLinkedin: '',
      contactIsDecisionMaker: false,
      contactIsInfluencer: false,
      contactIsBudgetOwner: false,
      contactIsTechnicalContact: false,
      contactIsDayToDayContact: false,
      contactPreferredMethod: '',
      contactTimezone: '',
      contactLanguage: '',
      contactPersonalNotes: '',
      contactLastContactDate: '',
      contactRelationshipScore: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground">Manage your client database.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Client
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search clients..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card 
            key={client.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/clients/${client.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg flex-1 truncate">{client.name}</CardTitle>
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {client.industry && <Badge variant="secondary" className="max-w-[100px] truncate">{client.industry}</Badge>}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Remove client and all client data"
                    onClick={() => setClientToDelete(client)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                {client.website && (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Globe className="h-4 w-4" />
                    <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                      {client.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Added {new Date(client.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No clients found.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-sm">
          <div className="w-full max-w-[80vw] rounded-lg bg-background p-6 shadow-lg flex flex-col max-h-[90vh] border border-border">
            <div className="mb-4 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold text-foreground">Add New Client</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddClient} className="space-y-4 overflow-y-auto px-1 flex-1">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Company Name <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Industry
                  </label>
                  <Input
                    value={newClient.industry}
                    onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                    placeholder="e.g. Technology"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Company Size
                  </label>
                  <Input
                    value={newClient.companySize}
                    onChange={(e) => setNewClient({ ...newClient, companySize: e.target.value })}
                    placeholder="e.g. 50-200"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Website
                </label>
                <Input
                  value={newClient.website}
                  onChange={(e) => setNewClient({ ...newClient, website: e.target.value })}
                  placeholder="e.g. acme.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Headquarters Location
                </label>
                <Input
                  value={newClient.headquartersLocation}
                  onChange={(e) => setNewClient({ ...newClient, headquartersLocation: e.target.value })}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Country
                  </label>
                  <Input
                    value={newClient.country}
                    onChange={(e) => setNewClient({ ...newClient, country: e.target.value })}
                    placeholder="e.g. United States"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Timezone
                  </label>
                  <Input
                    value={newClient.timezone}
                    onChange={(e) => setNewClient({ ...newClient, timezone: e.target.value })}
                    placeholder="e.g. PST"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  LinkedIn Company Page
                </label>
                <Input
                  value={newClient.linkedinCompanyPage}
                  onChange={(e) => setNewClient({ ...newClient, linkedinCompanyPage: e.target.value })}
                  placeholder="e.g. linkedin.com/company/acme"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Company Description
                </label>
                <textarea
                  value={newClient.companyDescription}
                  onChange={(e) => setNewClient({ ...newClient, companyDescription: e.target.value })}
                  placeholder="Brief description of the company..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-medium text-foreground mb-4">Business classification</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Client Type
                    </label>
                    <select 
                      value={newClient.clientType} 
                      onChange={(e) => setNewClient({ ...newClient, clientType: e.target.value as any })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select type...</option>
                      <option value="Prospect">Prospect</option>
                      <option value="Active">Active</option>
                      <option value="Past">Past</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Client Tier
                    </label>
                    <select 
                      value={newClient.clientTier} 
                      onChange={(e) => setNewClient({ ...newClient, clientTier: e.target.value as any })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select tier...</option>
                      <option value="Strategic">Strategic</option>
                      <option value="Standard">Standard</option>
                      <option value="Small">Small</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Lead Source
                    </label>
                    <Input
                      value={newClient.leadSource}
                      onChange={(e) => setNewClient({ ...newClient, leadSource: e.target.value })}
                      placeholder="e.g. Referral, Website"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Account Owner
                    </label>
                    <Input
                      value={newClient.accountOwnerId}
                      onChange={(e) => setNewClient({ ...newClient, accountOwnerId: e.target.value })}
                      placeholder="Owner Name/ID"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-medium text-foreground mb-4">Operational</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Billing Address
                    </label>
                    <Input
                      value={newClient.billingAddress}
                      onChange={(e) => setNewClient({ ...newClient, billingAddress: e.target.value })}
                      placeholder="e.g. 123 Business Rd, Suite 100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Shipping Address
                    </label>
                    <Input
                      value={newClient.shippingAddress}
                      onChange={(e) => setNewClient({ ...newClient, shippingAddress: e.target.value })}
                      placeholder="e.g. 456 Warehouse Blvd"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">
                        Tax Number / GST / VAT
                      </label>
                      <Input
                        value={newClient.taxNumber}
                        onChange={(e) => setNewClient({ ...newClient, taxNumber: e.target.value })}
                        placeholder="e.g. TAX-123456"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">
                        Legal Entity Name
                      </label>
                      <Input
                        value={newClient.legalEntityName}
                        onChange={(e) => setNewClient({ ...newClient, legalEntityName: e.target.value })}
                        placeholder="e.g. Acme Corporation LLC"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-medium text-foreground mb-4">Contacts (people)</h3>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Basic info</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">First Name</label>
                      <Input
                        value={newClient.contactFirstName}
                        onChange={(e) => setNewClient({ ...newClient, contactFirstName: e.target.value })}
                        placeholder="e.g. Jane"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Last Name</label>
                      <Input
                        value={newClient.contactLastName}
                        onChange={(e) => setNewClient({ ...newClient, contactLastName: e.target.value })}
                        placeholder="e.g. Doe"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Job Title</label>
                      <Input
                        value={newClient.contactJobTitle}
                        onChange={(e) => setNewClient({ ...newClient, contactJobTitle: e.target.value })}
                        placeholder="e.g. Marketing Director"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Department</label>
                      <Input
                        value={newClient.contactDepartment}
                        onChange={(e) => setNewClient({ ...newClient, contactDepartment: e.target.value })}
                        placeholder="e.g. Marketing"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                      <Input
                        type="email"
                        value={newClient.contactEmail}
                        onChange={(e) => setNewClient({ ...newClient, contactEmail: e.target.value })}
                        placeholder="e.g. jane@acme.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Phone</label>
                      <Input
                        value={newClient.contactPhone}
                        onChange={(e) => setNewClient({ ...newClient, contactPhone: e.target.value })}
                        placeholder="e.g. +1 555 123 4567"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">LinkedIn</label>
                    <Input
                      value={newClient.contactLinkedin}
                      onChange={(e) => setNewClient({ ...newClient, contactLinkedin: e.target.value })}
                      placeholder="e.g. linkedin.com/in/janedoe"
                    />
                  </div>

                  <h4 className="text-sm font-medium text-foreground pt-2">Relationship info</h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={newClient.contactIsDecisionMaker}
                        onChange={(e) => setNewClient({ ...newClient, contactIsDecisionMaker: e.target.checked })}
                        className="rounded border-input text-primary focus:ring-ring"
                      />
                      Decision maker
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={newClient.contactIsInfluencer}
                        onChange={(e) => setNewClient({ ...newClient, contactIsInfluencer: e.target.checked })}
                        className="rounded border-input text-primary focus:ring-ring"
                      />
                      Influencer
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={newClient.contactIsBudgetOwner}
                        onChange={(e) => setNewClient({ ...newClient, contactIsBudgetOwner: e.target.checked })}
                        className="rounded border-input text-primary focus:ring-ring"
                      />
                      Budget owner
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={newClient.contactIsTechnicalContact}
                        onChange={(e) => setNewClient({ ...newClient, contactIsTechnicalContact: e.target.checked })}
                        className="rounded border-input text-primary focus:ring-ring"
                      />
                      Technical contact
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground col-span-2">
                      <input
                        type="checkbox"
                        checked={newClient.contactIsDayToDayContact}
                        onChange={(e) => setNewClient({ ...newClient, contactIsDayToDayContact: e.target.checked })}
                        className="rounded border-input text-primary focus:ring-ring"
                      />
                      Day-to-day contact
                    </label>
                  </div>

                  <h4 className="text-sm font-medium text-foreground pt-2">Communication preferences</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Preferred Method</label>
                      <select 
                        value={newClient.contactPreferredMethod} 
                        onChange={(e) => setNewClient({ ...newClient, contactPreferredMethod: e.target.value as any })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select...</option>
                        <option value="Email">Email</option>
                        <option value="Phone">Phone</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Timezone</label>
                      <Input
                        value={newClient.contactTimezone}
                        onChange={(e) => setNewClient({ ...newClient, contactTimezone: e.target.value })}
                        placeholder="e.g. EST"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Language</label>
                      <Input
                        value={newClient.contactLanguage}
                        onChange={(e) => setNewClient({ ...newClient, contactLanguage: e.target.value })}
                        placeholder="e.g. English"
                      />
                    </div>
                  </div>

                  <h4 className="text-sm font-medium text-foreground pt-2">Notes</h4>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Personal Notes</label>
                    <textarea
                      value={newClient.contactPersonalNotes}
                      onChange={(e) => setNewClient({ ...newClient, contactPersonalNotes: e.target.value })}
                      placeholder="e.g. Met at design conference — loves AI design tools."
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Last Contact Date</label>
                      <Input
                        type="date"
                        value={newClient.contactLastContactDate}
                        onChange={(e) => setNewClient({ ...newClient, contactLastContactDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Relationship Score (1-10)</label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={newClient.contactRelationshipScore}
                        onChange={(e) => setNewClient({ ...newClient, contactRelationshipScore: e.target.value })}
                        placeholder="e.g. 8"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Client
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg flex flex-col border border-border">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Permanently Delete Client?
              </h2>
              <button
                onClick={() => {
                  setClientToDelete(null);
                  setDeleteConfirmationName('');
                }}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm font-medium">
                Warning: This action is permanent, irreversible, and will completely erase all trace of this client.
              </div>
              
              <div className="space-y-2 text-sm text-foreground">
                <p>
                  Are you absolutely sure you want to delete <strong className="font-semibold">{clientToDelete.name}</strong>?
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  To ensure complete system integrity and clean records, deleting this client will cascade-delete **ALL** associated data across the entire platform. This includes:
                </p>
                <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                  <li><strong>Core profile info</strong> (billing addresses, taxonomy and descriptions)</li>
                  <li><strong>All client contacts</strong> (associated individuals, job titles & notes)</li>
                  <li><strong>All CRM deals</strong> (pipeline values, stages and trade history)</li>
                  <li><strong>All projects & taskboards</strong> (Kanban cards, backlogs and group structures)</li>
                  <li><strong>All team time entries</strong> (hour logs and client billing details)</li>
                  <li><strong>All service/asset allocations</strong> (resource timelines details)</li>
                  <li><strong>All invoice documents</strong> (billing records history)</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-border space-y-3">
                <p className="text-xs font-semibold text-foreground">
                  To confirm, please type the client's name <span className="text-destructive font-mono font-bold">"{clientToDelete.name}"</span> below:
                </p>
                <Input
                  value={deleteConfirmationName}
                  onChange={(e) => setDeleteConfirmationName(e.target.value)}
                  placeholder="Type company name to confirm..."
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setClientToDelete(null);
                  setDeleteConfirmationName('');
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                disabled={deleteConfirmationName !== clientToDelete.name}
                onClick={async () => {
                  if (deleteConfirmationName === clientToDelete.name) {
                    await removeClient(clientToDelete.id);
                    setClientToDelete(null);
                    setDeleteConfirmationName('');
                  }
                }}
              >
                Yes, Permanently Delete All Client Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
