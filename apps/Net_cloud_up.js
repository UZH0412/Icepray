import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import fs from 'fs'
import YAML from 'yaml'

const _path = process.cwd().replace(/\\/g, "/");
const data = _path + '\/plugins\/Icepray\/data\/\/user_data.yaml';

export class Net_cloud_up extends plugin {
    constructor() {
        super({
            name: '网抑云上号',
            dsc: '简单开发示例',
            event: 'message',
            priority: 5000,
            rule: [
                {
                    reg: '^#?网抑云上号$',
                    fnc: 'Net_cloud_up'
                }
            ]
        })
    }

    async Net_cloud_up(e) {
        let url = 'https://api.xingzhige.com/API/NetEase_CloudMusic_hotReview/'
        let res = await fetch(url).catch((err) => logger.error(err))
        if (!res) {
            logger.error('[网抑云上号] 接口请求失败')
            return await this.reply('上号失败，您不需要被网抑云')
        }

        res = await res.json()

        await this.reply(`歌曲名称：${res.data.name}\n\n作者：${res.data.artist}\n\n评论者：${res.data.artistsname}\n\n评论：${res.data.content}\n\n点赞数：${res.data.likedCount}\n\n链接：${res.data.url}`)
        let gold = 20;
        let user_data = YAML.parse(fs.readFileSync(data, 'utf8'));
        if (user_data[e.user_id] === undefined) {
            user_data[e.user_id] = { gold: 200 - gold, star: 12500, luckygold: 0 }
            fs.writeFileSync(data, YAML.stringify(user_data));
        } else {
            user_data[e.user_id].gold -= gold;
            fs.writeFileSync(data, YAML.stringify(user_data));
        }
    }
}