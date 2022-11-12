const express = require("express");
const { response } = require("../app");
const {
  getAllActivities,
  createActivity,
  getActivityById,
  getActivityByName,
  updateActivity
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
activitiesRouter.patch('/:activityId', requireUser, async (req, res, next) => {
    const { activityId } = req.params;
    console.log(req.params)
    const { name, description } = req.body;

    const updateFields = {};

    if (name) {
        updateFields.name = name;
    }


    if (description) {
        updateFields.description = description;
    } 

    try {
        const originalActivity = await getActivityById(activityId);

        if (originalActivity.activityId) {

            const updatedActivity = await updateActivity(activityId, updateFields);
            res.send({activity: updatedActivity})
        } else {
            next ({
                name: 'UnauthorizedUserError',
                message: 'You cannot update a activity that is not yours'
            })
        }
    } catch ({ name, message}) {
        next ({name, message});
    }
});






module.exports = activitiesRouter;
