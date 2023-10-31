import plugin from '../../../lib/plugins/plugin.js'
import moment from 'moment'

let segment
try {
    segment = (await import("icqq")).segment
} catch (err) {
    segment = (await import("oicq")).segment
}

let GayCD = {};
const imgpath = process.cwd() + `\/plugins\/Icepray\/res\/koinori`

export class perish_together extends plugin {
  constructor() {
    super({
      name: '同归于尽',
      dsc: '简单开发示例',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?同归于尽$',
          fnc: 'person_together'
        }
      ]
    })
  }


  async person_together(e) {
    let id = e.group_id + e.user_id

    let qq2 = e.user_id;
    let qq = e.at

    if (!e?.group.is_owner && !e?.group.is_admin) {
      const no_admin = [
        `冰祈不是管理员啦`,
        segment.image(`file:///${imgpath}\/无语.png`)
      ]
      await this.reply(no_admin);
    }

    for (let msg of e.message) {

      if (msg.type == 'at') {
        qq = msg.qq
        break
      }
    }

    if (qq == null) {
      e.reply("要艾特到对方才可以同归于尽~", true)
      return true
    }

    let currentTime = moment(new Date()).format('ss')

    let multi_list = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
      4, 4, 4, 4, 4, 4, 4, 4, 4,
      5, 5, 5, 5, 5, 5,
      6, 6, 6, 6,
      7, 7, 7,
      8, 8,
      9,
      10
    ]

    let opposite_time = Math.floor(Math.random() * 181)
    let multi = multi_list[Math.floor(Math.random() * multi_list.length)]
    let user_time = opposite_time * multi
    let final_random = Math.floor(Math.random() * 1001)
    let range = Math.ceil(Math.random() * 50)
    let timeAdd, timeAddFlag

    if (currentTime < range) {
      timeAdd = range - currentTime
      timeAddFlag = 1
    }
    else {
      timeAdd = 0
      timeAddFlag = 0
    }
    if (final_random < 50) {
      if (timeAddFlag) {
        await e.group.muteMember(qq2, opposite_time + timeAdd)
        await e.reply(`对方追加了${timeAdd}s的禁言，而幸运的你未受到反弹。`, true)
      }
      else {
        await e.group.muteMember(qq2, opposite_time)
        await e.reply(`对方受到了${opposite_time}s的禁言，而幸运的你未受到反弹。`, true)
      }
    }
    else if (final_random < 950) {
      if (timeAddFlag) {
        await e.group.muteMember(qq, opposite_time + timeAdd)
        await e.group.muteMember(qq2, user_time)
        await e.reply(`对方追加了${opposite_time}s的禁言，而你受到了${multi}倍反弹。`, true)
      }
      else {
        await e.group.muteMember(qq, opposite_time)
        await e.group.muteMember(qq2, user_time)
        await e.reply(`对方受到了${opposite_time}s的禁言，而你受到了${multi}倍反弹。`, true)
      }
    }
    else {
      await e.group.muteMember(qq2, user_time)
      await e.reply(`对方幸运地闪开了，而你受到了${user_time}s的禁言`, true)
    }

    return true;
  }
}
