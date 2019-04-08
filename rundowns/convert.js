// this converts the 'json' format (with comment seperators) from robo3t into json that can be used
// use with `node convert.js > data/some-file.json`
// Note: current reads a hardcoded path dump.json

const fs = require('fs')

const d = fs.readFileSync('dump.json', 'utf8')
let d2 = d.replace(/\/\* (\d+) \*\//ig, ',')
let doc = '{"data":[' + d2.substr(1) + ']}'
let docJ = JSON.parse(doc)

let resDoc = {
	type: 'runningOrderCache',
	data: []
}

docJ.data.forEach(e => {
	if (e._id.indexOf('roCreate') >= 0) {
		e.type = 'roCreate'
		resDoc.data.push(e)
	} else if (e._id.indexOf('fullStory') >= 0) {
		e.type = 'fullStory'
		resDoc.data.push(e)
	} 
});

console.log(JSON.stringify(resDoc, undefined, 4))
