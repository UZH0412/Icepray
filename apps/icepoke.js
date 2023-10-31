import plugin from '../../../lib/plugins/plugin.js'
import cfg from '../../../lib/config/config.js'
import common from '../../../lib/common/common.js'
import CONFIG from '../config/CONFIG.js'
import fs from 'node:fs'
import YAML from 'yaml'


let segment
try {
  segment = (await import("icqq")).segment
} catch (err) {
  segment = (await import("oicq")).segment
}

let ciku = ['别戳了', '要戳坏掉了', '你欺负人，呜呜', '别戳了!!!', '不准戳了！！！', '再戳就坏了']
let CD = false
let POKE_GET = 0.9 //不回戳的概率
let picProbability = 75 // 触发图片概率
const _path = process.cwd().replace(/\\/g, "/");
const data = _path + '\/plugins\/Icepray\/data\/\/user_data.yaml'
let face_o = ['呆_白.jpg', '呆_黑.jpg', '呆_混合.jpg', '呆_黑_2.jpg', '呆_混合_R.jpg']  // O组表情
let face_a = ['不可以A_白.jpg', '不可以A_黑.jpg', '不可以A_混合.jpg', '不可以A_混合_R.jpg']  // A组表情
let face_b = ['不可以B_白.jpg', '不可以B_黑.jpg', '不可以B_混合.jpg', '不可以B_混合_R.jpg']  // B组表情
let feed_back = ['不可以戳戳>_<', '要戳坏掉了>_<']  // 文字表情
let poke_back = ['戳_白.jpg', '戳_混合.jpg', '戳_混合_bb.jpg', '戳_混合_wb.jpg', '戳_混合_ww.jpg',
  '戳_黑.jpg', '戳_混合_R.jpg', '戳_混合_Rbb.jpg', '戳_混合_Rwb.jpg', '戳_混合_Rww.jpg',
  '戳_黑.jpg', '戳_白.jpg', '戳_白.jpg', '戳_黑.jpg', '戳_白.jpg', '戳_黑.jpg']  // 反戳表情
let good_back = ['欸嘿嘿_白.jpg', '欸嘿嘿_混合.jpg', '欸嘿嘿_混合_bb.jpg', '欸嘿嘿_混合_wb.jpg', '欸嘿嘿_混合_ww.jpg',
  '欸嘿嘿_黑.jpg', '欸嘿嘿_混合_R.jpg', '欸嘿嘿_混合_Rbb.jpg', '欸嘿嘿_混合_Rwb.jpg', '欸嘿嘿_混合_Rww.jpg',
  '欸嘿嘿_白.jpg', '欸嘿嘿_黑.jpg', '欸嘿嘿_白.jpg', '欸嘿嘿_黑.jpg', '欸嘿嘿_白.jpg', '欸嘿嘿_黑.jpg']  // 欸嘿嘿表情
let face_ugo = ['戳_动图.gif']
/**
sv = 戳戳反应
戳戳冰祈，冰祈会有回应！
如果冰祈发出了“nya~”，则说明获得了25颗星星
如果冰祈发出了“欸嘿嘿”，则说明获得了10枚金币
*/
export class poke extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '冰祈戳一戳',
      /** 功能描述 */
      dsc: '冰祈戳一戳',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'notice.group.poke',
      /** 优先级，数字越小等级越高 */
      priority: -1,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '.*',
          /** 执行方法 */
          fnc: 'poke_back_function'
        }
      ]
    })
    this._path = process.cwd()
  }

  async poke_back_function(e) {
    if (CD) {
      return true
    } else {
      CD = true
      setTimeout(function () {
        CD = false
      }, 2000)
      if (e.target_id === cfg.qq) {
        let isPic = Math.random()
        if (isPic > POKE_GET) {
          let poke_back_img = poke_back[Math.floor(Math.random() * poke_back.length)]
          await e.reply('戳回去');
          await common.sleep(500);
          await e.group.pokeMember(e.operator_id);
          await common.sleep(500);
          await e.reply(segment.image(`${this._path}/plugins/Icepray/res/icepic/${poke_back_img}`))
        } else if (isPic < 0.1) {
          await e.reply('nya~')
        } else if (isPic < 0.3) {
          let face_o_img = face_o[Math.floor(Math.random() * face_o.length)]
          await e.reply(segment.image(`file:///${_path}/plugins/Icepray/res/icepic/${face_o_img}`))
        } else if (isPic <= 0.496) {
          let face_a_img = face_a[Math.floor(Math.random() * face_a.length)]
          await e.reply(segment.image(`file:///${_path}/plugins/Icepray/res/icepic/${face_a_img}`))
        } else if (isPic > 0.496 && isPic < 0.504) {
          let bonus_gold = random.randint(25, 100)
          // 以YAML格式读取文件
          let user_data = YAML.parse(fs.readFileSync(data, 'utf8'));
          // 判断用户是否存在
          if (user_data[e.user_id] === undefined) {
            // 不存在则创建
            user_data[e.user_id] = { gold: 200 + bonus_gold, star: 12500, luckygold: 0 + 2 }
          } else {
            user_data[e.user_id].gold += bonus_gold;
            user_data[e.user_id].luckygold += 2
            // 以YAML格式写入文件
            fs.writeFileSync(data, YAML.stringify(user_data));
          }
          await e.reply([segment.image(`file:///${_path}/plugins/Icepray/res/koinori/震惊.png`)])
        } else if (isPic < 0.7) {
          let face_b_img = face_b[Math.floor(Math.random() * (face_b))]
          await e.reply([segment.image(`file:///${_path}/plugins/Icepray/res/icepic/${face_b_img}`)])
        } else if (isPic > 0.7 || isPic < 0.9) {
          let feed_back_choice = feed_back[Math.floor(Math.random() * feed_back.length)]
          await e.reply(segment.text(`${feed_back_choice}`))
        } else if (isPic >= 0.9) {
          await e.reply('诶嘿嘿')
            / 以YAML格式读取文件
          let user_data = YAML.parse(fs.readFileSync(data, 'utf8'));
          // 判断用户是否存在
          if (user_data[e.user_id] === undefined) {
            // 不存在则创建
            user_data[e.user_id] = { gold: 200 + bonus_gold, star: 12500, luckygold: 0 + 2 }
          } else {
            user_data[e.user_id].gold += bonus_gold;
            user_data[e.user_id].luckygold += 2
            // 以YAML格式写入文件
            fs.writeFileSync(data, YAML.stringify(user_data));
          }
        }
      }
    }
  }
}
