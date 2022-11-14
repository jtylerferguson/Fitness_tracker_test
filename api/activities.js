const express = require("express");

const {
  getAllActivities,
  createActivity,
  getActivityById,
  getActivityByName,
  updateActivity,
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
activitiesRouter.patch("/:activityId", async (req, res, next) => {
  const { activityId } = req.params;
  
  const fields = req.body;
  if (req.body) {
    try {
      const originalActivity = await getActivityById(activityId);
      const originalActivityName = await getActivityByName(req.body.name);
      if (originalActivityName) {
        next({
          name: "Name duplicate",
          message: `An activity with name ${req.body.name} already exists`,
          error: "error",
        });
      }

      if (originalActivity) {
        const updatedActivity = await updateActivity({
          id: activityId,
          ...fields,
        });
        res.send(updatedActivity);
      } else {
        next({
          name: "Activity does not exist",
          message: `Activity ${activityId} not found`,
          error: "error",
        });
      }
    } catch ({ name, message, error }) {
      next({ name, message, error });
    }
  } else {
    next({
      name: "There is no req.body",
      message: "We need a body",
      error: "error",
    });
  }
});

module.exports = activitiesRouter;
