import TripList from '@/components/Listing';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  return { title: sp.category ? `${sp.category} trips` : 'All Trips & Packages' };
}

export default async function PackagesPage({ searchParams }) {
  const sp = await searchParams;
  return <TripList base="/packages" sp={sp} title="All Trips & Packages" />;
}