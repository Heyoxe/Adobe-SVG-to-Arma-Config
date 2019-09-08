const fs = require('fs');
const {parse} = require('svgson')

function Align(tabs) {
    let result = []
    for (let i = 0; i < tabs; i++) {
        result.push("\t")  
    }
    return result.join('')
}
   
function isGroup(data) {
    return ((data.name === 'g') ? true : false)
}


//https://stackoverflow.com/a/23398499
function getMinMaxOf2DIndex (arr, idx) {
    return {
        min: Math.min.apply(null, arr.map(function (e) { return e[idx]})),
        max: Math.max.apply(null, arr.map(function (e) { return e[idx]}))
    }
} 

function getGroupSize(data) {  
    let Positions = new Array()
    ParseControls(data.children, 0, false).match(/\(([^\)]+)\)/g).forEach(element => {
        let numbers = element.replace('(', '').replace(')', '').split(',')
        numbers.forEach((item, index, array) => {
            array[index] = Number(item)
        })
        numbers = [numbers[0], numbers[1],(numbers[0] + numbers[2]), (numbers[1] + numbers[3])]
        Positions.push(numbers)
    })
    let Position = ([
        getMinMaxOf2DIndex(Positions, 0).min, 
        getMinMaxOf2DIndex(Positions, 1).min, 
        getMinMaxOf2DIndex(Positions, 2).max - getMinMaxOf2DIndex(Positions, 0).min, 
        getMinMaxOf2DIndex(Positions, 3).max - getMinMaxOf2DIndex(Positions, 1).min
    ])
    return Position
}

function ParseControls(data, tabs, inGroup, GroupPositions, tag) {
    let result = []
    data.forEach(element => {
        if (isGroup(element)) {
            let groupSize = getGroupSize(element)
            let group = [
                `\n${Align(tabs)}class ${element.attributes['data-name']} {\n`,
                `${Align(tabs + 1)}${tag}_POSITION${((inGroup) ? '_CT' : '')}(${groupSize[0]},${groupSize[1]},${groupSize[2]},${groupSize[3]})\n`,
                `${Align(tabs + 1)}class Controls {\n`,
                `${ParseControls(element.children, (tabs + 2), true, groupSize, tag)}`,
                `${Align(tabs + 1)}};\n`,
                `${Align(tabs)}};\n`
            ]
            result.push(group.join(''))
        } else if (element.attributes.id) {
            let Values = (Object.values(element.attributes))
            let Positions = [
                Values[4].slice(9,Values[4].length).replace('(', '').replace(')', '').split(' ')[0], 
                Values[4].slice(9,Values[4].length).replace('(', '').replace(')', '').split(' ')[1],
                element.attributes.width,
                element.attributes.height
            ]

            if (inGroup) {
                Positions = [
                    Values[4].slice(9,Values[4].length).replace('(', '').replace(')', '').split(' ')[0] - GroupPositions[0], 
                    Values[4].slice(9,Values[4].length).replace('(', '').replace(')', '').split(' ')[1] - GroupPositions[1],
                    element.attributes.width,
                    element.attributes.height
                ]
            }
            let form = [
                `\n${Align(tabs)}class ${element.attributes['data-name']} {\n`,
                `${Align(tabs + 1)}${tag}_POSITION${((inGroup) ? '_CT' : '')}(${Positions[0]},${Positions[1]},${Positions[2]},${Positions[3]})\n`,
                `${Align(tabs)}};\n`
            ]
            result.push(form.join(''))
        }
    })
    return (result.join(''))
}

function ParseGUI(data) {
    let patfh = "3443" //Yes?
    parse(data).then(object => {
        let Dialog = object.children[1].attributes.id
        let Config = [
            `class ${Dialog} {\n`,
            `${Align(1)}idd = -1;\n`,
            `${Align(1)} class Controls {\n`,
            `${ParseControls(object.children[1].children, 2)}`,
            `${Align(1)}};\n`,
            `};`
        ]

        let now = new Date().getTime()
        fs.writeFileSync(`${__dirname}/public/temp/__temp_${Dialog}_${now}.html`, `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title></head><body><pre>`, err => {
            if (err) throw err;
        })
        fs.appendFileSync(`${__dirname}/public/temp/__temp_${Dialog}_${now}.html`, Config.join(''))
        fs.appendFileSync(`${__dirname}/public/temp/__temp_${Dialog}_${now}.html`, `</pre></body></html>`)
        /*fs.writeFile(`__temp_${Dialog}.html`, Config.join(''), err => {
            if (err) throw err;
        })*/
        patfh = `/public/temp/__temp_${Dialog}_${now}.html`
    })
}

