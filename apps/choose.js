import plugin from '../../../lib/plugins/plugin.js'

var num = Math.random();
let segment
try {
  segment = (await import("icqq")).segment
} catch (err) {
  segment = (await import("oicq")).segment
}
let sv_help = [
    '遇事不决问问冰祈吧~\n',
    '负责回答"X不X"类问题哦'
]
let Bot = await redis.get(`koinori-Bot_nickname`)

export class choose extends plugin {
    constructor() {
        super({
            name: '遇事不决',
            dsc: '遇事不决问问冰祈吧~',
            event: 'message',
            priority: 500,
            rule: [
                {
                    reg: '^(!or|！or)+(.*)+不+(.*)$',
                    fnc: 'hp_choose'
                },
                {
                    reg: '^(!rd|！rd)+(.*)+还是+(.*)+还是(.*)$',
                    fnc: 'rd_choose'
                },
                {
                    reg: '^帮助遇事不决$',
                    fnc: 'help_in_trouble'
                }
            ]
        })
    }


    async hp_choose(e) {
        e.msg = e.msg.replace(/！or|!or/g, '')
        let message = e.msg.replace('能否', '能不能').replace('是否', '是不是');
        message = message.split("不", 4)

        let msg1 = message[0]
        let res = e.msg.match(/不/g)
        var msg2

        let msgs = `${Bot}的选择：\n`
        let yes_or_no = ''

        num = Math.ceil(num * 100)
        if (num <= 50) {
            yes_or_no = '不'
        }
        if (res.length >= 3) {
            await e.reply(`给${Bot}整不会了QAQ`)
            return true
        } else if (res.length >= 2) {
            msg2 = message[1] + yes_or_no + message[2]
        } else {
            msg2 = message[1]
        }
        if (msg1.substring(msg1.length - 1) == msg2.substring(msg2.start)); msg1 = msg1.substring(0, msg1.length - 1); console.log(msg1);
        //if (msg1.substring(msg1.substr(-1, -2)) == msg2.substring(msg2.substr(1, 2))); msg1 = msg1.substring(0, msg1.length - 1, -2); console.log(msg1); e.reply(msgs + msg1 + yes_or_no + msg2, { at: true });
        e.reply(msgs + msg1 + yes_or_no + msg2, { at: true });
    }



    async rd_choose(e) {
        let msg = e.msg.replace(/！rd|!rd/g, '')
        let message = msg.split("还是", Math.pow(2, 32) - 1)

        let mag = message[Math.floor(Math.random() * message.length - 1)]
        
        let msgs = `${Bot}的选择：\n`
        let meg = [
            segment.at(e.user_id),
            msgs + mag
        ]
        await e.reply(meg)
    }



    async help_in_trouble(e) {
        await e.reply(sv_help, { at: true })
    }
}

