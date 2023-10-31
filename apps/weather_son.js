import plugin from '../../../lib/plugins/plugin.js';
import common from '../../../lib/common/common.js';
import moment from 'moment';

let segment
try {
    segment = (await import("icqq")).segment
} catch (err) {
    segment = (await import("oicq")).segment
}
let Bot = await redis.get(`koinori-Bot_nickname`)
let son = {};
let cd = 30;
const imgpath = process.cwd() + `/plugins/Icepray/res/koinori`;

export class weather_son extends plugin {
    constructor() {
        super({
            name: '谁是天弃之子',
            dsc: '看看谁是那位幸运的天弃之子',
            event: 'message',
            priority: 1000,
            rule:
                [
                    {
                        reg: "^天弃之子$",
                        fnc: 'weather_son'
                    }
                ]
        })
    }


    async weather_son(e) {
        var key = `weather_son${e.group_id}_cd`
        if (!e.isGroup) {
            return true;
        }
        if (!e?.group.is_owner && !e?.group.is_admin) {
            const no_admin = [
                `${Bot}不是管理员啦`,
                segment.image(`file:///${imgpath}/无语.png`)
            ]
            await this.reply(no_admin);
            return true
        }
        let currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        let leicd = await redis.get(`Yz:Iceprayl:koinori_${e.group_id}`)
        if (leicd && !e.isMaster) {
            let seconds = moment(currentTime).diff(moment(leicd), 'seconds')
            e.reply(`唤雷咏唱冷却中...(${cd - seconds}s)`)
            return true
        }
        await redis.set(key, currentTime, {
            EX: cd
        })
        let mmap = await e.group.getMemberMap();
        let arrMember = Array.from(mmap.values()).filter(member => member.role == "member");;
        let randomGay = arrMember[Math.round(Math.random() * (arrMember.length - 1))];
        let name = randomGay.card;
        if (name.length == 0) {
            name = randomGay.nickname;
        }
        let who = randomGay.user_id;
        var num = Math.random();
        if (son[e.group_id]) {
            Bot.pickGroup(e.group_id).muteMember(son[e.group_id].user_id, 60);
        }
        let u = true;
        let msgsegmentname;
        if (u) {
            msgsegmentname = e.nickname;
            if (msgsegmentname.length == 0) {
                msgsegmentname = e.user_id
            }
        }
        num = Math.ceil(num * 100)
        if (num >= 0 && num <= 10) {
            await e.reply(`${Bot}咏唱中...`)
            await common.sleep(1000)
            if (e.member.is_owner) {
                let msg = [
                    `一道闪电从天而降，但${msgsegmentname}以群主之力驱散了闪电！`,
                    `一道闪电从天而降，但${msgsegmentname}以群主之力将闪电送回了天上！`
                ]
                await e.reply(msg[Math.floor(Math.random() * msg.length)])
                if (e.menber.is_admin) {
                    await e.reply(`一道闪电从天而降，但${msgsegmentname}以管理之力驱散了闪电！`,)
                }
            } else {
                /**
                 * if (e.isMaster){
                 *     await e.reply(`一道闪电从天而降，劈到了${name}，但${name}幸运地避开了！但是${msgsegmentname}对其进行了改判，为${Magic}!`)
                 *     await e.group.muteMember(who,60)
                 *     return true
                 *   } else {
                 */
                this.e.reply(`一道闪电从天而降，劈到了${name}，但${name}以一己之力将闪电送回了${msgsegmentname}的身上！`)
                await e.group.muteMember(e.user_id, 60)
            }
            await redis.set(key, currentTime, {
                EX: cd
            })
        } else if (num > 10 && num <= 70) {
            await e.reply(`${Bot}咏唱中...`)
            await common.sleep(1000)
            await e.reply(`一道闪电从天而降，劈中了${name}!`)
            e.group.muteMember(who, 60);
            await redis.set(key, currentTime, {
                EX: cd
            })
        } else if (num > 70 && num <= 80) {
            let magic = [
                '♠A', '♠10', '♠J', '♠Q', '♠K',
                '♣A', '♣2', '♣3', '♣4', '♣5', '♣6', '♣7',
                '♣8', '♣9', '♣10', '♣J', '♣Q', '♣K'
            ]
            let Magic = magic[Math.floor(Math.random() * magic.length)]
            Bot.logger.info(msgsegmentname, ':', Chant, Magic)
            Bot.logger.info('------------------------')
            await e.reply(`${Bot}咏唱中...`)
            await e.group.muteMember(who, 60)
            await common.sleep(1000)
            await e.reply(`一道闪电从天而降，但${name}幸运地避开了！但是${msgsegmentname}对其进行了改判，为${Magic}`)
            await redis.set(key, currentTime, {
                EX: cd
            })
        } else if (num > 80 && num <= 90) {
            await e.reply(`${Bot}咏唱中...`)
            await common.sleep(1000)
            await e.group.muteMember(who, 60);
            await e.group.muteMember(e.user_id, 60)
            await e.reply(`两道闪电从天而降，劈中了${name}的同时也劈中了${msgsegmentname}！`)
            await redis.set(key, currentTime, {
                EX: cd
            })
        } else { 
            let n = Math.round(Math.random() * 2)
            if (n == 1) {
                let mag = [
                    `一道闪电从天而降，但${name}幸运地避开了！`,
                    `一道闪电从天而降，劈到了${name}，但是${name}掌握了雷电之法，驱散了闪电!`,
                    `一道闪电从天而降，劈到了${name},但是${name}竟拥有雷系属性，免疫了闪电!`
                ]
                await e.reply(`${Bot}咏唱中...`)
                await common.sleep(1000)
                await e.reply(mag[Math.floor(Math.random() * mag.length)])
            } else {
                let nomagic = [
                    '♥A', '♥2', '♥3', '♥4', '♥5', '♥6', '♥7',
                    '♥8', '♥9', '♥10', '♥J', '♥Q', '♥K',
                    '♦A', '♦2', '♦3', '♦4', '♦5', '♦6', '♦7',
                    '♦8', '♦9', '♦10', '♦J', '♦Q', '♦K'
                ]
                let NoMagic = nomagic[Math.floor(Math.random() * nomagic.length)]
                await e.reply(`${Bot}咏唱中...`)
                await common.sleep(1000)
                await e.reply(`一道闪电从天而降，${name}幸运地避开了！${msgsegmentname}对其进行了改判，但为${NoMagic}`)
            }
            await redis.set(key, currentTime, {
                EX: cd
            })
        }
    }
}