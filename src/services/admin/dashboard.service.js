// export const getProjectById = async (id) => {
//    const project = await Project.findById(id)
//      .populate("members", "name email")
//      .populate("createdBy", "name email")
//      .populate("manager", "name email role")
//      .populate("tester", "name email role")
//      .populate({
//        path: "bugs",
//        select: "title status priority severity assignedTo reportedBy",
//        populate: [
//          { path: "assignedTo", select: "name email" },
//          { path: "reportedBy", select: "name email" },
//        ],
//      })
//      .populate({
//        path: "reports",
//        select: "title status reportedBy reviewedBy",
//        populate: [
//          { path: "reportedBy", select: "name email" },
//          { path: "reviewedBy", select: "name email" },
//        ],
//      })
//      .lean(); // 🚀 important
 
//    if (!project) throw new Error("Project not found");
 
//    return computeProjectView(project);
//  };