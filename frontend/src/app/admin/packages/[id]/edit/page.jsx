'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin';
import PackageForm from '@/components/admin/PackageForm';

export default function EditPackagePage({ params }) {
  const [pkg, setPkg] = useState(null);
  const [notFound, setNotFound] = useState(false);

useEffect(() => {
    const { id } = params;
    Promise.resolve(id).then((pid) => {
      adminFetch('/api/packages?limit=100')
        .then((data) => {
          const found = (data.packages || []).find((p) => String(p.id) === String(pid));
          if (!found) return setNotFound(true);
          return adminFetch(`/api/packages/${found.slug}`).then(setPkg);
        })
        .catch(() => setNotFound(true));
    });
  }, [params]);

  if (notFound) {
    return (
      <div className="empty-state">
        <h3>Package not found</h3>
        <Link className="admin-btn" style={{ marginTop: 14, textDecoration: 'none' }} href="/admin/packages">Back to list</Link>
      </div>
    );
  }

  if (!pkg) return <div className="empty-state">Loading...</div>;

  return <PackageForm key={pkg.id} initial={pkg} />;
}