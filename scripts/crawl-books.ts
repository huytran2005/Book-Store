import * as fs from 'fs';
import * as path from 'path';

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  isbn?: string[];
  publisher?: string[];
  publish_date?: string[];
  number_of_pages_median?: number;
  language?: string[];
  subject?: string[];
  cover_i?: number;
}

interface ProcessedBook {
  id: string;
  title: string;
  authors: string[];
  description: string;
  categories: string[];
  thumbnail: string;
  isbn: string;
  publisher: string;
  publishedDate: string;
  pageCount: number;
  language: string;
  // Generated fields
  price: number;
  oldPrice?: number;
  quantity: number;
  sold: number;
  rating: number;
  createdAt: string;
}

const CATEGORY_QUERIES = [
  { name: 'Công nghệ & Lập trình', query: 'programming', categorySlug: 'programming' },
  { name: 'Kinh doanh & Khởi nghiệp', query: 'business', categorySlug: 'business' },
  { name: 'Khoa học & Vũ trụ', query: 'science', categorySlug: 'science' },
  { name: 'Lịch sử & Triết học', query: 'history', categorySlug: 'history' },
  { name: 'Văn học & Tiểu thuyết', query: 'fiction', categorySlug: 'literature' },
];

const TARGET_COUNT = 450; // Target count of unique books
const DELAY_MS = 2000; // 2 seconds between queries to avoid blocking

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, retries = 3, delay = 2000): Promise<any> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BookStoreCrawler/1.0 (contact: admin@bookstore.com)',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Request failed. Retrying in ${delay}ms... (${retries} retries left). Error: ${error instanceof Error ? error.message : error}`);
      await sleep(delay);
      return fetchWithRetry(url, retries - 1, delay * 2);
    }
    throw error;
  }
}

function generateStats() {
  const randomBasePrice = Math.floor(Math.random() * 41) * 10000 + 100000; // 100k - 500k VND
  const discount = Math.random() > 0.7; // 30% chance of discount
  const price = randomBasePrice;
  const oldPrice = discount ? Math.round((price * (1 + (Math.random() * 0.2 + 0.1))) / 1000) * 1000 : undefined;

  const quantity = Math.floor(Math.random() * 91) + 10; // 10 - 100
  const sold = Math.floor(Math.random() * Math.min(51, quantity)); // 0 - 50, but less than quantity
  const rating = Math.round((Math.random() * 1.5 + 3.5) * 10) / 10; // 3.5 - 5.0

  return { price, oldPrice, quantity, sold, rating };
}

async function crawl() {
  console.log('--- Starting Book Crawler (Open Library API) ---');
  const uniqueBooksMap = new Map<string, ProcessedBook>();
  
  // Explicitly ask Open Library for the specific fields we need
  const fields = 'key,title,author_name,isbn,publisher,publish_date,number_of_pages_median,language,subject,cover_i';

  for (const cat of CATEGORY_QUERIES) {
    console.log(`\nQuerying for category: "${cat.name}" (query: "${cat.query}")...`);
    
    // Request up to 150 items per query to get plenty of unique books
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(cat.query)}&limit=150&fields=${fields}`;
    
    try {
      const data = await fetchWithRetry(url);
      console.log(`Fetched ${data.docs ? data.docs.length : 0} items for query: "${cat.query}"`);
      
      await sleep(DELAY_MS); // Rate limiting sleep
      
      if (data.docs) {
        let addedInQuery = 0;
        for (const doc of data.docs as OpenLibraryDoc[]) {
          // Verify required fields
          if (!doc.isbn || doc.isbn.length === 0) continue;
          
          // Get the primary ISBN (first one in list)
          const isbn = doc.isbn[0];
          
          if (uniqueBooksMap.has(isbn)) continue; // Deduplicate by ISBN
          
          const id = doc.key.replace('/works/', '');
          const title = doc.title;
          const authors = doc.author_name || ['Unknown Author'];
          const publisher = doc.publisher ? doc.publisher[0] : 'NXB Trẻ';
          const publishedDate = doc.publish_date ? doc.publish_date[0] : '2020';
          const pageCount = doc.number_of_pages_median || 250;
          const language = doc.language ? doc.language[0] : 'eng';
          
          // Cover image
          let thumbnail = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';
          if (doc.cover_i) {
            thumbnail = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
          }
          
          // Description fallback
          const description = `Cuốn sách tuyệt vời về chủ đề ${cat.name} mang tên "${title}", được viết bởi ${authors.join(', ')}. Cuốn sách cung cấp những kiến thức giá trị, thực tiễn và chuyên sâu giúp độc giả mở rộng tư duy và kiến thức trong ngành.`;
          
          const stats = generateStats();
          
          const book: ProcessedBook = {
            id,
            title,
            authors,
            description,
            categories: [cat.name],
            thumbnail,
            isbn,
            publisher,
            publishedDate,
            pageCount,
            language,
            ...stats,
            createdAt: new Date().toISOString(),
          };
          
          uniqueBooksMap.set(isbn, book);
          addedInQuery++;
          
          if (uniqueBooksMap.size >= TARGET_COUNT) {
            console.log(`\nSuccess: Target count of ${TARGET_COUNT} unique books reached!`);
            break;
          }
        }
        console.log(`Added ${addedInQuery} new unique books from this query.`);
      }
      
      console.log(`Current total unique books: ${uniqueBooksMap.size}`);
      
      if (uniqueBooksMap.size >= TARGET_COUNT) {
        break;
      }
      
    } catch (error) {
      console.error(`Error querying "${cat.query}":`, error);
    }
  }
  
  const booksList = Array.from(uniqueBooksMap.values());
  console.log(`\nFinished crawling. Total unique books collected: ${booksList.length}`);
  
  const outputPath = path.join(process.cwd(), 'books.json');
  fs.writeFileSync(outputPath, JSON.stringify(booksList, null, 2), 'utf8');
  console.log(`Data successfully written to: ${outputPath}`);
}

crawl();
