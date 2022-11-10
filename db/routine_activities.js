/* eslint-disable no-useless-catch */
const client = require('./client')
const {getRoutineById, createActivity}  = require("./");


async function getRoutineActivityById(id)
{ const {
  rows: [routineActivities],
} = await client.query(
  `
  SELECT *
  FROM routine_activities
  WHERE id=$1;
`,
  [id]
);
if (!routineActivities) {
  console.log("No routineActivitiess");
} else {
  return routineActivities;
}
}

async function addActivityToRoutine({routineId, activityId, duration, count}) {
 
  try {
    const {rows: [routineActivity]} = await client.query(`
      INSERT INTO routine_activities("routineId", "activityId", duration, count)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("routineId", "activityId") DO NOTHING
      RETURNING *;
    `, [routineId, activityId, duration, count]);
 
    return routineActivity;
  } catch (error) {
    throw error;
  }

}

async function getRoutineActivitiesByRoutine({id}) {
  const {rows:routineActivities} = await client.query(`
  SELECT routine_activities.*
  FROM routine_activities
  WHERE "routineId"= $1 
  `, [id])

  
  return routineActivities
  
}

async function updateRoutineActivity({ id, ...fields }) {
  const {duration, count} = fields;
  
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');
  
  
  try {
  
    if (setString.length > 0) {
      await client.query(`
        UPDATE routine_activities
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
    }
  
    if (duration === undefined) {
      return await getRoutineActivityById(id);
    }
  
    return await getRoutineActivityById(id);
  } catch (error) {
    throw error;
  }
  }
async function destroyRoutineActivity(id) {
  try {
 
    const {rows: [routineActivity]} = await client.query(`
    DELETE FROM routine_activities
    WHERE id = ${id}
    RETURNING *;
  `);
  return routineActivity
   
 } catch (error) {
   console.error(error)
 }
}

async function canEditRoutineActivity(routineActivityId, userId) {
 
  const {rows: [canEdit]} = await client.query(`
  SELECT routine_activities.* 
  FROM routine_activities  
  JOIN routines ON routines."creatorId"=$1
  WHERE routine_activities.id= $2
  `, [userId, routineActivityId ])
  console.log(canEdit, "help")
if (canEdit){
  return true}else {return false}
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
