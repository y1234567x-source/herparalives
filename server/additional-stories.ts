import "server-only";
import type { StatDelta, StoryChoice, StoryNode } from "@/lib/types";
import type { StoryLibraryRecord } from "@/server/story-types";
import { immersiveScenes } from "@/server/immersive-scenes";
import { immersiveOutcomes } from "@/server/immersive-outcomes";
import { choiceRoutes, cityBranchNodes, educationBranchNodes, gapBranchNodes, relationshipBranchNodes } from "@/server/story-branches";

type Option = [label: string, hint: string, outcome: string, memory: string, deltas: StatDelta];
type NodeInput = Omit<StoryNode, "choices"> & { options: [Option, Option, Option] };

const statNames = { career: "事业", wisdom: "智慧", happiness: "幸福", relationship: "关系", courage: "勇气" } as const;

function makeChoices(nodeId: string, options: [Option, Option, Option]): StoryChoice[] {
  return options.map(([label, hint, outcome, memory, deltas], index) => {
    const entries = Object.entries(deltas) as Array<[keyof typeof statNames, number]>;
    const gains = entries.filter(([, value]) => value > 0).map(([key]) => statNames[key]);
    const costs = entries.filter(([, value]) => value < 0).map(([key]) => statNames[key]);
    return {
      id: `${nodeId}-${String.fromCharCode(97 + index)}`,
      label, hint, outcome: immersiveOutcomes[`${nodeId}-${String.fromCharCode(97 + index)}`] ?? outcome, memory, deltas,
      gain: gains.length ? `在${gains.join("、")}上获得推进` : "保留了重新判断的空间",
      cost: costs.length ? `${costs.join("、")}承受了即时压力` : "需要承担尚未确定的后续责任",
      unknown: "这次选择的延迟影响，要在后续关系与现实条件中才会显现",
      ...choiceRoutes[`${nodeId}-${String.fromCharCode(97 + index)}`],
    };
  });
}

const n = (input: NodeInput): StoryNode => ({ ...input, scene: immersiveScenes[input.id] ?? input.scene, choices: makeChoices(input.id, input.options) });

