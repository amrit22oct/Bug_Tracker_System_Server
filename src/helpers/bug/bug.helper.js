export const validateBugCreateInput = ({ title, description, projectId }) => {
   if (!title || !description || !projectId) {
     throw new Error("Title, description, and projectId are required");
   }
 };
 
 export const buildBugStatsPipeline = (projectId) => {
   const match = projectId ? { projectId } : {};
   return [
     { $match: match },
     { $group: { _id: "$status", count: { $sum: 1 } } },
   ];
 };
 