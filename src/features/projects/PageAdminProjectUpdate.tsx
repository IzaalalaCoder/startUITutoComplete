import { Button, Heading, SkeletonText, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { ErrorPage } from '@/components/ErrorPage';
import { Form } from '@/components/Form';
import { LoaderFull } from '@/components/LoaderFull';
import { toastCustom } from '@/components/Toast';
import { AdminBackButton } from '@/features/admin/AdminBackButton';
import { AdminCancelButton } from '@/features/admin/AdminCancelButton';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
  AdminLayoutPageTopBar,
} from '@/features/admin/AdminLayoutPage';
import { ProjectForm } from '@/features/projects/ProjectForm';
import {
  FormFieldsProject,
  zFormFieldsProject,
} from '@/features/projects/schemas';
import { trpc } from '@/lib/trpc/client';
import { isErrorDatabaseConflict } from '@/lib/trpc/errors';

export default function PageAdminProjectUpdate() {
  const trpcUtils = trpc.useUtils();

  const params = useParams();
  const router = useRouter();
  const project = trpc.projects.getById.useQuery(
    {
      id: params?.id?.toString() ?? '',
    },
    {
      staleTime: Infinity,
    }
  );

  const isReady = !project.isFetching;

  const updateProject = trpc.projects.updateById.useMutation({
    onSuccess: async () => {
      await trpcUtils.projects.invalidate();
      toastCustom({
        status: 'success',
        title: 'Updated with success',
      });
      router.back();
    },
    onError: (error) => {
      if (isErrorDatabaseConflict(error, 'name')) {
        form.setError('name', { message: 'Name already used' });
        return;
      }
      toastCustom({
        status: 'error',
        title: 'Update failed',
      });
    },
  });

  const form = useForm<FormFieldsProject>({
    resolver: zodResolver(zFormFieldsProject()),
    values: {
      name: project.data?.name ?? '',
      description: project.data?.description,
    },
  });

  return (
    <Form
      {...form}
      onSubmit={(values) => {
        if (!project.data?.id) return;
        updateProject.mutate({
          id: project.data.id,
          ...values,
        });
      }}
    >
      <AdminLayoutPage containerMaxWidth="container.md" showNavBar={false}>
        <AdminLayoutPageTopBar
          leftActions={<AdminBackButton withConfirm={form.formState.isDirty} />}
          rightActions={
            <>
              <AdminCancelButton withConfirm={form.formState.isDirty} />
              <Button
                type="submit"
                variant="@primary"
                isLoading={updateProject.isLoading || updateProject.isSuccess}
              >
                Save
              </Button>
            </>
          }
        >
          <Stack flex={1} spacing={0}>
            {project.isLoading && <SkeletonText maxW="6rem" noOfLines={2} />}
            {project.isSuccess && (
              <Heading size="sm">{project.data?.name}</Heading>
            )}
          </Stack>
        </AdminLayoutPageTopBar>
        {!isReady && <LoaderFull />}
        {isReady && project.isError && <ErrorPage />}
        {isReady && project.isSuccess && (
          <AdminLayoutPageContent>
            <ProjectForm />
          </AdminLayoutPageContent>
        )}
      </AdminLayoutPage>
    </Form>
  );
}
