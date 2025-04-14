import { Button, Heading } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Form } from '@/components/Form';
import { toastCustom } from '@/components/Toast';
import { trpc } from '@/lib/trpc/client';
import { isErrorDatabaseConflict } from '@/lib/trpc/errors';

import { AdminBackButton } from '../admin/AdminBackButton';
import { AdminCancelButton } from '../admin/AdminCancelButton';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
  AdminLayoutPageTopBar,
} from '../admin/AdminLayoutPage';
import { ProjectForm } from './ProjectForm';
import { FormFieldsProject, zFormFieldsProject } from './schemas';

export default function PageAdminProjectCreate() {
  const trpcUtils = trpc.useUtils();
  const router = useRouter();

  const createProject = trpc.projects.create.useMutation({
    onSuccess: async () => {
      await trpcUtils.projects.getAll.invalidate();
      toastCustom({
        status: 'success',
        title: 'Project created with success',
      });
      router.back();
    },
    onError: (error) => {
      if (!isErrorDatabaseConflict(error, 'name')) {
        form.setError('name', { message: 'Name already used' });
        return;
      }
      toastCustom({
        status: 'error',
        title: 'Failed to create the project',
      });
    },
  });
  const form = useForm<FormFieldsProject>({
    resolver: zodResolver(zFormFieldsProject()),
    defaultValues: {
      name: '',
      description: '',
    },
  });
  return (
    <Form
      {...form}
      onSubmit={(values) => {
        createProject.mutate(values);
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
                isLoading={createProject.isLoading || createProject.isSuccess}
              >
                Create
              </Button>
            </>
          }
        >
          <Heading size="sm">New project</Heading>
        </AdminLayoutPageTopBar>
        <AdminLayoutPageContent>
          <ProjectForm />
        </AdminLayoutPageContent>
      </AdminLayoutPage>
    </Form>
  );
}
