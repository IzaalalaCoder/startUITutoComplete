'use client';

import { Suspense } from 'react';

import PageAdminProjectUpdate from '@/features/projects/PageAdminProjectUpdate';

export default function Page() {
  return (
    <Suspense>
      <PageAdminProjectUpdate />
    </Suspense>
  );
}
