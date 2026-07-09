import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch, setDoc, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error('Please configure Firebase in .env.local first!');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importBooks() {
  console.log('--- Starting Book Import to Firestore ---');
  const booksPath = path.join(process.cwd(), 'books.json');
  
  if (!fs.existsSync(booksPath)) {
    console.error('books.json not found! Please run the crawl script first.');
    process.exit(1);
  }

  // 0. Clean up existing data first
  console.log('\nCleaning up old/messy books and categories in Firestore...');
  try {
    const booksSnapshot = await getDocs(collection(db, 'books'));
    if (booksSnapshot.size > 0) {
      console.log(`Found ${booksSnapshot.size} old books. Deleting...`);
      let deleteBatch = writeBatch(db);
      let deleteCount = 0;
      for (const docSnapshot of booksSnapshot.docs) {
        deleteBatch.delete(docSnapshot.ref);
        deleteCount++;
        if (deleteCount >= 400) {
          await deleteBatch.commit();
          deleteBatch = writeBatch(db);
          deleteCount = 0;
        }
      }
      if (deleteCount > 0) {
        await deleteBatch.commit();
      }
      console.log('Deleted old books successfully.');
    }

    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    if (categoriesSnapshot.size > 0) {
      console.log(`Found ${categoriesSnapshot.size} old categories. Deleting...`);
      const catDeleteBatch = writeBatch(db);
      categoriesSnapshot.docs.forEach((docSnapshot) => {
        catDeleteBatch.delete(docSnapshot.ref);
      });
      await catDeleteBatch.commit();
      console.log('Deleted old categories successfully.');
    }
  } catch (error) {
    console.error('Error during database cleanup:', error);
  }

  
  const booksData = JSON.parse(fs.readFileSync(booksPath, 'utf8'));
  console.log(`Loaded ${booksData.length} books from books.json.`);

  // Identify all categories present in the books
  const categoriesSet = new Set<string>();
  booksData.forEach((book: any) => {
    if (book.categories && book.categories.length > 0) {
      categoriesSet.add(book.categories[0]);
    }
  });

  const categories = Array.from(categoriesSet).map((catName) => {
    const slug = catName.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    return { name: catName, slug };
  });

  console.log(`\nImporting ${categories.length} categories...`);
  for (const cat of categories) {
    const catRef = doc(db, 'categories', cat.slug);
    await setDoc(catRef, {
      id: cat.slug,
      name: cat.name,
      slug: cat.slug,
    });
    console.log(`Category added: "${cat.name}" (${cat.slug})`);
  }

  // Import books in batches of 500
  console.log(`\nImporting ${booksData.length} books in batches...`);
  
  const batchLimit = 400; // Keep safely below the 500 limit
  let batch = writeBatch(db);
  let operationCount = 0;
  let batchIndex = 1;

  for (let i = 0; i < booksData.length; i++) {
    const rawBook = booksData[i];
    const catName = rawBook.categories && rawBook.categories.length > 0 ? rawBook.categories[0] : 'Uncategorized';
    const catSlug = categories.find((c) => c.name === catName)?.slug || 'uncategorized';

    // Map to Book schema
    const bookPayload = {
      id: rawBook.id,
      title: rawBook.title,
      author: rawBook.authors.join(', '),
      category: catSlug,
      price: rawBook.price,
      oldPrice: rawBook.oldPrice || null,
      description: rawBook.description,
      imageUrl: rawBook.thumbnail,
      quantity: rawBook.quantity,
      sold: rawBook.sold,
      createdAt: rawBook.createdAt,
      // Extra detailed fields requested
      isbn: rawBook.isbn,
      publisher: rawBook.publisher,
      publishedDate: rawBook.publishedDate,
      pageCount: rawBook.pageCount,
      language: rawBook.language,
      rating: rawBook.rating,
    };

    const bookRef = doc(db, 'books', rawBook.id);
    batch.set(bookRef, bookPayload);
    operationCount++;

    if (operationCount >= batchLimit || i === booksData.length - 1) {
      console.log(`Committing batch ${batchIndex}...`);
      await batch.commit();
      console.log(`Batch ${batchIndex} committed successfully.`);
      
      // Start a new batch
      batch = writeBatch(db);
      operationCount = 0;
      batchIndex++;
    }
  }

  console.log('\nBook import process completed successfully!');
  process.exit(0);
}

importBooks();
