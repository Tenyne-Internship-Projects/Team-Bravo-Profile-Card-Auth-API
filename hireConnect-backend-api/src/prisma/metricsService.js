import { prisma } from "./prismaClient.js";


// FREELANCER METRICS
export const getFreelancerMetricsService = async (freelancerId) => {
  // Total earnings (paid projects only)
  const earningsData = await prisma.application.aggregate({
    _sum: {
      job: {
        _sum: {
          budget: true,
        }
      }
    },
    where: {
      freelancerId: freelancerId,
      job: {
        isPaid: true
      }
    }
  });
  const earnings = earningsData._sum?.job?.budget || 0;

  // Active and Completed projects
  const [projectsActive, projectsCompleted] = await Promise.all([
    prisma.application.count({
      where: {
        freelancerId: freelancerId,
        job: {
          status: 'OPEN' // Adjust with correct enum if necessary
        }
      }
    }),
    prisma.application.count({
      where: {
        freelancerId: freelancerId,
        job: {
          status: 'CLOSED' // Adjust with correct enum if necessary
        }
      }
    })
  ]);

  // Profile views
  const userData = await prisma.user.findUnique({
    where: { id: freelancerId },
    select: { profileViews: true }
  });
  const profileViews = userData?.profileViews || 0;

  // Monthly earnings
  const paidProjects = await prisma.application.findMany({
    where: {
      freelancerId,
      job: {
        isPaid: true
      }
    },
    select: {
      job: {
        budget: true,
        createdAt: true
      }
    }
  });

  const monthlyEarnings = groupByMonth(
    paidProjects.map(p => ({ date: p.job.createdAt, value: p.job.budget })),
    'value'
  );

  return {
    earnings,
    projectsActive,
    projectsCompleted,
    profileViews,
    monthlyEarnings
  };
};


// CLIENT METRICS
export const getClientMetricsService = async (clientUserId) => {
  // Fetch projects posted by the client
  const projects = await prisma.project.findMany({
    where: { posted_by_id: clientUserId },
    select: { id: true, min_budget: true, max_budget: true, created_at: true }
  });

  const totalProjects = projects.length;

  // Count the number of applications
  const applicationCount = await prisma.application.count({
    where: {
      job: {
        posted_by_id: clientUserId,
      }
    }
  });

  // Calculate the average budget for projects
  const avgBudget = average([
    ...projects.map(p => p.min_budget),
    ...projects.map(p => p.max_budget)
  ]);

  // Group projects by month
  const monthlyProjects = groupByMonth(projects.map(p => p.created_at));

  return {
    totalProjects,
    applicationCount,
    averageBudget: avgBudget,
    monthlyProjects
  };
};


// ADMIN METRICS
export const getAdminMetricsService = async () => {
  // Count users by their roles
  const roleCounts = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
  });

  const userStats = roleCounts.reduce((acc, curr) => {
    acc[curr.role] = curr._count;
    return acc;
  }, {});

  // Calculate total revenue (sum of expected salary for all applications)
  const applications = await prisma.application.findMany({
    select: { expected_salary_monthly: true, created_at: true }
  });

  const totalRevenue = applications.reduce((sum, app) => sum + (app.expected_salary_monthly || 0), 0);

  // Group revenue data by month
  const revenueMonthly = groupByMonth(
    applications.map(app => ({ date: app.created_at, value: app.expected_salary_monthly || 0 })),
    'value'
  );

  // Group user registrations by month
  const userRegistrations = await prisma.user.findMany({ select: { created_at: true } });
  const userMonthly = groupByMonth(userRegistrations.map(u => u.created_at));

  // Merge user registration and revenue data for dual-axis chart
  const dualAxisData = mergeChartData(userMonthly, revenueMonthly);

  return {
    userStats,
    totalRevenue,
    dualAxisData
  };
};


// UTILITY FUNCTIONS
function groupByMonth(datesOrObjects, valueKey = null) {
  const map = {};
  for (let entry of datesOrObjects) {
    const date = valueKey ? entry.date : entry;
    const value = valueKey ? entry[valueKey] : 1;
    const month = new Date(date).toLocaleString("default", { month: "long" });

    map[month] = (map[month] || 0) + value;
  }

  return Object.entries(map).map(([month, val]) => ({
    month,
    [valueKey ? 'amount' : 'count']: val
  }));
}

function mergeChartData(users, revenue) {
  const allMonths = new Set([...users.map(u => u.month), ...revenue.map(r => r.month)]);
  return Array.from(allMonths).map(month => ({
    month,
    users: users.find(x => x.month === month)?.count || 0,
    revenue: revenue.find(x => x.month === month)?.amount || 0
  }));
}

function average(arr) {
  if (!arr.length) return 0;
  const total = arr.reduce((sum, n) => sum + n, 0);
  return total / arr.length;
}
