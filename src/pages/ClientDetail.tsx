import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Save, Trash2, X } from 'lucide-react';
import { Client } from '../types';

export function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, updateClient, removeClient } = useStore();
  
  const client = clients.find(c => c.id === id);
  const [formData, setFormData] = useState<Partial<Client>>(client || {});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('');

  if (!client) {
    return <div className="p-8 text-center">Client not found</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateClient(client.id, formData);
    navigate('/clients');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{client.name}</h1>
            <p className="text-sm text-muted-foreground">Edit client details</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="destructive" className="w-full sm:w-auto" onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Client
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Client / Company Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>1. Client / Company Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Core details</h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company name</label>
                <Input name="name" value={formData.name || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Industry</label>
                <Input name="industry" value={formData.industry || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company size (employees)</label>
                <Input name="companySize" value={formData.companySize || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Website</label>
                <Input name="website" value={formData.website || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Headquarters location</label>
                <Input name="headquartersLocation" value={formData.headquartersLocation || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Country / timezone</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input name="country" placeholder="Country" value={formData.country || ''} onChange={handleChange} />
                  <Input name="timezone" placeholder="Timezone" value={formData.timezone || ''} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">LinkedIn company page</label>
                <Input name="linkedinCompanyPage" value={formData.linkedinCompanyPage || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company description</label>
                <textarea 
                  name="companyDescription" 
                  value={formData.companyDescription || ''} 
                  onChange={handleChange}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Business classification</h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Client type</label>
                <select 
                  name="clientType" 
                  value={formData.clientType || ''} 
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <option value="">Select type...</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Active">Active</option>
                  <option value="Past">Past</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Client tier</label>
                <select 
                  name="clientTier" 
                  value={formData.clientTier || ''} 
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <option value="">Select tier...</option>
                  <option value="Strategic">Strategic</option>
                  <option value="Standard">Standard</option>
                  <option value="Small">Small</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Lead source</label>
                <Input name="leadSource" value={formData.leadSource || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account owner</label>
                <Input name="accountOwnerId" value={formData.accountOwnerId || ''} onChange={handleChange} />
              </div>

              <h3 className="font-medium text-foreground mt-6">Operational</h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Billing address</label>
                <Input name="billingAddress" value={formData.billingAddress || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Shipping address</label>
                <Input name="shippingAddress" value={formData.shippingAddress || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tax number / GST / VAT</label>
                <Input name="taxNumber" value={formData.taxNumber || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Legal entity name</label>
                <Input name="legalEntityName" value={formData.legalEntityName || ''} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Strategic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Key products/services they sell</label>
              <textarea 
                name="keyProductsServices" 
                value={formData.keyProductsServices || ''} 
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Target market</label>
              <textarea 
                name="targetMarket" 
                value={formData.targetMarket || ''} 
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Competitors</label>
              <textarea 
                name="competitors" 
                value={formData.competitors || ''} 
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Technology stack (comma separated)</label>
              <Input 
                name="technologyStack" 
                value={formData.technologyStack?.join(', ') || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, technologyStack: e.target.value.split(',').map(s => s.trim()) }))} 
              />
            </div>
          </CardContent>
        </Card>

        {/* 5. Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>5. Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Contract value</label>
              <Input type="number" name="contractValue" value={formData.contractValue || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Pricing model</label>
              <select 
                name="pricingModel" 
                value={formData.pricingModel || ''} 
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <option value="">Select model...</option>
                <option value="hourly">Hourly</option>
                <option value="fixed">Fixed</option>
                <option value="retainer">Retainer</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Retainer amount</label>
              <Input type="number" name="retainerAmount" value={formData.retainerAmount || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Payment terms</label>
              <Input name="paymentTerms" value={formData.paymentTerms || ''} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        {/* 7. Marketing Data */}
        <Card>
          <CardHeader>
            <CardTitle>7. Marketing Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="newsletterSubscription"
                name="newsletterSubscription" 
                checked={formData.newsletterSubscription || false} 
                onChange={(e) => setFormData(prev => ({ ...prev, newsletterSubscription: e.target.checked }))} 
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <label htmlFor="newsletterSubscription" className="text-sm font-medium text-muted-foreground">Newsletter subscription</label>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Campaign engagement</label>
              <Input name="campaignEngagement" value={formData.campaignEngagement || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Website visits</label>
              <Input type="number" name="websiteVisits" value={formData.websiteVisits || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Content downloads</label>
              <Input type="number" name="contentDownloads" value={formData.contentDownloads || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Events attended (comma separated)</label>
              <Input 
                name="eventsAttended" 
                value={formData.eventsAttended?.join(', ') || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, eventsAttended: e.target.value.split(',').map(s => s.trim()) }))} 
              />
            </div>
          </CardContent>
        </Card>

        {/* 8. Relationship Health */}
        <Card>
          <CardHeader>
            <CardTitle>8. Relationship Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Client satisfaction score</label>
              <Input type="number" name="clientSatisfactionScore" value={formData.clientSatisfactionScore || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Relationship health</label>
              <select 
                name="relationshipHealth" 
                value={formData.relationshipHealth || ''} 
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                <option value="">Select health...</option>
                <option value="Green">Green</option>
                <option value="Yellow">Yellow</option>
                <option value="Red">Red</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Risk of churn</label>
              <select 
                name="riskOfChurn" 
                value={formData.riskOfChurn || ''} 
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <option value="">Select risk...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Upsell opportunity</label>
              <Input name="upsellOpportunity" value={formData.upsellOpportunity || ''} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        {/* 9. Agency-Specific Fields */}
        <Card>
          <CardHeader>
            <CardTitle>9. Agency-Specific Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Service interests (comma separated)</label>
              <Input 
                name="serviceInterests" 
                value={formData.serviceInterests?.join(', ') || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, serviceInterests: e.target.value.split(',').map(s => s.trim()) }))} 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Tech stack (comma separated)</label>
              <Input 
                name="agencyTechStack" 
                value={formData.agencyTechStack?.join(', ') || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, agencyTechStack: e.target.value.split(',').map(s => s.trim()) }))} 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Digital maturity</label>
              <select 
                name="digitalMaturity" 
                value={formData.digitalMaturity || ''} 
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <option value="">Select maturity...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 10. Internal Agency Notes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>10. Internal Agency Notes</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Budget expectations</label>
              <textarea 
                name="budgetExpectations" 
                value={formData.budgetExpectations || ''} 
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Negotiation notes</label>
              <textarea 
                name="negotiationNotes" 
                value={formData.negotiationNotes || ''} 
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Internal project risks</label>
              <textarea 
                name="internalProjectRisks" 
                value={formData.internalProjectRisks || ''} 
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Political relationships inside client company</label>
              <textarea 
                name="politicalRelationships" 
                value={formData.politicalRelationships || ''} 
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
            </div>
          </CardContent>
        </Card>

      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg flex flex-col border border-border">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Permanently Delete Client?
              </h2>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
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
                  Are you absolutely sure you want to delete <strong className="font-semibold">{client.name}</strong>?
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
                  To confirm, please type the client's name <span className="text-destructive font-mono font-bold">"{client.name}"</span> below:
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
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmationName('');
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                disabled={deleteConfirmationName !== client.name}
                onClick={async () => {
                  if (deleteConfirmationName === client.name) {
                    await removeClient(client.id);
                    setIsDeleteModalOpen(false);
                    setDeleteConfirmationName('');
                    navigate('/clients');
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
