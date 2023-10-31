//冰祈插件相关配置文件

let Bot = await redis.get(`koinori-Bot_nickname`)
// 冰祈默认咏唱
const chant = `${Bot}咏唱中...`

// 好友、群聊管理
let white_list_group = 0  // 白名单群聊
let group_auto_approve = false  // 是否自动同意进群(需进入白名单群）
let friend_auto_approve = false   // 是否自动同意好友邀请（需进入白名单群）
let star_cost_mode = false  // 是否需要消耗星星来获得bot好友



// 腾讯api
// 密钥可前往https://console.cloud.tencent.com/cam/capi/网站进行获取
const TXSecretId = ''
const TXSecretKey = ''

// 天行api，
// 密钥可前往https://www.tianapi.com/获取
const tianxing_apikey = ''

// 有道翻译api
const youdao_appkey = ''
const youdao_secret = ''

// 随机美图
const sinaimg = true // 是否开启
const AUTO_SAVE = false  // 是否保存到本地
const AUTO_DELETE = true  // 是否撤回
const DELETE_TIME = 30 //

// danbooru
const SAVE_MODE = false  // 是否保存到本地
const DELETE_MODE = false  // 是否自动撤回

// arcaeaAPI
const api_url = ''
const token = ''

// 今天吃什么
let foods_whitelist = []  // 可以添加菜谱的群聊，为空则所有人都能添加

// 网络代理
let proxies = {
    'http': 'http://127.0.0.1:7890',
    'https': 'https://127.0.0.1:7890'
}

// openai api
const OPEN_API = ''
const OPEN_ORG = ''

// 冰祈戳戳
let icepoke = true // 冰祈戳戳开关


// 钓鱼
var ADMIN_GROUP = 0  // 漂流瓶审核群(必须有一个)
var COOL_TIME = 600  // 钓鱼冷却时长
var BAIT_PRICE = 10  // 鱼饵的价格
var FRAG_TO_CRYSTAL = 100  // 碎片转化为水之心的数量
var CRYSTAL_TO_BOTTLE = 3  // 水之心转化为漂流瓶的数量
var FISH_PRICE = { '🍙': 10, '🐟': 5, '🦐': 10, '🦀': 15, '🐡': 20, '🐠': 30, '🔮': 75 }  // 鱼的价格
var DEBUG_MODE = 0  // 调试模式
var STATIC_FC = 400  // 调试模式时可以固定first_choose的值，如果为0则不固定
// (A, B, C, D) 0-A:没钓到鱼/ A-B:随机事件/ B-C:钓到鱼/ C-D:钓到金币/ D-1000:钓到漂流瓶
var PROBABILITY = [(150, 230, 780, 880), (0, 80, 780, 880), (100, 200, 650, 750)]
// 海之眷顾 五种鱼的上钩概率
var PROBABILITY_2 = [(300, 550, 750, 900), (300, 550, 750, 900), (100, 250, 450, 700)]

export default { chant, sinaimg, AUTO_DELETE, DELETE_TIME, foods_whitelist, icepoke, COOL_TIME, FISH_PRICE, CRYSTAL_TO_BOTTLE, BAIT_PRICE, FRAG_TO_CRYSTAL, DEBUG_MODE, STATIC_FC }