import TripList from '@/components/Listing';
import { API_URL, API_URL_SERVER } from '@/lib/api';

export const dynamic = 'force-dynamic';

const CATEGORY_IMAGES = {
  'nepal-trekking': 'hero-everest',
  'nepal-tours': 'kathmandu-valley',
  bhutan: 'bhutan-paro',
  tibet: 'lhasa-tibet',
  india: 'ladakh-india',
  'peak-climbing': 'island-peak',
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const res = await fetch(`${API_URL_SERVER}/api/categories`, { cache: 'no-store' }).catch(() => null);
  const cats = res?.ok ? await res.json() : [];
  const cat = cats.find((c) => c.slug === slug);
  return { title: cat ? cat.name : 'Destination' };
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = String(slug);
  const heroImage = `${API_URL}/uploads/media/${CATEGORY_IMAGES[category] || 'hero-everest'}.svg`;

  return (
    <TripList
      base="/destinations"
      sp={{ ...sp, category }}
      title="Destination Packages"
      heroImage={heroImage}
    />
  );
}