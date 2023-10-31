import plugin from '../../../lib/plugins/plugin.js'
import fetch from "node-fetch";
import API from '../config/API.js'
import CONFIG from '../config/CONFIG.js'

let segment,url
try {
    segment = (await import("icqq")).segment
} catch (err) {
    segment = (await import("oicq")).segment
}

export class cloud_sucking_cat extends plugin {
  constructor() {
    super({
      name: '云吸猫',
      dsc: '随机一只猫猫',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^#*！cat|!cat$',
          fnc: 'cloud_sucking_cat'
        }
      ]
    })
  }


  async cloud_sucking_cat(e) {
    await e.reply(CONFIG.chant);
    if (Math.random() <= 0.5) {
      this.e.reply(segment.image(`http://edgecats.net/`))
      return true
    } else {
      url = API.CatUrl
      let res = await (await fetch(url)).json();
      this.e.reply(segment.image(res[0]));
      return true
    }
  }
}