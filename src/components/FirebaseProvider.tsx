import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useStore } from '../store/useStore';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const { login, logout } = useStore();

  useEffect(() => {
    async function testConnection() {
      try {
        await getDoc(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user exists in Firestore by email
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', user.email || ''));
          const querySnapshot = await getDocs(q);
          
          let userData;
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            userData = userDoc.data();
            if (!userData.uid) {
              await updateDoc(userDoc.ref, { uid: user.uid });
              userData.uid = user.uid;
            }
          } else {
            // Create new user
            const userRef = doc(db, 'users', user.uid);
            userData = {
              id: user.uid,
              uid: user.uid,
              email: user.email || '',
              name: user.displayName || 'New User',
              role: 'member',
              organizationId: 'org-1', // Default org
              hourlyRate: 100,
            };
            await setDoc(userRef, userData);
          }
          
          login(userData as any); // Update local store
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users');
        }
      } else {
        logout();
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, [login, logout]);

  // Sync data from Firestore to local store
  useEffect(() => {
    if (!isAuthReady || !auth.currentUser) return;

    const unsubscribes: (() => void)[] = [];

    // Sync organization
    unsubscribes.push(
      onSnapshot(doc(db, 'organizations', 'org-1'), (docSnapshot) => {
        if (docSnapshot.exists()) {
          useStore.setState({ organization: { id: docSnapshot.id, ...docSnapshot.data() } as any });
        } else {
          // Initialize organization if it doesn't exist
          setDoc(doc(db, 'organizations', 'org-1'), { name: 'Nexus Demo Workspace' })
            .catch(error => handleFirestoreError(error, OperationType.CREATE, 'organizations/org-1'));
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
  }, [isAuthReady]);

  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
  }

  return <>{children}</>;
}
