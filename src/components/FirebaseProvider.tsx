import React, { useEffect, useState } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store/useStore';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initFirestore() {
      try {
        // Ensure default organization exists
        const orgDoc = await getDoc(doc(db, 'organizations', 'org-1'));
        if (!orgDoc.exists()) {
          await setDoc(doc(db, 'organizations', 'org-1'), {
            id: 'org-1',
            name: 'Nexus Workspace',
            createdAt: new Date().toISOString()
          });
        }

        // Seed default demo accounts if not already present
        const usersRef = collection(db, 'users');
        const adminQuery = query(usersRef, where('email', '==', 'admin@nexus.io'));
        const adminSnap = await getDocs(adminQuery);
        if (adminSnap.empty) {
          await setDoc(doc(db, 'users', 'user-admin-1'), {
            id: 'user-admin-1',
            email: 'admin@nexus.io',
            password: 'password123',
            name: 'Admin User',
            role: 'admin',
            organizationId: 'org-1',
            hourlyRate: 150,
            createdAt: new Date().toISOString()
          });
        }

        const memberQuery = query(usersRef, where('email', '==', 'member@nexus.io'));
        const memberSnap = await getDocs(memberQuery);
        if (memberSnap.empty) {
          await setDoc(doc(db, 'users', 'user-member-1'), {
            id: 'user-member-1',
            email: 'member@nexus.io',
            password: 'password123',
            name: 'Team Member',
            role: 'member',
            organizationId: 'org-1',
            hourlyRate: 85,
            createdAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.warn('Initial Firestore setup or check warning:', error);
      } finally {
        setIsReady(true);
      }
    }

    initFirestore();
  }, []);

  // Sync data from Firestore to local store in real-time
  useEffect(() => {
    if (!isReady) return;

    const unsubscribes: (() => void)[] = [];

    // Sync organization
    unsubscribes.push(
      onSnapshot(doc(db, 'organizations', 'org-1'), (docSnapshot) => {
        if (docSnapshot.exists()) {
          useStore.setState({ organization: { id: docSnapshot.id, ...docSnapshot.data() } as any });
        }
      }, (error) => handleFirestoreError(error, OperationType.GET, 'organizations/org-1'))
    );

    // Sync users
    unsubscribes.push(
      onSnapshot(collection(db, 'users'), (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        useStore.setState({ users });
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'))
    );

    // Sync clients
    unsubscribes.push(
      onSnapshot(collection(db, 'clients'), (snapshot) => {
        const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        useStore.setState({ clients });
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'clients'))
    );

    // Sync contacts
    unsubscribes.push(
      onSnapshot(collection(db, 'contacts'), (snapshot) => {
        const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        useStore.setState({ contacts });
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'contacts'))
    );

    // Sync projects
    unsubscribes.push(
      onSnapshot(collection(db, 'projects'), (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        useStore.setState({ projects });
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'projects'))
    );

    // Sync tasks
    unsubscribes.push(
      onSnapshot(collection(db, 'tasks'), (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        useStore.setState({ tasks });
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'))
    );

    // Sync boards
    unsubscribes.push(
      onSnapshot(collection(db, 'boards'), (snapshot) => {
        const boards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        useStore.setState({ boards });
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'boards'))
    );

    // Sync boardGroups
    unsubscribes.push(
      onSnapshot(collection(db, 'boardGroups'), (snapshot) => {
        const boardGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        useStore.setState({ boardGroups });
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'boardGroups'))
    );

    // Sync deals
    unsubscribes.push(
      onSnapshot(collection(db, 'deals'), (snapshot) => {
        const deals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        useStore.setState({ deals });
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'deals'))
    );

    // Sync timeEntries
    unsubscribes.push(
      onSnapshot(collection(db, 'timeEntries'), (snapshot) => {
        const timeEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        useStore.setState({ timeEntries });
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'timeEntries'))
    );

    // Sync invoices
    unsubscribes.push(
      onSnapshot(collection(db, 'invoices'), (snapshot) => {
        const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        useStore.setState({ invoices });
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'invoices'))
    );

    // Sync allocations
    unsubscribes.push(
      onSnapshot(collection(db, 'allocations'), (snapshot) => {
        const allocations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        useStore.setState({ allocations });
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'allocations'))
    );

    // Sync invoiceTemplate
    unsubscribes.push(
      onSnapshot(doc(db, 'settings', 'invoiceTemplate'), (docSnapshot) => {
        if (docSnapshot.exists()) {
          useStore.setState({ invoiceTemplate: docSnapshot.data() as any });
        }
      }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/invoiceTemplate'))
    );

    // Sync financeSettings
    unsubscribes.push(
      onSnapshot(doc(db, 'settings', 'financeSettings'), (docSnapshot) => {
        if (docSnapshot.exists()) {
          useStore.setState({ financeSettings: docSnapshot.data() as any });
        }
      }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/financeSettings'))
    );

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [isReady]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-muted-foreground font-medium">Loading workspace...</p>
      </div>
    );
  }

  return <>{children}</>;
}