const gapNodes: StoryNode[] = [
  n({ id:"gap-1", chapter:1, chapterTitle:"第一章｜身体先按下暂停", title:"凌晨一点的排队号码", illustration:"/images/anran-night-v1.png", coach:"", scene:"消费科技公司的项目上线前夜，安然在电梯厅看见叫车还要等四十七分钟。她刚完成第三轮改稿，手却一直发抖。老板又发来一句：明早九点再对一版。\n\n她忽然分不清，自己是想离开这家公司，还是只想先睡一个完整的晚上。", dialogue:"同事问她：‘还回去改吗？’", options:[
    ["回工位改完", "先守住明早交付", "她重新打开文件，交付没有延误；凌晨的身体信号却被再次推迟。", "安然用加班换取了交付确定性", {career:1,happiness:-2}],
    ["只确认最低交付", "删掉非必要修改后离开", "她把必须项写清楚后关机。老板不满意她没有“再多走一步”，但项目没有失控。", "安然第一次用范围而不是体力守住项目", {wisdom:2,courage:1}],
    ["直接请病假", "让身体先退出今晚", "她把交接发进群里，第一次在任务未结束时离开。羞愧没有消失，睡眠却真实地回来了一点。", "安然把身体状况列为真实约束", {courage:2,happiness:1,career:-1}]
  ]}),
  n({ id:"gap-2", chapter:1, chapterTitle:"第一章｜身体先按下暂停", title:"一张没有标准答案的申请", illustration:"/images/anran-night-v1.png", chapterEnd:true, coach:"休息不是对意志力的奖励，而是做决定所需的基础资源。安然此刻要辨认的，是短暂疲惫、长期透支，还是工作结构本身已经不可持续。", scene:"第二天，医生只建议她休息，无法替她决定是否辞职。存款能覆盖约十个月基本生活，父母希望她“找到下家再走”，好友则说可以先停下来。\n\n安然需要给自己一个可执行的起点。", options:[
    ["立即辞职", "把离开变成明确日期", "她提交辞呈，获得确定的停止，也失去工资缓冲。最后一个月开始交接。", "安然选择用现金储备换取完整停顿", {courage:3,happiness:1,career:-2}],
    ["申请两周假", "先用短暂停顿收集证据", "她申请病假，并约定复工前重新评估睡眠、情绪和工作边界。决定被延后，但不再无限拖延。", "安然建立了两周复盘点", {wisdom:2,happiness:1}],
    ["留任一个月测试边界", "先谈范围与离线时间", "她提出减少临时需求和夜间消息。老板只同意一部分，她也获得了判断组织能否改变的新证据。", "安然把留下变成有期限的组织实验", {wisdom:2,courage:2,career:1}]
  ]}),
  n({ id:"gap-3", chapter:2, chapterTitle:"第二章｜空白也会制造噪音", title:"没有闹钟的第一个星期", illustration:"/images/anran-plan-v1.png", coach:"", scene:"停下来后，安然前三天几乎都在睡。第四天，她开始刷同龄人的晋升、婚礼和创业消息。自由没有自动变成轻松，空白反而让“我是不是落后了”变得更响。", options:[
    ["继续彻底休息", "先不把恢复做成绩效项目", "她关掉职业软件一周，允许日子没有成果；焦虑偶尔反扑，却不再被任务掩盖。", "安然允许恢复期暂时没有产出", {happiness:2,career:-1}],
    ["制定严格日程", "用训练、学习和投递填满每天", "日程让她重新可控，也很快复制了原来的紧绷。第三天漏掉一项时，她又开始责备自己。", "安然用结构抵抗空白，也看见结构会过量", {career:2,happiness:-1}],
    ["每天只设两个锚点", "固定起床与一次出门", "她只守住两个最低动作，剩余时间留白。生活没有立刻高效，却逐渐有了可以呼吸的轮廓。", "安然采用低负担生活锚点", {wisdom:2,happiness:1}]
  ]}),
  n({ id:"gap-4", chapter:2, chapterTitle:"第二章｜空白也会制造噪音", title:"间隔期不是一项秘密", illustration:"/images/anran-plan-v1.png", chapterEnd:true, coach:"外界的时间表会制造压力，但完全切断关系也可能让恢复变得孤立。边界不是不解释，而是决定向谁解释、解释到什么程度。", scene:"表姐婚宴上，亲戚连续追问“下一份去哪儿”。同桌有人夸她勇敢，也有人说经济不好不该任性。安然的父亲在旁边沉默，回家后才问她钱够不够。", options:[
    ["给出体面说法", "称自己正在做职业调整", "话题很快过去，她保住了场面，却发现自己仍在努力让停顿看起来像进步。", "安然选择保护社交场面的安全感", {relationship:1,happiness:-1}],
    ["说清真实状态", "承认疲惫和不确定", "有人不理解，也有人私下告诉她自己同样想停下。坦诚没有换来一致认同，却换来两段真实连接。", "安然选择有限公开自己的脆弱", {courage:2,relationship:2}],
    ["结束追问", "说明今天不讨论工作", "她平静转开话题。父亲后来单独问她计划，她答应把预算告诉他，而不是交出决定权。", "安然区分了关心与审问", {wisdom:2,relationship:1}]
  ]}),
  n({ id:"gap-5", chapter:3, chapterTitle:"第三章｜把探索变成证据", title:"三个都像机会的邀请", illustration:"/images/anran-plan-v1.png", coach:"", scene:"第六周，前同事带来短期咨询，公益机构招募志愿项目经理，一家大公司也邀请她面试相似岗位。每条路都能证明她“没有停滞”，也都可能再次吞掉恢复。", options:[
    ["接短期咨询", "用真实项目测试自由工作", "她限定每周三天并写清交付。收入不高，但第一次用合同守住时间。", "安然开始验证独立工作的边界", {career:2,courage:1}],
    ["参加公益项目", "用不同环境测试能力迁移", "没有薪资的投入压缩了预算，却让她看见自己不仅能服务商业增长。", "安然把能力放进新的价值场景", {wisdom:2,happiness:1,career:-1}],
    ["参加大公司面试", "先确认自己是否只是需要换团队", "熟悉的岗位让她重新自信，面试官对高强度的描述也提醒她：职位相似，生活未必会改变。", "安然用面试检验旧路径，而非立刻回归", {career:2,wisdom:1}]
  ]}),
  n({ id:"gap-6", chapter:3, chapterTitle:"第三章｜把探索变成证据", title:"第一个月的复盘表", illustration:"/images/anran-plan-v1.png", chapterEnd:true, coach:"探索的价值不在于每次都找到答案，而在于把模糊想象变成可观察的证据：什么让你恢复，什么再次透支，什么值得继续验证。", scene:"安然把睡眠、现金流、工作后的身体感受和愿意继续投入的事情写在同一页。她发现“喜欢什么”仍然模糊，但“不再接受什么”已经清楚很多。", options:[
    ["选一条路深挖", "接下来六周只做一个实验", "她放弃同时证明所有可能，把资源集中到一个可复盘的方向。", "安然用聚焦换取更可靠的证据", {wisdom:2,career:2}],
    ["保留两条小实验", "降低各自投入，继续比较", "她保留弹性，也承担频繁切换的成本。日程里第一次写进了明确停止条件。", "安然保留两条路线并设置退出线", {wisdom:2,happiness:-1}],
    ["暂停职业探索", "先修复身体和日常关系", "她把一个月交给治疗、运动和朋友。履历空白变长，但生活不再只是职业的候场区。", "安然把恢复设为正式任务", {happiness:3,relationship:1,career:-1}]
  ]}),
  n({ id:"gap-7", chapter:4, chapterTitle:"第四章｜安全感开始计价", title:"房租一次扣走三个月", illustration:"/images/anran-plan-v1.png", coach:"", scene:"房东要求续租时一次付清三个月。安然的可用储备从“还早”突然变成具体数字。与此同时，咨询客户想扩大范围，却不愿提高预算。", options:[
    ["接受扩大范围", "先守住现金流", "钱按时到账，她却连续两周取消休息。旧的透支以更自由的名字回来。", "安然为现金流暂时放松边界", {career:2,happiness:-2}],
    ["缩小住房成本", "搬去更小的房子", "搬家消耗精力，也把可支撑时间延长。她第一次主动调整生活结构，而非只提高收入。", "安然用生活降档换取探索时间", {wisdom:2,happiness:-1}],
    ["重新报价", "不加预算就删减交付", "客户删掉一半工作，也暗示可能不续约。她保住了边界，却必须寻找下一笔收入。", "安然让客户看见工作范围的价格", {courage:2,wisdom:1,career:-1}]
  ]}),
  n({ id:"gap-8", chapter:4, chapterTitle:"第四章｜安全感开始计价", title:"不是最后期限，是检查点", illustration:"/images/anran-night-v1.png", chapterEnd:true, coach:"财务压力是真实约束，不是勇气测试。成熟的选择并非无视风险，而是让风险可见、可分段，并预先约定何时调整方向。", scene:"安然给自己设下九十天检查点：储备、身体、机会质量都要重新评估。朋友问她，这是不是意味着失败后回去上班。她说，那意味着不让任何路线无限消耗。", options:[
    ["以全职求职为主", "恢复稳定现金流", "她开始筛选团队和边界，而不再海投。机会更少，但每次面试都更接近真实需要。", "安然把求职从自我证明改为双向筛选", {career:2,wisdom:1}],
    ["以独立工作为主", "要求客户结构更分散", "她给单一客户设置收入占比上限，增长变慢，风险却不再只藏在一个关系里。", "安然开始自建分散的稳定", {courage:2,wisdom:2}],
    ["先找过渡工作", "用较低强度换取时间", "职位名没有过去漂亮，却覆盖基本支出。她需要面对外界评价，也获得继续探索的空间。", "安然接受职业降档作为主动策略", {happiness:1,courage:2,career:-1}]
  ]}),
  n({ id:"gap-9", chapter:5, chapterTitle:"第五章｜重新进入，不必回到原点", title:"两个具体的下一步", illustration:"/images/anran-night-v1.png", coach:"", scene:"检查点到来，一家成熟公司给出流程清晰的岗位；咨询客户也愿意签半年合同，但要求她承担更多业务开发。两条路都不完美，也都能继续。", options:[
    ["接受全职岗位", "用组织资源重建节奏", "她要求试用期复盘工作边界。稳定回来，但她不再把沉默承受当作职业素养。", "安然带着新边界回到组织", {career:3,happiness:1}],
    ["签半年顾问合同", "把独立实验延长", "她要求分阶段付款和退出条款。自主性增加，获客压力也从背景走到台前。", "安然把自由路线变成有规则的承诺", {courage:3,wisdom:1}],
    ["暂不承诺半年", "只延长一个季度", "她放弃更优惠的长期价格，换取一次更近的复盘。选择没有最大化收益，却保留转向能力。", "安然用较短承诺保留调整权", {wisdom:2,happiness:1,career:-1}]
  ]}),
  n({ id:"gap-10", chapter:5, chapterTitle:"第五章｜重新进入，不必回到原点", title:"日历上留下的一格空白", illustration:"/images/anran-plan-v1.png", chapterEnd:true, coach:"安然没有找到一种永远不会焦虑的人生。她获得的是一套更早识别透支、计算现实资源并设置复盘点的方法。停顿没有替她回答人生，却改变了她提问的方式。", scene:"三个月后，安然的日历依然很满，但每周有半天没有被工作命名。她知道新路线也会长出困难，于是把下一次复盘日期写在角落。", options:[
    ["守住固定留白", "任何项目都不占用这半天", "她失去了一些即时效率，也让恢复不再等到崩溃后才发生。", "安然把恢复写进长期规则", {happiness:3,wisdom:1}],
    ["把留白交给关系", "定期与重要的人共同生活", "她不再只在需要帮助时联系朋友。关系重新成为生活本身，而非风险备用金。", "安然主动维护支持网络", {relationship:3,happiness:1}],
    ["把留白用于无目的探索", "不要求它立即变现", "她允许兴趣暂时没有职业价值。未知仍在，却不再自动等于浪费。", "安然保留不被绩效化的好奇", {courage:2,happiness:2}]
  ]}),
];

