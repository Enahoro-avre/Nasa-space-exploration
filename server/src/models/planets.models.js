// const { parse } = require('csv-parse/sync');
// const fs = require('fs')
const fs = require('node:fs');
const { parse } = require('csv-parse');
// import { parse }  from "csv-parse"

const path = require('path')
// import { path } from "path"
// import * as fs from 'fs';

// const habitablePlanets = []

const planets = require('./planets.mongo')

function isHabitablePlanets(planet){
    return planet ['koi_disposition'] === "CONFIRMED" && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11 && planet['koi_prad'] < 1.6
}

 function loadPlanetsData() {
    return new Promise ((resolve , reject) => {
        fs.createReadStream(path.join(__dirname, ".." , ".." , "data" , '2.1 kepler_data.csv'))
    .pipe(parse({
        comment: '#',
        columns: true,
    }))
    .on('data' , async (data)=>{
        if (isHabitablePlanets(data)){
            savePlanet(data)
            // habitablePlanets.push(data)
        // TODO : Replace below create with ==> insert + update = upsert 
        }
        
    })
    .on('error' , (err)=>{
        console.log(err) 
        reject(err)
    })
    .on('end' , async ()=>{
        // console.log(habitablePlanets.map((planet)=> {
        //     return planet['kepler_name']
        // }))
        const countPlanetsFound = (await savePlanet()).length
        console.log(`${countPlanetsFound} is the amount of habitable planet found !`)
        resolve()
    })
    })
}

async function getAllPlanets() {
    return await planets.find({} , {
        '__v':0 , '_id': 0,
        // This specifically exclude the internal values above
    })
}

async function savePlanet(planet){

    try {
        await planets.updateOne({
            keplerName: planet.kepler_name,
        },{
            keplerName: planet.kepler_name, 
        },{
            upsert: true,
        })
    } catch(err){
        console.error(`Could not save planet ${err}`)
    }
    
}

module.exports = {
    loadPlanetsData,
    getAllPlanets,
}
