import prisma from './prismaClient';
import { transporter } from '../utils/mailer.js';



export const applyToProjectService = async (projectId, freelancerId, applicationData) => {
    const existing = await prisma.application.findFirst({
      where: {
      jobId: Number(projectId),
      freelancerId,
      },
    });

    if (existing) throw new Error('You have already applied to this project');

  const project = await prisma.project.findUnique({
   where: { id: Number(projectId) },
    include: { posted_by: true } });



  const application = await prisma.application.create({ 
  data: { jobId: Number(projectId),
  freelancerId, 
  ...applicationData, },
 });
 await await transporter.sendMail({
   to: project.posted_by.email,
    subject: 'New Application Received', 
    text: You received a new application 
    for your project "${project.title}" from freelancer ID: ${freelancerId}
   });

  return application;},

};

