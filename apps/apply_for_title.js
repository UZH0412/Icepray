import plugin from '../../../lib/plugins/plugin.js'
import CONFIG from '../config/CONFIG.js'

let segment
try {
  segment = (await import("icqq")).segment
} catch (err) {
  segment = (await import("oicq")).segment
}

let Bot = await redis.get(`koinori-Bot_nickname`)
const _path = process.cwd() + `/plugins/Icepray/res/koinori`;

var ban = CONFIG.ban

export class apply_for_title extends plugin {
  constructor() {
    super({
      name: '申请头衔',
      dsc: '申请头衔',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '#?申请头衔(.*)$',
          fnc: 'apply_for_title'
        }
      ]
    })
  }



  async apply_for_title(e) {
    if (!e.isGroup) return true;


    if (!e?.group.is_owner) {
      e.reply(`${Bot}不是群主哦`, segment.image(`file:///${_path}/无语.png`));
      return false;
    }

    if (!await redis.get(key)) { await redis.set(key, '1') }
    let title = e.msg.replace(/#|申请头衔/g, "").trim();

    if (!title) return this.e.reply("请输入头衔");


    if (title.length >= 8) {
      await e.reply(`头衔太长，${Bot}记不住..`, segment.image(`file:///${_path}/no.png`))
    }

    if (ban.some(item => title.includes(item))) {
      let msg = [
        `不可以教坏${Bot}`,
        segment.image(`file:///${_path}/no.png`)
      ]
      await e.reply(msg)
    }

    let key = await e.group.setTitle(e.user_id, title);

    if (key) {
      let msg = [
        `头衔${title}设置成功！`,
        segment.image(`file:///${_path}/ok.png`)
      ];
      await this.e.reply(msg)
    }
  }
}

