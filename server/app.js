function Align(tabs) {
    let result = new Array()
    for (let i = 0; i < tabs; i++) {
        result.push("\t")  
    }
    return result.join('')
}

function ExtractSVGData(svgraw) {
    let SVG = parseSync(svgraw)
    let ViewBox = SVG.attributes.viewBox.split(' ')
    let Dimensions = [
        ViewBox[2], 
        ViewBox[3]
    ]
    let Id = SVG.children[1].attributes.id
    let Name = Id.split(':')[0]
    let Forms = SVG.children[1].children
    return [Dimensions, Id, Name, Forms]
}

function isGroup(data) {
    return ((data.name === 'g') && (data.attributes.id))
}

function isControl(data) {
    return ((data.name === 'rect') && (data.attributes.id))
}

function RelativePosition(controlPos, groupPos) {
    let x = controlPos[0] - groupPos[0]
    let y = controlPos[1] - groupPos[1]
    let w = controlPos[2]
    let h = controlPos[3]
    return [x, y, w, h]
}

function ParseControls(forms) {
    let result = new Array()
    forms.forEach(item => {
        if (isGroup(item)) {
            let ControlClass = TransformClass(item.attributes.id)   
            let ControlPosition = new Array()
            let ControlChildrens = ParseControls(item.children)
            let ControlName = ControlClass.split(': ')[0]
            ControlChildrens.forEach(element => {
                ControlPosition.push(element[1])
            })
            ControlPosition = ([
                getMinMaxOf2DIndex(ControlPosition, 0).min, 
                getMinMaxOf2DIndex(ControlPosition, 1).min, 
                getMinMaxOf2DIndex(ControlPosition, 2).max, 
                getMinMaxOf2DIndex(ControlPosition, 3).max
            ])
            result.push([
                ControlClass, 
                ControlPosition, 
                ControlChildrens,
                ControlName
            ])
            ControlChildrens.forEach((element, index, array) => {
                let relativePosition = RelativePosition(element[1], ControlPosition)
                ControlChildrens[index][1] = relativePosition
            })
        } else if (isControl(item)) {
            let ControlClass = TransformClass(item.attributes.id)   
            let ControlPosition = ParsePositions(item.attributes)
            let ControlName = ControlClass.split(': ')[0]
            result.push([
                ControlClass, 
                ControlPosition,
                ControlName
            ])
        } else {
            result.push(['ERR_NOT_SUPPORTED_TYPE'])
        }
    })
    return result
}

function BuildControls(data, addIDXs, rootIDX, useIDXsMacros, tabs, inGroup, groupName, tag, idxsList) {
    let result = new Array()
    let IDXList = new Array()
    IDXList = IDXList.concat(idxsList)
    data.forEach(element => {
        rootIDX += 1
        if (element.length === 3) {
            let Control = new Array(`${Align(tabs)}class ${element[0]} {`)
            if (addIDXs) {
                Control.push(`${Align(tabs + 1)}idc = ${(useIDXsMacros) ? tag + '_IDC_' +  ((inGroup) ? groupName + '_' : '') + element[2] : rootIDX};`)
                if (useIDXsMacros) {
                    IDXList.push(`#define ${tag + '_IDC_' +  ((inGroup) ? groupName + '_' : '') + element[2]} ${rootIDX}`)
                }
            }
            Control.push(`${Align(tabs + 1)}${tag}_POSITION${(inGroup) ? '_CT' : ''}(${element[1][0]},${element[1][1]},${element[1][2]},${element[1][3]})`)
            Control.push(`${Align(tabs)}};`)
            result.push(Control.join('\n'))
        } else if (element.length === 4) {
            let Control = new Array(`${Align(tabs)}class ${element[0]} {`)
            if (addIDXs) {
                Control.push(`${Align(tabs + 1)}idc = ${(useIDXsMacros) ? tag + '_IDC_' +  ((inGroup) ? groupName + '_' : '') + element[3] : rootIDX};`)
                if (useIDXsMacros) {
                    IDXList.push(`#define ${tag + '_IDC_' +  ((inGroup) ? groupName + '_' : '') + element[3]} ${rootIDX}`)
                }
            }
            Control.push(`${Align(tabs + 1)}${tag}_POSITION${(inGroup) ? '_CT' : ''}(${element[1][0]},${element[1][1]},${element[1][2]},${element[1][3]})`)
            Control.push(`${Align(tabs + 1)}class Controls {`)
            Controls = BuildControls(element[2], addIDXs, rootIDX, useIDXsMacros, tabs + 2, true, element[3], tag, [])
            rootIDX = Controls[1]
            IDXList = IDXList.concat(Controls[2])
            Control.push(Controls[0].join(`\n`))
            Control.push(`${Align(tabs + 1)}};`)
            Control.push(`${Align(tabs)}};`)
            result.push(Control.join('\n'))
        }
    })
    return [result, rootIDX, IDXList]
}

