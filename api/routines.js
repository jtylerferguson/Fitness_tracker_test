const express = require("express");
const routinesRouter = express.Router();
const { requireUser } = require("./utils");
const {
  getAllRoutines,
  createRoutine,
  getRoutineById,
  updateRoutine,
  destroyRoutine,
} = require("../db/routines.js");
const { addActivityToRoutine } = require("../db/routine_activities.js");
const { getRoutineActivitiesByRoutine } = require("../db");

// GET /api/routines
routinesRouter.get("/", async (req, res, next) => {
  try {
    const routine = await getAllRoutines();

    if (routine) {
      res.send(routine);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/routines
routinesRouter.post("/", requireUser, async (req, res, next) => {
  const { isPublic, name, goal } = req.body;
  const userId = req.user.id;

  const postData = { creatorId: `${userId}`, isPublic, name, goal };

  try {
    const routine = await createRoutine(postData);
    // const post = await createPost(postData);
    // if the post comes back, res.send({ post });
    if (routine) {
      res.send(routine);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});
// PATCH /api/routines/:routineId
routinesRouter.patch("/:routineId", requireUser, async (req, res, next) => {
  const { routineId } = req.params;
  const fields = req.body;

  try {
    const originalRoutine = await getRoutineById(routineId);
    console.log(originalRoutine.creatorId, "this is creatorId");

    if (originalRoutine) {
      if (originalRoutine.creatorId === req.user.id) {
        const updatedRoutine = await updateRoutine({
          id: routineId,
          ...fields,
        });
        console.log(updatedRoutine, "HEY");
        res.send(updatedRoutine);
        console.log(`hey`);
      } else {
        res.status(403);
        next({
          name: "UnauthorizedUser",
          message: `User ${req.user.username} is not allowed to update ${originalRoutine.name}`,
          error: "UnauthorizedUser",
        });
      }
    } else {
      next({
        name: "error",
        message: `${originalRoutine} does not exist`,
        error: "error",
      });
    }
  } catch ({ name, message, error }) {
    next({ name, message, error });
  }
});
// DELETE /api/routines/:routineId
routinesRouter.delete("/:routineId", requireUser, async (req, res, next) => {
  try {
    const routine = await getRoutineById(req.params.routineId);
    console.log(req.user);

    if (routine) {
      console.log(routine, "ROUTINE");
      if (routine.creatorId === req.user.id) {
        const deletedRoutine = await destroyRoutine(routine.id);
        res.send(deletedRoutine);
      } else {
        res.status(403);
        next({
          name: "UnauthorizedUserError",
          message: `User ${req.user.username} is not allowed to delete ${routine.name}`,
          error: "UnauthorizedUserError",
        });
      }
    } else {
      // if there was a routine, throw UnauthorizedUserError, otherwise throw routineNotFoundError
      next({
        name: "RoutineNotFoundError",
        message: "That routine does not exist",
        error: "RoutineNotFoundError",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});
// POST /api/routines/:routineId/activities
routinesRouter.post(
  "/:routineId/activities",
  requireUser,
  async (req, res, next) => {
    const routineId = req.params.routineId;
    const originalRoutine = await getRoutineById(routineId);

    if (originalRoutine) {
      if (originalRoutine.creatorId === req.user.id) {
        const { activityId, count, duration } = req.body;
        console.log(req.body, "REQ.BODY");
        const routineActivitiesList = (
          await getRoutineActivitiesByRoutine({ id: routineId })
        ).map((activity) => activity.activityId);
        if (routineActivitiesList.includes(activityId)) {
          next({
            name: "duplicate activity",
            message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
            error: "error.",
          });
        } else {
          const updatedRoutineActivity = await addActivityToRoutine({
            routineId,
            activityId,
            count,
            duration,
          });

          res.send(updatedRoutineActivity);
        }
      } else {
        next({
          name: "Unauthorized user",
          message: `User ${req.user.username} is not allowed to update `,
          error: "error.",
        });
      }
    } else {
      next({
        name: "Routine Error.",
        message: "Routine does not exist.",
        error: "error.",
      });
    }
  }
);
module.exports = routinesRouter;
