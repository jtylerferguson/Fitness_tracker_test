const express = require("express");
const { response } = require("../app");
const {
  getAllActivities,
  createActivity,
  getActivityById,
  getActivityByName,
} = require("../db");
const { requireUser } = require("./utils");
const activitiesRouter = express.Router();

// GET /api/activities/:activityId/routines

// GET /api/activities
activitiesRouter.get("/", async (req, res, next) => {
  try {
    const activities = await getAllActivities();

    if (activities) {
      res.send(activities);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/activities
activitiesRouter.post("/", requireUser, async (req, res, next) => {
  const { name, description = "" } = req.body;
  const postData = {};
  const activity = await getActivityByName(name);

  try {
    if (!activity) {
      postData.name = name;
      postData.description = description;

      const activities = await createActivity(postData);

      if (activities) {
        res.send(activities);
      }
    } else {
      next({
        error: "ACtivity already exists ",
        message: "An activity with name Push Ups already exists",
        name: `${postData.name}`,
      });
    }
  } catch ({ name, message, error }) {
    next({ name, message, error });
  }
});
// PATCH /api/activities/:activityId

module.exports = activitiesRouter;