function ParseGUI(svgraw, time) {
    let SVGData = ExtractSVGData(svgraw)
    if (SVGData[0].toString() !== ['1920', '1080'].toString()) {
        return 'ERR_NOT_SUPPORTED_ASPECT_RATIO'
    } else {
        let Credits = [
            `Generated with XD2A3 (xd2a3.heyoxe.ch) on %NOW%`,
            ``,
            `GitHub Repository: https://github.com/Heyoxe/Adobe-SVG-to-Arma-Config`,
            `Forum Thread: soon`,
            `Discord: https://discord.gg/QDGatN2`,
            `Website: http://xd2a3.heyoxe.ch/`,
        ]
        let Header = [
            `#define %TAG%_POSITION(X,Y,W,H) \\`,
            `${Align(1)}x = #((((X * (getResolution select 0)) / 1920) * safeZoneW) / (getResolution select 0) + safeZoneX); \\`,
            `${Align(1)}y = #((((Y * (getResolution select 1)) / 1080) * safeZoneH) / (getResolution select 1) + safeZoneY); \\`,
            `${Align(1)}w = #((((W * (getResolution select 0)) / 1920) * safeZoneW) / (getResolution select 0)); \\`,
            `${Align(1)}h = #((((H * (getResolution select 1)) / 1080) * safeZoneH) / (getResolution select 1));`,
            ``,
            `#define %TAG%_POSITION_CT(X,Y,W,H) \\`,
            `${Align(1)}x = #((((X * (getResolution select 0)) / 1920) * safeZoneW) / (getResolution select 0)); \\`,
            `${Align(1)}y = #((((Y * (getResolution select 1)) / 1080) * safeZoneH) / (getResolution select 1)); \\`,
            `${Align(1)}w = #((((W * (getResolution select 0)) / 1920) * safeZoneW) / (getResolution select 0)); \\`,
            `${Align(1)}h = #((((H * (getResolution select 1)) / 1080) * safeZoneH) / (getResolution select 1));`,          
        ]
        let DialogClass = TransformClass(SVGData[1])
        let DialogName = TransformClass(SVGData[1]).split(' ')[0]
        let Controls = ParseControls(SVGData[3])  
        return [DialogName, Credits, Header, DialogClass, Controls]
    }
}

function TransformClass(data) {
    if (data.includes(':_')) {
        return data.replace(':_', ': ')
    } else {
        return data
    }
}

function ParsePositions(data) {
    let x = (data.transform) ? Number(data.transform.replace('translate(', '').replace(')', '').split(' ')[0]) : 0
    let y = (data.transform) ? Number(data.transform.replace('translate(', '').replace(')', '').split(' ')[1]) : 0
    let w = (data.width) ? Number(data.width) : 0
    let h = (data.height) ? Number(data.height) : 0
    return [x, y, w, h]
}

//https://stackoverflow.com/a/23398499
function getMinMaxOf2DIndex(arr, idx) {
    return {
        min: Math.min.apply(null, arr.map(function (e) { return e[idx]})),
        max: Math.max.apply(null, arr.map(function (e) { return e[idx]}))
    }
}

function BuildGUI(data, addCredits, addDefines, definesTag, addIDXs, rootIDX, useIDXsMacros, separateIDXsMacros) {
    let time = new Date().getTime()
    let timeReadable = new Date(time).toUTCString()
    let Render = new Array()
    let IDXsList = new Array()

    if (addCredits) {
        let Credits = new Array('/*')
        data[1].forEach(element => {
            Credits.push(` * ${element}`)
        }) 
        Credits.push(` */`, '')
        Credits = Credits.join('\n').replace('%NOW%', timeReadable)
        Render.push(Credits)
    }

    let Controls = BuildControls(data[4], addIDXs, rootIDX - 1, useIDXsMacros, 2, false, '', definesTag, [])
    if (addIDXs) {
        if (useIDXsMacros) {
            if (separateIDXsMacros) {
                Render.push(`/* Includes */`)
                Render.push(`#include "IDXs.h`)
                Controls[2].splice(0, 0, `#define ${definesTag}_IDD_${data[0]} ${rootIDX}`)
                IDXsList.push(Controls[2].join(`\n`))
            } else {
                Render.push(`/* IDD/IDCs Macros */`)
                Controls[2].splice(0, 0, `#define ${definesTag}_IDD_${data[0]} ${rootIDX}`)
                Controls[2].push('')
                Render.push(Controls[2].join(`\n`))
            }
        }
    } else {
        rootIDX = -1
    }

    if (addDefines) {
        Render.push(`/* Positions Macros */`)
        let Defines = new Array()
        data[2].forEach(element => {
            Defines.push(element)
        }) 
        Defines.push('')
        Defines = Defines.join('\n').replace(/%TAG%(?=_POSITION)/g, definesTag)
        Render.push(Defines)        
    }


    let Dialog = [
        `class ${data[3]} {`,
        `${Align(1)}idd = ${rootIDX};`,
        `${Align(1)}class Controls {`,
        `${Controls[0].join('\n')}`,
        `${Align(1)}};`,
        `};`
    ]
    Render.push(Dialog.join('\n'))  

    return [Render.join('\n'), IDXsList, time]
}



/*
 * 
 * Server Code
 * 
 */
const fs = require('fs');
const {parseSync} = require('svgson')


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
    socket.on('svg', (data, addCredits, addDefines, definesTag, addIDXs, useIDXsMacros, rootIDX, separateIDXsMacros) => {
        //ParseGUI(data)[4]
        let time = new Date().getTime()
        let parsedGUI = ParseGUI(data, time)
        let result = BuildGUI(parsedGUI, addCredits, addDefines, definesTag, addIDXs, rootIDX, useIDXsMacros, separateIDXsMacros)
        let DialogContent = result[0]
        let Dialog = parsedGUI[0]
        let IDXsList = result[1][0]
        if (separateIDXsMacros) {
            socket.emit('converted', [IDXsList, 'IDXs.hpp']);
        }
        socket.emit('converted', [DialogContent, `${Dialog}.hpp`]);
    })
})



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
    } else {
        const file = `${__dirname}${req.originalUrl}`;
        res.sendFile(file, (err) => {
            if (err) {
                res.sendFile(`${__dirname}/public/error.html`)
            }
        })
    }
})