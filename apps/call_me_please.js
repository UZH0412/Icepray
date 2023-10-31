import plugin from '../../../lib/plugins/plugin.js'

let Bot = await redis.get(`koinori-Bot_nickname`)
var ban = [
    'rbq', 'RBQ', '憨批', '废物', '死妈', '崽种', '傻逼', '傻逼玩意', '贵物', '🐴',
    '没用东西', '傻B', '傻b', 'SB', 'sb', '煞笔', 'cnm', '爬', 'kkp', '你妈死了', '尼玛死了',
    'nmsl', 'D区', '口区', '我是你爹', 'nmbiss', '弱智', '给爷爬', '杂种爬', '爪巴', '冰祈',`${Bot}`
]

let segment
try {
    segment = (await import("icqq")).segment
} catch (err) {
    segment = (await import("oicq")).segment
}


const imgpath = process.cwd() + `/plugins/Icepray/res/koinori`

export class call_me_please extends plugin {
    constructor() {
        super({
            name: '我的新昵称',
            dsc: '让冰祈对你换个称呼',
            event: 'message',
            priority: 25,
            rule: [
                {
                    reg: `^(${Bot})?(请)(叫|喊)(我)(.*)`,
                    fnc: 'call_me_please'
                },
                {
                    reg: `^(${Bot})?(请)(叫|喊)(他|她|它)(.*)$`,
                    fnc: 'call_ta_please'
                },
                {
                    reg: `^(.+)?(${Bot})?(我)(是)(谁|哪个|哪位|什么|啥)(.+)?$`,
                    fnc: 'call_me_now'
                },
                {
                    reg: `^(.+)?(${Bot})?(他|她|它|TA|ta)(是)(谁|哪个|哪位|什么|啥)(.+)?$`,
                    fnc: 'call_ta_now'
                },
                {
                    reg: '^(允许|禁止)被动改名',
                    fnc: 'call_me_switch'
                },
                {
                    reg: '^#*清除昵称|删除昵称$',
                    fnc: 'dont_call_me'
                }
            ]
        })
    }


    async call_me_please(e) {
        let u = e.msg.replace(/请叫我|请喊我|叫我|喊我/g, "").trim();
        let uid = u.replace(new RegExp(Bot,'g'),"")
        if (ban.some(item => uid.includes(item))) {
            let msg = [
                `不可以教坏${Bot}`,
                segment.image(`file:///${imgpath}/no.png`)
            ]
            await e.reply(msg)
        } else {
            if (uid.length >= 20) {
                let msg = [
                    `名字太长，${Bot}记不住..`,
                    segment.image(`file:///${imgpath}/no.png`)
                ]
                await e.reply(msg)
            } else {
                await e.reply('好~')
                await redis.set(`call_me_now${e.user_id}`, uid)
            }
        }
    }


    async call_ta_please(e) {
        if (!await redis.get(`call_me_switch${e.at}`)) {
            await redis.set(`call_me_switch`, '1')
        }
        if (!e.atBot) {
        } else {
            let msg = [
                `${Bot}就是${Bot}喔~`,
                segment.image(`file:///${imgpath}/what.png`)
            ]
            await e.reply(msg)
        }
        if (!e.at) {
        } else {
            let u = e.msg.replace(/请叫他|请喊他|叫他|喊他|请叫她|请喊她|叫她|喊她|请叫它|请喊它|叫它|叫它/g, "")
            let uid = u.replace(new RegExp(Bot,'g'),"")
            if (e.atall) {
                let msg = [
                    '不可以随意艾特全体成员喔',
                    segment.image(`file:///${imgpath}/问号.png`)
                ]
                await e.reply(msg)
            } else {
                if (ban.some(item => uid.includes(item))) {
                    let msg = [
                        `不可以教坏${Bot}`,
                        segment.image(`file:///${imgpath}/no.png`)
                    ]
                    await e.reply(msg)
                } else {
                    if (uid.length >= 20) {
                        let msg = [
                            `名字太长，${Bot}记住...`,
                            segment.image(`file:///${imgpath}/no.png`)
                        ]
                        await e.reply(msg)
                    } else {
                        let k = await redis.get(`call_me_switch${e.at}`)
                        if (k == 2) {
                            let msg = [
                                '不可以改TA的昵称..',
                                segment.image(`file:///${imgpath}/no.png`)
                            ]
                            await e.reply(msg)
                        } else {
                            let key = await redis.get(`call_me_now${e.at}`)
                            if (key == null) {
                                await redis.set(`call_me_now${e.at}`, uid)
                                await e.reply('好~')
                            } else {
                                await e.reply('TA已经有昵称了')
                            }
                        }
                    }
                }
            }
        }
    }


    async call_me_now(e) {
        let uid = await redis.get(`call_me_now${e.user_id}`)
        if (uid == null) {
            uid = e.nickname;
        }
        e.reply(`是${uid}~`)
        return true;
    }


    async call_ta_now(e) {
        if (!e.atBot) {
        } else {
            await e.reply(`是${Bot}~`)
        }
        if (!e.at) {
            return true
        } else {
            if (e.atall) {
                let msg = [
                    '不可以随意艾特全体成员喔',
                    segment.image(`file:///${imgpath}/问号.png`)
                ]
                await e.reply(msg)
            } else {
                let uid = await redis.get(`call_me_now${e.at}`)
                if (uid == null) {
                    uid = e.nickname;
                }
                await e.reply(`是${uid}~`)
            }
        }
    }


    async call_me_switch(e) {
        let match_obj = e.msg.replace(/被动改名/g, '')
        if (match_obj == '允许') {
            await redis.set(`call_me_switch${e.user_id}`, '1')
            await e.reply('好~')
        }
        if (match_obj == '禁止') {
            await redis.set(`call_me_switch${e.user_id}`, '2')
            await e.reply('好~')
        }
    }


    async dont_call_me(e) {
        await redis.del(`call_me_now${e.user_id}`)
        await e.reply('已恢复昵称~')
    }
}

