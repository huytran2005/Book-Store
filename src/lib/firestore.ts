import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';

// Helper for localStorage fallback
const getLocalData = (key: string): any[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(`mock_db_${key}`);
  return data ? JSON.parse(data) : [];
};

const setLocalData = (key: string, data: any[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`mock_db_${key}`, JSON.stringify(data));
};

export const firestoreService = {
  // Get all documents from a collection
  async getAll(colName: string): Promise<any[]> {
    if (!isFirebaseConfigured) {
      return getLocalData(colName);
    }
    try {
      const querySnapshot = await getDocs(collection(db, colName));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error fetching all from ${colName}:`, error);
      return getLocalData(colName);
    }
  },

  // Get a single document by ID
  async getById(colName: string, id: string): Promise<any | null> {
    if (!isFirebaseConfigured) {
      const data = getLocalData(colName);
      return data.find(item => item.id === id) || null;
    }
    try {
      const docRef = doc(db, colName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching document ${id} from ${colName}:`, error);
      const data = getLocalData(colName);
      return data.find(item => item.id === id) || null;
    }
  },

  // Add a new document with an auto-generated ID
  async add(colName: string, data: any): Promise<any> {
    const timestamp = new Date().toISOString();
    const docWithMeta = { ...data, createdAt: timestamp };

    if (!isFirebaseConfigured) {
      const localData = getLocalData(colName);
      const newId = Math.random().toString(36).substring(2, 11);
      const newDoc = { id: newId, ...docWithMeta };
      localData.push(newDoc);
      setLocalData(colName, localData);
      return newDoc;
    }
    try {
      const docRef = await addDoc(collection(db, colName), docWithMeta);
      return { id: docRef.id, ...docWithMeta };
    } catch (error) {
      console.error(`Error adding document to ${colName}:`, error);
      // Fallback
      const localData = getLocalData(colName);
      const newId = Math.random().toString(36).substring(2, 11);
      const newDoc = { id: newId, ...docWithMeta };
      localData.push(newDoc);
      setLocalData(colName, localData);
      return newDoc;
    }
  },

  // Set a document with a specific ID (create or overwrite)
  async set(colName: string, id: string, data: any): Promise<any> {
    const timestamp = new Date().toISOString();
    const docWithMeta = { ...data, id, createdAt: timestamp };

    if (!isFirebaseConfigured) {
      const localData = getLocalData(colName);
      const index = localData.findIndex(item => item.id === id);
      if (index > -1) {
        localData[index] = docWithMeta;
      } else {
        localData.push(docWithMeta);
      }
      setLocalData(colName, localData);
      return docWithMeta;
    }
    try {
      await setDoc(doc(db, colName, id), docWithMeta);
      return docWithMeta;
    } catch (error) {
      console.error(`Error setting document ${id} in ${colName}:`, error);
      // Fallback
      const localData = getLocalData(colName);
      const index = localData.findIndex(item => item.id === id);
      if (index > -1) {
        localData[index] = docWithMeta;
      } else {
        localData.push(docWithMeta);
      }
      setLocalData(colName, localData);
      return docWithMeta;
    }
  },

  // Update specific fields of a document
  async update(colName: string, id: string, data: any): Promise<void> {
    if (!isFirebaseConfigured) {
      const localData = getLocalData(colName);
      const index = localData.findIndex(item => item.id === id);
      if (index > -1) {
        localData[index] = { ...localData[index], ...data };
        setLocalData(colName, localData);
      }
      return;
    }
    try {
      const docRef = doc(db, colName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error(`Error updating document ${id} in ${colName}:`, error);
      // Fallback
      const localData = getLocalData(colName);
      const index = localData.findIndex(item => item.id === id);
      if (index > -1) {
        localData[index] = { ...localData[index], ...data };
        setLocalData(colName, localData);
      }
    }
  },

  // Delete a document
  async delete(colName: string, id: string): Promise<void> {
    if (!isFirebaseConfigured) {
      const localData = getLocalData(colName);
      const filtered = localData.filter(item => item.id !== id);
      setLocalData(colName, filtered);
      return;
    }
    try {
      const docRef = doc(db, colName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${id} from ${colName}:`, error);
      // Fallback
      const localData = getLocalData(colName);
      const filtered = localData.filter(item => item.id !== id);
      setLocalData(colName, filtered);
    }
  },

  // Query documents with a single where clause
  async queryByField(colName: string, field: string, operator: any, value: any): Promise<any[]> {
    if (!isFirebaseConfigured) {
      const localData = getLocalData(colName);
      return localData.filter(item => {
        const itemVal = item[field];
        if (operator === '==') return itemVal === value;
        if (operator === 'in') return Array.isArray(value) && value.includes(itemVal);
        return false;
      });
    }
    try {
      const q = query(collection(db, colName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error querying ${colName} by ${field}:`, error);
      // Fallback
      const localData = getLocalData(colName);
      return localData.filter(item => {
        const itemVal = item[field];
        if (operator === '==') return itemVal === value;
        if (operator === 'in') return Array.isArray(value) && value.includes(itemVal);
        return false;
      });
    }
  }
};
