import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
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

const CATEGORIES = [
  { name: 'Công nghệ & Lập trình', slug: 'programming' },
  { name: 'Kinh doanh & Khởi nghiệp', slug: 'business' },
  { name: 'Văn học & Tiểu thuyết', slug: 'literature' },
  { name: 'Khoa học & Vũ trụ', slug: 'science' },
  { name: 'Lịch sử & Triết học', slug: 'history' },
];

async function seedData() {
  console.log('Starting seed process...');

  // 1. Seed Categories
  console.log('Seeding categories...');
  for (const cat of CATEGORIES) {
    const catRef = doc(db, 'categories', cat.slug);
    await setDoc(catRef, {
      id: cat.slug,
      name: cat.name,
      slug: cat.slug,
    });
    console.log(`- Added category: ${cat.name}`);
  }

  // 2. Fetch books from Google Books API and seed
  console.log('Fetching books from Google Books API...');
  
  for (const cat of CATEGORIES) {
    console.log(`Fetching books for query: ${cat.name}...`);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cat.slug)}&maxResults=8&langRestrict=vi`
      );
      let data = await response.json();
      
      // If we don't get enough Vietnamese books, fetch English ones
      if (!data.items || data.items.length < 5) {
        const enResponse = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cat.slug)}&maxResults=8`
        );
        data = await enResponse.json();
      }

      if (data.items) {
        for (const item of data.items) {
          const info = item.volumeInfo;
          const id = item.id;
          
          const title = info.title;
          const author = info.authors ? info.authors.join(', ') : 'Unknown Author';
          const description = info.description || 'Không có mô tả chi tiết cho cuốn sách này.';
          
          // Get high-res image if possible
          let imageUrl = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';
          if (info.imageLinks) {
            imageUrl = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || imageUrl;
            // Force https
            if (imageUrl.startsWith('http://')) {
              imageUrl = imageUrl.replace('http://', 'https://');
            }
          }

          // Generate random prices and stats
          const randomBasePrice = Math.floor(Math.random() * 20) * 10000 + 60000; // 60k - 250k VND
          const discountPercent = Math.random() > 0.6 ? 0.2 : 0;
          const price = Math.round((randomBasePrice * (1 - discountPercent)) / 1000) * 1000;
          const oldPrice = discountPercent > 0 ? randomBasePrice : undefined;

          const quantity = Math.floor(Math.random() * 80) + 20; // 20 - 100
          const sold = Math.floor(Math.random() * 15) + 5; // 5 - 20

          const bookData = {
            id,
            title,
            author,
            category: cat.slug,
            price,
            oldPrice,
            description,
            imageUrl,
            quantity,
            sold,
            createdAt: new Date().toISOString(),
          };

          await setDoc(doc(db, 'books', id), bookData);
          console.log(`  + Seeded book: "${title}" (${cat.name})`);
        }
      }
    } catch (err) {
      console.error(`Error seeding books for ${cat.name}:`, err);
    }
  }

  console.log('Data seeding completed successfully!');
  process.exit(0);
}

seedData();
