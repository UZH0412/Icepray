import fs from 'fs'
import YAML from 'yaml'
import moment from 'moment'
import common from '../../../lib/common/common.js'
import CONFIG from '../config/CONFIG.js'
import serif from '../apps/fishing/serif.js'
import GetFish from '../apps/fishing/get_fish.js'
import evnet_functions from '../apps/fishing/evnet_functions.js'

let cd = 30;
const _path = process.cwd().replace(/\\/g, "/");
const info = _path + '\/plugins\/Icepray\/data\/\/user_info.yaml'; //这里定义数据存储路径
const data = _path + '\/plugins\/Icepray\/data\/\/user_data.yaml'
var bait_sleep = { '🍙': 600 }
const no = `file:///${_path}/plugins/Icepray/res/koinori/no.png`;
const ok = `file:///${_path}/plugins/Icepray/res/koinori/ok.png`;
const help = `file:///${_path}/plugins/Icepray/res/fishing_help.jpg`
let segment
try {
    segment = (await import("icqq")).segment
} catch (err) {
    segment = (await import("oicq")).segment
}
/**
let sv_help = [
    '<---冰祈与鱼--->',
    '\n#钓鱼帮助  🎣打开帮助菜单',
    '\n#钓鱼/#🎣  🎣开始钓鱼',
    '\n#买鱼饵 [数量(可选)]  🎣购买鱼饵',
    '\n#背包/#仓库  🎣查看背包',
    '\n#卖鱼/#sell [🐟🦐🦀] [数量(可选)]  🎣出售，数量和鱼用空格隔开',
    '\n#放生/#free [🐟🦐🦀] [数量(可选)]  🎣放生，同上',
    '\n#钓鱼统计/#钓鱼记录  🎣查看自己的钓鱼记录',
    '\n🔮为水之心，收集3个可以合成一个漂流瓶',
    '\n放生足够多的话可以获得特别谢礼',
    '\n#合成漂流瓶 [数量(可选)]  🎣消耗水之心合成',
    '\n#扔漂流瓶 [消息]  🎣投放一个漂流瓶'
]
*/
const default_info = {
    'waters': 'river', 'rod': 1, 'rod_dur': 65, 'free': 0, 'sell': 0, 'total_fish': 0, 'frags': 0, '🐟': 0, '🦐': 0, '🦀': 0, '🐡': 0, '🐠': 0, '🔮': 0, '✉': 0, '🍙': 0,
}


export class fishing extends plugin {
    constructor() {
        super({
            name: '冰祈与鱼',
            dsc: '',
            event: 'message',
            priority: 510,
            rule: [
                {
                    reg: '^#钓鱼帮助$',
                    fnc: 'fishing_help'
                },
                {
                    reg: '^#钓鱼统计|#钓鱼记录|＃钓鱼统计|＃钓鱼记录$',
                    fnc: 'statistic_of_fish'
                },
                {
                    reg: '^#鱼市|#钓鱼商店|#购买(.*)$',
                    fnc: 'fish_shop'
                },
                {
                    reg: '^#钓鱼|#🎣|＃钓鱼$',
                    fnc: 'go_fishing'
                },
                {
                    reg: '^(#|＃)+?(我的)?(背包|仓库)$',
                    fnc: 'my_fish'
                },
                {
                    reg: '^#(买|购买)(鱼饵|饭团|🍙)(.+)?$',
                    fnc: 'buy_bait_func'
                },
                {
                    reg: '^/1|/2|/3|/4$',
                    fnc: 'random_event_trigger'
                },
                {
                    reg: '^(＃换鱼竿|#换鱼竿)+[1,2,3,4]?$',
                    fnc: 'change_rod_func'
                },
                {
                    reg: '^(#放生 |#free |＃放生 |＃free)(🐟|🦐|🦀|🐡|🐠)+(.*)?$',
                    fnc: 'free_func'
                },
                {
                    reg: '^(#卖鱼 |#sell |#出售 |＃卖鱼 |＃sell |＃出售 )(🐟|🦐|🦀|🐡|🐠|🔮)+(.*)?$',
                    fnc: 'sell_func'
                },
                {
                    reg: '^(#合成漂流瓶|＃合成漂流瓶).*?$',
                    fnc: 'driftbottle_compound'
                },
                {
                    reg: '^#扔漂流瓶|#丢漂流瓶|＃扔漂流瓶$',
                    fnc: 'driftbottle_throw'
                },
                {
                    reg: '^#更换水域(河水|湖水|海水)|水域详情$',
                    fnc: 'changing_waters'
                }
            ]
        })
    }


    async fishing_help(e) {
        let num = Math.ceil(Math.random() * 100);
        if (num > 0 && num <= 20) {
            await e.reply('字太多了，翻看一下消息记录吧QAQ');
            return
        } else {
            await e.reply(segment.image(help));
            return
        }
    }


