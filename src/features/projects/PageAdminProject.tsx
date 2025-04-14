import {
  Box,
  Card,
  CardBody,
  Heading,
  IconButton,
  SkeletonText,
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { LuPenLine, LuTrash2 } from 'react-icons/lu';

import { ConfirmText } from '@/components/ConfirmMenuItem/docs.stories';
import { ConfirmModal } from '@/components/ConfirmModal';
import { ErrorPage } from '@/components/ErrorPage';
import { LoaderFull } from '@/components/LoaderFull';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { toastCustom } from '@/components/Toast';
import { AdminBackButton } from '@/features/admin/AdminBackButton';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
  AdminLayoutPageTopBar,
} from '@/features/admin/AdminLayoutPage';
import { trpc } from '@/lib/trpc/client';

import { ROUTES_PROJECTS } from './routes';

export default function PageAdminProject() {
  const trpcUtils = trpc.useUtils();
  const router = useRouter();
  const params = useParams();
  const project = trpc.projects.getById.useQuery({
    id: params?.id?.toString() ?? '',
  });

  const projectDelete = trpc.projects.delete.useMutation({
    onSuccess: async () => {
      await trpcUtils.projects.getAll.invalidate();
      toastCustom({
        status: 'success',
        title: 'Deletion successed',
        description: 'Succed to delete the project',
      });
      router.replace(ROUTES_PROJECTS.admin.root());
    },
    onError: () => {
      toastCustom({
        status: 'error',
        title: 'Deletion failed',
        description: 'Failed to delete the project',
      });
    },
  });

  return (
    <AdminLayoutPage showNavBar="desktop" containerMaxWidth="container.md">
      <AdminLayoutPageTopBar
        leftActions={<AdminBackButton />}
        rightActions={
          <>
            <ResponsiveIconButton
              as={Link}
              href={ROUTES_PROJECTS.admin.update({
                id: project.data?.id || '',
              })}
              icon={<LuPenLine />}
            >
              Edit
            </ResponsiveIconButton>
            <ConfirmModal
              title="Confirm deleting the project"
              message={`Would you like to delete "${project.data?.name || ''}" ? Delete will be permanent.`}
              confirmText="Delete"
              onConfirm={() =>
                project.data && projectDelete.mutate({ id: project.data.id })
              }
              confirmVariant="@dangerSecondary"
            >
              <IconButton
                aria-label="Delete"
                icon={<LuTrash2 />}
                isDisabled={!project.data}
                isLoading={projectDelete.isLoading}
              />
            </ConfirmModal>
          </>
        }
      >
        {project.isLoading && <SkeletonText maxW="6rem" noOfLines={2} />}
        {project.isSuccess && <Heading size="sm">{project.data?.name}</Heading>}
      </AdminLayoutPageTopBar>
      <AdminLayoutPageContent>
        {project.isLoading && <LoaderFull />}
        {project.isError && <ErrorPage />}
        {project.isSuccess && (
          <Card>
            <CardBody>
              <Stack spacing={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">
                    Name
                  </Text>
                  <Text>{project.data.name}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">
                    Description
                  </Text>
                  <Text>{project.data.description || <small>-</small>}</Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        )}
      </AdminLayoutPageContent>
    </AdminLayoutPage>
  );
}
