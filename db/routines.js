/* eslint-disable no-useless-catch */
const client = require("./client");
const { attachActivitiesToRoutines, getActivityById } = require("./activities");
const {getUserByUsername} = require('./users')
async function getRoutineById(routineId) {
  const {
    rows: [routine],
  } = await client.query(
    `
    SELECT *
    FROM routines
    WHERE id=$1;
  `,
    [routineId]
  );
  if (!routine) {
    console.log("No Routines");
  } else {
    return routine;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows: routineIds } = await client.query(`
    SELECT *
    FROM routines;`);

    const routines = await Promise.all(
      routineIds.map((routine) => getRoutineById(routine.id))
    );

    return routines;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows } = await client.query(`
    SELECT routines.*, users.username AS
    "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.id;`);

    return attachActivitiesToRoutines(rows);
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
const {id} = await getUserByUsername(username)
  
  const {rows} = await client.query(`
  SELECT routines.*, users.username AS 
  "creatorName"
  FROM routines
  JOIN users ON routines."creatorId"=users.id
  WHERE "creatorId" = $1
  `, [id])
  return attachActivitiesToRoutines(rows)
}

async function getPublicRoutinesByUser({ username }) {
  const {id} = await getUserByUsername(username)
  
  const {rows} = await client.query(`
  SELECT routines.*, users.username AS 
  "creatorName"
  FROM routines
  JOIN users ON routines."creatorId"=users.id
  WHERE "creatorId" = $1 AND "isPublic"=true
  `, [id])
  return attachActivitiesToRoutines(rows)
}

async function getAllPublicRoutines() {
  const { rows } = await client.query(`
    SELECT routines.*, users.username AS
    "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.id
    WHERE "isPublic" = true;`);

    return attachActivitiesToRoutines(rows)
}

async function getPublicRoutinesByActivity({ id }) {

const request = await client.query(`
SELECT routines.*, users.username AS 
"creatorName"
FROM routines
JOIN users ON routines."creatorId"=users.id
JOIN routine_activities ON routine_activities."routineId"=routines.id
WHERE routine_activities."activityId"= $1 AND routines."isPublic"=true
`, [id])
console.log(request)
const  {rows: routines} = request
const routinesWithActivities= attachActivitiesToRoutines(routines)
return routinesWithActivities

}

async function createRoutine({ creatorId, isPublic, name, goal }) {
  const {
    rows: [routines],
  } = await client.query(
    `
     INSERT INTO routines("creatorId", "isPublic", name, goal)
     VALUES($1, $2, $3, $4)
     RETURNING *;
     `,
    [creatorId, isPublic, name, goal]
  );

  return routines;
}

async function updateRoutine({ id, ...fields }) {}

async function destroyRoutine(id) {}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
