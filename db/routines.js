/* eslint-disable no-useless-catch */
const client = require('./client');
const {attachActivitiesToRoutines} = require('./activities')
async function getRoutineById(routineId) {
   
  const { rows: [ routine ]  } = await client.query(`
    SELECT *
    FROM routines
    WHERE id=$1;
  `, [routineId]);
  if (!routine) 
    {console.log("No Routines")}
    else {
      return routine;
    }
}

async function getRoutinesWithoutActivities(){
  try {
    const {rows: routineIds} = await client.query(`
    SELECT *
    FROM routines;`)
   

   const routines = await Promise.all(routineIds.map(
    routine => getRoutineById( routine.id)
    ));


    return routines;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines () {
 
  try {
    const {rows} = await client.query(`
    SELECT routines.*, users.username AS
    "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.id;`)
   
return attachActivitiesToRoutines(rows)

  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({username}) {
}

async function getPublicRoutinesByUser({username}) {
}

async function getAllPublicRoutines() {
}

async function getPublicRoutinesByActivity({id}) {
}

async function createRoutine({
  creatorId,
  isPublic,
  name,
  goal }) 
 {
     const {rows: [routines]} = await client.query(`
     INSERT INTO routines("creatorId", "isPublic", name, goal)
     VALUES($1, $2, $3, $4)
     RETURNING *;
     `, [creatorId, isPublic, name, goal]);
   
     return routines
}

async function updateRoutine({id, ...fields}) {
}

async function destroyRoutine(id) {
}

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
}