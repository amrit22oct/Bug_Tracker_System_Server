import Bug from "../../models/bug.model.js";

export const getBugsByDeveloperService = async (developerId, options = {}) => {
   const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
 
   return Bug.find({ assignedTo: developerId, deletedAt: null })
     .populate({
       path: "reportedBy assignedTo watchers comments.user reviewedBy",
       select: "_id name email role avatar", // only include necessary user fields
     })
     .populate("projectId") // include full project info
     .sort(sort)
     .skip(skip)
     .limit(limit);
 };
 

// export const getBugsByDeveloperService = async (developerId) => {
//    return Bug.find({ assignedTo: developerId, deletedAt: null })
//      .populate("reportedBy assignedTo watchers comments.user reviewedBy projectId")
//      .sort({ createdAt: -1 });
//  };