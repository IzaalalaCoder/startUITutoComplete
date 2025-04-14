import { prisma } from '../utils';

export async function createProjects() {
  console.log('seedind project');

  if (!(await prisma.project.findUnique({ where: { name: 'My Project' } }))) {
    await prisma.project.create({
      data: {
        name: 'My Project',
        description: 'This is project created with the seed command',
      },
    });
  }
}
