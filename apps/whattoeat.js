import plugin from '../../../lib/plugins/plugin.js'
import CONFIG from '../config/CONFIG.js'
import fs from 'node:fs'
import YAML from 'yaml';

let segment
try {
    segment = (await import("icqq")).segment
} catch (err) {
    segment = (await import("oicq")).segment
}
const _path = process.cwd().replace(/\\/g, "/");
const imgpath = `${_path}/plugins/Icepray/res/`;
const config = _path + '\/plugins\/Icepray\/data\/user_config.yaml';

export class whattoeat extends plugin {
  constructor() {
    super({
      name: '今天吃什么',
      dsc: '看看今天吃啥',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^(今|今天|今儿)?(早|早上|早餐|早饭)(吃|恰)(甚|甚么|什么|啥|点啥)(.+)?',
          fnc: 'random_breakfast'
        },
        {
          reg: '^(.+)?(今天|[中午晚][饭餐午上]|夜宵|今晚)(吃|恰)(甚|甚么|什么|啥|点啥)(.+)?$',
          fnc: 'net_ease_cloud_word'
        },
        {
          reg: '^换菜单(正常模式|来点硬菜|用户模式)$',
          fnc: 'change_menu'
        }
      ]
    })
  }


  async random_breakfast(e) {
    e.msg = e.msg.replace(/吃什么/g, '');
    let user_config = YAML.parse(fs.readFileSync(config, 'utf8'))
    if (user_config[e.user_id] === undefined) {
      user_config[e.user_id] = { menu: 1 }
      fs.writeFileSync(config, YAML.stringify(user_config))
    }
    if (user_config[e.user_id].menu === 1) {
      const files = fs
        .readdirSync(`${imgpath}/foods/breakfast`);
      let k = Math.ceil(Math.random() * files.length);
      let o = files[k].replace(/.jpg|.png/g, "");
      let msg = [
        `${e.msg}去吃${o}吧~`,
        segment.image(`${imgpath}/foods/breakfast/${files[k]}`)
      ];
      await e.reply(msg);
    } else {
      const extra = fs
        .readdirSync(`${imgpath}/foods/extra`)
      let n = Math.ceil(Math.random() * extra.length);
      let i = extra[n].replace(/.jpg|.png/g, "");
      let msg = [
        `${e.msg}去吃${i}吧~`,
        segment.image(`${imgpath}/foods/extra/${extra[n]}`)
      ];
      await e.reply(msg);
    }
  }

  async net_ease_cloud_word(e) {
    e.msg = e.msg.replace(/吃什么/g, '');
    let user_config = YAML.parse(fs.readFileSync(config, 'utf8'))
    if (user_config[e.user_id] === undefined) {
      user_config[e.user_id] = { menu: 1 }
      fs.writeFileSync(config, YAML.stringify(user_config))
    }
    if (user_config[e.user_id].menu == 1) {
      const files = fs
        .readdirSync(`${imgpath}/foods/dinner`);
      let k = Math.ceil(Math.random() * files.length);
      let o = files[k].replace(/.jpg|.png/g, "");
      let msg = [
        `${e.msg}去吃${o}吧~`,
        segment.image(`${imgpath}/foods/dinner/${files[k]}`)
      ];
      await e.reply(msg);
    } else {
      const extra = fs
        .readdirSync(`${imgpath}/foods/extra`)
      let n = Math.ceil(Math.random() * extra.length);
      let i = extra[n].replace(/.jpg|.png/g, "");
      let msg = [
        `${e.msg}去吃${i}吧~`,
        segment.image(`${imgpath}/foods/extra/${extra[n]}`)
      ];
      await e.reply(msg);
    }
  }


  async change_menu(e) {
    let user_config = YAML.parse(fs.readFileSync(config, 'utf8'))
    let ret = e.msg.replace(/换菜单/g, "")
    if (user_config[e.user_id] === undefined) {
      user_config[e.user_id] = { menu: 1 }
    } else {
      if (ret == '正常模式') {
        if (user_config[e.user_id].menu === 1) {
          await e.reply("已经是正常菜式了哦")
        } else {
          user_config[e.user_id].menu = 1
          const yami = `file:///${imgpath}/koinori/yami.png`
          await e.reply(["切换成功，果然还是正常的好吃呢~", segment.image(yami)])
        }
      }
      if (ret === '来点硬菜') {
        if (user_config[e.user_id].menu == 2) {
          const jiii = `file:///${imgpath}/koinori/jiii.png`
          await e.reply(["您已经站在了食物链的顶端！", segment.image(jiii)])
        } else {
          user_config[e.user_id].menu = 2
          const kowai = `file:///${imgpath}/koinori/kowai.png`
          await e.reply(["切...切换成功...", segment.image(kowai)])
        }
      }
      if (ret === '用户模式') {
        if (user_config[e.user_id].menu == 3) {
          user_config[e.user_id].menu = 3
          await e.reply('已经在自定义模式里了~')
        } else {
          let message = '已经切换到用户自定义模式了~'
          if (CONFIG.foods_whitelist.some(item => e.group_id.includes(item))) {
            message += '使用"添菜"添加菜肴~'
          }
          await e.reply(message)
        }
      }
      fs.writeFileSync(config, YAML.stringify(user_config))
    }
  }
}