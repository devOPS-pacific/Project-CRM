import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';
import { sanitizeForFirestore } from '../lib/utils';
import {
  User,
  Organization,
  Client,
  Contact,
  Deal,
  Project,
  Board,
  BoardGroup,
  Task,
  TimeEntry,
  ResourceAllocation,
  TaskStatus,
  TaskPriority,
  DealStage,
  Invoice,
  InvoiceStatus,
  InvoiceTemplate,
  FinanceSettings,
} from '../types';

interface AppState {
  currentUser: User | null;
  organization: Organization | null;
  users: User[];
  clients: Client[];
  contacts: Contact[];
  deals: Deal[];
  projects: Project[];
  boards: Board[];
  boardGroups: BoardGroup[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  allocations: ResourceAllocation[];
  invoices: Invoice[];
  invoiceTemplate: InvoiceTemplate;
  financeSettings: FinanceSettings;
  theme: 'light' | 'dark';
  dismissedNotifications: string[];

  // Actions
  login: (user: User) => void;
  logout: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  dismissNotification: (id: string) => void;
  addUser: (user: Omit<User, 'id' | 'organizationId'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  removeUser: (id: string) => void;
  addProject: (name: string, clientId?: string, budget?: number, startDate?: string, endDate?: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addTask: (groupId: string, title: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTaskPriority: (taskId: string, priority: TaskPriority) => void;
  addBoardGroup: (boardId: string, name: string, color: string) => void;
  updateBoardGroupsOrder: (groups: BoardGroup[]) => void;
  addClient: (clientData: Omit<Client, 'id' | 'organizationId' | 'createdAt'>, contactData?: Omit<Contact, 'id' | 'clientId' | 'name'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  removeClient: (id: string) => Promise<void>;
  addDeal: (name: string, clientId: string, value: number, stage: DealStage) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  updateDealStage: (dealId: string, stage: DealStage) => void;
  logTime: (projectId: string, hours: number, date: string, description?: string, billable?: boolean) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  sendInvoice: (id: string, email: string) => void;
  updateInvoiceTemplate: (template: Partial<InvoiceTemplate>) => void;
  updateFinanceSettings: (settings: Partial<FinanceSettings>) => void;
  addAllocation: (allocation: Omit<ResourceAllocation, 'id'>) => void;
  updateAllocation: (id: string, updates: Partial<ResourceAllocation>) => void;
  removeAllocation: (id: string) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
}

const MOCK_ORG_ID = 'org-1';

const initialInvoiceTemplate: InvoiceTemplate = {
  companyName: 'Nexus Workspace',
  companyAddress: '123 Business Rd.\nTech City, TC 12345',
  taxId: 'TAX-987654321',
  defaultDueDays: 30,
  notes: 'Thank you for your business!',
  footer: 'Thank you for your business.',
};

const initialFinanceSettings: FinanceSettings = {
  currency: 'USD',
  taxRate: 0,
};

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  organization: { id: MOCK_ORG_ID, name: 'Nexus Workspace' },
  users: [],
  clients: [],
  contacts: [],
  deals: [],
  projects: [],
  boards: [],
  boardGroups: [],
  tasks: [],
  timeEntries: [],
  allocations: [],
  invoices: [],
  invoiceTemplate: initialInvoiceTemplate,
  financeSettings: initialFinanceSettings,
  theme: (typeof window !== 'undefined' && localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  dismissedNotifications: (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('dismissedNotifications') || '[]')) || [],

  login: (user) => set({ currentUser: user }),
  
  logout: () => set({ currentUser: null }),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  dismissNotification: (id) => set((state) => {
    const next = [...state.dismissedNotifications, id];
    localStorage.setItem('dismissedNotifications', JSON.stringify(next));
    return { dismissedNotifications: next };
  }),

  addUser: async (userData) => {
    const id = uuidv4();
    const newUser = {
      ...userData,
      id,
      organizationId: get().organization?.id || MOCK_ORG_ID,
    };
    try {
      await setDoc(doc(db, 'users', id), sanitizeForFirestore(newUser));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${id}`);
    }
  },

  updateUser: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'users', id), sanitizeForFirestore(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${id}`);
    }
  },

  removeUser: async (id) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${id}`);
    }
  },

  addProject: async (name, clientId, budget, startDate, endDate) => {
    const projectId = uuidv4();
    const newProject: Project = {
      id: projectId,
      name,
      clientId,
      status: 'active',
      budget,
      startDate,
      endDate,
      organizationId: get().organization?.id || MOCK_ORG_ID,
      createdAt: new Date().toISOString(),
    };
    
    const boardId = uuidv4();
    const newBoard: Board = { id: boardId, projectId, name: 'Main Tasks' };
    const newGroups: BoardGroup[] = [
      { id: uuidv4(), boardId, name: 'To Do', color: '#cbd5e1', order: 0 },
      { id: uuidv4(), boardId, name: 'In Progress', color: '#3b82f6', order: 1 },
      { id: uuidv4(), boardId, name: 'Blocked', color: '#ef4444', order: 2 },
      { id: uuidv4(), boardId, name: 'Done', color: '#22c55e', order: 3 },
    ];

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'projects', projectId), sanitizeForFirestore(newProject));
      batch.set(doc(db, 'boards', boardId), sanitizeForFirestore(newBoard));
      newGroups.forEach(group => {
        batch.set(doc(db, 'boardGroups', group.id), sanitizeForFirestore(group));
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `projects/${projectId}`);
    }
  },

  updateProject: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'projects', id), sanitizeForFirestore(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${id}`);
    }
  },

