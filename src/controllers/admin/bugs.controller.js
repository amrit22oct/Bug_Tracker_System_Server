import {
  createBugService,
  createBugAndReportService,
  getAllBugsService,
  getBugByIdService,
  updateBugService,
  deleteBugService,
  getBugByProjectIdService,
  assignBugService,
  updateBugStatusService,
  linkRelatedBugsService,
  createSubBugService,
  addBugHistoryService,
  getBugStatsService,
} from "../../services/admin/bug.service.js";

/* ================= CREATE BUG ================= */
export const createBug = async (req, res) => {
  try {
    const bug = await createBugService(req.body, req.user?._id);

    res.status(201).json({
      success: true,
      message: "🐞 Bug reported successfully",
      data: bug,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/* ==================== CREATE AND REPORT BUG ============= */
export const createBugAndReport = async (req, res) => {
  try {
    const bug = await createBugAndReportService(req.body, req.user?._id);

    res.status(201).json({
      success: true,
      message: "Bug created and reported successfully",
      data: bug,
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};


/* ================= GET ALL BUGS ================= */
export const getAllBugs = async (req, res) => {
  try {
    const bugs = await getAllBugsService();
    res.json({ success: true, count: bugs.length, data: bugs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ================= GET BUG BY ID ================= */
export const getBugById = async (req, res) => {
  try {
    const bug = await getBugByIdService(req.params.id);
    res.json({ success: true, data: bug });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};


/*==================GET BUG BY PROJECT ID ============*/
export const getBugByProjectId = async (req, res) => {
  try {
    const bug = await getBugByProjectIdService(req.params.id);
    res.json({ success: true, data: bug });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ================= UPDATE BUG ================= */
export const updateBug = async (req, res) => {
  try {
    const bug = await updateBugService(req.params.id, req.body);
    res.json({
      success: true,
      message: "Bug updated successfully 🔧",
      data: bug,
    });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};

/* ================= DELETE BUG ================= */
export const deleteBug = async (req, res) => {
  try {
    await deleteBugService(req.params.id);
    res.json({ success: true, message: "Bug deleted successfully 🗑️" });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};

/* ================= ASSIGN BUG ================= */
export const assignBug = async (req, res) => {
  try {
    const bug = await assignBugService(req.params.id, req.body.userId);
    res.json({
      success: true,
      message: "Bug assigned successfully 👤",
      data: bug,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/* ================= UPDATE BUG STATUS ================= */
export const updateBugStatus = async (req, res) => {
  try {
    const bug = await updateBugStatusService(
      req.params.id,
      req.body.status
    );
    res.json({ success: true, message: "Bug status updated", data: bug });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/* ================= LINK RELATED BUGS ================= */
export const linkRelatedBugs = async (req, res) => {
  try {
    const data = await linkRelatedBugsService(
      req.params.id,
      req.body.relatedBugId
    );
    res.json({ success: true, message: "🔗 Bugs linked successfully", data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/* ================= CREATE SUB BUG ================= */
export const createSubBug = async (req, res) => {
  try {
    const bug = await createSubBugService(
      req.params.id,
      req.body,
      req.user?._id
    );
    res
      .status(201)
      .json({ success: true, message: "🧩 Sub-bug created", data: bug });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/* ================= ADD BUG HISTORY ================= */
export const addBugHistory = async (req, res) => {
  try {
    const history = await addBugHistoryService(req.params.id, {
      changedBy: req.user?._id,
      ...req.body,
      changedAt: new Date(),
    });

    res.json({
      success: true,
      message: "🧠 Bug history updated",
      data: history,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/* ================= GET BUG STATS ================= */
export const getBugStats = async (req, res) => {
  try {
    const stats = await getBugStatsService(req.query.projectId);
    res.json({ success: true, data: stats });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
