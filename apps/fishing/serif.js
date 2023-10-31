// 钓上鱼
function get_fish_serif(fishes) {
    var get_fish_serif = [
        `一个${fishes}上钩了~`,
        `钓上了${fishes}~`,
        `${fishes}上钩了~`,
        `一个华丽的起竿，${fishes}正乖乖地挂在鱼钩上~`,
        `你感觉鱼钩上有什么东西在动，是一个${fishes}~`,
        `${fishes}在挣扎过程中回想着自己的一生，然后放弃了挣扎...`,
        `${fishes}在与鱼钩战斗时被戳晕了...`,
        `${fishes}铤而走险，但美味与危机并存，这一次它失误了...`,
        `${fishes}咬钩后试图挣脱逃跑，但你起竿的速度更胜一筹...`
    ]
    return get_fish_serif
}

// 没钓上鱼
function no_fish_serif() {
    var no_fish_serif = [
        '鱼儿背水一战，将鱼线挣断了！你没有钓到鱼...',
        '鱼儿在挣脱鱼钩时溺水而亡...你没有钓到鱼...',
        '你感觉鱼钩上有什么东西在动，是一团海草！但并不是鱼，背包拒绝了它。',
        '鱼儿在挣扎过程中回想着自己的一生，然后拼命摆动，逃跑了...',
        '你钓上了一条鱼~然而它将自己改成了创造模式，飞走了！',
        '鱼在偷咬鱼饵时不慎撑坏肚子与世长辞，你试图将它放进背包，但背包拒绝了它...',
        '鱼钩进水过猛砸死了鱼，你没有钓到鱼...',
        '一条侦察鱼提前通知了这片水域的其他居民，你钓了很久依旧没有收获...'
    ]
    return no_fish_serif
}

var cool_time_serif = [
    '鱼竿累了，需要休息一下QAQ',
    '鱼累了，需要休息一下QAQ',
    '河累了，需要休息一下QAQ',
    '鱼钩累了，需要休息一下QAQ']


export default { get_fish_serif, no_fish_serif, cool_time_serif }