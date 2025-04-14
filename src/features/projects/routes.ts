import { ROUTES_ADMIN } from '@/features/admin/routes';

export const ROUTES_PROJECTS = {
  admin: {
    root: () => `${ROUTES_ADMIN.baseUrl()}/projects`,
    create: () => `${ROUTES_PROJECTS.admin.root()}/create`,
    project: (params: { id: string }) =>
      `${ROUTES_PROJECTS.admin.root()}/${params.id}`,
    update: (params: { id: string }) =>
      `${ROUTES_PROJECTS.admin.root()}/${params.id}/update`,
  },
};
