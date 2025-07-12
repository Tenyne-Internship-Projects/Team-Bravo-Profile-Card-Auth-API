import { prisma } from "./prismaClient.js";
import { startOfMonth, format } from "date-fns";



const getFreelancerMetrics = async (userId) => {
  const freelancer = await prisma.freelancer.findUnique({
    where: { user_id: userId },
    select: { id: true, user: { select: { profileViews: true } } }
  });

  if (!freelancer) {
    throw new Error("Freelancer not found");
  }

  const freelancerId = freelancer.id;

  const applications = await prisma.application.findMany({
    where: { freelancerId },
    include: { job: true }
  });

  let earnings = 0;
  let projectsActive = 0;
  let projectsCompleted = 0;
  const monthlyMap = {};

  applications.forEach(app => {
    const status = app.job?.status;

    if (status === "IN_PROGRESS") projectsActive++;
    else if (status === "CLOSED") projectsCompleted++;

    if (status === "CLOSED" && app.expected_salary_monthly) {
      earnings += app.expected_salary_monthly;

      const month = format(startOfMonth(app.created_at), "MMMM");
      if (!monthlyMap[month]) monthlyMap[month] = 0;
      monthlyMap[month] += app.expected_salary_monthly;
    }
  });

  const monthlyEarnings = Object.entries(monthlyMap).map(([month, amount]) => ({
    month,
    amount,
  }));

  return {
    earnings,
    projectsActive,
    projectsCompleted,
    profileViews: freelancer.user.profileViews || 0,
    monthlyEarnings,
  };
};

export default getFreelancerMetrics;