    async go_fishing(e) {
        let uid = e.user_id;
        await redis.set(`fishing_uid`, uid)
        let currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        let lastTime = await redis.get(`go_fishing_${e.user_id}_cd`)
        if (lastTime && !e.isMaster) {
            let seconds = moment(currentTime).diff(moment(lastTime), 'seconds')
            let cool_time_serif = serif.cool_time_serif
            let msg = cool_time_serif[Math.floor(Math.random() * cool_time_serif.length)]
            e.reply(msg);
            return
        }
        // 以YAML格式读取文件
        let user_info = YAML.parse(fs.readFileSync(info, 'utf8'));
        // 判断用户是否存在
        if (user_info[e.user_id] === undefined) {
            // 不存在则创建
            user_info[e.user_id] = default_info
            await e.reply('没有鱼饵喔，要买点鱼饵嘛？(或发送#钓鱼帮助)');
            fs.writeFileSync(info, YAML.stringify(user_info));
            return
        } else {
            if (user_info[e.user_id]['🍙'] == 0) {
                await e.reply('没有鱼饵喔，要买点鱼饵嘛？(或发送#钓鱼帮助)');
                return
            } else {
                if (user_info[e.user_id].rod_dur == 0) {
                    await e.reply([segment.at(e.user_id), "当前鱼竿耐久度为0，请更换鱼竿或维修此鱼竿"])
                    return true
                }
                user_info[e.user_id]['🍙'] -= 1;
                await e.reply('你开始了钓鱼...');
                await common.sleep(500);
                var resp = GetFish.get_fish(e);
                let code = resp.code
                let msg = resp.msg
                user_info[e.user_id].rod_dur -= 1
                let fish_type = msg.match(/🐟|🦐|🦀|🐡|🐠/g);
                if (code == 1) {
                    await common.sleep(`${bait_sleep['🍙']}`)
                    await e.reply([segment.at(e.user_id), '  ', `${msg}`]);
                    await common.sleep(500);
                    switch (fish_type) {
                        case '🐟':
                            fish_type = "🐟"
                            break;
                        case '🦐':
                            fish_type = "🦐"
                            break;
                        case '🦀':
                            fish_type = "🦀"
                            break;
                        case '🐡':
                            fish_type = "🐡"
                            break;
                        case '🐠':
                            fish_type = "🐠"
                            break;
                    }
                    var resq = msg.match(/🐟|🦐|🦀|🐡|🐠/g)
                    let fish_num = !resq ? 0 : resq.length
                    user_info[e.user_id][fish_type[0]] += fish_num;
                    user_info[e.user_id].total_fish += fish_num;
                    fs.writeFileSync(info, YAML.stringify(user_info))
                } else if (code == 2) {
                    user_info[e.user_id].rod_dur -= 1
                    if (msg == '<漂流瓶case>') {
                        let bottle_amount = get_bottle_amount();
                        let second_choose = Math.floor(Math.random() * (1, 1000));
                        let probability = Math.floor(Math.random() * (((bottle_amount / 50), 0.5) * 1000));
                        if (second_choose < probability) {
                            user_info[e.user_id]['🔮'] += 1;
                            await common.sleep(CONFIG.bait_sleep['🍙'])
                            await e.reply([segment.at(e.user_id), '你发现鱼竿有着异于平常的感觉，竟然钓到了一颗水之心🔮~'])
                            fs.writeFileSync(info, YAML.stringify(user_info))
                        } else {
                            await common.sleep(CONFIG.bait_sleep['🍙'])
                            let get_bottle = fs.readFileSync(`${_path}/plugins/Icepray/data/check_bottle.json`, 'utf8');
                            let bottle = await JSON.parse(get_bottle)
                            let msg = []
                            let qq = bottle.uid
                            let mag = bottle.msg;
                            let time = bottle.time;
                            let group = bottle.group
                            msg.push(`你钓到了${qq}的漂流瓶~\n内容为:`)
                            msg.push(`${mag}`)
                            msg.push(`投放地点(群聊)：${group}\n投放时间：${time}`)
                            await e.reply([segment.at(e.user_id), '\n你的鱼钩碰到了什么，看起来好像是一个漂流瓶！'])
                            await common.sleep(500);
                            let reply = await e.reply(await common.makeForwardMsg(e, msg, '点击查看漂流瓶内容'));
                            if (!reply) {
                                logger.error('漂流瓶为空，将替换为水之心')
                                user_info[e.user_id]['🔮'] += 1;
                                await e.reply([segment.at(e.user_id), '漂流瓶为空，将替换为水之心'])
                            }
                        }
                    } else {
                        await common.sleep(CONFIG.COOL_TIME)
                        await e.reply(msg)
                    }
                } else {
                    user_info[e.user_id].rod_dur -= 1
                    let event_flag = evnet_functions.event_list() //event_list();
                    let message = event_flag.msg;
                    let choice = event_flag.choice;
                    let coder = event_flag.coder;
                    let session = { 'code': coder }
                    let msg = message + choice + '\n(发送/+选项ID完成选择枝~)';
                    await redis.set(`fishing_event`, uid)
                    await redis.set(`fishing_event_code${e.user_id}`, coder)
                    await redis.set(`fishing_event_${e.user_id}_START`, '1');
                    await common.sleep(CONFIG.bait_sleep['🍙'])
                    await e.reply([segment.at(e.user_id), '  ', msg])
                    return session
                }
            }
        }
        await redis.set(`go_fishing_${e.user_id}_cd`, currentTime, {
            EX: cd
        })
    }


    async my_fish(e) {
        let user_info = YAML.parse(fs.readFileSync(info, 'utf8'));
        if (user_info[e.user_id] === undefined) {
            user_info[e.user_id] = default_info
            await e.reply('空空入也...')
            fs.writeFileSync(info, YAML.stringify(user_info));
        } else {
            let bait = user_info[e.user_id]['🍙'];
            let grass = user_info[e.user_id]['🐟'];
            let shrimp = user_info[e.user_id]['🦐'];
            let crab = user_info[e.user_id]['🦀'];
            let fugu = user_info[e.user_id]['🐡'];
            let tropical = user_info[e.user_id]['🐠'];
            let water = user_info[e.user_id]['🔮']
            let bottle = user_info[e.user_id]['✉']
            var bait_msg, grass_msg, shrimp_msg, crab_msg, fugu_msg, tropical_msg, water_msg, bottle_msg
            if (grass) { grass_msg = `\n🐟×${grass}` } else { grass_msg = '' }
            if (shrimp) { shrimp_msg = `\n🦐×${shrimp}` } else { shrimp_msg = '' }
            if (crab) { crab_msg = `\n🦀×${crab}` } else { crab_msg = '' }
            if (fugu) { fugu_msg = `\n🐡×${fugu}` } else { fugu_msg = '' }
            if (tropical) { tropical_msg = `\n🐠×${tropical}` } else { tropical_msg = '' }
            if (water) { water_msg = `\n🔮×${water}` } else { water_msg = '' }
            if (bottle) { bottle_msg = `\n当前可用漂流瓶✉×${bottle}` } else { bottle_msg = '' }
            if (bait) { bait_msg = `\n当前可用鱼饵🍙×${bait}` } else { bait_msg = '' }
            let msg = [
                segment.at(e.user_id),
                '  背包',
                grass_msg,
                shrimp_msg,
                crab_msg,
                fugu_msg,
                tropical_msg,
                water_msg,
                bottle_msg,
                bait_msg
            ];
            await e.reply(msg);
            return true
        }
    }


    async buy_bait_func(e) {
        let message = e.msg.match(/\d+/);
        var num
        if (!message || message == 0) {
            num = 1;
        } else if (message > 50) {
            await e.reply(['一次只能购买50个鱼饵喔', segment.image(no)]);
            num = 10;
            return true
        } else {
            num = message
        }
        let gold_num = Number(CONFIG.BAIT_PRICE * num)
        let user_data = YAML.parse(fs.readFileSync(data, 'utf8'));
        let user_info = YAML.parse(fs.readFileSync(info, 'utf8'));
        if (user_data[e.user_id] === undefined) {
            user_data[e.user_id] = user_data[e.user_id] = { gold: 200 - gold_num, star: 12500, luckygold: 0 }
            if (user_info[e.user_id] === undefined) {
                // 不存在则创建
                user_info[e.user_id] = { rod: 0, '🐟': 0, '🦐': 0, '🦀': 0, '🐡': 0, '🐠': 0, '🔮': 0, '✉': 0, '🍙': 0 + Number(num) }
                user_data[e.user_id].gold -= gold_num;
                await e.reply(`已经成功购买${num}个鱼饵啦~(金币-${gold_num})`)
                fs.writeFileSync(data, YAML.stringify(user_data));
                fs.writeFileSync(info, YAML.stringify(user_info));
            } else {
                if (!user_data[e.user_id].gold < gold_num) {
                    user_info[e.user_id]['🍙'] += Number(num);
                }
            }
            user_data[e.user_id].gold -= gold_num;
            await e.reply(`已经成功购买${num}个鱼饵啦~(金币-${gold_num})`)
            fs.writeFileSync(data, YAML.stringify(user_data));
            fs.writeFileSync(info, YAML.stringify(user_info));
        } else {
            if (user_data[e.user_id].gold < gold_num) {
                await e.reply(['金币不足喔...', segment.image(no)]);
                return
            } else {
                if (user_info[e.user_id] === undefined) {
                    // 不存在则创建
                    user_info[e.user_id] = { rod: 0, '🐟': 0, '🦐': 0, '🦀': 0, '🐡': 0, '🐠': 0, '🔮': 0, '✉': 0, '🍙': 0 + Number(num) }
                    user_data[e.user_id].gold -= gold_num;
                    await e.reply(`已经成功购买${num}个鱼饵啦~(金币-${gold_num})`)
                    fs.writeFileSync(data, YAML.stringify(user_data));
                    fs.writeFileSync(info, YAML.stringify(user_info));
                } else {
                    if (!user_data[e.user_id].gold < gold_num) {
                        user_info[e.user_id]['🍙'] += Number(num);
                    }
                }
                user_data[e.user_id].gold -= gold_num;
                await e.reply(`已经成功购买${num}个鱼饵啦~(金币-${gold_num})`)
                fs.writeFileSync(data, YAML.stringify(user_data));
                fs.writeFileSync(info, YAML.stringify(user_info));
            }
        }
    }