const relationshipNodes: StoryNode[] = [
  n({id:"rel-1",chapter:1,chapterTitle:"第一章｜成功之后的空位",title:"签约桌旁的橘子",illustration:"/images/lumingwei-greenhouse-v1.png",coach:"",scene:"B轮协议签完，陆明薇被一群人簇拥着合影。回办公室时，她看见母亲送来的橘子和一张便签：别只顾公司。她本想忽略，晚上却又打开了一份空白的伴侣条件表。",options:[
    ["把条件写满","用标准降低不确定","她列出教育、收入与生活习惯，获得秩序，也发现任何真人都像会破坏表格。","明薇先用标准保护自己",{wisdom:1,relationship:-1}],
    ["约一个朋友庆祝","先让成功被关系接住","她没有讨论婚恋，只让朋友陪她吃完一顿饭。空位没有被填上，却不再那么像缺陷。","明薇允许朋友分享重要时刻",{relationship:2,happiness:1}],
    ["继续工作","把情绪推迟到发布后","她处理完所有邮件，夜里却想不起自己是否真正高兴。","明薇用效率延后个人感受",{career:2,happiness:-1}]
  ]}),
  n({id:"rel-2",chapter:1,chapterTitle:"第一章｜成功之后的空位",title:"一场正确但无聊的约会",illustration:"/images/lumingwei-greenhouse-v1.png",chapterEnd:true,coach:"标准能帮助人识别底线，却不能代替相处本身。亲密不是降低判断力，而是把判断从简历移到具体时刻：对方如何回应边界、差异与不方便。",scene:"相亲对象的履历几乎符合所有条件，谈话却像一次融资尽调。对方问她婚后能否减少出差，明薇没有生气，只是突然很累。",options:[
    ["礼貌结束","不为合适标签延长关系","她明确说没有继续了解的意愿。母亲失望，但她没有把勉强当成熟。","明薇拒绝仅凭条件继续",{courage:2,happiness:1,relationship:-1}],
    ["提出真实分歧","直接谈事业与照顾责任","对方坦承期待传统分工。谈话不浪漫，却让不匹配及时显露。","明薇用具体问题检验兼容性",{wisdom:2,relationship:1}],
    ["再见一次","区分初次紧张与根本不合","第二次仍不轻松，但她确认自己的判断来自相处，而非快速淘汰。","明薇给判断增加一次现实样本",{wisdom:2,happiness:-1}]
  ]}),
  n({id:"rel-3",chapter:2,chapterTitle:"第二章｜温室里没有职位介绍",title:"他只问这株叶子",illustration:"/images/lumingwei-greenhouse-v1.png",coach:"",scene:"植物园合作活动上，研究者林远没有问她公司估值，只请她看一株叶缘卷曲的幼苗。明薇说自己不懂，他回答：不懂也可以先看。",options:[
    ["留下十分钟","接受一段无目标谈话","她错过了提前回邮件的时间，却记住了他说植物不会因催促更快生长。","明薇允许一次无产出的相处",{happiness:2,relationship:1}],
    ["交换联系方式","把好奇变成下一次见面","她主动开口，也立刻感到自己暴露了兴趣。林远只平静地递来手机。","明薇主动创造继续了解的机会",{courage:2,relationship:2}],
    ["礼貌离开","保护当天既定安排","她准时回到会议，温室的安静却在晚些时候回来。","明薇暂时保留距离",{career:1,happiness:-1}]
  ]}),
  n({id:"rel-4",chapter:2,chapterTitle:"第二章｜温室里没有职位介绍",title:"面馆里的停顿",illustration:"/images/lumingwei-greenhouse-v1.png",chapterEnd:true,coach:"被照顾并不自动意味着欠债；拒绝照顾也不等于独立。重要的是双方能否询问、拒绝和调整，而不是谁永远扮演强者或照顾者。",scene:"第二次见面在小面馆。林远没有评价她的忙碌，只问她是否需要安静吃完。母亲的电话此时响起，催她给相亲对象回复。",options:[
    ["当面接电话","让两个生活同时出现","母亲的焦虑进入这顿饭，林远没有替她解围。明薇挂断后第一次说明自己的为难。","明薇让真实家庭压力被看见",{courage:2,relationship:1}],
    ["先拒接再解释","保护当下并说明原因","她说自己不想让母亲决定见谁。林远只问她希望怎样被支持。","明薇明确当下的关系边界",{wisdom:2,relationship:2}],
    ["提前结束见面","独自处理家庭压力","她保住隐私，也让林远无法理解突然的撤离。之后她需要决定是否补充说明。","明薇在压力下恢复距离",{happiness:-1,relationship:-1,courage:1}]
  ]}),
  n({id:"rel-5",chapter:3,chapterTitle:"第三章｜靠近发生在忙乱里",title:"系统告警与一张豆苗照片",illustration:"/images/lumingwei-greenhouse-v1.png",coach:"",scene:"公司产品出现严重告警，明薇连续两晚未睡。林远只发来一张新长出的豆苗，没有追问。她看了很久，不确定回复是否会让关系变成另一项责任。",options:[
    ["只回一个表情","保留联系，不开启长谈","林远没有追加问题。轻微回应让她知道，联系可以不等于交付。","明薇尝试低负担回应",{relationship:1,happiness:1}],
    ["告诉他今天很糟","给出真实但有限的信息","她没有解释全部危机。林远问她想听建议还是只想被听见。","明薇允许有限脆弱进入关系",{courage:2,relationship:2}],
    ["暂时不回","先处理公司危机","她守住注意力，三天后才解释。林远接受延迟，也说突然消失会让他担心。","明薇看见沉默也会影响别人",{career:2,relationship:-1}]
  ]}),
  n({id:"rel-6",chapter:3,chapterTitle:"第三章｜靠近发生在忙乱里",title:"咖啡馆的三句话",illustration:"/images/lumingwei-door-v1.png",chapterEnd:true,coach:"专业的边界不是猜测对方能承受什么，而是把需求、能力和限制说出来。亲密关系也可以通过小规模、可撤回的尝试来建立信任。",scene:"危机结束后，林远说他不是要一个随时回复的人，但需要知道明薇是否还愿意继续了解。她给自己三句话的空间，不做长期承诺，只回答现在。",options:[
    ["我愿意继续，但很慢","提出可执行的节奏","两人约定每周一次见面，忙时提前说明。规则不浪漫，却让靠近有了容器。","明薇提出慢速相处协议",{relationship:3,wisdom:2}],
    ["我现在没有余量","暂停而不是模糊消失","林远失望，却尊重她的明确。明薇保住空间，也承担关系可能不再继续。","明薇用清晰暂停替代回避",{courage:2,happiness:1,relationship:-2}],
    ["我不知道，但想试一次","接受不确定的短期实验","他们约定四周后复盘。明薇没有保证结果，只保证会诚实反馈。","明薇把关系变成可复盘的尝试",{courage:2,relationship:2}]
  ]}),
  n({id:"rel-7",chapter:4,chapterTitle:"第四章｜旧规则重新出现",title:"副驾驶座上的沉默",illustration:"/images/lumingwei-door-v1.png",coach:"",scene:"一次晚餐后，林远临时改了路线去取研究样本，没有提前解释。明薇瞬间僵硬：她讨厌计划被别人掌控。林远察觉后停车，问她发生了什么。",options:[
    ["说出不舒服","不把反应包装成指责","她说明自己需要提前知道变化。林远道歉，也解释了紧急性，两人共同约定下次做法。","明薇把控制感需求说具体",{wisdom:2,relationship:2}],
    ["要求立刻送她回家","先恢复安全距离","林远照做。她获得控制感，之后仍需决定是否解释这次 abrupt 退出。","明薇先离开触发情境",{courage:1,happiness:1,relationship:-1}],
    ["假装没事","避免让夜晚变复杂","气氛表面恢复，她却在接下来几天减少回复。未说出的边界变成了距离。","明薇把冲突转成沉默",{happiness:-1,relationship:-2}]
  ]}),
  n({id:"rel-8",chapter:4,chapterTitle:"第四章｜旧规则重新出现",title:"旧书市场的半步后退",illustration:"/images/lumingwei-door-v1.png",chapterEnd:true,coach:"理解自己的保护方式，不等于把一切归因于童年，也不意味着必须立刻改变。它只是帮助明薇在自动后退之前，多看见一个可选择的动作。",scene:"旧书市场人多，林远自然伸手护了一下她的肩。明薇下意识退开。她想起过去每次关系变近时，自己都会开始挑出对方所有不合格之处。",options:[
    ["解释刚才的反应","不要求自己立刻适应触碰","林远收回手，问她怎样更舒服。退后没有被解释成拒绝整个人。","明薇把身体边界转化为沟通",{relationship:2,wisdom:2}],
    ["主动牵手","用行动穿过犹豫","她迈得比自己准备的更快，温暖与紧张同时出现。之后她仍需确认这是不是自由选择。","明薇主动尝试身体靠近",{courage:3,happiness:1}],
    ["转去看书","暂时不处理这一刻","林远没有追问，但两人的距离保持到散场。她获得缓冲，也留下未解释的空白。","明薇暂时用转移保护自己",{happiness:1,relationship:-1}]
  ]}),
  n({id:"rel-9",chapter:5,chapterTitle:"第五章｜门可以半开",title:"温室门口的邀请",illustration:"/images/lumingwei-door-v1.png",coach:"",scene:"林远获得一年外地研究机会。他没有要求明薇等待，只问两人是否愿意一起设计下一段关系。明薇手里拿着他送的旧植物书，第一次无法靠条件表完成决定。",options:[
    ["尝试异地一年","共同约定联系与复盘","他们写下频率、探访和三个月复盘。承诺不是保证成功，而是共同承担实验。","明薇选择有规则的远距离关系",{relationship:3,courage:2}],
    ["把关系停在这里","不让未来承诺超过能力","林远难过但没有劝服。明薇承认喜欢与不继续可以同时为真。","明薇选择结束而不贬低这段关系",{wisdom:2,relationship:-3,happiness:-1}],
    ["先试三个月","缩短承诺周期","他们没有把一年压成一道誓言，只约定在第一次探访后重新讨论。","明薇用短周期检验共同能力",{wisdom:2,relationship:2}]
  ]}),
  n({id:"rel-10",chapter:5,chapterTitle:"第五章｜门可以半开",title:"一臂距离",illustration:"/images/lumingwei-door-v1.png",chapterEnd:true,coach:"这条线没有把爱情写成对强大女性的奖赏，也没有把独立写成亲密的敌人。明薇练习的是：在不交出决定权的前提下，让另一个人的需要也成为真实变量。",scene:"出发前，他们最后一次来到温室。林远站在一臂之外，没有替她推门。明薇知道任何安排都会带来想念、误解或改变，也可能带来过去没有的共同经验。",options:[
    ["请他一起进去","把关系当作共同实践","两人并肩进入。没有谁救谁，只是开始学习怎样在差异里协商。","明薇允许共同决定进入日常",{relationship:3,happiness:2}],
    ["自己先进去","保留独立节奏再会合","林远在后面等了片刻。靠近不再要求两个人每一步都同步。","明薇为亲密保留个人节奏",{wisdom:2,relationship:2}],
    ["在门口道别","承认一段关系的阶段完成","她把书留下又收回，最终带走了它。关系结束，经验没有被判为失败。","明薇允许结束与珍惜同时存在",{courage:2,happiness:-1,relationship:-2}]
  ]}),
];

