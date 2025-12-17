import {
  createBugService,
  getAllBugsService,
  getBugByIdService,
  updateBugService,
  deleteBugService,
  assignBugService,
  updateBugStatusService,
  linkRelatedBugsService,
  createSubBugService,
  addBugHistoryService,
  getBugStatsService,
} from "../../services/admin/bug.service.js";

export const createBug = async (req, res) => {
  try {
    const bug = await bugService.createBugService(req.body, req.user?._id);
    res.status(201).json({
      success: true,
      message: "🐞 Bug reported successfully",
      data: bug,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getAllBugs = async (_, res) => {
  try {
    const bugs = await bugService.getAllBugsService();
    res.json({ success: true, count: bugs.length, data: bugs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getBugById = async (req, res) => {
  try {
    const bug = await bugService.getBugByIdService(req.params.id);
    res.json({ success: true, data: bug });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};

export const updateBug = async (req, res) => {
  try {
    const bug = await bugService.updateBugService(req.params.id, req.body);
    res.json({
      success: true,
      message: "Bug updated successfully 🔧",
      data: bug,
    });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};

export const deleteBug = async (req, res) => {
  try {
    await bugService.deleteBugService(req.params.id);
    res.json({ success: true, message: "Bug deleted successfully 🗑️" });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};

export const assignBug = async (req, res) => {
  try {
    const bug = await bugService.assignBugService(
      req.params.id,
      req.body.userId
    );
    res.json({
      success: true,
      message: "Bug assigned successfully 👤",
      data: bug,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updateBugStatus = async (req, res) => {
  try {
    const bug = await bugService.updateBugStatusService(
      req.params.id,
      req.body.status
    );
    res.json({ success: true, message: "Bug status updated", data: bug });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const linkRelatedBugs = async (req, res) => {
  try {
    const data = await bugService.linkRelatedBugsService(
      req.params.id,
      req.body.relatedBugId
    );
    res.json({ success: true, message: "🔗 Bugs linked successfully", data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createSubBug = async (req, res) => {
  try {
    const bug = await bugService.createSubBugService(
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

export const addBugHistory = async (req, res) => {
  try {
    const history = await bugService.addBugHistoryService(req.params.id, {
      user: req.user?._id,
      ...req.body,
      date: new Date(),
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

export const getBugStats = async (req, res) => {
  try {
    const stats = await bugService.getBugStatsService(req.query.projectId);
    res.json({ success: true, data: stats });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
