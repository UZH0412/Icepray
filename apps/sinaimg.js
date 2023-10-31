import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import YAML from 'yaml'
import moment from 'moment'
import API from '../config/API.js'
import fetch from "node-fetch";
import common from '../../../lib/common/common.js'
import CONFIG from '../config/CONFIG.js';

let cd = CONFIG.DELETE_TIME
let Bot = await redis.get(`koinori-Bot_nickname`)
let timeout = 150000
const _path = process.cwd().replace(/\\/g, "/");
const data = _path + '\/plugins\/Icepray\/data\/\/user_data.yaml'; //这里定义数据存储路径
let segment
try {
    segment = (await import("icqq")).segment
} catch (err) {
    segment = (await import("oicq")).segment
}

export class sinaimg extends plugin {
    constructor() {
        super(
            {
                name: '来份涩图',
                dsc: '来份涩图',
                event: 'message',
                priority: '50',
                rule: [
                    {
                        reg: "^(来|來|莱)(点|點|份|張|张|丶)(涩|色|美|黄)(图|圖)$",
                        fnc: 'random_wallpaper',
                    },
                    {
                        reg: '#*(来|來|莱)(点|點|份|張|张|丶)(.*)(涩|色|美|黄)(图|圖)$',
                        fnc: 'get_setu'
                    },
                    {
                        reg: '^#*美图三连$',
                        fnc: 'triple_wallpaper'
                    },
                    {
                        reg: '^美图十连$',
                        fnc: 'fulltriple_wallpaper'
                    }
                ]
            }
        )
    }


    async Chehui(msgRes, e) {
        if (timeout != 0 && msgRes && msgRes.message_id) {
            let target = null;
            if (e.isGroup) {
                target = e.group;
            } else {
                target = e.friend;
            }
            if (target != null) {
                setTimeout(() => {
                    target.recallMsg(msgRes.message_id);
                }, timeout);
            }
        }
    }


    async random_wallpaper(e) {
        if (!CONFIG.sinaimg) {
            return false
        }
        await e.reply(CONFIG.chant)
        let img = await (await fetch(API.setuurl)).json()
        let msg = segment.image(img.data[0].urls.original);
        // setuCD
        let currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        let lastTime = await redis.get(`setu_${e.group_id}_cd`)
        if (lastTime && !e.isMaster) {
            let seconds = moment(currentTime).diff(moment(lastTime), 'seconds')
            e.reply(`${Bot}冷却中...(${cd - seconds}s)`)
            return true
        }

     
        await redis.set(`setu_${e.group_id}_cd`, currentTime, {
            EX: cd
        })

        let gold = 10;
        
        let user_data = YAML.parse(fs.readFileSync(data, 'utf8'));
        if (user_data[e.user_id] === undefined) {
            user_data[e.user_id] = { gold: 200 - gold, star: 12500, luckygold: 0 }
        } else {
            user_data[e.user_id].gold -= gold;
        }
        fs.writeFileSync(data, YAML.stringify(user_data));
        let msgRes = await e.reply(msg).catch((err) => logger.error('随机壁纸发生错误A：' + err))
        if (!msgRes) return e.reply('咏唱失败了呢QwQ').catch((err) => logger.error("随机壁纸单张撤回失败：" + err))
        if (CONFIG.AUTO_DELETE) this.Chehui(msgRes, e)

        await redis.set(`setu_${e.group_id}`, currentTime, {
            EX: cd
        })
        return msgRes
    }


