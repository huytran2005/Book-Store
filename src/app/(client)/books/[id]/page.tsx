import React from 'react';
import BookDetailPageClient from '@/components/BookDetailPageClient';
import * as fs from 'fs';
import * as path from 'path';

export function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), 'books.json');
    if (fs.existsSync(filePath)) {
      const books = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return books.map((book: any) => ({
        id: book.id,
      }));
    }
  } catch (error) {
    console.error('Error generating static params for book details:', error);
  }
  return [];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <BookDetailPageClient bookId={resolvedParams.id} />;
}
