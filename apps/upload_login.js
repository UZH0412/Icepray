import fetch from "node-fetch";
import plugin from "../../../lib/plugins/plugin.js";
import fs from "fs";
import YAML from 'yaml'
import { promisify } from "util";
import { pipeline } from "stream";
import { exec } from "child_process";

const _path = process.cwd().replace(/\\/g,"/");
const data = _path + '\/plugins\/Icepray\/data\/\/user_data.yaml'; //这里定义数据存储路径
const path = _path + "/plugins/Icepray/res/qiandao/user";

// 自定义图片需要的金币数
const cost_num = 30


const no = `file:///${_path}/plugins/Icepray/res/koinori/no.png`

export class upload_login extends plugin {
  constructor() {
    super({
      name: "上传签到图",
      dsc: "用户自定义背景图",
      event: "message",
      priority: 100,
      rule: [
        {
          reg: "^上传签到图片(.*)$",
          fnc: "upload_login"
        },
        {
          reg: "^清除签到图片$",
          fnc: "del"
        }
      ]
    });
  }
  
  async upload_login(e) {

    let user_data = YAML.parse(fs.readFileSync(data, 'utf8'));
    if (user_data[e.user_id] === undefined) {
      // 不存在则创建
      user_data[e.user_id] = {gold: 200 - cost_num,star: 12500,luckygold: 0}
 
      // 以YAML格式写入文件
    fs.writeFileSync(data, YAML.stringify(user_data));
    } else {
        if (user_data[e.user_id].gold < 30) {
            await e.reply(['金币不足',segment.image(no)])
        }
      user_data[e.user_id].gold -= cost_num;

      fs.writeFileSync(data, YAML.stringify(user_data));
    }
    let msg = `将扣除${cost_num}金币`
    let reply;
    if (e.source) {
      if (e.isGroup) {
        reply = (await e.group.getChatHistory(e.source.seq, 1)).pop()?.message;
      } else {
        reply = (await e.friend.getChatHistory(e.source.time, 1)).pop()
          ?.message;
      }
      if (reply) {
        for (let val of reply) {
          if (val.type == "image") {
            e.img = [val.url];
            break;
          }
        }
      }
    }
    if (!e.img) {
      e.reply("请附带图片~");
      return false;
    }
   
    // return true
    // 尝试保存图片
    const response = await fetch(e.img[0]);
    // 没获取到
    if (!response.ok) {
      e.reply(["源图片下载失败，请重试"], true);
      await this.clearCD(e);
      return true;
    }
    // 默认图片类型是jpg
    let picType = "jpg";

    const streamPipeline = promisify(pipeline);
    // 生成图片文件名
    let picPath = `${path}/${e.user_id}.${picType}`;
    logger.warn("【上传签到图片】：", picPath);
    // 写入文件
    await streamPipeline(response.body, fs.createWriteStream(picPath));
    await redis.set(`userimage_${e.user_id}`,'1');
    e.reply(`已上传图片~` + msg);
  }


  async del(e) {
    var cmdStr = `rm -rf ${path}/${e.user_id}.jpg`;

    exec(cmdStr,function (err,stdout,srderr) {
      if (err) {
        logger.warn(srderr);
      } else {
        console.log(stdout);
        redis.set(`userimage_${e.user_id}`,'0');
      }
    })
    return this.reply('已恢复默认背景~')
  }
}
