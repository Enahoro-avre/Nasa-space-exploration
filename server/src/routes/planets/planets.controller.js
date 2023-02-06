const { getAllplanets } = require('../../models/planets.models.js')

async function httpGetAllPlanets(req , res) {
    return res.status(200).json(await getAllplanets())
}

module.exports = {
    httpGetAllPlanets,
}