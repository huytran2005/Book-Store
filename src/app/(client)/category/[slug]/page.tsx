import React from 'react';
import CategoryPageClient from '@/components/CategoryPageClient';

// Static categories for static export params
export function generateStaticParams() {
  return [
    { slug: 'programming' },
    { slug: 'business' },
    { slug: 'science' },
    { slug: 'history' },
    { slug: 'literature' },
  ];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <CategoryPageClient slug={resolvedParams.slug} />;
}
