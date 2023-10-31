import YAML from 'yaml'
import fs from 'fs'
import serif from './serif.js';
import cfg from '../../config/CONFIG.js'

const _path = process.cwd().replace(/\\/g, "/");
const info = _path + '\/plugins\/Icepray\/data\/\/user_info.yaml'; //这里定义数据存储路径
const data = _path + '\/plugins\/Icepray\/data\/\/user_data.yaml'

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

    if (cfg.DEBUG_MODE) {
        first_choose = cfg.STATIC_FC
    }
    logger.info(`玩家${e.user_id} 使用钓竿：${mode}，随机数为${second_choose()} `)
    if (first_choose > 0 && first_choose <= 150) {
        if (rod == 2) {
            result = { 'code': 1, 'msg': `钓到了一条${fishes} ~` }
        } else {
            let no_fish_serif = serif.no_fish_serif()
            result = { 'code': 1, 'msg': no_fish_serif[Math.floor(Math.random() * no_fish_serif.length)] }
        }
    } else if (first_choose > 150 && first_choose <= 300) {
        result = { 'code': 3, 'msg': '<随机事件case>' }
    } else if (first_choose > 300 && first_choose <= 750) { // 获取鱼模式
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
            let get_fish_serif = serif.get_fish_serif(fishes)
            result = { 'code': 1, 'msg': get_fish_serif[Math.floor(Math.random() * get_fish_serif.length)] + add_msg + `\n你将鱼放进了背包。` }
        }
    } else if (first_choose > 750 && first_choose <= 880) { // 漂流瓶模式
        let second_choose = Math.floor(Math.random() * (1, 1000));
        let coin_amount; // 得到的金币数
        if (second_choose <= 800) {
            coin_amount = Math.ceil(Math.random() * 30)
            result = { 'code': 2, 'msg': `你钓到了一个布包，里面有${coin_amount}枚金币，但是没有钓到鱼...` }
            user_data[e.user_id].gold += coin_amount;
        } else {
            coin_amount = Math.ceil(Math.random() * 3);
            result = { 'code': 2, 'msg': `你钓到了一个锦囊，里面有${coin_amount}枚幸运币，但是没有钓到鱼...` }
            user_data[e.user_id].gold += coin_amount;
        }
        fs.writeFileSync(data, YAML.stringify(user_data));
    } else {
        result = { 'code': 2, 'msg': '<漂流瓶case>' }
    }
    return result
}

export default { fish, randomNum, get_fish }