    async random_event_trigger(e) {
        let uid = await redis.get(`fishing_event`);
        if (e.user_id == uid) {
            let code = await redis.get(`fishing_event_code${e.user_id}`)
            let user_data = YAML.parse(fs.readFileSync(data, 'utf8'));
            let user_info = YAML.parse(fs.readFileSync(info, 'utf8'));
            if (code == 1) {
                if (e.msg == '/1') {
                    let choose = Math.floor(Math.random() * 4) + 1;
                    if (choose == 4) {
                        e.reply([segment.at(e.user_id), '   美人鱼点了点头，将金饭团递给了你！(金币+80)'])
                        user_data[e.user_id].gold += 100
                    } else {
                        e.reply([segment.at(e.user_id), '   美人鱼发现了你的谎言，收走了你钱包里的金币！(金币-40)'])
                        user_data[e.user_id].gold -= 50
                    }
                    fs.writeFileSync(data, YAML.stringify(user_data))
                } else if (e.msg == '/2') {
                    let choose = Math.floor(Math.random() * 3) + 1;
                    if (choose == 3) {
                        e.reply([segment.at(e.user_id), '   美人鱼点了点头，将银饭团递给了你！(金币+50)'])
                        user_data[e.user_id].gold += 50
                    } else {
                        e.reply([segment.at(e.user_id), '   美人鱼发现了你的谎言，收走了你钱包里的金币！(金币-30)'])
                        user_data[e.user_id].gold -= 30
                    }
                } else if (e.msg == '/3') {
                    e.reply([segment.at(e.user_id), '   美人鱼点了点头，将饭团递给了你。(鱼饵+2)'])
                    user_info[e.user_id]['🍙'] += 2
                    fs.writeFileSync(info, YAML.stringify(user_info))
                } else {
                    let choose = Math.floor(Math.random() * 8) + 1;
                    if (choose == 8) {
                        e.reply([segment.at(e.user_id), '   你的诚实打动了美人鱼，她将所有的饭团都递给了你！(金币+150，🍙+2)'])
                        user_data[e.user_id].gold += 150
                        user_info[e.user_id]['🍙'] += 2

                    } else {
                        if (choose > 2) {
                            e.reply([segment.at(e.user_id), '   美人鱼表扬了你的诚实，将鱼饵饭团送给了你。(🍙+2)'])
                            user_info[e.user_id]['🍙'] += 2
                        } else {
                            e.reply([segment.at(e.user_id), '   美人鱼点了点头，道谢后回到了水里。'])
                        }
                    }
                    fs.writeFileSync(data, YAML.stringify(user_data));
                    fs.writeFileSync(info, YAML.stringify(user_info))
                }
                await redis.del(`fishing_event_`);
                await redis.del(`fishing_event_code${e.user_id}`)
                await redis.del(`fishing_event_${e.user_id}_START`);
            } else if (code == 2) {
                if (e.msg == '/1') {
                    let user_gold = user_data[e.user_id].gold;
                    if (user_gold > 15) {
                        let bait_num = Math.floor(Math.random() * 3) + 1;
                        user_data[e.user_id].gold -= 15;
                        user_info[e.user_id]['🍙'] += bait_num;
                        await e.reply([segment.at(e.user_id), '  ', `他显得很高兴，在自己的口袋里摸索了半天，"瞧瞧我今天为你准备了什么！给你啦！"(🍙+${bait_num})`])
                    } else {
                        user_data[e.user_id].gold += 15;
                        await e.reply([segment.at(e.user_id), '  ', '你表示自己的手头也很紧，他苦笑了一下，"今天还是算了吧，那希望我的这点钱能帮你度过难关！"(金币+15)'])
                    }
                } else if (e.msg == '/2') {
                    let user_lucky = user_data[e.user_id].luckygold;
                    if (user_lucky > 2) {
                        let crystal_num = Math.floor(Math.random() * 3) + 1;
                        user_data[e.user_id].luckygold -= 2;
                        user_info[e.user_id]['🔮'] += crystal_num;
                        await e.reply([segment.at(e.user_id), '  ', `他显得很高兴，在自己的口袋里摸索了半天，"瞧瞧我今天为你准备了什么！给你啦！"(🔮+${crystal_num})`])
                    } else {
                        user_data[e.user_id].gold += 15;
                        await e.reply([segment.at(e.user_id), '  ', '你表示自己的手头也很紧，他苦笑了一下，"今天还是算了吧，那希望我的这点钱能帮你度过难关！"(金币+15)'])
                    }
                } else {
                    let choose = Math.floor(Math.random() * 3) + 1;
                    if (choose == 1) {
                        await e.reply([segment.at(e.user_id), '  ', '“你推我做什么!!哎呀你这人!”他大喊大叫着走了。回到竿前，你发现鱼饵已经被鱼吃掉了。'])
                    } else {
                        let get_ran_fish = fish()
                        user_info[e.user_id][`${get_ran_fish}`] += 1;
                        await e.reply([segment.at(e.user_id), '  ', `“你推我做什么!!哎呀你这人!”他大喊大叫着走了。回到竿前，你发现一条鱼正在咬钩。(${get_ran_fish}+1)`])
                    }
                }
                await redis.del(`fishing_event_`);
                await redis.del(`fishing_event_code${e.user_id}`)
                await redis.del(`fishing_event_${e.user_id}_START`);
                fs.writeFileSync(data, YAML.stringify(user_data));
                fs.writeFileSync(info, YAML.stringify(user_info))
            } else if (code == 3) {
                if (e.msg == '/1') {
                    let fish_num = Math.floor(Math.random() * 3) + 1;
                    user_info[e.user_id]['🐟'] += fish_num;
                    await e.reply([segment.at(e.user_id), '  ', `你屏息凝神，发现鱼比往常更加活跃，趁着大雨连续钓到了${fish_num}条鱼！(🐟+${fish_num})`])
                } else {
                    let gold_num = Math.floor(Math.random() * 25) + 5;
                    user_data[e.user_id].gold += gold_num;
                    await e.reply([segment.at(e.user_id), '  ', `你找到了一处废弃的小屋躲雨，在屋内休息时发现地上散落着一些钱币。(金币+${gold_num})`])
                }
                await redis.del(`fishing_event_`);
                await redis.del(`fishing_event_code${e.user_id}`)
                await redis.del(`fishing_event_${e.user_id}_START`);
                fs.writeFileSync(data, YAML.stringify(user_data));
                fs.writeFileSync(info, YAML.stringify(user_info))
            } else if (code == 4) {
                if (e.msg == '/1') {
                    let choose = Math.floor(Math.random() * 3) + 1;
                    if (choose == 1) {
                        user_info[e.user_id]['🐟'] += 1;
                        user_info[e.user_id]['🦐'] += 1;
                        user_info[e.user_id]['🦀'] += 1;
                        user_info[e.user_id]['🐡'] += 1;
                        user_info[e.user_id]['🐠'] += 1
                        await e.reply([segment.at(e.user_id), '  ', '文字散发出白色的光芒，水里的鱼儿开始躁动不安，纷纷往岸边游去。你收获颇丰。(🐟🦐🦀🐡🐠各+1)'])
                    } else if (choose == 2) {
                        let gold_num = Math.floor(Math.random() * 25) + 10;
                        user_data[e.user_id].gold += gold_num;
                        await e.reply([segment.at(e.user_id), '  ', `文字散发出红色的光芒，书本随即变成了一堆金币。(金币+${gold_num})`])
                    } else if (choose == 3) {
                        user_data[e.user_id].luckygold += 3;
                        await e.reply([segment.at(e.user_id), '  ', '文字散发出蓝色的光芒，你感觉你的幸运提升了。果然不久之后，你钓上了装有幸运币的布包。(幸运币+3)'])
                    } else {
                        let gold_num = Math.floor(Math.random() * (1, 10));
                        user_data[e.user_id].gold -= gold_num;
                        await e.reply([segment.at(e, user_id), '  ', `文字散发出黑色的光芒，你感觉书本正在你的身上寻找着什么。(金币-${gold_num})`])
                    }
                } else if (e.msg == '#2') {
                    let choose = Math.floor(Math.random() + 1);
                    if (choose == 1) {
                        user_info[e.user_id]['🔮'] += 1;
                        await e.reply([segment.at(e.user_id), '  ', '你默默阅读着文字。书中的魔力引导着你的思绪，使你仿佛徜徉于海底。回过神来，发现手中已没有了书，而是握着一颗水之心。(水之心+1)'])
                    } else {
                        user_data[e.user_id]['🍙'] += 1;
                        await e.reply([segment.at(e.user_id), '  ', '你默默阅读着文字。书中的魔力引导着你的思绪，使你仿佛翱翔于天际。回过神来，发现自己正躺在地上，那本书也没有了踪迹。(🍙+1)'])
                    }
                } else if (e.msg == '/3') {
                    let ran_fish_list = ['🐟', '🦐', '🦀']
                    let random_fish = ran_fish_list[Math.floor(Math.random() * ran_fish_list.length)]
                    user_info[e.user_id][random_fish] += 1;
                    await e.reply([segment.at(e.user_id), '  ', `你感觉到书本散发的能量超出了自己的认知，还是尽快脱手为好。不久后你钓上了一条${random_fish}。`])
                }
                await redis.del(`fishing_event_`);
                await redis.del(`fishing_event_code${e.user_id}`)
                await redis.del(`fishing_event_${e.user_id}_START`);
                fs.writeFileSync(data, YAML.stringify(user_data));
                fs.writeFileSync(info, YAML.stringify(user_info))
            } else if (code == 5) {
                let msg = '    你将一枚金币放入投币口，拉下拉杆，一阵响动后，';
                user_data[e.user_id].gold -= 1;
                if (e.msg == '/1') {
                    let choose = Math.floor(Math.random() * 3) + 1;
                    if (choose == 1) {
                        let gold_num = Math.floor(Math.random() * (5, 15));
                        user_data[e.user_id].gold += gold_num;
                        await e.reply([segment.at(e.user_id), msg + `从出货口里掉出了一些金币。(金币+${gold_num})`])
                    } else if (choose == 2) {
                        user_data[e.user_id].luckygold += 1;
                        await e.reply([segment.at(e.user_id), '从出货口里掉出了一枚幸运币。(幸运币+1)'])
                    } else if (choose == 3) {
                        let bait_num = Math.floor(Math.random() * 3) + 2;
                        user_info[e.user_id]['🍙'] += bait_num;
                        await e.reply([segment.at(e.user_id), msg + `出货口掉出了一袋鱼饵。(鱼饵+${bait_num})`])
                    } else {
                        let random_fish_list = ['🦐', '🦀', '🐡', '🐠']
                        let random_fish = random_fish_list[Math.floor(Math.random() * random_fish_list.length)];
                        user_info[e.user_id][random_fish] += 1;
                        await e.reply([segment.at(e.user_id), `什么事也没有发生。你感觉受到了欺骗，丢掉老虎机后继续钓起了鱼。(${fish()}+1)`])
                    }
                } else if (e.msg == '/2') {
                    let msg = '    你将两枚幸运币放入投币口，拉下拉杆，一阵响动后，';
                    user_info[e.user_id]['🔮'] += 1;
                    await e.reply([segment.at(e.user_id), msg + '老虎机渐渐被柔和的光包围，与此同时其形状也开始发生变化，最终化为了一颗水之心，静静地躺在你的手里。(🔮+1)'])
                } else if (e.msg == '/3') {
                    let choose = Math.round(Math.random() + 1);
                    if (choose == 1) {
                        let random_fish = fish();
                        user_info[e.user_id][random_fish] += 1;
                        await e.reply([segment.at(e.user_id), `你感觉这个在水里泡过的老虎机并不会正常工作，于是将它丢回了水里并继续钓起了鱼。(${random_fish}+1)`])
                    } else {
                        user_data[e.user_id].gold += 15;
                        await e.reply([segment.at(e.user_id), '你感觉这个在水里泡过的老虎机并不会正常工作，但其本身应该还能换点钱。你回去后将它卖了出去。(金币+15)'])
                    }
                } else {
                    user_data[e.user_id].luckygold += 1;
                    await e.reply([segment.at(e.user_id), '出于好奇，你将老虎机拆开，发现里面有一枚幸运币，是其他人投进去的吧？(幸运币+1)'])
                }
                await redis.del(`fishing_event_`);
                await redis.del(`fishing_event_code${e.user_id}`)
                await redis.del(`fishing_event_${e.user_id}_START`);
                fs.writeFileSync(data, YAML.stringify(user_data));
                fs.writeFileSync(info, YAML.stringify(user_info))
            } else if (code == 6) {
                if (e.msg == '/1') {
                    let choose = Math.floor(Math.random() + 1);
                    if (choose == 1) {
                        let fishes1 = GetFish.fish();
                        let fishes2 = GetFish.fish();
                        let fishes3 = GetFish.fish();
                        user_info[e.user_id][fishes1, fishes2, fishes3] += 1;
                        await e.reply([segment.at(e.user_id), '  ', `喝下水后，你感觉自己的感官变得十分敏锐，短时间内连续钓上了三条鱼。(获得${fishes1}${fishes2}${fishes3})`])
                    } else {
                        await e.reply([segment.at(e.user_id), '  ', '喝下水后，你感觉自己的感官变得迟钝起来，很长时间里都让咬钩的鱼跑掉了。'])
                    }
                } else {
                    let random_fish = fish();
                    user_info[e.user_id][random_fish] += 1;
                    await e.reply([segment.at(e.user_id), '  ', `你感觉这个水并不卫生，倒了一些出来研究了一番，无果后将水瓶扔回了水里，随后继续钓起了鱼。(${random_fish}+1)`])
                }
                await redis.del(`fishing_event_`);
                await redis.del(`fishing_event_code${e.user_id}`)
                await redis.del(`fishing_event_${e.user_id}_START`);
                fs.writeFileSync(data, YAML.stringify(user_data));
                fs.writeFileSync(info, YAML.stringify(user_info))
            } else {
                if (CONFIG.DEBUG_MODE) {
                    logger.info('随机事件未触发,事件标志未立起')
                }
                await redis.del(`fishing_event_`);
                await redis.del(`fishing_event_code${e.user_id}`)
                await redis.del(`fishing_event_${e.user_id}_START`);
                return this.reply("DE_BUG")
            }
        } else {
            logger.info("非触发者的选择")
            return true
        }
    }


