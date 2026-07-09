import { storage, isFirebaseConfigured } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const storageService = {
  /**
   * Uploads an image to Firebase Storage and returns its download URL.
   * If Firebase is not configured, it will convert the file to a base64 Data URL so the app remains fully functional locally.
   */
  async uploadBookImage(file: File): Promise<string> {
    if (!isFirebaseConfigured || !storage) {
      console.log('Firebase Storage not configured, using local base64 fallback');
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file as Data URL'));
        };
        reader.readAsDataURL(file);
      });
    }

    try {
      const uniqueFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(storage, `books/${uniqueFileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading book image:', error);
      // Fallback to base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  }
};
