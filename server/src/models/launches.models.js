const axios = require('axios')

const launchesDatabase = require("./launches.mongo")
const planets = require("./planets.models")

const DEFAULT_FLIGHT_NUMBER = 100

const launches = new Map()

// let latestFlightNumber = 100

// const launch = {
//     flightNumber:100, // flight_number
//     mission:"Kepler exploration X", //name
//     rocket:"Dark side", // rocket.name
//     launchDate: new Date('December 17 , 2030'), // date_local
//     destination: "kepler-442 b", // not applicable
//     customer:['ZTM' , 'NASA'], //payload.customers for each payload
//     upcoming: true, // upcoming
//     success: true, // success
// }
// saveLaunch(launch)

async function populateLaunches(){
    console.log("DOWNLOADING launch data....")
    const response = await axios.post(SPACEX_API_URL , {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    })

    if(response.status !== 200){
        console.log('Problem downloading Launch data')
        throw new Error('Launch data download failed ! ')
    }

    const launchDocs = response.data.docs
    for(const launchDoc of launchDocs){
        const payloads = launchDoc['payloads']
        const customers = payloads.flatMap((payload)=>{
            return payload['customers']
        }) 

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers,
        }
        console.log(`${launch.flightNumber} , ${launch.mission}`)
        // TODO: Populate launchs collection
        await saveLaunch(launch)
    }
}

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function loadLaunchData(){
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    })

    if(firstLaunch){
        console.log('Launch data already exist')
    } else {
        await populateLaunches()
    }
    
    
}

async function findLaunch(filter){
    return await launchesDatabase.findOne(filter)
}

async function existsLaunchWithId(launchId){
    return await findLaunch({
        flightNumber: launchId,
    })
}

async function getLatestFlightNumber(){
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber')
    
    if(!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER
    } 
    return latestLaunch.flightNumber
}

// launches.set(launch.flightNumber , launch)
// function getAllLaunches(){
//     return Array.from(launches.values())
// }

async function getAllLaunches(skip , limit){
    return await launchesDatabase
    .find({} , {
        '_id': 0 , '__v': 0
    })
    .sort({flightNumber: 1})
    .skip(skip)
    .limit(limit)
}

async function saveLaunch(launch){
    // const planet = await planets.findOne({
    //     keplerName: launch.target,
    // })

    // if(!planet) {
    //     throw new Error("No matching planet found...")
    // }
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    } , launch ,{
        upsert: true,
    })
}

async function scheduleNewLaunch(launch){
    const planet = await planets.findOne({
        keplerName: launch.target,
    })

    if(!planet) {
        throw new Error("No matching planet found...")
    }

    const newFlightNumber = await getLatestFlightNumber() + 1
    const newLaunch = Object.assign(launch , {
        success: true,
        upcoming: true,
        customers: ['Zero to mastery' , 'NASA'],
        flightNumber: newFlightNumber,
    });
    await saveLaunch(newLaunch)
}

// function addNewLaunch(launch){
//     latestFlightNumber++
//     launches.set(la testFlightNumber , 
//         Object.assign(launch, {
//         flightNumber: latestFlightNumber,
//         customer: ["zero to mastery" , 'NASA'],
//         upcoming: true,
//         success: true
//     }))
// }

async function abortLaunchById(launchId){
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId,
    },{
        upcoming: false,
        success: false,
    })

    return aborted.ok === 1 && aborted.nModified === 1;
    // const aborted = launches.get(launchId)
    // aborted.upcoming = false
    // aborted.success = false
    // return aborted
}

module.exports = {
    loadLaunchData,
    getAllLaunches,
    // addNewLaunch,
    existsLaunchWithId,
    abortLaunchById,
    scheduleNewLaunch,
} 