'use client';

import { Suspense } from 'react';

import PageAdminProjectCreate from '@/features/projects/PageAdminProjectCreate';

export default function Page() {
  return (
    <Suspense>
      <PageAdminProjectCreate />
    </Suspense>
  );
}
