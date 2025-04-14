import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { zProject } from '@/features/projects/schemas';

import { ExtendedTRPCError } from '../config/errors';
import { createTRPCRouter, protectedProcedure } from '../config/trpc';

export const projectsRouter = createTRPCRouter({
  getAll: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      method: 'GET',
      path: '/projects',
      protect: true,
      tags: ['projects'],
    })
    .input(
      z
        .object({
          cursor: z.string().cuid().optional(),
          limit: z.number().min(1).max(100).default(20),
          searchTerm: z.string().optional(),
        })
        .default({})
    )
    .output(
      z.object({
        items: z.array(zProject()),
        nextCursor: z.string().cuid().nullish(),
        total: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        name: {
          contains: input.searchTerm,
          mode: 'insensitive',
        },
      } satisfies Prisma.ProjectWhereInput;

      const [total, projects] = await ctx.db.$transaction([
        ctx.db.project.count(),
        ctx.db.project.findMany({
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          where,
        }),
      ]);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (projects.length > input.limit) {
        const nextProjects = projects.pop();
        nextCursor = nextProjects?.id;
      }

      return { items: projects, nextCursor, total };
    }),

  create: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'POST',
        path: '/projects',
        protect: true,
        tags: ['projects'],
      },
    })
    .input(
      zProject().pick({
        name: true,
        description: true,
      })
    )
    .output(zProject())
    .mutation(async ({ ctx, input }) => {
      try {
        ctx.logger.info('Create new project');
        return await ctx.db.project.create({
          data: input,
        });
      } catch (e) {
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),

  getById: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'GET',
        path: '/projects/{id}',
        protect: true,
        tags: ['projects'],
      },
    })
    .input(zProject().pick({ id: true }))
    .output(zProject())
    .query(async ({ ctx, input }) => {
      ctx.logger.info('Getting project');
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
      });

      if (!project) {
        ctx.logger.warn('Unable to find project with the provided input');
        throw new TRPCError({
          code: 'NOT_FOUND',
        });
      }

      return project;
    }),

  updateById: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'PUT',
        path: '/projects/{id}',
        protect: true,
        tags: ['projects'],
      },
    })
    .input(
      zProject().pick({
        id: true,
        name: true,
        description: true,
      })
    )
    .output(zProject())
    .mutation(async ({ ctx, input }) => {
      try {
        ctx.logger.info('Updating project');
        return await ctx.db.project.update({
          where: { id: input.id },
          data: input,
        });
      } catch (e) {
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),
  delete: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/projects/{id}',
        protect: true,
        tags: ['projects'],
      },
    })
    .input(zProject().pick({ id: true }))
    .output(zProject())
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.project.delete({
          where: { id: input.id },
        });
      } catch (e) {
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),
});
