// this converts a snapshot into importable rundown data
// use with `node convert.js > data/some-file.json`
// Note: current reads a hardcoded path snapshot.json

const fs = require('fs')

const snapshot = require('./snapshot.json').ingestData


const rundownData = snapshot.filter(e => e.type === 'rundown')
const segmentData = snapshot.filter(e => e.type === 'segment')
const partData = snapshot.filter(e => e.type === 'part')

if (rundownData.length !== 1) {
    console.error(`Got ${rundownData.length} rundown ingest data. Can't continue`)
    return
}

segmentData.forEach(seg => {
    let parts = partData.filter(e => e.segmentId === seg.segmentId)
    parts = parts.map(e => e.data)
    parts = parts.sort((a, b) => b.rank - a.rank) // TODO - check order

    seg.data.parts = parts
})

let segments = segmentData.map(s => s.data)
segments = segments.sort((a, b) => b.rank - a.rank) // TODO - check order

const rundown = rundownData[0].data
rundown.segments = segments

console.log(JSON.stringify(rundown, undefined, 4))
