'use client';

import { Suspense } from 'react';

import PageAdminProjects from '@/features/projects/PageAdminProjects';

export default function Page() {
  return (
    <Suspense>
      <PageAdminProjects />
    </Suspense>
  );
}
