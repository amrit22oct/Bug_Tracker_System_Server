import Bug from "../../models/bug.model.js";
import User from "../../models/user.model.js";
import Project from "../../models/project.model.js";

/* ================================================================
   🐞 CREATE BUG
================================================================ */
export const createBug = async (req, res) => {
  try {
    const {
      title,
      description,
      status = "Open",
      priority = "Low",
      severity = "Minor",
      tags,
      projectId,
      assignedTo,
      dueDate,
      relatedBugs = [],
      parentBug,
    } = req.body;

    if (!title || !description || !projectId)
      return res.status(400).json({
        success: false,
        message: "Title, description, and projectId are required",
      });

    const project = await Project.findById(projectId);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "Assigned user not found" });
    }

    // ✅ Create the bug
    const bug = await Bug.create({
      title,
      description,
      status,
      priority,
      severity,
      tags,
      projectId,
      assignedTo,
      reportedBy: req.user?._id,
      dueDate,
      relatedBugs,
      parentBug,
    });

    // update project stats
    project.stats.totalBugs += 1;
    project.stats.openBugs += 1;
    await project.save();

    return res.status(201).json({
      success: true,
      message: "🐞 Bug reported successfully",
      data: bug,
    });
  } catch (error) {
    console.error("❌ Bug creation error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================================================
   🐛 GET ALL BUGS
================================================================ */
export const getAllBugs = async (req, res) => {
  try {
    const bugs = await Bug.find()
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")
      .populate("projectId", "name")
      .populate("relatedBugs", "title status")
      .populate("parentBug", "title");

    return res.status(200).json({
      success: true,
      message: "All bugs fetched successfully 🐛",
      count: bugs.length,
      data: bugs,
    });
  } catch (error) {
    console.error("❌ Get all bugs error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================================================
   🐞 GET BUG BY ID
================================================================ */
export const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")
      .populate("projectId", "name")
      .populate("relatedBugs", "title status")
      .populate("parentBug", "title");

    if (!bug)
      return res.status(404).json({ success: false, message: "Bug not found" });

    return res.status(200).json({ success: true, data: bug });
  } catch (error) {
    console.error("❌ Get bug by ID error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================================================
   🔧 UPDATE BUG
================================================================ */
export const updateBug = async (req, res) => {
  try {
    const updates = req.body;
    const bug = await Bug.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!bug)
      return res.status(404).json({ success: false, message: "Bug not found" });

    return res.status(200).json({
      success: true,
      message: "Bug updated successfully 🔧",
      data: bug,
    });
  } catch (error) {
    console.error("❌ Update bug error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================================================
   🗑️ DELETE BUG
================================================================ */
export const deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findByIdAndDelete(req.params.id);
    if (!bug)
      return res.status(404).json({ success: false, message: "Bug not found" });

    // Update project stats
    const project = await Project.findById(bug.projectId);
    if (project) {
      project.stats.totalBugs = Math.max(0, project.stats.totalBugs - 1);
      if (bug.status === "Open")
        project.stats.openBugs = Math.max(0, project.stats.openBugs - 1);
      else if (bug.status === "Resolved")
        project.stats.resolvedBugs = Math.max(
          0,
          project.stats.resolvedBugs - 1
        );
      await project.save();
    }

    return res
      .status(200)
      .json({ success: true, message: "Bug deleted successfully 🗑️" });
  } catch (error) {
    console.error("❌ Delete bug error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================================================
   👤 ASSIGN BUG TO USER
================================================================ */
export const assignBug = async (req, res) => {
  try {
    const { userId } = req.body;
    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId },
      { new: true }
    ).populate("assignedTo", "name email");

    if (!bug)
      return res.status(404).json({ success: false, message: "Bug not found" });

    return res.status(200).json({
      success: true,
      message: `Bug assigned successfully 👤`,
      data: bug,
    });
  } catch (error) {
    console.error("❌ Assign bug error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================================================
   🔄 UPDATE BUG STATUS
================================================================ */
export const updateBugStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bug = await Bug.findById(req.params.id);
    if (!bug)
      return res.status(404).json({ success: false, message: "Bug not found" });

    bug.status = status;
    await bug.save();

    return res.status(200).json({
      success: true,
      message: `Bug status updated to ${status}`,
      data: bug,
    });
  } catch (error) {
    console.error("❌ Update bug status error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================================================
   🔗 LINK RELATED BUGS
================================================================ */
export const linkRelatedBugs = async (req, res) => {
  try {
    const { relatedBugId } = req.body;
    const bug = await Bug.findById(req.params.id);
    const relatedBug = await Bug.findById(relatedBugId);

    if (!bug || !relatedBug)
      return res.status(404).json({ success: false, message: "Bug not found" });

    if (!bug.relatedBugs.includes(relatedBugId))
      bug.relatedBugs.push(relatedBugId);

    if (!relatedBug.relatedBugs.includes(bug._id))
      relatedBug.relatedBugs.push(bug._id);

    await bug.save();
    await relatedBug.save();

    return res.status(200).json({
      success: true,
      message: "🔗 Bugs linked successfully",
      data: { bug, relatedBug },
    });
  } catch (error) {
    console.error("❌ Link bugs error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================================================
   🧩 CREATE SUB BUG / CHILD ISSUE
================================================================ */
export const createSubBug = async (req, res) => {
  try {
    const parent = await Bug.findById(req.params.id);
    if (!parent)
      return res
        .status(404)
        .json({ success: false, message: "Parent bug not found" });

    const { title, description, priority, severity } = req.body;
    const childBug = await Bug.create({
      title,
      description,
      priority,
      severity,
      projectId: parent.projectId,
      parentBug: parent._id,
      reportedBy: req.user?._id,
    });

    if (!parent.relatedBugs.includes(childBug._id)) {
      parent.relatedBugs.push(childBug._id);
      await parent.save();
    }

    return res.status(201).json({
      success: true,
      message: "🧩 Sub-bug created and linked successfully",
      data: childBug,
    });
  } catch (error) {
    console.error("❌ Create sub-bug error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================================================
   🧠 BUG HISTORY / ACTIVITY LOG (Simplified)
================================================================ */
export const addBugHistory = async (req, res) => {
  try {
    const { action, note } = req.body;
    const bug = await Bug.findById(req.params.id);
    if (!bug)
      return res.status(404).json({ success: false, message: "Bug not found" });

    const log = {
      user: req.user?._id,
      action,
      note,
      date: new Date(),
    };

    bug.history.push(log);
    await bug.save();

    return res.status(200).json({
      success: true,
      message: "🧠 Bug history updated",
      data: bug.history,
    });
  } catch (error) {
    console.error("❌ Bug history error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================================================
   📊 BUG STATISTICS
================================================================ */
export const getBugStats = async (req, res) => {
  try {
    const projectId = req.query.projectId;
    const match = projectId ? { projectId } : {};

    const stats = await Bug.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("❌ Get bug stats error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
