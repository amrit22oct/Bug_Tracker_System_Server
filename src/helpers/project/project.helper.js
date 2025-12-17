export const calculateCompletionRatio = (total, completed) => {
   const ratio = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;
   return {
     total,
     completed,
     completionRate: `${ratio}%`,
   };
 };
 