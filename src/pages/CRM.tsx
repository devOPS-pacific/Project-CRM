import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Plus, Search, MoreHorizontal, X } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Deal, DealStage } from '../types';

export function CRM() {
  const { deals, clients, users, addDeal, updateDeal } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [newDeal, setNewDeal] = useState({
    name: '',
    clientId: '',
    value: 0,
    stage: 'lead' as DealStage,
  });

  const stages: DealStage[] = ['lead', 'contacted', 'proposal', 'negotiation', 'won', 'lost'];

  const filteredDeals = deals.filter(deal => 
    deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clients.find(c => c.id === deal.clientId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeal.name || !newDeal.clientId) return;
    addDeal(newDeal.name, newDeal.clientId, newDeal.value, newDeal.stage);
    setIsModalOpen(false);
    setNewDeal({ name: '', clientId: '', value: 0, stage: 'lead' });
  };

  const handleUpdateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDeal && editingDeal.name.trim()) {
      updateDeal(editingDeal.id, {
        name: editingDeal.name.trim(),
        clientId: editingDeal.clientId,
        value: editingDeal.value,
        stage: editingDeal.stage,
      });
      setEditingDeal(null);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sales Pipeline</h1>
          <p className="text-sm text-muted-foreground">Track and manage your deals across stages.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Deal
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search deals..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto sm:overflow-x-auto pb-4">
        <div className="flex flex-col sm:flex-row gap-4 h-full">
          {stages.map(stage => {
            const stageDeals = filteredDeals.filter(d => d.stage === stage);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div key={stage} className="w-full sm:w-80 shrink-0 flex flex-col bg-muted/50 rounded-xl border border-border p-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-medium text-foreground capitalize">{stage}</h3>
                  <Badge variant="secondary">{stageDeals.length}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-4 px-1">
                  ${stageTotal.toLocaleString()}
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {stageDeals.map(deal => {
                    const client = clients.find(c => c.id === deal.clientId);
                    const owner = users.find(u => u.id === deal.ownerId);

                    return (
                      <Card 
                        key={deal.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setEditingDeal(deal)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-foreground text-sm">{deal.name}</h4>
                            <button className="text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{client?.name}</p>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-sm font-semibold text-foreground">
                              ${deal.value.toLocaleString()}
                            </span>
                            {owner && (
                              <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium" title={owner.name}>
                                {owner.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-border">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Add New Deal</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddDeal} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Deal Name
                </label>
                <Input
                  required
                  value={newDeal.name}
                  onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                  placeholder="e.g. Website Redesign"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Client
                </label>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newDeal.clientId}
                  onChange={(e) => setNewDeal({ ...newDeal, clientId: e.target.value })}
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Value ($)
                </label>
                <Input
                  type="number"
                  required
                  min="0"
                  value={newDeal.value || ''}
                  onChange={(e) => setNewDeal({ ...newDeal, value: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Stage
                </label>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newDeal.stage}
                  onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value as DealStage })}
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Deal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-border">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Edit Deal</h2>
              <button
                onClick={() => setEditingDeal(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateDeal} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Deal Name
                </label>
                <Input
                  required
                  value={editingDeal.name}
                  onChange={(e) => setEditingDeal({ ...editingDeal, name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Client
                </label>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={editingDeal.clientId}
                  onChange={(e) => setEditingDeal({ ...editingDeal, clientId: e.target.value })}
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Value ($)
                </label>
                <Input
                  type="number"
                  required
                  min="0"
                  value={editingDeal.value || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, value: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Stage
                </label>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={editingDeal.stage}
                  onChange={(e) => setEditingDeal({ ...editingDeal, stage: e.target.value as DealStage })}
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setEditingDeal(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
