// src/controllers/dashboard.controller.js
import Project from "../../models/project.model.js";
import Bug from "../../models/bug.model.js";
import Team from "../../models/team.model.js";
import User from "../../models/user.model.js";

const normalizeStatus = (status = "") =>
  status.toLowerCase().replace(/\s+/g, "");

export const getDashboardData = async (req, res) => {
  try {
    /* =====================================================
       RECENT PROJECTS (STATUS DERIVED FROM BUGS)
    ===================================================== */
    const recentProjects = await Project.aggregate([
      { $match: { deletedAt: { $exists: false } } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },

      {
        $lookup: {
          from: "bugs",
          localField: "_id",
          foreignField: "projectId",
          as: "bugs",
        },
      },

      {
        $addFields: {
          status: {
            $cond: [
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: "$bugs",
                        as: "b",
                        cond: { $in: ["$$b.status", ["Open", "In Progress"]] },
                      },
                    },
                  },
                  0,
                ],
              },
              "In Progress",
              {
                $cond: [
                  { $gt: [{ $size: "$bugs" }, 0] },
                  "Completed",
                  "$status",
                ],
              },
            ],
          },
          isActive: {
            $cond: [
              { $in: ["$status", ["Archived", "Cancelled"]] },
              false,
              true,
            ],
          },
        },
      },

      /* ---------- POPULATE ---------- */
      {
        $lookup: {
          from: "teams",
          localField: "teamId",
          foreignField: "_id",
          as: "teamId",
        },
      },
      { $unwind: { path: "$teamId", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "users",
          localField: "manager",
          foreignField: "_id",
          as: "manager",
        },
      },
      { $unwind: { path: "$manager", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "users",
          localField: "teamLeader",
          foreignField: "_id",
          as: "teamLeader",
        },
      },
      { $unwind: { path: "$teamLeader", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "users",
          localField: "tester",
          foreignField: "_id",
          as: "tester",
        },
      },
      { $unwind: { path: "$tester", preserveNullAndEmptyArrays: true } },

      { $project: { bugs: 0 } },
    ]);

    /* =====================================================
       RECENT BUGS
    ===================================================== */
    const recentBugs = await Bug.find({ deletedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("projectId", "name")
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email");

    /* =====================================================
       BUG STATUS COUNTS
    ===================================================== */
    const bugStatusCounts = await Bug.aggregate([
      { $match: { deletedAt: { $exists: false } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const bugStatus = {
      open: 0,
      inprogress: 0,
      resolved: 0,
      closed: 0,
    };

    bugStatusCounts.forEach(({ _id, count }) => {
      const key = normalizeStatus(_id);
      if (bugStatus[key] !== undefined) bugStatus[key] = count;
    });

    /* =====================================================
       PROJECT STATUS COUNTS (BUG-DRIVEN)
    ===================================================== */
    const projectStatusCounts = await Project.aggregate([
      { $match: { deletedAt: { $exists: false } } },

      {
        $lookup: {
          from: "bugs",
          localField: "_id",
          foreignField: "projectId",
          as: "bugs",
        },
      },

      {
        $addFields: {
          derivedStatus: {
            $cond: [
              { $in: ["$status", ["Archived", "Cancelled"]] },
              "$status",
              {
                $cond: [
                  {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: "$bugs",
                            as: "b",
                            cond: {
                              $in: ["$$b.status", ["Open", "In Progress"]],
                            },
                          },
                        },
                      },
                      0,
                    ],
                  },
                  "In Progress",
                  {
                    $cond: [
                      { $gt: [{ $size: "$bugs" }, 0] },
                      "Completed",
                      "$status",
                    ],
                  },
                ],
              },
            ],
          },
        },
      },

      { $group: { _id: "$derivedStatus", count: { $sum: 1 } } },
    ]);

    const projectStatus = {
      planned: 0,
      inprogress: 0,
      completed: 0,
      onhold: 0,
      cancelled: 0,
      archived: 0,
    };

    projectStatusCounts.forEach(({ _id, count }) => {
      const key = normalizeStatus(_id);
      if (projectStatus[key] !== undefined) projectStatus[key] = count;
    });

    /* =====================================================
       TOTAL COUNTS
    ===================================================== */
    const totalProjects = await Project.countDocuments({
      deletedAt: { $exists: false },
    });
    const totalBugs = await Bug.countDocuments({
      deletedAt: { $exists: false },
    });
    const totalTeams = await Team.countDocuments({
      deletedAt: { $exists: false },
    });
    const totalUsers = await User.countDocuments({ isActive: true });

    /* =====================================================
       TEAMS WITH PROJECT + BUG METRICS
    ===================================================== */
    const teams = await Team.aggregate([
      { $match: { deletedAt: { $exists: false } } },

      {
        $lookup: {
          from: "users",
          localField: "lead",
          foreignField: "_id",
          as: "lead",
        },
      },
      { $unwind: { path: "$lead", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members",
        },
      },

      {
        $lookup: {
          from: "projects",
          let: { projectIds: "$projects" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$projectIds"] },
                deletedAt: { $exists: false },
              },
            },
          ],
          as: "projects",
        },
      },

      {
        $lookup: {
          from: "bugs",
          let: { projectIds: "$projects._id" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$projectId", "$$projectIds"] },
                deletedAt: { $exists: false },
              },
            },
          ],
          as: "bugs",
        },
      },

      {
        $addFields: {
          projects: {
            $map: {
              input: "$projects",
              as: "p",
              in: {
                _id: "$$p._id",
                name: "$$p.name",
                deadline: "$$p.endDate",

                totalBugs: {
                  $size: {
                    $filter: {
                      input: "$bugs",
                      as: "b",
                      cond: { $eq: ["$$b.projectId", "$$p._id"] },
                    },
                  },
                },

                resolvedBugs: {
                  $size: {
                    $filter: {
                      input: "$bugs",
                      as: "b",
                      cond: {
                        $and: [
                          { $eq: ["$$b.projectId", "$$p._id"] },
                          { $in: ["$$b.status", ["Resolved", "Closed"]] },
                        ],
                      },
                    },
                  },
                },

                progress: {
                  $cond: [
                    {
                      $eq: [
                        {
                          $size: {
                            $filter: {
                              input: "$bugs",
                              as: "b",
                              cond: {
                                $eq: ["$$b.projectId", "$$p._id"],
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    0,
                    {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                {
                                  $size: {
                                    $filter: {
                                      input: "$bugs",
                                      as: "b",
                                      cond: {
                                        $and: [
                                          {
                                            $eq: [
                                              "$$b.projectId",
                                              "$$p._id",
                                            ],
                                          },
                                          {
                                            $in: [
                                              "$$b.status",
                                              ["Resolved", "Closed"],
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                  },
                                },
                                {
                                  $size: {
                                    $filter: {
                                      input: "$bugs",
                                      as: "b",
                                      cond: {
                                        $eq: [
                                          "$$b.projectId",
                                          "$$p._id",
                                        ],
                                      },
                                    },
                                  },
                                },
                              ],
                            },
                            100,
                          ],
                        },
                        0,
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },

      {
        $addFields: {
          totalProjects: { $size: "$projects" },
          completedProjects: {
            $size: {
              $filter: {
                input: "$projects",
                as: "p",
                cond: { $eq: ["$$p.progress", 100] },
              },
            },
          },
          teamProgress: {
            $cond: [
              { $eq: [{ $size: "$projects" }, 0] },
              0,
              { $round: [{ $avg: "$projects.progress" }, 0] },
            ],
          },
        },
      },
      {
         $addFields: {
           totalBugs: { $size: "$bugs" },
 
           teamBugsInProgress: {
             $size: {
               $filter: {
                 input: "$bugs",
                 as: "b",
                 cond: { $in: ["$$b.status", ["Open", "In Progress"]] },
               },
             },
           },
 
           closedBugs: {
             $size: {
               $filter: {
                 input: "$bugs",
                 as: "b",
                 cond: { $eq: ["$$b.status", "Closed"] },
               },
             },
           },
         },
       },

      { $project: { bugs: 0 } },
    ]);

        // ---------------------- Recent activities ----------------------
    // Recent bug resolutions, project updates, comments
    const recentActivities = [];

    const recentBugUpdates = await Bug.find({})
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("reportedBy", "name")
      .populate("assignedTo", "name");

    recentBugUpdates.forEach((b) => {
      recentActivities.push({
        type: "Bug",
        action: `Bug '${b.title}' updated`,
        bugId: b._id,
        projectId: b.projectId,
        by: b.assignedTo?.name || b.reportedBy.name,
        updatedAt: b.updatedAt,
      });
    });

    const recentProjectUpdates = await Project.find({})
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("manager", "name")
      .populate("teamLeader", "name");

    recentProjectUpdates.forEach((p) => {
      recentActivities.push({
        type: "Project",
        action: `Project '${p.name}' updated`,
        projectId: p._id,
        by: p.manager?.name || p.teamLeader?.name,
        updatedAt: p.updatedAt,
      });
    });

    // Sort activities by date descending
    recentActivities.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    const topRecentActivities = recentActivities.slice(0, 10);

    /* =====================================================
       FINAL RESPONSE
    ===================================================== */
    return res.json({
      totals: { totalProjects, totalBugs, totalTeams, totalUsers },
      bugStatus,
      projectStatus,
      recentProjects,
      recentBugs,
      teams,
      recentActivities: topRecentActivities,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};