  removeProject: async (id) => {
    const boards = get().boards.filter(b => b.projectId === id);
    const boardIds = boards.map(b => b.id);
    const groups = get().boardGroups.filter(g => boardIds.includes(g.boardId));
    const groupIds = groups.map(g => g.id);
    const tasks = get().tasks.filter(t => groupIds.includes(t.groupId));
    const timeEntries = get().timeEntries.filter(te => te.projectId === id);
    const allocations = get().allocations.filter(a => a.projectId === id);
    const invoices = get().invoices.filter(i => i.projectId === id);

    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'projects', id));
      boards.forEach(b => batch.delete(doc(db, 'boards', b.id)));
      groups.forEach(g => batch.delete(doc(db, 'boardGroups', g.id)));
      tasks.forEach(t => batch.delete(doc(db, 'tasks', t.id)));
      timeEntries.forEach(te => batch.delete(doc(db, 'timeEntries', te.id)));
      allocations.forEach(a => batch.delete(doc(db, 'allocations', a.id)));
      invoices.forEach(i => batch.delete(doc(db, 'invoices', i.id)));
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
    }
  },

  addTask: async (groupId, title) => {
    const id = uuidv4();
    const newTask = {
      id,
      groupId,
      title,
      status: 'todo',
      priority: 'medium',
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'tasks', id), sanitizeForFirestore(newTask));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `tasks/${id}`);
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), sanitizeForFirestore(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  },

  updateTaskStatus: async (taskId, status) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return;

    let updates: Partial<Task> = { status };

    // Synchronize groupId if the task is on a board
    if (task.groupId) {
      const currentGroup = get().boardGroups.find(g => g.id === task.groupId);
      if (currentGroup) {
        const boardId = currentGroup.boardId;
        const groupsInBoard = get().boardGroups.filter(g => g.boardId === boardId);
        
        // Map status to group name
        let targetGroupName = '';
        switch (status) {
          case 'todo': targetGroupName = 'To Do'; break;
          case 'in_progress': targetGroupName = 'In Progress'; break;
          case 'blocked': targetGroupName = 'Blocked'; break;
          case 'done': targetGroupName = 'Done'; break;
          case 'review': targetGroupName = 'Review'; break;
        }

        if (targetGroupName) {
          const targetGroup = groupsInBoard.find(g => g.name === targetGroupName);
          if (targetGroup) {
            updates.groupId = targetGroup.id;
          }
        }
      }
    }

    try {
      await updateDoc(doc(db, 'tasks', taskId), sanitizeForFirestore(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  },

  updateTaskPriority: async (taskId, priority) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { priority });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  },

  addBoardGroup: async (boardId, name, color) => {
    const id = uuidv4();
    const groups = get().boardGroups.filter(g => g.boardId === boardId);
    const maxOrder = groups.reduce((max, g) => Math.max(max, g.order), -1);
    const newGroup: BoardGroup = {
      id,
      boardId,
      name,
      color,
      order: maxOrder + 1,
    };
    try {
      await setDoc(doc(db, 'boardGroups', id), sanitizeForFirestore(newGroup));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `boardGroups/${id}`);
    }
  },

  updateBoardGroupsOrder: async (groups) => {
    try {
      const batch = writeBatch(db);
      groups.forEach((group, index) => {
        batch.update(doc(db, 'boardGroups', group.id), { order: index });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'boardGroups');
    }
  },

  addClient: async (clientData, contactData) => {
    const clientId = uuidv4();
    const newClient = {
      ...clientData,
      id: clientId,
      organizationId: get().organization?.id || MOCK_ORG_ID,
      createdAt: new Date().toISOString(),
    };
    
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'clients', clientId), sanitizeForFirestore(newClient));
      
      if (contactData && (contactData.firstName || contactData.lastName || contactData.email)) {
        const contactId = uuidv4();
        batch.set(doc(db, 'contacts', contactId), sanitizeForFirestore({
          ...contactData,
          id: contactId,
          clientId,
          name: `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim() || contactData.email,
        }));
      }
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${clientId}`);
    }
  },

  updateClient: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'clients', id), sanitizeForFirestore(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `clients/${id}`);
    }
  },

  removeClient: async (id) => {
    const clientProjects = get().projects.filter(p => p.clientId === id);
    const clientProjectIds = clientProjects.map(p => p.id);

    const boards = get().boards.filter(b => clientProjectIds.includes(b.projectId));
    const boardIds = boards.map(b => b.id);
    const groups = get().boardGroups.filter(g => boardIds.includes(g.boardId));
    const groupIds = groups.map(g => g.id);
    const tasks = get().tasks.filter(t => groupIds.includes(t.groupId));
    const timeEntries = get().timeEntries.filter(te => clientProjectIds.includes(te.projectId));
    const allocations = get().allocations.filter(a => clientProjectIds.includes(a.projectId));
    const invoices = get().invoices.filter(i => clientProjectIds.includes(i.projectId));

    const contacts = get().contacts.filter(c => c.clientId === id);
    const deals = get().deals.filter(d => d.clientId === id);

    try {
      const batch = writeBatch(db);
      
      // Delete client doc itself
      batch.delete(doc(db, 'clients', id));

      // Delete associated contacts and deals
      contacts.forEach(c => batch.delete(doc(db, 'contacts', c.id)));
      deals.forEach(d => batch.delete(doc(db, 'deals', d.id)));

      // Delete associated projects and cascading child objects
      clientProjects.forEach(p => batch.delete(doc(db, 'projects', p.id)));
      boards.forEach(b => batch.delete(doc(db, 'boards', b.id)));
      groups.forEach(g => batch.delete(doc(db, 'boardGroups', g.id)));
      tasks.forEach(t => batch.delete(doc(db, 'tasks', t.id)));
      timeEntries.forEach(te => batch.delete(doc(db, 'timeEntries', te.id)));
      allocations.forEach(a => batch.delete(doc(db, 'allocations', a.id)));
      invoices.forEach(i => batch.delete(doc(db, 'invoices', i.id)));

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `clients/${id}`);
    }
  },

  addDeal: async (name, clientId, value, stage) => {
    const id = uuidv4();
    const newDeal = {
      id,
      name,
      clientId,
      value,
      stage,
      ownerId: get().currentUser?.id || 'unknown',
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'deals', id), sanitizeForFirestore(newDeal));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `deals/${id}`);
    }
  },

  updateDeal: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'deals', id), sanitizeForFirestore(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `deals/${id}`);
    }
  },

  updateDealStage: async (dealId, stage) => {
    try {
      await updateDoc(doc(db, 'deals', dealId), { stage });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `deals/${dealId}`);
    }
  },

  logTime: async (projectId, hours, date, description, billable = true) => {
    const id = uuidv4();
    const newEntry = {
      id,
      projectId,
      userId: get().currentUser?.id || 'unknown',
      hours,
      date,
      description,
      billable,
    };
    try {
      await setDoc(doc(db, 'timeEntries', id), newEntry);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `timeEntries/${id}`);
    }
  },

  addInvoice: async (invoice) => {
    const id = uuidv4();
    const newInvoice = { ...invoice, id, createdAt: new Date().toISOString() };
    try {
      await setDoc(doc(db, 'invoices', id), newInvoice);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `invoices/${id}`);
    }
  },

  updateInvoice: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'invoices', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `invoices/${id}`);
    }
  },

  updateInvoiceStatus: async (id, status) => {
    try {
      await updateDoc(doc(db, 'invoices', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `invoices/${id}`);
    }
  },

  sendInvoice: async (id, email) => {
    try {
      await updateDoc(doc(db, 'invoices', id), { status: 'sent', sentToEmail: email });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `invoices/${id}`);
    }
  },

  updateInvoiceTemplate: async (template) => {
    try {
      await setDoc(doc(db, 'settings', 'invoiceTemplate'), template, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/invoiceTemplate');
    }
  },

  updateFinanceSettings: async (settings) => {
    try {
      await setDoc(doc(db, 'settings', 'financeSettings'), settings, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/financeSettings');
    }
  },

  addAllocation: async (allocation) => {
    const id = crypto.randomUUID();
    try {
      await setDoc(doc(db, 'allocations', id), { id, ...allocation });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `allocations/${id}`);
    }
  },

  updateAllocation: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'allocations', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `allocations/${id}`);
    }
  },

  removeAllocation: async (id) => {
    try {
      await deleteDoc(doc(db, 'allocations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `allocations/${id}`);
    }
  },

  updateOrganization: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'organizations', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `organizations/${id}`);
    }
  },
}));
