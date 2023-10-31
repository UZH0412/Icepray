import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from "../../../lib/puppeteer/puppeteer.js";
import fs from 'fs'
import YAML from 'yaml'
import moment from 'moment'


//签到和钱包卡片冷却时间，默认30秒
let cd = 30;
const _path = process.cwd().replace(/\\/g, "/");
const data = _path + '\/plugins\/Icepray\/data\/\/user_data.yaml'; //这里定义数据存储路径
let dateTime = 'YYYY-MM-DD 00:00:00'; //这里定义时间刷新时间格式是 年-月-日 时:分:秒


export class icelogin extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '冰祈签到',
      /** 功能描述 */
      dsc: '简单开发示例',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#*签到$',
          /** 执行方法 */
          fnc: 'icelogin'
        },
        {
          reg: '^#*我的钱包',
          fnc: 'money'
        }
      ]
    })
  }

  /**
   * 签到
   * @param e oicq传递的事件参数e
   */
  async icelogin(e) {
    if (!await redis.get(`icelogin_${e.user_id}_day`)) {
      await redis.set(`icelogin_${e.user_id}_day`, '0')
    }
    //签到cd
    let currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    let lastTime = await redis.get(`icelogin_${e.user_id}_cd`)
    if (lastTime && !e.isMaster) {
      let seconds = moment(currentTime).diff(moment(lastTime), 'seconds')
      e.reply(`已经领过签到卡片啦，稍微等一下再来领喔～(${cd - seconds}s)`)
      return true
    }
    var new_date = (new Date(moment(Date.now()).add(1, 'days').format(dateTime)).getTime() - new Date().getTime()) / 1000
    // await InitializeFolder(data)
    //=== 获取今日宜忌=== 
    let goodluck_list = [
      '宜 抽卡', '宜 干饭', '宜 摸鱼', '宜 刷副本',
      '宜 女装', '宜 打游戏', '宜 刷b站', '宜 无',
      '宜 逛街', '宜 好好学习', '宜 搓麻将', '宜 工作',
      '宜 点外卖', '宜 水群', '宜 睡觉', '宜 刷剧',
      '宜 做作业', '宜 刷抖音', '宜 睡觉', '宜 刷剧',
      '宜 Among Us'
    ]
    let badluck_list = [
      '忌 抽卡上头', '忌 躺平', '忌 摸鱼', '忌 刷副本',
      '忌 女装', '忌 打游戏', '忌 刷b站', '忌 看涩图',
      '忌 点外卖', '忌 水群', '忌 听音乐', '忌 背单词',
      '忌 摆烂', '忌 学习', '忌 搓麻将', '忌 做作业',
      '忌 刷抖音', '忌 睡懒觉', '忌 刷剧', '忌 无'
    ]
    var badluck
    let goodluck = goodluck_list[Math.floor(Math.random() * goodluck_list.length)]
    badluck = badluck_list[Math.floor(Math.random() * badluck_list.length)]
    let str1 = goodluck.slice(1)
    let str2 = badluck.slice(1)
    if (str1 == str2) badluck = badluck_list[Math.floor(Math.random() * badluck_list.length)]
    // ===今日人品值=== 
    var value = Math.random();
    value = Math.round(Math.random() * 101);
    let rp = ''; // 人品吐槽
    if (value == 0) {
      rp = 'QAQ...冰祈不是故意的...';
    } else if (value == 101) {
      value = 999;
      rp = '999！是隐藏的999运势！';
    } else if (value == 100) {
      rp = '100！今天说不定能发大财！！！';
    } else if (value >= 20 && value < 40) {
      rp = '运势欠佳哦，一定会好起来的！';
    } else if (value >= 40 && value < 60) {
      rp = '运势普普通通，不好也不坏噢~';
    } else if (value >= 60 && value < 80) {
      rp = '运势不错~会有什么好事发生吗？';
    } else if (value >= 80 && value < 90) {
      rp = '运势旺盛！今天是个好日子~';
    } else if (value >= 90 && value <= 99) {
      rp = '好运爆棚！一定会有好事发生吧！';
    } else {
      rp = '运势很差呢，摸摸...';
    }
    if (e.user_id == 80000000) {
      rp = -1;
      goodluck = "宜 取消匿名";
      badluck = "忌 匿名"
    }

    //===日期+签到天数===
    const today = new Date()
    let time
    let day = today.getDay()
    switch (day) {
      case 0:
        day = "星期日"
        break
      case 1:
        day = "星期一"
        break
      case 2:
        day = "星期二"
        break
      case 3:
        day = "星期三"
        break
      case 4:
        day = "星期四"
        break
      case 5:
        day = "星期五"
        break
      case 6:
        day = "星期六"
        break
    }
    time = (today.getMonth() + 1) + "月" + today.getDate() + "日" + day
    //随机获取签到获得的金币，星星，整数，范围1-5


    //===获取节日===
    let event_list = ['0101', '1225', '0214', '0308', '0401', '0405', '0501', '0601', '0622', '0701', '0801', '0822', '0929', '1001', '1010', '1011', '1101', '1111', '1224', '1225', '0121', '0122', '0205']
    let event_name_list = ['元旦节', '圣诞节', '情人节', '妇女节', '愚人节', '清明节', '劳动节', '儿童节', '端午节', '建党节', '建军节', '七夕节', '中秋节', '国庆节', '萌节', '萝莉节', '万圣节', '光棍节', '平安夜', '圣诞节', '除夕夜', '春节', '元宵节']

    let index = event_list.indexOf(moment(new Date()).format("MMDD"))
    if (!index == -1) return event_name_list[index]
    let event_flag = event_name_list[index]

    //计算累签天数
    let days = JSON.parse(await redis.get(`icelogin_${e.user_id}_day`))
    if (await redis.get(`icelogin_${e.user_id}_day`)) {
      if (days) {
        let islogin = await redis.get(`Yz:Icepray_icelogin_${e.user_id}`)
        if (!islogin) days = Number(days) + 1
      } else {
        days = 1
      }



      await redis.set(`icelogin_${e.user_id}_day`, days)
    }




    //累签星星数
    let star_num = value * 5;
    let star_add = Math.floor(Math.random() * (500, (0, (days / 10) * 50)));
    //累签金币数
    let gold_add = Math.floor(Math.random() * (100, (0, (days / 10) * 5)));
    gold_add = parseInt(gold_add);

    let r = Math.floor(Math.random() * (0, 255));
    let g = Math.floor(Math.random() * (0, 255));
    let b = Math.floor(Math.random() * (0, 255));


    let key = JSON.parse(await redis.get(`icelogin_${e.user_id}_ys`))
    if (key) {
      goodluck = key.goodluck
      badluck = key.badluck
      value = key.value
      rp = key.rp
    } else {
      key = {
        goodluck: goodluck,
        badluck: badluck,
        value: value,
        rp: rp
      }
      await redis.set(`icelogin_${e.user_id}_ys`, JSON.stringify(key), { EX: parseInt(new_date) })
    }
    //签到基础金币
    let basis_gold = 50;
    let gold_num = basis_gold + value;


    //计算幸运币
    let luckygold;
    if (value == 90 || value == 91) luckygold = 1;
    if (value > 91) {
      var req = value - 90
      if (value == 999) {
        req = 101 - 90;
        luckygold = Number(Math.ceil(Math.random() * req))
      }
      else {
        luckygold = Number(Math.ceil(Math.random() * req));
      }
    }


    //节日奖励
    let event_gold = 200;
    let event_star = 400;

    // 以YAML格式读取文件
    let user_data = YAML.parse(fs.readFileSync(data, 'utf8'));
    // 判断用户是否存在
    if (user_data[e.user_id] === undefined) {
      // 不存在则创建
      if (!luckygold) luckygold = 0;
      //判断是否为节日
      if (index == -1) {
        if (days < 10) {
          user_data[e.user_id] = { gold: 200 + gold_num, star: 12500, luckygold: 0 + luckygold }
        } else {
        user_data[e.user_id] = { gold: 200 + gold_add + gold_num, star: 12500 + star_add, luckygold: 0 + luckygold }
        }
      } else {
        if (days < 10) {
          user_data[e.user_id] = { gold: 200 + event_gold + gold_num, star: 12500+ event_star, luckygold: 0 + luckygold }
        } else {
        user_data[e.user_id] = { gold: 200 + gold_add + event_gold + gold_num, star: 12500 + star_add + event_star, luckygold: 0 + luckygold }
      }
    }
      fs.writeFileSync(data, YAML.stringify(user_data));
    } else {
      // 存在则累加
      if (index == -1) {
        if (value < 90) {
          if (days < 10) {
            let gold = gold_num;
            let star = star_num;

            user_data[e.user_id].gold += gold;
            user_data[e.user_id].star += star;
  
            // 以YAML格式写入文件
            fs.writeFileSync(data, YAML.stringify(user_data));
          } else {
          let gold = gold_add + gold_num;
          let star = star_add + star_num;

          user_data[e.user_id].gold += gold;
          user_data[e.user_id].star += star;

          // 以YAML格式写入文件
          fs.writeFileSync(data, YAML.stringify(user_data));
          }
        } else {
          if (days < 10) {
            let gold = gold_num;
            let star = star_num;

            user_data[e.user_id].gold += gold;
          user_data[e.user_id].star += star;
          user_data[e.user_id].luckygold += luckygold;

          // 以YAML格式写入文件
          fs.writeFileSync(data, YAML.stringify(user_data));
          } else {
          let gold = gold_add + gold_num;
          let star = star_add + star_num;

          user_data[e.user_id].gold += gold;
          user_data[e.user_id].star += star;
          user_data[e.user_id].luckygold += luckygold;

          // 以YAML格式写入文件
          fs.writeFileSync(data, YAML.stringify(user_data));
        }
      }
      } else {
        if (value < 90) {
          if (days < 10) {
            let gold = event_gold + gold_num;
            let star = event_star + star_num;

            user_data[e.user_id].gold += gold;
          user_data[e.user_id].star += star;

          // 以YAML格式写入文件
          fs.writeFileSync(data, YAML.stringify(user_data));
          } else {
          let gold = gold_add + event_gold + gold_num;
          let star = star_add + event_star;


          user_data[e.user_id].gold += gold;
          user_data[e.user_id].star += star;

          // 以YAML格式写入文件
          fs.writeFileSync(data, YAML.stringify(user_data));
          }
        } else {
          if (days < 10) {
            let gold = event_gold + gold_num;
            let star = event_star + star_num;

            user_data[e.user_id].gold += gold;
          user_data[e.user_id].star += star;
          user_data[e.user_id].luckygold += luckygold;

          // 以YAML格式写入文件
          fs.writeFileSync(data, YAML.stringify(user_data));
          } else {
          let gold = gold_add + event_gold + gold_num;
          let star = star_add + event_star;


          user_data[e.user_id].gold += gold;
          user_data[e.user_id].star += star;
          user_data[e.user_id].luckygold += luckygold;

          // 以YAML格式写入文件
          fs.writeFileSync(data, YAML.stringify(user_data));
          }
        }
      }
    }




    time += `     累计签到${days}天`

    // 初始化
    let uid = await redis.get(`call_me_now${e.user_id}`)


    let files = fs.readdirSync(`${_path}/plugins/Icepray/res/qiandao/img`).filter(file => file.endsWith('.jpg'))
    let num = Math.round(Math.random() * (files.length - 1))

    let touxiang = Bot.pickUser(this.e.user_id).getAvatarUrl()
    let islogin = await redis.get(`Yz:Icepray_icelogin_${e.user_id}`)

    let bsgold = gold_add + gold_num;
    let bsstar = star_add + star_num;

    let evgold = gold_add + event_gold + gold_num;
    let evstar = star_add + event_star + gold_num;


    //下面开始渲染
    let Data = {
      tplFile: './plugins/Icepray/res/qiandao/qiandao.html',
      cssFile: `${_path}/plugins/Icepray/res/qiandao`,
      saveId: 'qiandao',
      imgType: 'png',
      img: files[num],
      tou: touxiang,
      name: e.nickname,
      what: `${goodluck}  ${badluck}`,
      value: value,
      rp: rp,
      luckygold: luckygold,
      gold_add: gold_add,
      star_add: star_add,
      event_gold: event_gold,
      event_star: event_star,
      bsgold: bsgold,
      bsstar: bsstar,
      evgold: evgold,
      evstar: evstar,
      index: index,
      event_flag: event_flag,
      islogin: islogin,
      uid: uid,
      time: time,
      day: days,
      r: r,
      g: g,
      b: b
    }
    let img = await puppeteer.screenshot("icelogin", Data)
    await this.reply(img)
    await redis.set(`icelogin_${e.user_id}_cd`, currentTime, {
      EX: cd
    })
    //存入redis
    await redis.set(`Yz:Icepray_icelogin_${e.user_id}`, 1, { EX: parseInt(new_date) });
    //返回ture
    return true;
  }

  /**
   * 我的钱包
   * @param e oicq传递的事件参数e
   */
  async money(e) {
    //钱包cd
    let currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    let lastTime = await redis.get(`money_${e.user_id}_cd`)
    if (lastTime) {
      let seconds = moment(currentTime).diff(moment(lastTime), 'seconds')
      e.reply(`已经领过钱包卡片啦，稍微等一下再来领喔～(${cd - seconds}s)`)
      return true
    }
    // await InitializeFolder(data)

    let user_data = YAML.parse(fs.readFileSync(data, 'utf8'));
    if (!await redis.get(`icelogin_${e.user_id}_day`)) {
      if (user_data[e.user_id] === undefined) {
        // 不存在则创建
        user_data[e.user_id] = { gold: 200, star: 12500, luckygold: 0 }
        // 以YAML格式写入文件
        fs.writeFileSync(data, YAML.stringify(user_data));
      }
    }

    // 获取金币，星星，幸运币
    let gold = user_data[e.user_id].gold;
    let star = user_data[e.user_id].star;
    let luckygold = user_data[e.user_id].luckygold;


    // 随机选取背景图资源
    let files = fs.readdirSync(`${_path}/plugins/Icepray/res/qianbao/img`).filter(file => file.endsWith('.jpg'))
    let num = Math.round(Math.random() * (files.length - 1))

    // 获取用户头像
    let touxiang = Bot.pickUser(this.e.user_id).getAvatarUrl()

    // 获取用户昵称
    let id = await redis.get(`call_me_now${e.user_id}`)
    if (id === null) {
      id = e.nickname
    }

    //下面开始渲染图片
    let Data = {
      tplFile: './plugins/Icepray/res/qianbao/qianbao.html',
      cssFile: `${_path}/plugins/Icepray/res/qianbao`,
      saveId: 'qianbao',
      imgType: 'png',
      img: files[num],
      gold: gold,
      star: star,
      luckygold: luckygold,
      uid: id,
      name: id,
      tou: touxiang
    }

    let img = await puppeteer.screenshot("icelogin", Data)
    await this.reply(img)



    await redis.set(`money_${e.user_id}_cd`, currentTime, {
      EX: cd
    })
  }
}