const cityNodes: StoryNode[] = [
  n({id:"city-1",chapter:1,chapterTitle:"第一章｜两封邮件，两座城市",title:"厦门的海与北京的他",illustration:"/images/linwan-airport-v1.png",coach:"",scene:"26岁的游戏数据分析师林晚同时收到两份 offer：厦门的岗位更贴近游戏研究，北京的岗位普通一些，却能结束与陈屿的异地。两封邮件都只给三天答复。",options:[
    ["选厦门","优先职业匹配度","她获得更想做的工作，也把异地从暂时状态变成长期安排。","林晚先验证自己的职业方向",{career:3,relationship:-1}],
    ["选北京","优先共同生活","她与陈屿结束异地，却接受了一份吸引力较弱的工作。","林晚把共同生活设为当前优先级",{relationship:3,career:-1}],
    ["争取延期","先补充团队与生活信息","一家公司拒绝延期，另一家给了两天。她失去部分从容，却避免只凭城市想象决定。","林晚要求用更多事实做选择",{wisdom:2,courage:1}]
  ]}),
  n({id:"city-2",chapter:1,chapterTitle:"第一章｜两封邮件，两座城市",title:"不能只说支持你",illustration:"/images/linwan-airport-v1.png",chapterEnd:true,coach:"城市选择不是爱情与事业的忠诚测试。更有用的问题是：谁承担迁移成本、成本能否被看见，以及两个人是否愿意为共同决定改变自己的安排。",scene:"陈屿说“我支持你”，林晚却听不出这意味着继续异地、他未来搬家，还是所有迁移成本仍由她承担。她决定把模糊支持变成具体讨论。",options:[
    ["列出一年方案","约定探访、费用与复盘点","浪漫被表格打断，异地却第一次有了共同责任。","两人建立一年异地协议",{wisdom:2,relationship:2}],
    ["请陈屿给出迁移计划","不再独自承担未来想象","陈屿承认短期离不开北京，也提出九个月后重新求职。承诺仍需时间检验。","林晚要求伴侣承担迁移变量",{courage:2,relationship:1}],
    ["暂不讨论长期","先各自进入新工作","压力降低，但谁移动的问题被留到以后。轻松与延迟代价同时存在。","两人把城市决定暂时拆开",{happiness:1,relationship:-1}]
  ]}),
  n({id:"city-3",chapter:2,chapterTitle:"第二章｜异地不是背景音乐",title:"错过的周末与升职项目",illustration:"/images/linwan-airport-v1.png",coach:"",scene:"一年后，林晚得到核心项目机会，恰逢陈屿难得的长周末。航班价格很高，而项目第一次评审不能改期。异地的成本终于落在具体日历上。",options:[
    ["留在项目","取消见面并解释","项目推进顺利，陈屿理解，却坦白自己已经连续三次调整计划。","林晚优先职业节点并看见关系累积成本",{career:2,relationship:-2}],
    ["飞去北京","把这次关系需要放在前面","她错过评审主导，仍通过远程补救。见面让两人恢复亲近，也留下职业代价。","林晚为关系承担一次职业缺席",{relationship:2,happiness:1,career:-1}],
    ["请陈屿来厦门","重新分配移动成本","陈屿调整值班赶来，疲惫却也第一次进入她真实的工作生活。","陈屿开始承担异地移动",{relationship:2,wisdom:1}]
  ]}),
  n({id:"city-4",chapter:2,chapterTitle:"第二章｜异地不是背景音乐",title:"第三年的搬家问题",illustration:"/images/linwan-airport-v1.png",chapterEnd:true,coach:"长期关系需要的不只是感情浓度，也需要对机会、照顾劳动和迁移损失进行持续分配。任何一方移动，都不应被叙述为理所当然的证明。",scene:"第三年，陈屿在北京得到晋升，林晚也成为厦门团队骨干。双方父母开始问结婚，异地协议到了复盘日。现在移动的人会放弃真实积累。",options:[
    ["林晚去北京","由她承担这次迁移","共同生活终于开始，她也需要重建职业网络。陈屿承诺承担更多家庭事务。","林晚选择迁往北京并明确补偿安排",{relationship:3,career:-2,courage:2}],
    ["陈屿来厦门","由他承担这次迁移","陈屿离开晋升通道，在厦门求职受挫。林晚获得陪伴，也要面对他的失落。","陈屿选择迁往厦门，关系承担职业余震",{relationship:3,happiness:1,career:-1}],
    ["再异地一年","给双方寻找第三地机会","两人保留现有积累，也承认拖延可能耗尽关系。复盘频率改为三个月。","两人尝试共同寻找第三座城市",{wisdom:2,relationship:-1}]
  ]}),
  n({id:"city-5",chapter:3,chapterTitle:"第三章｜共同生活并不自动公平",title:"餐桌上的隐形排班",illustration:"/images/linwan-home-v1.png",coach:"",scene:"共同生活后，猫粮、维修、看父母和晚饭逐渐落到更灵活的林晚身上。陈屿并非故意逃避，只是总说“你告诉我就行”。林晚发现分配任务本身也是劳动。",options:[
    ["列出完整分工","把默认责任重新分配","表格让生活显得不浪漫，却减少了反复提醒。陈屿第一次负责父母探访安排。","两人把家庭劳动变成共同责任",{wisdom:2,relationship:2}],
    ["先做完再说","避免小事引发冲突","家里井然有序，她却越来越不愿分享工作压力。怨气没有消失，只是没有名字。","林晚继续承担隐形协调",{happiness:-2,relationship:-1}],
    ["只谈最累的一件事","从最小改变开始","陈屿接手晚饭与采购，其他问题仍在，但讨论没有变成总清算。","两人从一个具体负担开始调整",{relationship:2,happiness:1}]
  ]}),
  n({id:"city-6",chapter:3,chapterTitle:"第三章｜共同生活并不自动公平",title:"一个不再增长的岗位",illustration:"/images/linwan-home-v1.png",chapterEnd:true,coach:"为关系迁移后出现职业损失，不代表当初选择错误；否认损失也不会保护关系。修复从承认代价、重新分配资源和允许调整开始。",scene:"北京岗位稳定却重复，林晚半年没有接触核心分析。她收到内部转岗机会，新团队强度更高，也能重建专业成长。陈屿刚接下重要项目。",options:[
    ["申请转岗","不让迁移永久冻结职业","她进入更忙的团队，两人的家务安排必须再次调整。","林晚主动重建职业增长",{career:3,courage:1,relationship:-1}],
    ["暂时留岗","给共同生活更多稳定","她保住可预测时间，也给职业停滞设下六个月期限。","林晚把留下变成有期限选择",{relationship:2,wisdom:2,career:-1}],
    ["开始外部求职","不把内部机会当唯一出口","面试占据晚上，关系压力增加，却让她重新看见市场价值。","林晚并行探索新的职业位置",{career:2,happiness:-1}]
  ]}),
  n({id:"city-7",chapter:4,chapterTitle:"第四章｜权力不会因为努力自动消失",title:"永远不够具体的修改",illustration:"/images/linwan-home-v1.png",coach:"",scene:"转岗后，新上司不断推翻方案，却拒绝给出标准；会上暗示林晚“不够有主人翁意识”，私下又要求她不要越级。林晚开始怀疑自己的判断。",options:[
    ["记录需求与版本","用事实厘清反复变化","书面记录减轻自我怀疑，也让上司更谨慎地口头施压。","林晚建立可追溯工作证据",{wisdom:3,career:1}],
    ["加倍重做","先证明自己能适应","交付变多，标准仍移动。她获得短暂认可，睡眠再次被侵蚀。","林晚用额外劳动应对模糊权力",{career:1,happiness:-2}],
    ["找同事校准","确认问题是否只发生在自己身上","两位同事描述了相似经历。她没有给上司贴诊断标签，而是确认了可观察的管理模式。","林晚通过同伴证据校准现实",{wisdom:2,relationship:2}]
  ]}),
  n({id:"city-8",chapter:4,chapterTitle:"第四章｜权力不会因为努力自动消失",title:"带证据进入会议室",illustration:"/images/linwan-home-v1.png",chapterEnd:true,coach:"面对有权力差异的工作关系，重要的是描述具体行为、影响与需求，而非用心理标签解释对方。留下、申诉或离开都需要评估证据、盟友和现实风险。",scene:"林晚整理出三次需求反复、两次公开否定与对应项目损失。HR愿意见她，但提醒调查需要时间；另一家公司也邀请她面试。",options:[
    ["正式申诉","推动组织处理具体行为","流程启动后气氛变冷，她得到跨部门支持，也必须承受等待与不确定。","林晚用证据进入正式机制",{courage:3,wisdom:1,happiness:-1}],
    ["先内部转组","优先离开直接关系","她放弃当前项目功劳，换到资源更少但边界清晰的团队。","林晚选择组织内撤离",{career:-1,happiness:2}],
    ["推进外部面试","把退出变成现实选项","她没有立刻辞职，而是先确认薪资、团队和城市成本。","林晚开始建立外部退路",{career:2,courage:2}]
  ]}),
  n({id:"city-9",chapter:5,chapterTitle:"第五章｜选择不等于定居",title:"又一封异地 offer",illustration:"/images/linwan-airport-v1.png",coach:"",scene:"新 offer 来自杭州：更好的岗位，也意味着再次迁移。陈屿无法立刻同行，但明确说这次不会只讲支持，他们需要一起算账。",options:[
    ["接受杭州 offer","让职业再次拥有优先期","两人重启异地，并把探访费用和家务迁移写进共同预算。","林晚选择新城市并共同分担成本",{career:3,courage:2,relationship:-1}],
    ["留在北京换团队","保留共同生活","她放弃更高职位，换来关系与城市网络的连续，也要求现岗位提供明确成长路径。","林晚选择留城但不留在原处",{relationship:2,career:1,wisdom:1}],
    ["要求远程试用三个月","尝试创造第三种安排","公司只同意六周。窗口很短，却足以验证工作和异地是否值得。","林晚谈出短期双城实验",{wisdom:2,courage:2}]
  ]}),
  n({id:"city-10",chapter:5,chapterTitle:"第五章｜选择不等于定居",title:"地图没有终点站",illustration:"/images/linwan-airport-v1.png",chapterEnd:true,coach:"林晚没有找到一座同时满足所有需要的城市。她学会的是让迁移成本可见，让伴侣共同承担，并允许过去的选择在条件变化后被重新讨论。",scene:"一年后，她把两座城市的车票夹在同一本笔记里。猫在视频镜头外叫，陈屿问下一次复盘放在哪一天。地图上的线路仍会延长。",options:[
    ["设季度复盘","定期检查工作、关系与照顾成本","复盘不能消除变化，却让积累的不满更早出现。","两人把城市选择视为可更新协议",{wisdom:3,relationship:1}],
    ["先定两年计划","用较长承诺换取建设空间","稳定让他们敢于投入社区与职业，也减少了短期转向能力。","两人选择两年共同建设期",{relationship:2,happiness:2,courage:-1}],
    ["保留各自城市基地","接受非传统共同生活","成本更高，解释更多，但他们不再把同住当作关系唯一证明。","两人尝试双基地关系",{courage:3,relationship:1,career:1}]
  ]}),
];

