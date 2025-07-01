import prisma from './prismaClient';



export default {

  apply: async (projectId, freelancerId, applicationData) => {
    const existing = await prisma.application.findFirst({
        where: {
        jobId: Number(projectId),
        freelancerId,
      },
    });

    if (existing) {

      throw new Error('You have already applied to this project.');

    }
    return prisma.application.create({
      data: {
        jobId: Number(projectId),
        freelancerId,
        ...applicationData,
      },
    });
  },

};

