const dashboardModel = require('../models/dashboardModel');

exports.getAdminDashboard = async (req, res, next) => {
  try {
    const data = await dashboardModel.getAdminDashboard();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};
