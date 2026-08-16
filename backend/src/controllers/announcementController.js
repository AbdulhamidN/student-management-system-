const announcementModel = require('../models/announcementModel');

async function getAnnouncements(req, res, next) {
  try {
    const announcements = await announcementModel.getPublishedAnnouncements();
    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAnnouncements,
};
