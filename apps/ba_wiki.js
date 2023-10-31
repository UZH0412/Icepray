import fs from 'fs'
import YAML from 'yaml'
import common from '../../../lib/common/common.js'
import path from "path"

let segment
try {
    segment = (await import("icqq")).segment
} catch (err) {
    segment = (await import("oicq")).segment
}
let Bot = await redis.get(`koinori-Bot_nickname`)

const _path = process.cwd()
const sudent_list = YAML.parse(fs.readFileSync(`${_path}/plugins/Icepray/res/stdent_list.yaml`, 'utf8'))
const settings = {
  path: path.join(_path, "/plugins/Icepray/res/"),

}
export class ba_wiki extends plugin {
    constructor() {
        super({
            name: 'ba_wiki',
            dsc: '碧蓝档案学生wiki',
            event: "message",
            priority: 50,
            rule: [
                {
                    reg: '^档案查询(.*)$',
                    fnc: 'send_student_info'
                },
                {
                    reg: '^技能查询(.*)$',
                    fnc: 'send_skill_info'
                },
                {
                    reg: '^材料查询(.*)$',
                    fnc: 'send_material_info'
                },
                {
                    reg: '^档案音乐(.*)$',
                    fnc: 'send_music_info'
                },
                {
                    reg: '^学生列表$',
                    fnc: 'student_nickname'
                }
            ]
        })
    }


    async send_student_info(e) {
        let nickname = e.msg.replace(/档案查询| +/g, "")
        await e.reply('正在制作卡片中，请耐心等待~')
        let id = await this.getName(nickname, `${_path}/plugins/Icepray/res/stdent_list.yaml`, 'utf8')
        console.log(id)
        await common.sleep(500)
        if (fs.existsSync(`${_path}/plugins/Icepray/res/student_info/${id}.png`)) {
            await e.reply([segment.image(`file:///${_path}/plugins/Icepray/res/student_info/${id}.png`)])
            return true
        } else {
            await e.reply("没有找到这名学生..")
        }
    }


    async send_skill_info(e) {
        let nickname = e.msg.replace(/技能查询| +/g, "")
        await e.reply('正在制作卡片中，请耐心等待~')
        let id = await this.getName(nickname, `${_path}/plugins/Icepray/res/stdent_list.yaml`, 'utf8')
        await common.sleep(500)
        if (fs.existsSync(`${_path}/plugins/Icepray/res/skill_info/${id}.png`)) {
            await e.reply([segment.image(`file:///${_path}/plugins/Icepray/res/skill_info/${id}.png`)])
        } else {
            await e.reply("没有找到这名学生..")
        }
    }

    async send_material_info(e) {
        let nickname = e.msg.replace(/材料查询| +/g, "")
        await e.reply('正在制作卡片中，请耐心等待~')
        let id = await this.getName(nickname, `${_path}/plugins/Icepray/res/stdent_list.yaml`, 'utf8')
        await common.sleep(500)
        if (fs.existsSync(`${_path}/plugins/Icepray/res/material_info/${id}.png`)) {
            await e.reply([segment.image(`file:///${_path}/plugins/Icepray/res/material_info/${id}.png`)])
        } else {
            await e.reply("没有找到这名学生..")
        }
    }


    async send_music_info(e) {
        await e.reply("正在放置唱片...")
        let name = "audio";
        let music_id = e.msg.replace(/档案音乐| +/g, "")
        let voicePath = path.join(settings.path, name)
        let bitMap = fs.readFileSync(`${voicePath}/${music_id}.ogg`);
        let base64 = Buffer.from(bitMap, 'binary').toString('base64');
        let message = segment.record(`base64://${base64}`);
        await common.sleep(500)
        await e.reply(message);
        await common.sleep(500)
        await e.reply(`${Bot}正在播放：${music_id}，匹配度：100%`)
        }


    async student_nickname(e) {
        await e.reply(String(sudent_list))
    }


    async getName(originName, path) {
        if (fs.existsSync(path)) {
            let YamlObject = YAML.parse(fs.readFileSync(path, 'utf8'))
            for (let element in YamlObject) {
                if (YamlObject[element].includes(originName)) { return element }
            }
        }
        return originName
    }
}