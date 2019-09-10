const fs = require('fs')
const { DealTasks } = require('./Subscriptions/src/main.js')

const dataPath = __dirname + '/data.json'
const containerPath = __dirname + '/container.json'

async function GetSubscriptions(){
    let container = JSON.parse(fs.readFileSync(containerPath, 'utf8'))
    let tasks = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    let result = await DealTasks(tasks)
    
    const newResultList = result.reduce((acc, x) => {
        const containerList = x.result.containerList
        const newContainerList = containerList.filter(x => container.filter(y => y.title === x.title && y.href === x.href).length == 0)
        newContainerList.map(x => container.push(x))
        fs.writeFileSync(containerPath, JSON.stringify(container, null, 4))
        return acc.concat(newContainerList)
    }, [])

    const outputStr = newResultList.reduce((acc, ele) => {
        return `${acc}\n${ele.title}\nLink: ${ele.href}\n\n`
    }, `Find Results: ${newResultList.length}\n\n`).trim()

    return outputStr
}

module.exports = GetSubscriptions

if (require.main === module) {
    (async () => {
        let result = await GetSubscriptions()
        console.log(result)
    })()
}