    async get_setu(e) {
        if (!CONFIG.sinaimg) {
            return false
        }
        let gold = 10;

        let user_data = YAML.parse(fs.readFileSync(data, 'utf8'));

        let keyword = e.msg.replace(/#tag|-n|-l|-r|\d+| +/g, "")
        await e.reply(CONFIG.chant)

        let num = e.msg.match(/\d+/)
        if (!num) {
            num = 1
        } else if (num > 10) {
            num = 10
        }

        let r = 1
        if (!e.msg.match(/-r/g)) r = 0

        let proxy = "i.pixiv.re"
        let size = "original"

        if (user_data[e.user_id] === undefined) {
            
            user_data[e.user_id] = { gold: 200 - gold, star: 12500, luckygold: 0 }
        } else {
            if (user_data[e.user_id].gold < gold) {
                await e.reply("金币不足哦~")
                return true
            }
            user_data[e.user_id].gold -= gold;
        }
        for (let i = 0;i < [num]; i++) {
            let url = `https://api.lolicon.app/setu/v2?proxy=${proxy}&size=${size}&r18=${r}&tag=${keyword}`
            let response = await (await fetch(url)).json()
            image.push(segment.image(response.data[0].urls.original))
        }

        let currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        let lastTime = await redis.get(`get_setu_${e.group_id}_cd`)
        if (lastTime && !e.isMaster) {
            let seconds = moment(currentTime).diff(moment(lastTime), 'seconds')
            e.reply(`${Bot}冷却中...(${cd - seconds}s)`)
            return true
        }

  
        await redis.set(`setu_${e.group_id}_cd`, currentTime, {
            EX: cd
        })
        
        fs.writeFileSync(data, YAML.stringify(user_data));
        let msgRes = await e.reply(await common.makeForwardMsg(e, image, '客官？您点滴涩图来啦！'));
        if (!msgRes) return e.reply('咏唱失败了呢QwQ')
        if (CONFIG.AUTO_DELETE) this.Chehui(msgRes, e)

        await redis.set(`get_setu_${e.group_id}`, currentTime, {
            EX: cd
        })
    }


    async triple_wallpaper(e) {
        if (!CONFIG.sinaimg) {
            return false
        }
        await e.reply(`${Bot}蓄力咏唱中...`)
        let num = 3
        let image = []
        for (let i = 0; i < [num]; i++) {
            let result = await (await fetch(`https://api.lolicon.app/setu/v2?r18=2`)).json()
            image.push(segment.image(result.data[0].urls.original));
        }
        // setuCD
        let currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        let lastTime = await redis.get(`more_setu_${e.group_id}_cd`)
        if (lastTime && !e.isMaster) {
            let seconds = moment(currentTime).diff(moment(lastTime), 'seconds')
            e.reply([`${Bot}...冷却中...(${cd - seconds}s)`, segment.image(`file:///${_path}\/plugins\/Icepray\/res\/koinori\/faint.png`)])
            return true
        }

        
        await redis.set(`setu_${e.group_id}_cd`, currentTime, {
            EX: cd
        })

        let gold = 10 * Number(num)
        
        let user_data = YAML.parse(fs.readFileSync(data, 'utf8'));
        
        if (user_data[e.user_id] === undefined) {
            
            user_data[e.user_id] = { gold: 200 - goldm, star: 12500, luckygold: 0 }
        } else {
            
            user_data[e.user_id].gold -= gold;
        }
        
        fs.writeFileSync(data, YAML.stringify(user_data));
        let msgRes = await e.reply(num > 1 ? await common.makeForwardMsg(e, image, '客官？您点滴涩图来啦！') : image, false, { recallMsg: 0 }).catch((err) => logger.error('随机壁纸发生错误A：' + err))
        if (!msgRes) return e.reply('咏唱失败了呢QwQ')
        if (CONFIG.AUTO_DELETE) this.Chehui(msgRes, e)

        await redis.set(`more_setu_${e.group_id}`, currentTime, {
            EX: cd
        })
    }


    async fulltriple_wallpaper(e) {
        if (!CONFIG.sinaimg) {
            return false
        }
        await e.reply(`${Bot}全力咏唱中...`)
        let num = 10
        let image = []
        for (let i = 0; i < [num]; i++) {
            let result = await (await fetch(`https://api.lolicon.app/setu/v2?r18=2`)).json()
            image.push(segment.image(result.data[0].urls.original));
        }
        // setuCD
        let currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        let lastTime = await redis.get(`more_setu_${e.group_id}_cd`)
        if (lastTime && !e.isMaster) {
            let seconds = moment(currentTime).diff(moment(lastTime), 'seconds')
            e.reply([`${Bot}...冷却中...(${cd - seconds}s)`, segment.image(`file:///${_path}\/plugins\/Icepray\/res\/koinori\/faint.png`)])
            return true
        }

        
        await redis.set(`setu_${e.group_id}_cd`, currentTime, {
            EX: cd
        })

        let gold = 10 * Number(num)
        
        let user_data = YAML.parse(fs.readFileSync(data, 'utf8'));
        
        if (user_data[e.user_id] === undefined) {
            
            user_data[e.user_id] = { gold: 200 - goldm, star: 12500, luckygold: 0 }
        } else {
            
            user_data[e.user_id].gold -= gold;
        }
        
        fs.writeFileSync(data, YAML.stringify(user_data));
        let msgRes = await e.reply(num > 1 ? await common.makeForwardMsg(e, image, '客官？您点滴涩图来啦！') : image, false, { recallMsg: 0 }).catch((err) => logger.error('随机壁纸发生错误A：' + err))
        if (!msgRes) return e.reply('咏唱失败了呢QwQ')
        if (CONFIG.AUTO_DELETE) this.Chehui(msgRes, e)

        await redis.set(`more_setu_${e.group_id}`, currentTime, {
            EX: cd
        })
    }
}