    async change_rod_func(e) {
        var mode;
        let rod_help = [
            '当前鱼竿：', '\n',
            '1.普通鱼竿', '\n',
            '2.永不空军鱼竿(不会空军)', '\n',
            '3.海之眷顾鱼竿(稀有鱼概率UP)', '\n',
            '4.时运鱼竿(概率双倍鱼)', '\n',
            '发送"#换鱼竿+ID"更换鱼竿'
        ]
        let user_info = YAML.parse(fs.readFileSync(info, 'utf8'));
        if (user_info === undefined) {
            user_info = default_info
        }
        let _id = e.msg.replace(/#换鱼竿|＃换鱼竿/g, "");
        if (!_id) {
            await e.reply(rod_help)
        } else {
            if (_id == 1) {
                mode = '普通鱼竿'
            } else if (_id == 2) {
                mode = '永不空军钓竿'
            } else if (_id == 3) {
                mode = '海之眷顾钓竿'
            } else {
                mode = '时运钓竿'
            }
            if (_id == 1) {
                user_info[e.user_id].rod = 1
                await e.reply([segment.at(e.user_id), '  已更换鱼竿：' + mode])
            } else if (_id == 2) {
                let rod = await redis.get(`rod_two${e.user_id}`)
                if (!rod) {
                    await e.reply([segment.at(e.user_id), '  ', '还没有拿到这个鱼竿喔'])
                    return true
                } else {
                    user_info[e.user_id].rod = 2
                    await e.reply([segment.at(e.user_id), '  ', `已更换鱼竿：` + mode])
                }
            } else if (_id == 3) {
                let rod = await redis.get(`rod_therr${e.user_id}`)
                if (!rod) {
                    await e.reply([segment.at(e.user_id), '  ', '还没有拿到这个鱼竿喔'])
                    return true
                } else {
                    user_info[e.user_id].rod = 3
                    await e.reply([segment.at(e.user_id), '  ', `已更换鱼竿：` + mode])
                }
            } else if (_id == 4) {
                let rod = await redis.get(`rod_four${e.user_id}`)
                if (!rod) {
                    await e.reply([segment.at(e.user_id), '  ', '还没有拿到这个鱼竿喔'])
                    return true
                } else {
                    user_info[e.user_id].rod = 4
                    await e.reply([segment.at(e.user_id), '  ', `已更换鱼竿：` + mode])
                }
                fs.writeFileSync(info, YAML.stringify(user_info))
            }
        }
    }


    async free_func(e) {
        let msg = e.msg.replace(/#放生|#free| +/g, "")
        let fish_type = msg.match(/🐟|🦐|🦀|🐡|🐠/g); // 鱼的类型
        let fish_num = e.msg.match(/\d+/g); // 鱼的数量
        let user_info = YAML.parse(fs.readFileSync(info, 'utf8')); // 用户数据
        switch (fish_type[0]) {
            case '🐟':
                fish_type = "🐟"
                break;
            case '🦐':
                fish_type = "🦐"
                break;
            case '🦀':
                fish_type = "🦀"
                break;
            case '🐡':
                fish_type = "🐡"
                break;
            case '🐠':
                fish_type = "🐠"
                break;
        }
        if (user_info[e.user_id][`${fish_type}`] < fish_num[0]) {
            await e.reply([segment.at(e.user_id), '数量不足喔']) // 没有这么多鱼
            return true
        } else {
            let addition;
            let get_frags = CONFIG.FISH_PRICE[fish_type] * fish_num[0];
            let frags_num = user_info[e.user_id].frags; // 获取已有的水之心碎片数量
            if ((frags_num + get_frags * fish_num[0]) >= CONFIG.FRAG_TO_CRYSTAL) { // 总和是否超过100
                addition = `\n一条美人鱼浮出水面！为了表示感谢，TA将${parseInt((frags_num + get_frags) / CONFIG.FRAG_TO_CRYSTAL)}颗水之心放入了你的手中~`
            } else {
                addition = ''
            }
            user_info[e.user_id].frags = ((frags_num + get_frags) % CONFIG.FRAG_TO_CRYSTAL); // 超过100则减去100
            user_info[e.user_id]['🔮'] += parseInt((frags_num + get_frags) / CONFIG.FRAG_TO_CRYSTAL); // 水之心+1
            await e.reply([segment.at(e.user_id), `  ${fish_num}条${fish_type}成功回到了水里，获得${get_frags}个水心碎片~` + addition]) // 回复
            user_info[e.user_id][`${fish_type}`] -= fish_num[0]; // 鱼的数量减少
            user_info[e.user_id].free += Number(fish_num[0]); //累计放生的鱼的数量
            fs.writeFileSync(info, YAML.stringify(user_info)); // 写入数据
            return true
        }
    }


    async driftbottle_throw(e) {
        let message = e.msg.replace(/#扔漂流瓶|#丢漂流瓶|＃扔漂流瓶| +/, "");
        let uid = e.user_id;
        let user_info = YAML.parse(fs.readFileSync(info, 'utf8'))
        let msg = message.toString()
        let group_id = e.group_id
        let time = moment().format("MM-DD HH:mm:ss")
        if (!user_info[e.user_id]['✉']) {
            await e.reply(['背包里没有漂流瓶喔', segment.image(no)]);
            return
        }
        if (e.msg.match(/http|https/g)) {
            await e.reply('含有链接，不可以放进漂流瓶里...')
            return true
        } else if (e.msg.length >= 200) {
            await e.reply('字数太多了，漂流瓶里放不下...')
            return true
        } else {
            await e.reply('你将漂流瓶放入了水中，目送它漂向诗与远方...');
        }
        let config = { "uid": uid, "msg": msg, "group": group_id, "time": time }
        try {
            user_info[e.user_id]['✉'] -= 1
            fs.writeFileSync(`${_path}/plugins/Icepray/data/check_bottle.json`, JSON.stringify(config), 'utf8');
            fs.writeFileSync(info, YAML.stringify(user_info))
        } catch (error) {
            logger.error("漂流瓶存放失败")
        }
    }


    async driftbottle_compound(e) {
        let message = e.msg.match(/\d+/g);
        var num
        let user_info = YAML.parse(fs.readFileSync(info, 'utf8'))
        if (!message || message == 0) {
            num = 1
        } else {
            num = message
        }

        if (user_info[e.user_id]['🔮'] < CONFIG.CRYSTAL_TO_BOTTLE) {
            await e.reply('要三个🔮才可以合成一个漂流瓶体喔');
            return true
        } else {
            if (num * 3 > user_info[e.user_id]['🔮']) {
                await e.reply("水之心数量不足够合成这么多漂流瓶体喔~")
                return true
            }
            user_info[e.user_id]['🔮'] -= num * 3
            user_info[e.user_id]['✉'] += Number(num);
            await e.reply(`${num * 3} 个🔮发出柔和的光芒，融合成了${num} 个漂流瓶体！\n可以使用"#扔漂流瓶+内容"来投放漂流瓶了！`);
            fs.writeFileSync(info, YAML.stringify(user_info));
        }
    }


    async sell_func(e) {
        e.msg = e.msg.replace(/ +/g, "")
        let fish_type = e.msg.match(/🐟|🦐|🦀|🐡|🐠|🔮/g); // 鱼的类型
        let fish_num = e.msg.match(/\d+/g); // 鱼的数量
        let user_info = YAML.parse(fs.readFileSync(info, 'utf8')); // 用户数据
        let user_data = YAML.parse(fs.readFileSync(data, 'utf8'))
        switch (fish_type[0]) {
            case '🐟':
                fish_type = "🐟"
                break;
            case '🦐':
                fish_type = "🦐"
                break;
            case '🦀':
                fish_type = "🦀"
                break;
            case '🐡':
                fish_type = "🐡"
                break;
            case '🐠':
                fish_type = "🐠"
                break;
            case '🔮':
                fish_type = "🔮"
        }
        if (user_info[e.user_id][`${fish_type}`] < fish_num[0]) {
            await e.reply([segment.at(e.user_id), '数量不足喔']) // 没有这么多鱼
            return true
        } else {
            let get_golds = CONFIG.FISH_PRICE[fish_type] * fish_num[0]
            user_info[e.user_id][`${fish_type}`] -= fish_num[0]
            user_info[e.user_id].sell += Number(fish_num[0])
            user_data[e.user_id].gold += get_golds
            user_info[e.user_id].sell += get_golds
            await e.reply(`成功出售了${fish_num[0]}条${fish_type}, 得到了${get_golds}枚金币~`)
            fs.writeFileSync(info, YAML.stringify(user_info));
            fs.writeFileSync(data, YAML.stringify(user_data))
        }
    }


    async statistic_of_fish(e) {
        let user_info = YAML.parse(fs.readFileSync(info, 'utf8'));
        var free_msg, sell_msg, total_fish_msg
        if (user_info[e.user_id].free) {
            free_msg = `已放生${user_info[e.user_id].free} 条鱼`;
        } else {
            free_msg = '还没有放生过鱼'
        }
        if (user_info[e.user_id].sell) {
            sell_msg = `已卖出${user_info[e.user_id].sell} 金币的鱼`;
        } else {
            sell_msg = '还没有卖出过鱼'
        }
        if (user_info[e.user_id].total_fish) {
            total_fish_msg = `总共钓上了${user_info[e.user_id].total_fish} 条鱼`
        } else {
            total_fish_msg = '还没有钓上过鱼'
        }
        await e.reply([segment.at(e.user_id), `钓鱼统计：\n${free_msg} \n${sell_msg} \n${total_fish_msg} `])
    }


    async changing_waters(e) {
        if (e.msg == '水域详情') {
            await e.reply("当前水域：河水(默认)，未解锁水域:湖水，海水\n河水水域热带鱼较少，水域等级越高，热带鱼随之越多\n湖水水域解锁需要：累计热带鱼钓到50条\n海水水域解锁需要：累计热带鱼钓到100条")
            return true
        }
        let waters = e.msg.replace(/#更换水域/g, "")
        let user_info = YAML.parse(fs.readFileSync(info, 'utf8'))
        if (waters == '河水') {
            user_info[e.user_id].waters = "river"
        } else if (waters == '湖水') {
            let key = await redis.get(`fishing_waters${e.user_id} _lake`)
            if (!key) {
                await e.reply([segment.at(e.user_id), "您还为解锁该水域喔~"])
                return true
            }
            user_info[e.user_id].waters = "lake"
        } else {
            let key = await redis.get(`fishing_waters${e.user_id} _sea`)
            if (!key) {
                await e.reply([segment.at(e.user_id), "您还未解锁该水域喔~"])
                return true
            }
            user_info[e.user_id].waters = "sea"
        }
        await e.reply("更换水域成功，当前水域：" + waters)
        fs.writeFileSync(info, YAML.stringify(user_info))
    }



    async fish_shop(e) {
        if (e.msg == '#鱼市' || e.msg == '#钓鱼商城') {
            await e.reply([segment.at(e.user_id), '  ', '欢迎光临冰祈杂货铺！小铺商品如下：'])
            await common.sleep(500)
            const shop_data = [
                '道具名称', ' 耐久度 ', '价格', '\n',
                '电击器  可使用2次 (金币500)', '\n',
                '发送 #购买 + 道具名称 购买道具'
            ]
            await e.reply(shop_data)
            return true
        }
        let user_info = YAML.parse(fs.readFileSync(info, 'utf8'))
        let user_data = YAML.parse(fs.readFileSync(data, 'utf8'))
        e.msg = e.msg.replace(/#购买/g, "")
        if (e.msg == '电击器') {
            if (user_data[e.user_id].gold < 500) {
                await e.reply([segment.at(e.user_id), "   金币不够喔~", segment.image(no)])
                return true
            } else {
                user_data[e.user_id].gold -= 500
                user_info[e.user_id].djq += 2

                fs.writeFileSync(info, YAML.stringify(user_info));
                fs.writeFileSync(data, YAML.stringify(user_data))
                await e.reply([segment.at(e.user_id), '  ', '   已经成功购买电击器啦~(金币-500)', segment.image(ok)])
                return true
            }
        } else if (e.msg == '普通鱼竿') {
            if (user_data[e.user_id].gold < 50) {
                await e.reply([segment.at(e.user_id), "   金币不够喔~", segment.image(no)])
                return true
            }
            user_data[e.user_id].gold -= 50
            user_info[e.user_id].rod_dur += 65

            fs.writeFileSync(info, YAML.stringify(user_info));
            fs.writeFileSync(data, YAML.stringify(user_data))
            await e.reply([segment.at(e.user_id), '  ', '   已经成功购买普通鱼竿啦~(金币-50)', segment.image(ok)])
            return true
        }
    }


    async makeForwardMsg(qq, title, msg) {
        let nickname = Bot.nickname
        if (this.e.isGroup) {
            let info = await Bot.getGroupMemberInfo(this.e.group_id, qq)
            nickname = info.card ?? info.nickname
        }
        let userInfo = {
            user_id: Bot.uin,
            nickname
        }
        let forwardMsg = [
            {
                ...userInfo,
                message: title
            },
            {
                ...userInfo,
                message: msg
            }
        ]
        /** 制作转发内容 */
        if (this.e.isGroup) {
            forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
        } else {
            forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
        }
        /** 处理描述 */
        forwardMsg.data = forwardMsg.data
            .replace(/\n/g, '')
            .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
            .replace(/___+/, `< title color = "#777777" size = "26" > ${title}</title > `)
        return forwardMsg
    }

    // 用户自定义漂流瓶
    async check_bottle() {
        let get_bottle = fs.readFileSync(`${_path} /plugins/Icepray / data / check_bottle.json`, 'utf8');
        get_bottle = await JSON.parse(get_bottle)
        let qq = get_bottle.uid
        let msg = get_bottle.msg;
        let bottle = `你钓到了${qq} 的漂流瓶，内容为：` + '\n' + msg
        logger.info(bottle)
        return bottle
    }
}



/**
// 随机得到一只鱼
function fish(rod, waters) {
    var fish;
    var fish_list
    if (waters == 'river') {
        fish_list = ['🐟', '🦐', '🦀', '🐡', '🐠']
    } else if (waters == 'lake') {
        fish_list = ['🐟', '🦐', '🦀', '🐡', '🐠', '🐙']
    } else {
        fish_list = ['🐟', '🦐', '🦀', '🐡', '🐠', '🐙']
    }
    if (rod == 3) {
        if (second_choose <= 50) {
            let enchanted_book = [
                '海之眷顾', '耐久', '经验修补', '消失诅咒'
            ]
            fish = enchanted_book[Math.floor(Math.random() * enchanted_book.length)]
        } else if (second_choose() <= 300) {
            fish = fish_list[0]
        } else if (second_choose() <= 500) {
            fish = fish_list[1]
        } else if (second_choose() <= 700) {
            fish = fish_list[2]
        } else if (second_choose() <= 800) {
            fish = fish_list[3]
        } else {
            fish = fish_list[4]
        }
    } else {
        let PROBABILITY_2 = [300, 550, 750, 900, 1000]
        if (second_choose <= 50) {
            let enchanted_book = [
                '海之眷顾', '耐久', '经验修补', '消失诅咒'
            ]
            fish = enchanted_book[Math.floor(Math.random() * enchanted_book.length)]
        } else if (second_choose() <= PROBABILITY_2[0]) {
            fish = fish_list[0]
        } else if (second_choose() <= PROBABILITY_2[1]) {
            fish = fish_list[1]
        } else if (second_choose() <= PROBABILITY_2[2]) {
            fish = fish_list[2]
        } else if (second_choose() <= PROBABILITY_2[3]) {
            fish = fish_list[3]
        } else {
            fish = fish_list[4]
        }
    }
    return fish
}

function second_choose() {
    let num = randomNum(1, 1000);
    return num
}


function get_fish_serif() {
    let get_fish_serif_list = [
        `一个${fish()}上钩了~`,
        `一个华丽的起竿，${fish()}正乖乖地挂在鱼钩上~`,
        `${fish()} 铤而走险，但美味与危机并存，这一次它失误了...`,
        `${fish()} 咬钩后试图挣扎逃跑，但你起竿的速度更胜一筹...`,
        `${fish()} 在挣扎过程中回想着自己的一生，然后放弃了挣扎...`,
        `${fish()}上钩了~`,
        `${fish()}在与鱼钩战斗时被戳晕了...`,
        `钓上了${fish()} ~`,
        `你感觉鱼钩上有什么东西在动，是一个${fish()} ~`
    ];
    let get_fish_serif = get_fish_serif_list[Math.floor(Math.random() * (get_fish_serif_list.length))]
    return get_fish_serif
}

function no_fish_serif() {
    let no_fish_serif_list = [
        `你感觉鱼钩上有什么东西在动，是一团海草！但并不是鱼，背包拒绝了它。`,
        `鱼钩进水过猛砸死了鱼，你没有钓到鱼...`,
        `一条侦察鱼提前通知了这片水域的其他居民，你钓了很久依旧没有收获...`,
        `鱼在享用鱼饵是不慎撑死，你试图将它钓起并放进背包，但背包拒绝了死掉的鱼...`,
        `鱼儿在挣脱鱼钩时溺水而亡...你没有钓到鱼...`,
        '鱼儿背水一战，将鱼线挣断了！你没有钓到鱼...',
        '鱼儿在挣扎过程中回想着自己的一生，然后拼命摆动，逃跑了！',
        '你钓上了一条鱼~然而它将自己改成了创造模式，飞走了！',
        '鱼在偷咬鱼饵时不慎撑坏肚子与世长辞，你试图将它放进背包，但背包拒绝了它..'
    ];
    let no_fish_serif = no_fish_serif_list[Math.floor(Math.random() * (no_fish_serif_list.length))]
    return no_fish_serif
}


function randomNum(min, max) {
    var range = max - min;
    var rand = Math.random();
    var num = min + Math.round(rand * range);
    return num;
}

function get_fish(e) {
    // 获取用户钱包及背包数据
    let user_data = YAML.parse(fs.readFileSync(data, 'utf8'))
    let user_info = YAML.parse(fs.readFileSync(info, 'utf8'))
    let total_fish = user_info[e.user_id].total_fish
    if (total_fish >= 300) {
        redis.set(`fishing_waters${e.user_id} _lake`, '1')
    }
    if (total_fish >= 500) {
        redis.set(`fishing_waters${e.user_id} _sea`, '1')
    }
    // 获取用户鱼竿
    let rod = user_info[e.user_id].rod;
    let waters = user_info[e.user_id].waters
    let multi;
    let add_msg;
    var result, mode, first_choose
    let fishes = fish(rod, waters)
    if (fishes == '消失诅咒') {
        user_info[e.user_id].rod = "null"
        result = { "code": 1, "msg": `你钓到了一本附魔书，但是为消失诅咒！你失去了钓鱼竿..` }
        return result
    }
    var MODE_INFO = [
        '普通鱼竿',
        '永不空军钓竿(不会空军)',
        '海之眷顾钓竿(稀有鱼概率UP)',
        '时运钓竿(概率双倍鱼)'
    ]
    if (rod == 1) {
        mode = MODE_INFO[0]
    } else if (mode == 2) {
        mode = MODE_INFO[1]
    } else if (mode == 3) {
        mode = MODE_INFO[2]
    } else {
        mode = MODE_INFO[3]
    }
    if (rod == 2) {
        first_choose = randomNum(150, 1000)
    } else {
        first_choose = randomNum(1, 1000)
    }
    logger.info(`玩家${e.user_id} 使用钓竿：${mode}，随机数为${second_choose()} `)
    if (first_choose > 0 && first_choose <= 150) {
        if (rod == 2) {
            result = { 'code': 1, 'msg': `钓到了一条${fishes} ~` }
        } else {
            result = { 'code': 1, 'msg': no_fish_serif() }
        }
    } else if (first_choose > 150 && first_choose <= 230) {
        result = { 'code': 3, 'msg': '<随机事件case>' }
    } else if (first_choose > 230 && first_choose <= 750) { // 获取鱼模式
        if (rod == 4) { // 判断鱼竿是否为时运
            multi = Math.round(Math.random() + 1)
        }
        if (multi > 1) { // 触发时运效果 获得的鱼随机增加
            add_msg = `另外，鱼竿发动了时运效果，${fishes}变成了${multi} 条！`
        } else {
            add_msg = ''
        }
        let mag = `钓到了一条${fishes} ~`
        let choose = Math.floor(Math.random() * (1, 10))
        if (choose <= 5) {
            result = { 'code': 1, 'msg': mag + add_msg + `\n你将鱼放进了背包。` }
        } else {
            result = { 'code': 1, 'msg': get_fish_serif() + add_msg + `\n你将鱼放进了背包。` }
        }
    } else if (first_choose > 750 && first_choose <= 880) { // 漂流瓶模式
        let second_choose = Math.floor(Math.random() * (1, 1000));
        let coin_amount; // 得到的金币数
        if (second_choose <= 800) {
            coin_amount = Math.ceil(Math.random() * 30)
            result = { 'code': 2, 'msg': `你钓到了一个布包，里面有${coin_amount} 枚金币，但是没有钓到鱼...` }
            user_data[e.user_id].gold += coin_amount;
        } else {
            coin_amount = Math.ceil(Math.random() * 3);
            result = { 'code': 2, 'msg': `你钓到了一个锦囊，里面有${coin_amount} 枚幸运币，但是没有钓到鱼...` }
            user_data[e.user_id].gold += coin_amount;
        }
        fs.writeFileSync(data, YAML.stringify(user_data));
    } else {
        result = { 'code': 2, 'msg': '<漂流瓶case>' }
    }
    return result
}


// 随机故事集
function event_list() {
    let threeted_choose = Math.floor(Math.random() * (1, 600));
    let message;
    if (threeted_choose <= 100) {
        message = {
            'coder': 1,
            'msg':
                '在钓鱼时，你发现河中出现了一个漩涡，一条美人鱼从中浮起，手中拿着三个饭团:金饭团、银饭团和鱼饵饭团，询问你是否有弄丢过饭团.\n',
            'choice': ['1.选择金饭团.', '\n2.选择银饭团.', '\n3.选择鱼饵饭团.', '\n4.向美人鱼说明自己没有弄丢过饭团.']
        }
    } else if (threeted_choose > 100 && threeted_choose <= 200) {
        message = {
            'coder': 2,
            'msg':
                "“好久不见！原来你在这里钓鱼！”一个男子欢快地从你身边经过，你不认识这个男人。\n“所以今天有什么好东西给我吗？还是说和往常一样？”\n他停在了你的身边，你满腹狐疑地打量着他，开始思考应该怎么做……\n",
            'choice': ['1.给予15金币.', '\n2.给予2幸运币', '\n3.赶走他']
        }
    } else if (threeted_choose > 200 && threeted_choose <= 300) {
        message = {
            'coder': 3,
            'msg':
                "在钓鱼的时候，天渐渐暗了下来，感觉有零星的雨点落下，快要下雨了。\n",
            'choice': ['1.继续钓鱼', '\n2.暂时躲雨']
        }
    } else if (threeted_choose > 300 && threeted_choose < 400) {
        message = {
            'coder': 4,
            'msg':
                '你钓上来了一本书。看起来已经在水里浸泡了很久。\n书内的文字依稀可辨，似乎是某种神秘的咒语。\n',
            'choice': ['1.大声朗读', '\n2.默默阅读', '\n3.扔回水里']
        }
    } else if (threeted_choose > 400 && threeted_choose <= 500) {
        message = {
            'coder': 5,
            'msg':
                '你钓到了一台袖珍老虎机，两只手刚好能拿住，摇起来有叮当的响声，看上去是刚被丢弃不久的。摆弄途中你找到了它的投币口，似乎往里投入硬币就能使用。\n',
            'choice': ['1.投入一枚金币', '\n2.投入一枚幸运币', '\n3.扔回水里', '\n4.砸开看看']
        }
    } else if (threeted_choose > 500 && threeted_choose <= 600) {
        message = {
            'coder': 6,
            'msg':
                '你钓上了一个密封的玻璃瓶，奇怪的是，里面装满了闪着光的水。\n',
            'choice': ['1.尝试喝一口', '\n2.扔掉可疑的水']
        }
    } else if (threeted_choose > 600 && threeted_choose <= 700) {
        message = {
            'coder': 7,
            'msg':
                '钓鱼时，一只可爱的小猫咪从你的身后窜出，并在你的周围寻找些什么。当它靠近你装鱼的背包时，表现出了明显的兴奋，看来是饿了。\n',
            'choice': ['1.喂一条鱼', '\n2.喂一份饭团', '\n3.不理睬']
        }
    } else if (threeted_choose > 700 && threeted_choose <= 800) {
        message = {
            'coder': 8,
            'msg':
                '一名上身赤裸男人跑到了你的身边。\n"你能给我点儿什么吗，求求你了...我只是需要找个地方过夜，我身上有财宝可以交换..."他的手上握着一颗水之心。虽然看起来疯疯癫癫的，但并没有危险。\n',
            'choice': ['1.给予100金币', '\n2.夺走他的财宝', '\n3.不帮助他']
        }
    } else {
        message = {
            'coder': 9,
            'msg':
                '你钓到了一块甲骨，发现上面写满了古老的文字。你尝试推理这些奇怪的符号和图案可能的意思，却发现文字开始发起了光。突然之间，文字的意义变得清晰了...原来是关于真理的选择。\n',
            'choice': ['1.简约', '\n2.质朴']
        }
    }
    return message
}
*/

// 概率将空漂流瓶转化为水之心
function get_bottle_amount() {
    let amount = Math.floor(Math.random() * (1, 500))
    return amount
}

