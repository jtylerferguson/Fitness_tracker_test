/* eslint-disable no-useless-catch */
const client = require('./client')
const {getRoutineById, createActivity}  = require("./");


async function getRoutineActivityById(id){
}

async function addActivityToRoutine(routineId, activityId, duration, count) {
  try {
    await client.query(`
      INSERT INTO routine_activities("routineId", "activityId", duration, count)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("routineId", "activityId") DO NOTHING;
    `, [routineId, activityId, duration, count]);
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({id}) {
}

async function updateRoutineActivity ({id, ...fields}) {
}

async function destroyRoutineActivity(id) {
}

async function canEditRoutineActivity(routineActivityId, userId) {
}

async function attachActivitiesToRoutines(routines) {
  // no side effects
  const routinesToReturn = [...routines];
  const binds = routines.map((_, index) => `$${index + 1}`).join(', ');
  const routineIds = routines.map(routine => routine.id);
  if (!routineIds?.length) return [];
  
  try {
    // get the activities, JOIN with routine_activities (so we can get a routineId), and only those that have those routine ids on the routine_activities join
    const { rows: activities } = await client.query(`
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities 
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" IN (${ binds });
    `, routineIds);

    // loop over the routines
    for(const routine of routinesToReturn) {
      // filter the activities to only include those that have this routineId
      const activitiesToAdd = activities.filter(activity => activity.routineId === routine.id);
      // attach the activities to each single routine
      routine.activities = activitiesToAdd;
    }
    return routinesToReturn;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
  attachActivitiesToRoutines
};
