import { getBugsByDeveloperService } from "../../services/developer/bug.service.js";

export const getDeveloperBugs = async (req, res) => {
  try {
    const developerId = req.params.developerId;
    const { limit, skip } = req.query;

    const bugs = await getBugsByDeveloperService(developerId, {
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0,
    });

    res.status(200).json({
      success: true,
      message: "🪲 Bugs fetched successfully",
      data: bugs,
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};
