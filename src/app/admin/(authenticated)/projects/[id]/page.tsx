'use client';

import { Suspense } from 'react';

import PageAdminProject from '@/features/projects/PageAdminProject';

export default function Page() {
  return (
    <Suspense>
      <PageAdminProject />
    </Suspense>
  );
}
