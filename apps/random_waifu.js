import plugin from '../../../lib/plugins/plugin.js'
import common from '../../../lib/common/common.js';
import API from '../config/API.js'
import CONFIG from '../config/CONFIG.js'

let segment
try {
    segment = (await import("icqq")).segment
} catch (err) {
    segment = (await import("oicq")).segment
}

export class random_waifu extends plugin {
  constructor() {
    super({
      name: '随机waifu',
      dsc: '随机老婆头像',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^#?随机waifu$',
          fnc: 'random_waifu_generator'
        }
      ]
    })
  }


  async random_waifu_generator(e) {
    await e.reply(CONFIG.chant)
    var totalImages = 100000;
    let image_name = Math.floor(Math.random() * totalImages);
    let waifuUrl = API.waifuUrl + image_name + '.jpg';
    await common.sleep(1000);
    this.reply(segment.image(waifuUrl))
  }
}