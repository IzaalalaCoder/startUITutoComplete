import {
  Button,
  Flex,
  HStack,
  Heading,
  LinkBox,
  LinkOverlay,
  Stack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { LuPlus } from 'react-icons/lu';

import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListText,
} from '@/components/DataList';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SearchInput } from '@/components/SearchInput';
import { trpc } from '@/lib/trpc/client';

import {
  AdminLayoutPage,
  AdminLayoutPageContent,
} from '../admin/AdminLayoutPage';
import { ROUTES_PROJECTS } from './routes';

export default function PageAdminProjects() {
  const [searchTerm, setSearchTerm] = useQueryState('s', { defaultValue: '' });
  const projects = trpc.projects.getAll.useInfiniteQuery(
    {
      searchTerm,
      limit: 5,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <AdminLayoutPage>
      <AdminLayoutPageContent>
        <Stack>
          <HStack spacing={4} alignItems={{ base: 'end', md: 'center' }}>
            <Flex
              flexDirection={{ base: 'column', md: 'row' }}
              alignItems={{ base: 'start', md: 'center' }}
              gap={4}
              flex={1}
            >
              <Heading flex="none" size="md">
                Projects
              </Heading>
              <SearchInput
                value={searchTerm}
                onChange={(value) => setSearchTerm(value || null)}
                size="sm"
                maxW={{ base: 'none', md: '20rem' }}
              />
            </Flex>
            <ResponsiveIconButton
              as={Link}
              href={ROUTES_PROJECTS.admin.create()}
              variant="@primary"
              size="sm"
              icon={<LuPlus />}
            >
              Create Project
            </ResponsiveIconButton>
          </HStack>

          <DataList>
            {projects.isLoading && <DataListLoadingState />}
            {projects.isError && (
              <DataListErrorState retry={() => projects.refetch()} />
            )}
            {projects.isSuccess &&
              !projects.data.pages.flatMap((p) => p.items).length && (
                <DataListEmptyState searchTerm={searchTerm} />
              )}
            {projects.data?.pages
              .flatMap((p) => p.items)
              .map((project) => (
                <DataListRow as={LinkBox} key={project.id} withHover>
                  <DataListCell>
                    <DataListText fontWeight="bold">
                      <LinkOverlay
                        as={Link}
                        href={ROUTES_PROJECTS.admin.project({ id: project.id })}
                      >
                        {project.name}
                      </LinkOverlay>
                    </DataListText>
                  </DataListCell>
                  <DataListCell>
                    <DataListText color="text-dimmed">
                      {project.description}
                    </DataListText>
                  </DataListCell>
                </DataListRow>
              ))}
            {projects.isSuccess && (
              <DataListRow mt="auto">
                <DataListCell>
                  <Button
                    size="sm"
                    onClick={() => projects.fetchNextPage()}
                    isLoading={projects.isFetchingNextPage}
                    isDisabled={!projects.hasNextPage}
                  >
                    Load more
                  </Button>
                </DataListCell>
              </DataListRow>
            )}
          </DataList>
        </Stack>
      </AdminLayoutPageContent>
    </AdminLayoutPage>
  );
}
