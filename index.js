import fs from 'node:fs'

if (Bot?.logger?.info) {
  Bot.logger.info('---------^_^---------')
  Bot.logger.info(`主人！冰祈酱打卡上班啦！`)
  Bot.logger.info('---------------------')
} else {
  console.log(`冰祈插件初始化~`)
}

if (!await redis.get(`koinori-Bot_nickname`)) {
  await redis.set(`koinori-Bot_nickname`, Bot.nickname)
}

const files = fs.readdirSync('./plugins/Icepray/apps').filter(file => file.endsWith('.js'))

let ret = []

files.forEach((file) => {
  ret.push(import(`./apps/${file}`))
})

ret = await Promise.allSettled(ret)

let apps = {}
for (let i in files) {
  let name = files[i].replace('.js', '')

  if (ret[i].status != 'fulfilled') {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}
export { apps }