const educationNodes: StoryNode[] = [
  n({id:"edu-1",chapter:1,chapterTitle:"第一章｜一封迟到的录取信",title:"稳定生活里的小裂缝",illustration:"/images/xuzhixia-desk-v1.png",coach:"",scene:"30岁的许知夏是资深用户研究员，工作稳定、团队友好，却连续两年做相似项目。她申请的一年制海外硕士录取信突然到来，确认期限只有两周。",options:[
    ["立刻告诉所有人","让机会进入现实讨论","祝福与担忧同时涌来，她获得支持，也被不同期待包围。","知夏公开了学习机会",{relationship:2,courage:1}],
    ["先独自研究","在意见进入前补足信息","她查清课程与签证，却发现独自计算会放大最坏情形。","知夏先建立自己的事实底稿",{wisdom:2,happiness:-1}],
    ["暂不回应","让兴奋冷却三天","她没有错过期限，也看见这个愿望在冷静后仍然存在。","知夏给冲动与恐惧共同降温",{wisdom:1,happiness:1}]
  ]}),
  n({id:"edu-2",chapter:1,chapterTitle:"第一章｜一封迟到的录取信",title:"不是勇敢测试",illustration:"/images/xuzhixia-desk-v1.png",chapterEnd:true,coach:"教育选择不是‘敢不敢追梦’的性格测试。它同时涉及学习目标、机会成本、照顾责任、财务承受和替代路径；焦虑本身不应被扣分。",scene:"同事说不去会后悔，母亲说现在不该放弃稳定。知夏发现两种意见都把决定变成一句口号，而她真正想知道的是这段学习能改变什么。",options:[
    ["写下三个学习目标","先检验项目是否匹配","她发现其中一项目标可在工作中实现，另两项确实需要系统训练。","知夏把愿望拆成可验证目标",{wisdom:3,career:1}],
    ["联系在读学生","寻找真实的一手经验","课程并非宣传页那么完美，但跨学科资源比她预想更强。","知夏用真实经验修正想象",{wisdom:2,relationship:1}],
    ["约职业导师谈一次","检查教育之外的替代方案","导师没有替她决定，而是提出内部轮岗与短期访学两条备选。","知夏扩大了路径集合",{career:2,wisdom:1}]
  ]}),
  n({id:"edu-3",chapter:2,chapterTitle:"第二章｜把代价放到桌面上",title:"两年积蓄与一年时间",illustration:"/images/xuzhixia-desk-v1.png",coach:"",scene:"学费与生活费接近她两年积蓄；离职还意味着失去稳定收入。父亲近期需要复查，但日常能够自理。数字没有替她回答，却让风险有了边界。",options:[
    ["按最坏情况预算","保留六个月应急金","可用于留学的钱减少，她需要奖学金或兼职，也获得更安全的底线。","知夏优先保留应急缓冲",{wisdom:3,courage:-1}],
    ["动用大部分积蓄","减少贷款与兼职压力","学习期更从容，回国后的选择空间却变窄。","知夏把主要储备用于教育投资",{career:2,happiness:1,wisdom:-1}],
    ["申请延期一年","先继续储蓄与照顾家庭","学校可能不批准，机会也可能变化；她换来更多准备时间。","知夏尝试用延期降低现实风险",{wisdom:2,career:-1,relationship:1}]
  ]}),
  n({id:"edu-4",chapter:2,chapterTitle:"第二章｜把代价放到桌面上",title:"家人担心的并非同一件事",illustration:"/images/xuzhixia-desk-v1.png",chapterEnd:true,coach:"家人的担心可能包含爱、风险经验和他们自己的价值观。倾听不等于服从，独立也不等于拒绝所有关系责任；先把不同担忧拆开，协商才可能发生。",scene:"母亲担心婚恋年龄，父亲担心钱，知夏担心错过职业窗口。晚饭桌上，三种担心混成一句“别去了”。",options:[
    ["逐项回应","把钱、照顾和婚恋分开谈","父亲愿意讨论复查安排，母亲仍不同意。分歧没有消失，但不再是一团。","知夏把家庭反对拆成具体议题",{wisdom:2,relationship:2}],
    ["宣布自己决定","先保护个人选择权","她阻止了继续说服，也让父母暂时感到被排除。","知夏明确决定权属于自己",{courage:3,relationship:-2}],
    ["邀请家人一起看方案","让他们参与信息而非表决","父亲指出预算漏洞，母亲也开始问生活细节。参与没有变成否决权。","知夏建立有限的家庭协作",{relationship:2,wisdom:2}]
  ]}),
  n({id:"edu-5",chapter:3,chapterTitle:"第三章｜三条路都需要承担",title:"确认期限前四十八小时",illustration:"/images/xuzhixia-station-v1.png",coach:"",scene:"学校要求支付占位费；公司同时开放一个跨国研究项目。它不能替代学位，却能测试国际协作。知夏第一次拥有了真正的三条路。",options:[
    ["接受录取","把一年交给系统学习","她支付占位费，兴奋与损失稳定工作的恐惧同时变得真实。","知夏确认海外学习路线",{courage:3,career:2,happiness:-1}],
    ["申请延期","争取把准备与机会错开","等待结果期间，她既不能完全留下，也不能开始出发。","知夏选择延后承诺",{wisdom:2,happiness:-1}],
    ["放弃录取接跨国项目","用工作内实验替代学位","她保住收入，也接受这条路无法提供完整学术训练。","知夏选择职场内学习实验",{career:2,wisdom:1,courage:-1}]
  ]}),
  n({id:"edu-6",chapter:3,chapterTitle:"第三章｜三条路都需要承担",title:"为选择写一份反悔条件",illustration:"/images/xuzhixia-station-v1.png",chapterEnd:true,coach:"承诺不必假装永不改变。提前写下退出、延期或调整条件，可以减少沉没成本，也让‘坚持’不再成为唯一值得赞美的品质。",scene:"决定做出后，知夏仍睡不好。她开始写一份“什么情况下我会调整路线”的清单，而不是逼自己相信选择一定正确。",options:[
    ["设财务止损线","储备低于底线就调整","限制减少了任性空间，也让风险不再无限。","知夏设定财务退出条件",{wisdom:3,happiness:1}],
    ["设学习证据线","课程无法支持目标就换方案","她必须主动收集成果，而不是只完成学位。","知夏用学习证据检验投入",{career:2,wisdom:2}],
    ["设家庭应急线","父亲健康变化就重排照顾","她承认个人计划与关系责任会互相影响，但不预先放弃。","知夏明确家庭应急机制",{relationship:2,wisdom:2}]
  ]}),
  n({id:"edu-7",chapter:4,chapterTitle:"第四章｜新环境也有普通日子",title:"第一场听不懂的讨论",illustration:"/images/xuzhixia-station-v1.png",coach:"",scene:"新路线开始后，第一个重要讨论并不顺利。她的经验没有自动转换成新环境里的表达优势；同伴更年轻、方法更新，知夏第一次怀疑投入是否值得。",options:[
    ["承认没听懂","课后请同伴复盘","她暴露短板，也获得一组共同学习伙伴。","知夏用求助换取学习连接",{wisdom:2,relationship:2}],
    ["独自补课","先恢复基本能力感","她熬夜追上内容，短期自信回来，孤立感仍在。","知夏先用独立准备修补差距",{career:2,happiness:-1}],
    ["找导师校准目标","确认困难是否仍服务于选择","导师指出一门课可以放弃，把精力转到她真正需要的方法训练。","知夏主动重排学习资源",{wisdom:3,courage:1}]
  ]}),
  n({id:"edu-8",chapter:4,chapterTitle:"第四章｜新环境也有普通日子",title:"旧公司递来的回程票",illustration:"/images/xuzhixia-desk-v1.png",chapterEnd:true,coach:"回头不是失败，坚持也不是天然正确。值得判断的是：现实发生了什么变化、原目标是否仍成立，以及继续投入的代价是否仍在可承受范围。",scene:"旧公司邀请她提前回去负责新项目，薪资更高；与此同时，她刚获得参与一项重要研究的机会。两条路都回应了她最初的不满，却指向不同成长。",options:[
    ["提前回公司","把新知识带回真实业务","她放弃部分课程，换取角色升级。未完成学位成为代价，不是羞耻。","知夏选择提前回到实践场",{career:3,happiness:1,wisdom:-1}],
    ["完成学习","守住原定一年","她错过岗位窗口，也获得更完整的研究经验。","知夏继续完成系统学习",{wisdom:2,career:2,happiness:-1}],
    ["谈短期顾问合作","连接两边而不全职回归","公司只同意有限预算，她的时间压力上升，但知识开始接受实践检验。","知夏尝试连接学习与工作",{career:2,wisdom:1,happiness:-1}]
  ]}),
  n({id:"edu-9",chapter:5,chapterTitle:"第五章｜学历之外的收获",title:"作品集里该放什么",illustration:"/images/xuzhixia-station-v1.png",coach:"",scene:"阶段结束前，知夏发现最有价值的并非一张证书，而是一次失败研究、一组跨文化访谈和她重新建立的求助能力。她需要决定下一步怎样使用这些变化。",options:[
    ["回原行业升级角色","把新方法带回熟悉领域","她有连续经验，也要防止新能力被旧职位结构吞没。","知夏选择在熟悉行业中升级",{career:3,wisdom:1}],
    ["转向研究型岗位","接受更低起点换方向","职位级别下降，工作内容却更靠近她真正想训练的能力。","知夏选择换赛道并接受降级",{courage:3,career:1,happiness:-1}],
    ["先做三个月项目","用短期合作继续验证","她推迟长期归属，用多个项目测试能力如何落地。","知夏选择短周期职业实验",{wisdom:2,courage:2}]
  ]}),
  n({id:"edu-10",chapter:5,chapterTitle:"第五章｜学历之外的收获",title:"站台不是颁奖台",illustration:"/images/xuzhixia-station-v1.png",chapterEnd:true,coach:"教育没有自动把知夏变成更成功的人，也没有保证投入一定回报。它提供了一段高成本的重新学习；真正留下的是她更会定义问题、使用支持，并在条件变化时修订选择。",scene:"清晨站台上，知夏拿着一本写满修改痕迹的笔记。她没有感觉自己赢了或输了，只比一年前更清楚：想学什么、愿意付出什么、何时需要转弯。",options:[
    ["保留年度学习预算","让学习成为长期资源","她减少一部分消费，换取持续训练，而不是把成长押在一次学位上。","知夏把学习纳入长期生活结构",{wisdom:3,career:1}],
    ["建立同行互助小组","把求助能力保留下来","她不再只在危机时寻找导师，也开始向别人提供经验。","知夏持续经营学习共同体",{relationship:3,wisdom:1}],
    ["给自己半年不定型期","允许新身份慢慢形成","她拒绝立刻讲出完美转型故事，也承担短期的不确定。","知夏允许身份在实践中形成",{courage:2,happiness:2}]
  ]}),
];

