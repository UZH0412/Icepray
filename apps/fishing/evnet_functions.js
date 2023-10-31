
function event_list() {
    let threeted_choose = Math.floor(Math.random() * 600);
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
    } else {
        message = {
            'coder': 7,
            'msg':
                '钓鱼时，一只可爱的小猫咪从你的身后窜出，并在你的周围寻找些什么。当它靠近你装鱼的背包时，表现出了明显的兴奋，看来是饿了。\n',
            'choice': ['1.喂一条鱼', '\n2.喂一份饭团', '\n3.不理睬']
        }
    }
    return message
}

/** 
 else if (threeted_choose > 700 && threeted_choose <= 800) {
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
    */
export default { event_list }