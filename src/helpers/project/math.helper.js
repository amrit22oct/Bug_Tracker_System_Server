export const calculatePercentage = (completed, total) =>
  total > 0 ? Math.round((completed / total) * 100) : 0;

export const calculateCompletionRatio = (total, completed) => ({
  total,
  completed,
  completionRate: `${calculatePercentage(completed, total)}%`,
});