const published = { status:"published", version:"3.0.0", sourceType:"team", consentConfirmed:true, publishedAt:"2026-08-21T00:00:00+08:00" } as const;

export const additionalStories: StoryLibraryRecord[] = [
  { ...published, id:"gap-year-anran", name:"安然", age:28, portrait:5, theme:"职业倦怠与间隔期", color:"#9B7358", tagline:"停下来并不会自动带来答案。她要用有限的储备，重新学习怎样工作而不靠透支证明自己。", situation:"28岁，上海消费科技公司产品经理。长期高压让身体发出警报，她在离开、短休和继续谈判之间寻找可持续的下一步。", nodes:[...gapNodes, ...gapBranchNodes] },
  { ...published, id:"relationship-lumingwei", name:"陆明薇", age:32, portrait:6, theme:"亲密关系与自主边界", color:"#75638F", tagline:"她不是等待被谁软化，而是在不交出决定权的前提下，练习让另一个人的需要进入生活。", situation:"32岁，医疗影像 AI 创业公司 CEO。事业快速上升，亲密关系却始终停在条件表外；一次温室相遇让她开始检验靠近的边界。", nodes:[...relationshipNodes, ...relationshipBranchNodes] },
  { ...published, id:"two-cities-linwan", name:"林晚", age:26, portrait:7, theme:"城市、关系与职业迁移", color:"#60879B", tagline:"没有一座城市能自动兼顾爱情与事业。重要的是迁移成本由谁承担，以及选择能否被重新讨论。", situation:"26岁，游戏数据分析师。厦门有更匹配的工作，北京有相恋多年的伴侣；三年的双城生活把抽象选择变成一次次具体交换。", nodes:[...cityNodes, ...cityBranchNodes] },
  { ...published, id:"education-xuzhixia", name:"许知夏", age:30, portrait:8, theme:"深造、稳定与机会成本", color:"#71836B", tagline:"深造不是勇敢测试，留下也不是退缩。她需要判断这段高成本学习究竟要解决什么。", situation:"30岁，资深用户研究员。稳定工作开始停滞，一封一年制海外硕士录取信，让学习目标、家庭责任和两年积蓄同时来到桌面。", nodes:[...educationNodes, ...educationBranchNodes] },
];