//Careful, trash code below that line
const express = require('express')
console.log('Initializing Server and Network Listner...')
const app = express()
const server = require('http').createServer(app)

const ip = require("ip")
const port = 16224

const io = require('socket.io').listen(server)
server.listen(port)

console.log(`Server Started on ${ip.address()}:${port}`)

io.on('connection', function (socket) {
    socket.on('svg', function (data, credits, defines, tag) {
        //ParseGUI(data)
        parse(data).then(object => {
            let now = new Date().getTime()
            let Dialog = object.children[1].attributes.id
            let Config = [];
            if (credits) {
                Config.push([
                    `/*\n`,
                    ` * Generated with XD2A3 (by Heyoxe)\n`,
                    ` * Website: http://adobetoarma.heyoxe.ch/\n`,
                    ` * Discord: https://discord.gg/5pPEnb\n`,
                    ` * GitHub: https://github.com/Heyoxe/Adobe-SVG-to-Arma-Config\n`,
                    ` * BI Forum Post: soon\n`,
                    ` *\n`,
                    ` * Generated on ${new Date(now).toUTCString()}\n`,
                    ` */\n`,
                    `\n`,
                ].join(''))
            }
            if (defines) {
                let Name = tag
                Config.push([
                    `#define ${Name}_POSITION(X,Y,W,H) \\\n`,
                    `${Align(1)}x = #((((X * (getResolution select 0)) / 1920) * safeZoneW) / (getResolution select 0) + safeZoneX); \\\n`,
                    `${Align(1)}y = #((((Y * (getResolution select 1)) / 1080) * safeZoneH) / (getResolution select 1) + safeZoneY); \\\n`,
                    `${Align(1)}w = #((((W * (getResolution select 0)) / 1920) * safeZoneW) / (getResolution select 0)); \\\n`,
                    `${Align(1)}h = #((((H * (getResolution select 1)) / 1080) * safeZoneH) / (getResolution select 1));\n`,
                    `\n`,
                    `#define ${Name}_POSITION_CT(X,Y,W,H) \\\n`,
                    `${Align(1)}x = #((((X * (getResolution select 0)) / 1920) * safeZoneW) / (getResolution select 0)); \\\n`,
                    `${Align(1)}y = #((((Y * (getResolution select 1)) / 1080) * safeZoneH) / (getResolution select 1)); \\\n`,
                    `${Align(1)}w = #((((W * (getResolution select 0)) / 1920) * safeZoneW) / (getResolution select 0)); \\\n`,
                    `${Align(1)}h = #((((H * (getResolution select 1)) / 1080) * safeZoneH) / (getResolution select 1));\n`,
                    `\n`
                ].join(''))
            } else {
                tag = "COOPR"
            }

            Config.push([
                `class ${Dialog} {\n`,
                `${Align(1)}idd = -1;\n`,
                `${Align(1)}class Controls {\n`,
                `${ParseControls(object.children[1].children, 2, false, [], tag)}`,
                `${Align(1)}};\n`,
                `};`
            ].join(''))
    
            fs.writeFileSync(`${__dirname}/public/temp/__temp_${Dialog}_${now}.hpp`, Config.join(''), err => {
                if (err) throw err;
            })
            let path = `/public/temp/__temp_${Dialog}_${now}.hpp?${Dialog}`
            socket.emit('converted', path);
            /*fs.writeFile(`__temp_${Dialog}.html`, Config.join(''), err => {
                if (err) throw err;
            })*/
        })
    });
    socket.on('downloaded', data => {
        console.log('Yeh')
        fs.unlinkSync(`${__dirname}${data}`)
    })
});
//Routes (or whatever it's called)
console.log('Creating routes...')
app.get('*', (req, res) => {
    let url = req.params[0]
    if (url === '/') {
        const file = `${__dirname}/public/home.html`;
        res.sendFile(file, (err) => {
            if (err) {
                //res.sendFile(`${__dirname}/public/error.html`)
            }
        })
    } else if (url.startsWith('/public/temp')) {
        res.download(`${__dirname}${req._parsedUrl.pathname}`, `${req._parsedUrl.query}.hpp`, e => {
            fs.unlinkSync(`${__dirname}${req._parsedUrl.pathname}`)
        })
    } else {
        const file = `${__dirname}${req.originalUrl}`;
        res.sendFile(file, (err) => {
            if (err) {
                res.sendFile(`${__dirname}/public/error.html`)
            }
        })
    }
})