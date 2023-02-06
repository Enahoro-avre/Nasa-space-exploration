const {
    getAllLaunches , 
    addNewLaunch , 
    existsLaunchWithId,
    abortLaunchById,
    scheduleNewLaunch,
} = require('../../models/launches.models')

const {
    getPagination,
} = require('../../services/query')


async function httpGetAllLaunches(req , res) {
    const { skip , limit } = getPagination(req.query)
    const launches = await getAllLaunches(skip , limit)
    // return res.status(200).json(Array.from(launches.values()))
    return res.status(200).json(launches)
}

async function httpAddnewLaunch(req , res) {
    const launch = req.body

    if(!launch.mission || !launch.rocket || !launch.launchDate  || !launch.destination) {
        return res.status(400).json({
            error: 'Missing required launch property',
        })
    }

    launch.launchDate = new Date(launch.launchDate)
    if(isNaN(launch.launchDate)){
        res.status(400).json({
            error:"Invalid launch date"
        })
    }
    await scheduleNewLaunch(launch)
    return res.status(201).json(launch)
}


async function httpAbortLaunch(req , res){

    const launchId = Number(req.params.id);

    // if launch doesn't exist
    const existsLaunch = await existsLaunchWithId(launchId)
    if(!existsLaunch){
        return res.status(404).json({
            error:"Launch not found",
    });
    }
    // if launch exist
    const aborted = await abortLaunchById(launchId)
    if(!aborted){
        return res.status(400).json({
            error: "Failed to abort"
        })
    }
    return res.status(200).json({
        ok: true,
    });
}

module.exports = { 
    httpGetAllLaunches,
    httpAddnewLaunch,
    httpAbortLaunch,
}