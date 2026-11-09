'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin';
import BlogForm from '@/components/admin/BlogForm';

export default function EditBlogPost({ params }) {
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.resolve(params).then(async ({ id }) => {
      try {
        const posts = await adminFetch('/api/blog-posts');
        const found = posts.find((p) => String(p.id) === String(id));
        if (!found) return setNotFound(true);
        const detail = await adminFetch(`/api/blog-posts/${found.slug}`);
        setPost(detail);
      } catch {
        setNotFound(true);
      }
    });
  }, [params]);

  if (notFound) {
    return (
      <div className="empty-state">
        <h3>Post not found</h3>
        <Link className="admin-btn" style={{ marginTop: 14, textDecoration: 'none' }} href="/admin/blog">Back to list</Link>
      </div>
    );
  }

  if (!post) return <div className="empty-state">Loading...</div>;

  return <BlogForm key={post.id} initial={post} />;
}