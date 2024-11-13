/**
 * @author xmo
 * @name botreply
 * @team xmo
 * @version 3.4.0
 * @description 自动回复插件，可调用聊天插件如ChatGPT等回复，仅支持文本。
 * @rule ^(botreply)\s+(\S+)\s+([\s\S]+)$
 * @rule ^(botreply)\s+(\S+)\s+(del)$
 * @rule ^(botreply)\s+(list)$
 * @rule ^(botreply)\s+(empty)$
 * @rule ^([\s\S]+)$
 * @admin false
 * @priority -1
 * @classification ["botreply"]
 * @public true
 * @disable false
 */

 /*
 功能介绍：
   关键词重定向参数格式：@remsg@重定向后的关键词
   伪装消息参数格式：@mask@平台@ones@群组ID@ones@好友ID@ones@用户ID@ones@消息
   伪装删除参数格式：@mask@@delmsg@平台@ones@群组ID@ones@好友ID@ones@用户ID
   管理命令参数格式：@admincmd@平台@ones@命令
   管理推送参数格式：@adminpush@平台@ones@消息@ones@类型@ones@路径
   用户推送参数格式：@userpush@平台@ones@群组ID@ones@用户ID@ones@消息@ones@类型@ones@路径
 基本指令：
   botreply 关键词 回复内容         //向数据库中添加新的回复[关键词内不应该有空格，若必须设置半角空格用“%20”全角空格用“%E3%80%80”代替进行设置]
   botreply list                   //数据库中关键词列表
   botreply empty                  //清空所有关键词
   botreply upkey 旧key|>>|新key   //更新key，回复内容不变
 黑白名单：
   @keyblacklist@                       //key黑名单
   @groupblacklist@ @groupwhitelist@    //群组黑白名单，选择一个使用，两个同时存在只生效黑名单
   @userblacklist@ @userwhitelist@      //用户黑白名单，选择一个使用，两个同时存在只生效黑名单
   @oneblacklist@ @onewhitelist@        //私聊黑白名单，选择一个使用，两个同时存在只生效黑名单
 传参指令：
   @remsg@          //重定向标识符
   @mask@           //伪装消息标识符
   @mask@@delmsg@   //伪装删除标识符
   @admincmd@       //管理命令标识符
   @adminpush@      //管理推送标识符
   @userpush@       //用户推送标识符
   @recallmsg@      //撤回消息识别符
   @chatcom@        //关键词标识符
   @ones@           //通用分隔符
   @type@           //文件类型分隔符，发送文件类型不为text时使用此标识符分割
   |@@|             //多条回复内容分割标识符
   @sfrom@          //平台
   @groupid@        //群组id
   @userid@         //用户id
   @admin@          //管理员权限
   @msgself@        //消息内容
   @msgid@          //消息id
   @groupname@      //群组名称
   @username@       //用户名称
   @nowdate@        //当前日期
   @nowtime@        //当前时间
   @userkeyword@    //消息内容(剔除模糊匹配词)
   @nodel@          //持久消息(不受自动删除的约束)
   @delayN@         //延时发送秒数(N改为整数)
   @nochat@         //禁止创建回复路径
   @deldelayN@      //自定义延时发送秒数(N改为整数)
 示例：
   参照：https://github.com/xmoxmo/bncr
 */

const jsonSchema = BncrCreateSchema.object({
  basic: BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('指令开关').setDescription(`开启将启用匹配其他插件指令，开启并填写指令关键词后生效。`).setDefault(true),
    forward: BncrCreateSchema.string().setTitle('指令关键词').setDescription(`请输入其他插件匹配指令关键词，留空则不启用调用，仅读取数据库内容。`).setDefault('aigptv2'),
    enablechat: BncrCreateSchema.boolean().setTitle('聊天模式开关').setDescription(`聊天模式总开关，当数据库中无匹配回复时自动调用聊天模式指令关键词所在ai插件回复。`).setDefault(false),
    forwardchat: BncrCreateSchema.string().setTitle('聊天模式指令关键词').setDescription(`为聊天模式单独设置其他插件匹配指令关键词，留空则使用"指令关键词"。`).setDefault(''),
    maxword: BncrCreateSchema.number().setTitle('聊天模式限制字数').setDescription(`设置私聊时忽略超过指定字数的问题应答`).setDefault(80),
  }).setTitle('基本设置').setDefault({}),
  forwards: BncrCreateSchema.array(BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('启用').setDescription('是否启用').setDefault(true),
    rule: BncrCreateSchema.object({
      csform: BncrCreateSchema.string().setTitle('平台').setDescription(`启用自定义指令关键词的平台名称`).setDefault(""),
      cforward: BncrCreateSchema.string().setTitle('指令关键词').setDescription(`自定义的指令关键词，留空则使用基本设置的"指令关键词"`).setDefault(''),
      cforwardchat: BncrCreateSchema.string().setTitle('聊天模式指令关键词').setDescription(`自定义的聊天模式指令关键词，留空则使用"自定义的指令关键词"`).setDefault(''),
      cmaxword: BncrCreateSchema.number().setTitle('聊天模式限制字数').setDescription(`设置私聊时忽略超过指定字数的问题应答`).setDefault(80),
    }),
  })).setTitle('指令相关').setDefault([]),
  nobotname: BncrCreateSchema.array(BncrCreateSchema.string()).setTitle('Bot设置').setDescription(`填写未设置bot名称不提示引导操作的适配器名称，设置bot名称主要用来识别群组内是否被@。若bot所在适配器无群组功能则无需设置bot名称，并将此适配器名称填写到以下表单。`).setDefault(['web', 'ssh', 'wxMP']),
  noreplychat: BncrCreateSchema.array(BncrCreateSchema.string()).setTitle('聊天设置').setDescription(`禁用聊天模式的适配器，填写数据库中无匹配数据时不再调用"指令关键词"进行额外回复的适配器名称。当聊天模式开关开启时此处才会生效。`).setDefault(['HumanTG']),
  autodelglobal: BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('自动撤回').setDescription('开启后将启用人形外平台的自动撤回').setDefault(false),
    delay: BncrCreateSchema.number().setTitle('超时秒数').setDescription(`设置自动撤回超时的秒数`).setDefault(60),
  }).setTitle('撤回设置').setDefault({}),
  humantg: BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('自动撤回').setDescription(`开启将启用自动撤回功能。`).setDefault(false),
    humanfrom: BncrCreateSchema.string().setTitle('人形平台').setDescription(`填写人形平台名称，使用英文“,”分割。设置对应平台的botid[set 平台名 botid 人形id]。`).setDefault('HumanTG'),
    mode: BncrCreateSchema.string().setTitle('模式设置').setDescription('选择合适自己的模式').setEnum(['white', 'black']).setEnumNames(['白名单模式', '黑名单模式']).setDefault('white'),
    modestr: BncrCreateSchema.string().setTitle('生效设置').setDescription(`填写应用上述模式的群id使用英文“,”分割。`).setDefault(''),
    delay: BncrCreateSchema.number().setTitle('撤回延时').setDescription(`设置自动撤回超时的秒数`).setDefault(60),
  }).setTitle('人形设置').setDefault({}),
  debug: BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('调试开关').setDescription(`开启将开启调试模式，对应平台管理员将收到额外的调试信息。`).setDefault(false),
  }).setTitle('调试设置').setDefault({})
});

const ver = '3.4.0';
const ConfigDB = new BncrPluginConfig(jsonSchema);
module.exports = async (s) => {
  if (!Object.keys(ConfigDB.userConfig).length) {
    autoreply('请前往前端web"插件配置"来完成插件首次配置。');
    return 'next';
  }

  const forward = ConfigDB.userConfig.basic.enable || true;
  const forwardchat = ConfigDB.userConfig.basic.enablechat || false;
  const sfrom = s.getFrom();
  const customforwards = ConfigDB.userConfig.forwards.filter(o => o.enable) || [];
  let customforwardline = '';
  let customforwardlinechat = '';
  let custommaxword = '';
  for (const customforward of customforwards) {
    const csform = customforward.rule.csform || '';
    const cforward = customforward.rule.cforward || '';
    const cforwardchat = customforward.rule.cforwardchat || '';
    const cmaxword = customforward.rule.cmaxword || '';
    if (csform === sfrom) {
      customforwardline = cforward;
      customforwardlinechat = cforwardchat;
      custommaxword = cmaxword
      break;
    }
  }
  let forwardline = '';
  let forwardlinechat = '';
  if (forward) {
    forwardline = customforwardline || ConfigDB.userConfig.basic.forward || '';
  }
  if (forwardchat) {
    forwardlinechat = customforwardlinechat || ConfigDB.userConfig.basic.forwardchat || '';
  }
  const maxword = custommaxword || ConfigDB.userConfig.basic.maxword || 80;
  const nonamearr = ConfigDB.userConfig.nobotname || [];
  const noreplychatarr = ConfigDB.userConfig.noreplychat || [];
  const autodelglobal = ConfigDB.userConfig.autodelglobal.enable || false;
  const autodel = ConfigDB.userConfig.humantg.enable || false;
  const humanfrom = ConfigDB.userConfig.humantg.humanfrom || '';
  const mode = ConfigDB.userConfig.humantg.mode || 'white';
  const modestr = ConfigDB.userConfig.humantg.modestr || '';
  const debug = ConfigDB.userConfig.debug.enable;
  const groupId = s.getGroupId();
  const userId = s.getUserId();
  const msgSelf = s.getMsg();
  const msgId = s.getMsgId();
  const userName = s.getUserName();
  const groupName = s.getGroupName();
  const getTime = sysMethod.getTime();
  const sysDB = new BncrDB('BotReplyDB');
  const commandType = s.param(1);
  const keyword = decodeURIComponent(s.param(2));
  const replyContent = s.param(3);
  const fromDB = new BncrDB(sfrom);
  const nowDate = sysMethod.getTime('yyyy-MM-dd');
  const nowTime = sysMethod.getTime('hh:mm:ss');
  const ones = '@ones@';
  let botname = await fromDB.get('botname') || '';
  let botid = await fromDB.get('botid') || '';
  let autodelmsg = 'n';
  let autodelmsgdelay = 60;
  let humanfroms = [];
  if (autodel) {
    if (humanfrom) {
      humanfroms = humanfrom.split(',');
      if (humanfroms.indexOf(sfrom) != -1) {
        if (mode === 'white') {
          if (modestr) {
            modestrs = modestr.split(',');
            if (modestrs.indexOf(groupId) != -1) {
              autodelmsg = 'y';
              autodelmsgdelay = ConfigDB.userConfig.humantg.delay || 60;
            }
          }
        }
        if (mode === 'black') {
          if (modestr) {
            modestrs = modestr.split(',');
            if (modestrs.indexOf(groupId) == -1) {
              autodelmsg = 'y';
              autodelmsgdelay = ConfigDB.userConfig.humantg.delay || 60;
            }
          }
        }
      }
    }
  }
  // console.log(autodelmsg);
  if (autodelglobal) {
    autodelmsg = 'y';
    autodelmsgdelay = ConfigDB.userConfig.autodelglobal.delay || 60;
  }

  // console.log(`Received command: ${commandType}, Keyword: ${keyword}, ReplyContent: ${replyContent}`);

  if (commandType === 'botreply') {
    if (keyword === 'list') {
      await handleListKeywords(s);
    } else if (keyword === 'empty') {
      await handleEmptyKeywords(s);
    } else if (replyContent === 'del') {
      await handleDelReply(s, keyword);
    } else if (keyword  === 'upkey') {
      await handleModifykey(s, replyContent);
    } else if (keyword  === 'treply') {
      await handlereplacekeyword(s, replyContent);
    } else {
      await handleAddReply(s, keyword, replyContent);
    }
  } else {
    let endreturn = await handleGetReply(s, commandType);
    if (endreturn === 'next') {
      return 'next';
    }
  }

  async function handleAddReply(s, keyword, reply) {
    if (!(await s.isAdmin())) {
      // console.log('User does not have admin privileges');
      return autoreply('你没有权限执行此操作');
    }

    let str = keyword;
    let keygjc = '';
    let keydyy = '';
    if (str.includes('|@|')) {
      let strarr = str.split('|@|');
      keygjc = strarr[0];
      keydyy = strarr[1];
    } else {
      keygjc = str;
    }
    if (!keygjc) {
      autoreply('设置失败：无关键词');
    } else {
      const result = await setReply(keyword, reply);
      // console.log(`Set reply result for keyword ${keyword}: ${result}`);
      autoreply(result ? '设置成功' : '设置失败');
    }
  }

  async function handleDelReply(s, keyword) {
    if (!(await s.isAdmin())) {
      // console.log('User does not have admin privileges');
      return autoreply('你没有权限执行此操作');
    }

    let keys = await sysDB.keys();
    if (keys.indexOf(keyword) == -1) {
      autoreply(`删除失败：数据库中无[${keyword}]`);
      return null;
    }
    const result = await deleteReply(keyword);
    // console.log(`Delete reply result for keyword ${keyword}: ${result}`);
    autoreply(result ? '删除成功' : '删除失败');
  }

  async function handleModifykey(s, keyword) {
    if (!(await s.isAdmin())) {
      // console.log('User does not have admin privileges');
      return autoreply('你没有权限执行此操作');
    }
    
    let str = keyword;
    let oldkey = '';
    let newkey = '';
    if (str.includes('|>>|')) {
      let strarr = str.split('|>>|');
      oldkey = strarr[0];
      newkey = strarr[1];
      let replymsg = '';
      if (oldkey === newkey) {
        replymsg = '修改前后key一致';
      } else {
        reply = await sysDB.get(oldkey);
        if (reply) {
          const addresult = await setReply(newkey, reply);
          replymsg = (addresult ? '' : '添加newkey失败');
        } else {
          replymsg = '请检查要修改的key是否正确';
        }
      }
      if (replymsg) {
        autoreply('更改失败：' + replymsg);
      } else {
        const delresult = await deleteReply(oldkey);
        replymsg = (delresult ? '' : '删除oldkey失败');
        if (replymsg) {
          autoreply('更改失败：' + replymsg);
        } else {
          autoreply('更改成功');
        }
      }
    } else {
      autoreply('更改失败：无标识符[|>>|]');
    }
  }

  async function handlereplacekeyword(s, keyword) {
    if (!(await s.isAdmin())) {
      // console.log('User does not have admin privileges');
      return autoreply('你没有权限执行此操作');
    }

    if (keyword.includes('|tt|')) {
      let wstrarr = keyword.split('|tt|');
      oldt = wstrarr[0];
      newt = wstrarr[1];
      let replymsg = '';
      if (oldt === newt) {
        replymsg = '替换词前后一致';
      } else {
        let keys = await sysDB.keys();
        if (keys.length > 0) {
          for (var i = 0; i < keys.length; i++) {
            let replydb = '';
            let addmsg = '';
            let key = keys[i];
            replydb = await sysDB.get(key);
            newreplydb = replydb.replace(new RegExp(oldt,'g'), newt);
            if (replydb !== newreplydb) {
              addresult = await setReply(key, newreplydb);
              addmsg = (addresult ? '' : key);
              if (addmsg) {
                 replymsg += '、' + addmsg;
              }
            }
          }
          if (replymsg) {
            replymsg = replymsg.slice(1);
          }
        }
      }
      if (replymsg) {
        autoreply('替换失败：' + replymsg);
      } else {
        autoreply('替换成功');
      }
    } else {
      autoreply('替换失败：无标识符[|tt|]');
    }
  }

  async function handleGetReply(s, keyword) {
    if (!keyword) return 'next';
    let getlastmsg = await sysDB.get('@botreplylastmsg@');
    let nowmsginfo = `${sfrom}/${groupId}@${userId}:${keyword}`;
    let nowmsg = `${getTime}${ones}${nowmsginfo}`;
    if (getlastmsg) {
      if (getlastmsg.includes(ones)) {
        let getlastmsgs = getlastmsg.split(ones);
        msgstamp = getlastmsgs[0];
        msginfo = getlastmsgs[1];
        let lag = Number(getTime) - Number(msgstamp);
        if (Number(lag) < 30) {
          if (nowmsginfo === msginfo) {
            sysMethod.pushAdmin({
              platform: [`${sfrom}`],
              msg: `管理员消息：\n  >来源:${sfrom}\n  >群组id:${groupId}\n  >用户id:${userId}\n  >关键词:${keyword}\n  >详情:疑似循环`,
            });
            return null;
          }
        }
      }
    }
    if (keyword === '@botreplylastmsg@') {
      if (await s.isAdmin()) {
        let list = await sysDB.get(keyword);
        if (list) {
          await autoreply(list);
        } else {
          await autoreply('未设置');
        }
        return null;
      } else {
        autoreply('你没有权限执行此操作');
        return null;
      }
    }
    await sysDB.set('@botreplylastmsg@', nowmsg);
    if (keyword === 'botreply_ver') {
      await autoreply(ver);
      return null;
    }
    let keyblacklist = await sysDB.get('@keyblacklist@');
    if (keyblacklist) {
      if (keyblacklist.includes(ones)) {
        let keyblacklists = keyblacklist.split(ones);
        for (var k = 0; k < keyblacklists.length; k++) {
          let str = keyblacklists[k];
          if (str === '*') {
            sysMethod.pushAdmin({
              platform: [`${sfrom}`],
              msg: 'botreply关键词黑名单“@keyblacklist@”设置了“*”，插件被禁用',
            });
            return 'next';
          }
          if (str.includes('*')) { 
            str = str.replace(new RegExp(/\*/,'g'), '');
            if (keyword.includes(str)) {
              return 'next';
            }
          } else {
            if (keyword === str) {
              return 'next';
            }
          }
        }
      } else {
        if (keyword.includes(keyblacklist)) {
          return 'next';
        }
      }
    }
    let userblacklist = await sysDB.get('@userblacklist@');
    if (userblacklist) {
      if (userblacklist.includes(ones)) {
        let userblacklists = userblacklist.split(ones);
        if (userblacklists.indexOf(userId) != -1) {
          return 'next';
        }
      } else {
        if (userId === userblacklist) {
          return 'next';
        }
      }
    } else {
      let userwhitelist = await sysDB.get('@userwhitelist@');
      if (userwhitelist) {
        if (userwhitelist.includes(ones)) {
          let userwhitelists = userwhitelist.split(ones);
          if (userwhitelists.indexOf(userId) == -1) {
            return 'next';
          }
        } else {
          if (userId !== userwhitelist) {
            return 'next';
          }
        }
      }
    }
    if (!groupId || groupId === '0') {
      let oneblacklist = await sysDB.get('@oneblacklist@');
      if (oneblacklist) {
        if (oneblacklist.includes(ones)) {
          let oneblacklists = oneblacklist.split(ones);
          if (oneblacklists.indexOf(userId) != -1) {
            return 'next';
          }
        } else {
          if (userId === oneblacklist) {
            return 'next';
          }
        }
      } else {
        let onewhitelist = await sysDB.get('@onewhitelist@');
        if (onewhitelist) {
          if (onewhitelist.includes(ones)) {
            let onewhitelists = onewhitelist.split(ones);
            if (onewhitelists.indexOf(userId) == -1) {
              return 'next';
            }
          } else {
            if (userId !== onewhitelist) {
              return 'next';
            }
          }
        }
      }
    } else {
      let groupblacklist = await sysDB.get('@groupblacklist@');
      if (groupblacklist) {
        if (groupblacklist.includes(ones)) {
          let groupblacklists = groupblacklist.split(ones);
          if (groupblacklists.indexOf(groupId) != -1) {
            return 'next';
          }
        } else {
          if (groupId === groupblacklist) {
            return 'next';
          }
        }
      } else {
        let groupwhitelist = await sysDB.get('@groupwhitelist@');
        if (groupwhitelist) {
          if (groupwhitelist.includes(ones)) {
            let groupwhitelists = groupwhitelist.split(ones);
            if (groupwhitelists.indexOf(groupId) == -1) {
              return 'next';
            }
          } else {
            if (groupId !== groupwhitelist) {
              return 'next';
            }
          }
        }
      }
    }
    if (keyword === '@keyblacklist@' || keyword === '@userblacklist@' || keyword === '@groupblacklist@' || keyword === '@userwhitelist@' || keyword === '@groupwhitelist@' || keyword === '@oneblacklist@' || keyword === '@onewhitelist@') {
      if (await s.isAdmin()) {
        let list = await sysDB.get(keyword);
        if (list) {
          await autoreply(list);
        } else {
          await autoreply('未设置');
        }
        return null;
      } else {
        autoreply('你没有权限执行此操作');
        return null;
      }
    }
    if (keyword.includes('@keyblacklist@') || keyword.includes('@userblacklist@') || keyword.includes('@groupblacklist@') || keyword.includes('@botreplylastmsg@') || keyword.includes('@userwhitelist@') || keyword.includes('@groupwhitelist@') || keyword.includes('@oneblacklist@') || keyword.includes('@onewhitelist@')) {
      if (await s.isAdmin()) {
        autoreply('指令有误');
      } else {
        autoreply('你没有权限执行此操作');
      }
      return null;
    }
    let xforwardline = forwardlinechat || forwardline;
    if (xforwardline) {
      if (keyword.includes(`${xforwardline} `)) {
        sysMethod.pushAdmin({
          platform: [`${sfrom}`],
          msg: `管理员消息：\n  >来源:${sfrom}\n  >群组id:${groupId}\n  >用户id:${userId}\n  >关键词:${keyword}\n  >指令:${forwardline}\n  >详情:指令未响应`,
        });
        return null;
      }
    }
    if (keyword.includes('@group@')) {
      if (!(await s.isAdmin())) {
        keyword = keyword.replace(new RegExp('@group@','g'), '');
      }
    }
    let atbotmsg = '';
    if (botname) {
      if (sfrom === 'qq') {
        atbotmsg = `CQ:at,qq=${botname}`;
      } else if (sfrom === 'wxXyo') {
        atbotmsg = `at=${botname}`;
      } else {
        atbotmsg = `@${botname}`;
      }
    } else {
      botname = '';
      if (await s.isAdmin()) {
        if (nonamearr.indexOf(sfrom) == -1) {
          if (forwardchat) {
            if (noreplychatarr.indexOf(sfrom) == -1) {
              await autoreply(`警告：未读取到bot名称或qq账号！\n    管理员发送[set ${sfrom} botname 机器人名称或机器人账号]设置bot的名称，否则@机器人的信息无法识别。`);
            }
          }
        }
      }
    }
    let reply = '';
    if (atbotmsg) {
      if (!(keyword.includes(atbotmsg))) {
        reply = await getReply(keyword);
      }
    } else {
      reply = await getReply(keyword);
    }
    // console.log(`Get reply for keyword ${keyword}: ${reply}`);
    if (reply) {
      // console.log(`Replying with: ${reply}`);
      if (reply !== '@noreply@') {
        await autoreply(reply);
      }
      return null;
    } else {
      if (sfrom == 'HumanTG') {
        if (botid) {
          if (userId == botid) {
            return null;
          }
        }
        if (botname) {
          if (userName == botname) {
            return null;
          }
        }
      }
      if (forwardlinechat) {
        forwardline = forwardlinechat;
      }
      if (forwardchat) {
        if (noreplychatarr.indexOf(sfrom) != -1) {
          forwardline = '';
        }
      } else {
        forwardline = '';
      }
      let keywordstr = '';
      let newkeyword = '';
      let sreturn = '';
      if (!groupId || groupId === '0') {
        if (keyword.length > maxword) {
          sreturn = 'next';
        } else {
          if (forwardline) {
            s.inlineSugar(`${forwardline} ${keyword}`);
          } else {
            sreturn = 'next';
          }
        }
      } else {
        if (atbotmsg) {
          if (keyword.includes(atbotmsg)) {
            newkeyword = keyword;
            if (sfrom === 'qq') {
              newkeyword = newkeyword.replace(new RegExp(/\[CQ:at,.*?\]/, 'g'), '');
            }
            if (sfrom === 'wxXyo') {
              newkeyword = newkeyword.replace(new RegExp(/\[at=.*?\]/, 'g'), '');
            }
            newkeyword = newkeyword.replace(new RegExp(atbotmsg,'g'), '');
            newkeyword = newkeyword.replace(new RegExp(' ','g'), '');
            newkeyword = newkeyword.replace(new RegExp(' ','g'), '');
            if (newkeyword) {
              if (forwardline) {
                s.inlineSugar(`${forwardline} ${newkeyword}`);
                sreturn = null;
              } else {
                sreturn = 'next';
              }
            }
          } else {
            sreturn = 'next';
          }
        } else {
          sreturn = 'next';
        }
      }
      if (keyword.includes(',name=')) {
        keyword = keyword.replace(new RegExp(/CQ:at,qq=[0-9]+,name=/, 'g'), '@');
      }
      if (keyword.includes('CQ:at,qq=')) {
        keyword = keyword.replace(new RegExp(/CQ:at,qq=/, 'g'), '@');
      }
      if (keyword.includes('at=')) {
        keyword = keyword.replace(new RegExp(/at=/, 'g'), '@');
      }
      if (!newkeyword) {
        newkeyword = keyword;
      }
      if (!keywordstr) {
        keywordstr = keyword;
      }
      if (await s.isAdmin()) {
        if (debug) {
          sysMethod.pushAdmin({
            platform: [`${sfrom}`],
            msg: `管理员调试消息：\n  >来源:${sfrom}\n  >群组id:${groupId}\n  >用户id:${userId}\n  >信息:${keywordstr}\n  >名字:${botname}\n  >内容:${newkeyword}\n  >指令:${forwardline}`,
          });
        }
      }
      if (sreturn) {
        return sreturn;
      }
    }
  }

  async function handleListKeywords(s) {
    if (!(await s.isAdmin())) {
      // console.log('User does not have admin privileges');
      return autoreply('你没有权限执行此操作');
    }
    
    const keys = await sysDB.keys();
    // console.log(`Listing keywords: ${keys}`);
    if (keys.length > 0) {
      autoreply(`当前关键词列表:\n${keys.join('\n')}`);
    } else {
      autoreply('当前没有关键词');
    }
  }

  async function handleEmptyKeywords(s) {
    if (!(await s.isAdmin())) {
      // console.log('User does not have admin privileges');
      return autoreply('你没有权限执行此操作');
    }

    try {
      const keys = await sysDB.keys();
      for (const key of keys) {
        await sysDB.del(key);
      }
      // console.log('All keywords cleared');
      autoreply('所有关键词已清空');
    } catch (e) {
      // console.error('清空失败:', e);
      autoreply('清空失败');
    }
  }

  async function setReply(keyword, reply) {
    try {
      await sysDB.set(keyword, reply);
      return true;
    } catch (e) {
      console.error('设置失败:', e);
      return false;
    }
  }

  async function deleteReply(keyword) {
    try {
      await sysDB.del(keyword);
      return true;
    } catch (e) {
      console.error('删除失败:', e);
      return false;
    }
  }

  async function sortArray(array) {
    array.sort((a, b) => b.length - a.length)
    return array
  }

  async function getReply(keyword) {
    try {
      if (keyword.includes('　')) {
        keyword = keyword.replace(new RegExp('　','g'), ' ');
      }
      if (keyword.slice(0, 7) === '@remsg@') {
        return '@noreply@';
      } else {
        let newreturn = '';
        if (keyword.includes(':')) {
          newreturn = await getkey(':', keyword);
        }
        // console.log('“:”>' + newreturn);
        if (newreturn) {
          return '@noreply@'
        }
        if (keyword.includes(' ')) {
          newreturn = await getkey(' ', keyword);
        }
        // console.log('“ ”>' + newreturn);
        if (newreturn) {
          return '@noreply@'
        }
        newreturn = await getkey('', keyword);
        // console.log('“n”>' + newreturn);
        if (newreturn) {
          return '@noreply@'
        } else {
          return null;
        }

        async function getkey(fgf, keyword) {
          let userkeyword = keyword;
          let oldkeyword = keyword;
          if (fgf) {
            if (keyword.includes(fgf)) {
              let keywords = keyword.split(fgf);
              keyword = keywords[0] + fgf;
            }
            try {
              userkeyword = userkeyword.replace(new RegExp(`${keyword}`,'g'), '');
            } catch (e) {
              // console.error('正则替换失败:', e);
            }
          }
          // console.log('key' + '{' + keyword + '}');
          // console.log('user' + userkeyword);
          let keys = await sysDB.keys();
          keys = await sortArray(keys);
          return await newkeyword(keys, keyword, userkeyword, oldkeyword, fgf);
        }

        async function newkeyword(keys, keyword, userkeyword, oldkeyword, fgf) {
          let newkeyword = '';
          if (keys.length > 0) {
            for (var i = 0; i < keys.length; i++) {
              let str = keys[i];
              let keygjc = '';
              let keydyy = '';
              if (str.includes('|@|')) {
                let strarr = str.split('|@|');
                keygjc = strarr[0];
                keydyy = strarr[1];
              } else {
                keygjc = str;
                keydyy = '';
              }
              if (keygjc) {
                if (groupId && groupId !== '0') {
                  let smatch = '';
                  if (keygjc.includes('*')) {
                    keygjc = keygjc.replace(new RegExp(/\*/,'g'), '');
                    if (fgf) {
                      smatch = keyword === keygjc;
                    } else {
                      smatch = keyword.includes(keygjc);
                    }
                  } else {
                    smatch = oldkeyword === keygjc;
                  }
                  if (smatch) {
                    if (!keydyy) {
                      keydyy = groupId;
                    }
                    if (keydyy.includes(groupId)) {
                      let keydyyarr = keydyy.split(ones);
                      if (keydyyarr.indexOf(groupId) != -1) {
                        keyword = keys[i];
                        break;
                      }
                    } else {
                      let getgroup = await sysDB.get(`${keydyy}@group@|@|0`);
                      if (getgroup) {
                        let getgrouparr = getgroup.split(ones);
                        if (getgrouparr.indexOf(groupId) != -1) {
                          keyword = keys[i];
                          break;
                        }
                      }
                    }
                  }
                } else {
                  if (keygjc.includes('*')) {
                    keygjc = keygjc.replace(new RegExp(/\*/,'g'), '');
                    if (keyword === keygjc) {
                      newkeyword += `|@@|${keys[i]}`;
                      // break;
                    }
                  } else {
                    if (oldkeyword === keygjc) {
                      newkeyword += `|@@|${keys[i]}`;
                      // break;
                    }
                  }
                }
              }
            }
          }
          if (newkeyword) {
            keyword = newkeyword.slice(4);
          }
          if (keyword.includes('|@@|')) {
            let keywords = keyword.split('|@@|');
            for (var k = 0; k < keywords.length; k++) {
              await funreplydb(keywords[k], userkeyword);
            }
            return '@noreply@';
          } else {
            return await funreplydb(keyword, userkeyword);
          }
        }

        async function funreplydb(keyword, userkeyword) {
          replydb = await sysDB.get(keyword);
          if (replydb) {
            if (replydb.includes('|@@|')) {
              let replydbs = replydb.split('|@@|');
              for (var k = 0; k < replydbs.length; k++) {
                await funsendreply(replydbs[k], userkeyword);
              }
              return '@noreply@';
            } else {
              return await funsendreply(replydb, userkeyword);
            }
          } else {
            return null;
          }
        }
        
        async function funsendreply(replydb, userkeyword) {
          if (replydb) {
            if (replydb === '@noreply@') {
              return '@noreply@';
            }
            if (replydb.includes('@admin@')) {
              if (await s.isAdmin()) {
                replydb = replydb.replace(new RegExp('@admin@','g'), '');
              } else {
                autoreply('你没有权限执行此操作');
                return '@noreply@';
              }
            }
            const delay = replydb.match(/@delay([^ \n]+)@/g);
            let delay0 = 0;
            if (delay) {
              delay0 = delay[0];
              replydb = replydb.replace(new RegExp(delay0,'g'), '');
              const delayn = delay0.replace(new RegExp('@delay','g'), '').replace(new RegExp('@','g'), '');
              if (!isNaN(delayn)) {
                await sysMethod.sleep(Math.round(delayn));
              } else {
                await sysMethod.sleep(5);
              }
            }
            const deldelay = replydb.match(/@deldelay([^ \n]+)@/g);
            let deldelay0 = 0;
            if (deldelay) {
              deldelay0 = deldelay[0];
              replydb = replydb.replace(new RegExp(deldelay0,'g'), '');
              const deldelayn = Number(deldelay0.replace(new RegExp('@deldelay','g'), '').replace(new RegExp('@','g'), ''));
              if (!isNaN(deldelayn)) {
                if (autodelmsg === 'n') {
                  autodelmsg === 'y';
                }
                autodelmsgdelay = deldelayn;
              }
            }
            let nodelmsgs = false;
            if (replydb.includes('@nodel@')) {
              replydb = replydb.replace(new RegExp('@nodel@','g'), '');
              nodelmsgs = true;
            }
            if (replydb.includes('@userkeyword@')) {
              replydb = replydb.replace(new RegExp('@userkeyword@','g'), userkeyword);
            }
            if (replydb.includes('@sfrom@')) {
              replydb = replydb.replace(new RegExp('@sfrom@','g'), sfrom);
            }
            if (replydb.includes('@groupid@')) {
              replydb = replydb.replace(new RegExp('@groupid@','g'), groupId);
            }
            if (replydb.includes('@userid@')) {
              replydb = replydb.replace(new RegExp('@userid@','g'), userId);
            }
            if (replydb.includes('@msgself@')) {
              replydb = replydb.replace(new RegExp('@msgself@','g'), msgSelf);
            }
            if (replydb.includes('@msgid@')) {
              replydb = replydb.replace(new RegExp('@msgid@','g'), msgId);
            }
            if (replydb.includes('@username@')) {
              replydb = replydb.replace(new RegExp('@username@','g'), userName);
            }
            if (replydb.includes('@groupname@')) {
              replydb = replydb.replace(new RegExp('@groupname@','g'), groupName);
            }
            if (replydb.includes('@nowdate@')) {
              replydb = replydb.replace(new RegExp('@nowdate@','g'), nowDate);
            }
            if (replydb.includes('@nowtime@')) {
              replydb = replydb.replace(new RegExp('@nowtime@','g'), nowTime);
            }
            let onchat = 1;
            if (replydb.includes('@nochat@')) {
              replydb = replydb.replace(new RegExp('@nochat@','g'), '');
              onchat = 0;
            }
            let replydbones = '';
            let dbsfrom ='';
            let dbgroupid = '';
            let dbfriendid = '';
            let dbuserid = '';
            let dbmsg = '';
            let dbtype = '';
            let dbpath = '';
            let chatdb = '';
            let setdbmsg = '';
            let olddbmsg = '';
            if (replydb.slice(0, 7) === '@remsg@') {
              replydb = replydb.slice(7);
              if (replydb.includes('@chatcom@')) {
                replydb = replydb.replace(new RegExp('@chatcom@','g'), forwardline);
                if (forwardline) {
                  s.inlineSugar(replydb);
                }
              } else {
                s.inlineSugar(replydb);
              }
            } else if (replydb.slice(0, 6) === '@mask@') { //伪装消息
              replydbones = '';
              dbsfrom ='';
              dbgroupid = '';
              dbfriendid = '';
              dbuserid = '';
              dbmsg = '';
              replydb = replydb.slice(6);
              if (replydb.slice(0, 8) === '@delmsg@') {
                replydb = replydb.slice(8);
                if (replydb.includes('@ones@')) {
                  if (sfrom === 'HumanTG') {
                    replydbones = replydb.split('@ones@');
                    dbsfrom = replydbones[0];
                    if (dbsfrom == 0) {
                      dbsfrom = sfrom;
                    }
                    dbgroupid = replydbones[1];
                    dbfriendid = replydbones[2];
                    dbuserid = replydbones[3];
                    const msgInfo = {
                      userId: dbuserid || '0',
                      groupId: dbgroupid || '0',
                      friendId: dbfriendid || '0',
                    }
                    if (userkeyword) {
                      const userkeywords = userkeyword.split(' ');
                      let delnum = Number(userkeywords[0]) || 1;
                      if (!isNaN(delnum)) {
                        delnum = 1;
                      }
                      let deltime = Number(userkeywords[1]) || 1;
                      if (!isNaN(deltime)) {
                        deltime = 1;
                      }
                      let delinfo = [];
                      const ChatID = +dbgroupid || +dbfriendid || +dbuserid;
                      delinfo = await s.Bridge.getUserMsgId(ChatID, dbuserid, delnum);
                      console.log(delinfo);
                      await sysMethod.sleep(deltime);
                      sysMethod.Adapters(msgInfo, sfrom, 'delMsg', delinfo);
                    }
                  }
                } 
              } else {
                if (replydb.includes('@ones@')) {
                  replydbones = replydb.split('@ones@');
                  dbsfrom = replydbones[0];
                  if (dbsfrom == 0) {
                    dbsfrom = sfrom;
                  }
                  dbgroupid = replydbones[1];
                  dbfriendid = replydbones[2];
                  dbuserid = replydbones[3];
                  dbmsg = replydbones[4];
                  const msgInfo = {
                    type: 'text',
                    msg: dbmsg.replaceAll('\\n', '\n'),
                    userId: dbuserid || '0',
                    groupId: dbgroupid || '0',
                    friendId: dbfriendid || '0',
                  }
                  sysMethod.Adapters(msgInfo, sfrom, 'inlinemask', msgInfo);
                } 
              }
            } else if (replydb.slice(0, 10) === '@admincmd@') { //管理命令
              replydb = replydb.slice(10);
              sysMethod.inline(replydb.replaceAll('\\n', '\n'));
            } else if (replydb.slice(0, 11) === '@adminpush@') { //管理推送
              replydbones = '';
              dbsfrom ='';
              dbmsg = '';
              dbtype = '';
              dbpath = '';
              replydb = replydb.slice(11);
              if (replydb.includes('@ones@')) {
                replydbones = replydb.split('@ones@');
                dbsfrom = replydbones[0];
                dbmsg = replydbones[1];
                dbtype = replydbones[2];
                dbpath = replydbones[3];
                let dbsfroms = '';
                if (dbsfrom) {
                  dbsfroms = dbsfrom.split(",");
                }
                sysMethod.pushAdmin({
                  platform: dbsfroms || [],
                  msg: dbmsg.replaceAll('\\n', '\n'),
                  type: dbtype || 'text',
                  path: dbpath || '',
                });
                if (msgSelf.slice(0, 2) !== '对话') {
                  if (onchat) {
                    chatdb = await sysDB.get(`对话${userId} *`);
                    if (groupId && groupId !== '0') {
                      setdbmsg = `@userpush@${sfrom}@ones@${groupId}@ones@0@ones@于时间{@nowdate@ @nowtime@}收到来自管理员发给{${userName}}的消息:\n@userkeyword@|@@|消息{@userkeyword@}推送给用户{${userName}}成功@delay2@`;
                    } else {
                      setdbmsg = `@userpush@${sfrom}@ones@0@ones@${userId}@ones@于时间{@nowdate@ @nowtime@}收到来自管理员发给{${userName}}的消息:\n@userkeyword@|@@|消息{@userkeyword@}推送给用户{${userName}}成功@delay2@`;
                    }
                    if (!chatdb) {
                      await sysDB.set(`对话${userId} *`, setdbmsg);
                    } else {
                      const olddbmsg = await sysDB.get(`对话${userId} *`);
                      if (setdbmsg !== olddbmsg) {
                        await sysDB.set(`对话${userId} *`, setdbmsg);
                      }
                    }
                  }
                }
              }
            } else if (replydb.slice(0, 10) === '@userpush@') { //用户推送
              replydbones = '';
              dbsfrom ='';
              dbgroupid = '';
              dbuserid = '';
              dbmsg = '';
              dbtype = '';
              dbpath = '';
              replydb = replydb.slice(10);
              if (replydb.includes('@ones@')) {
                replydbones = replydb.split('@ones@');
                dbsfrom = replydbones[0];
                dbgroupid = replydbones[1];
                dbuserid = replydbones[2];
                dbmsg = replydbones[3];
                dbtype = replydbones[4];
                dbpath = replydbones[5];
                let dbsfroms = '';
                if (dbsfrom) {
                  dbsfroms = dbsfrom.split(",");
                }
                sysMethod.push({
                  platform: dbsfroms || [],
                  groupId: dbgroupid,
                  userId: dbuserid,
                  msg: dbmsg.replaceAll('\\n', '\n'),
                  type: dbtype || 'text',
                  path: dbpath || '',
                });
                if (msgSelf.slice(0, 2) !== '对话') {
                  if (onchat) {
                    chatdb = await sysDB.get(`对话${userId} *`);
                    if (groupId && groupId !== '0') {
                      setdbmsg = `@userpush@${sfrom}@ones@${groupId}@ones@0@ones@于时间{@nowdate@ @nowtime@}收到发给{${userName}}的消息:\n@userkeyword@|@@|消息{@userkeyword@}推送给用户{${userName}}成功@delay2@`;
                    } else {
                      setdbmsg = `@userpush@${sfrom}@ones@0@ones@${userId}@ones@于时间{@nowdate@ @nowtime@}收到发给{${userName}}的消息:\n@userkeyword@|@@|消息{@userkeyword@}推送给用户{${userName}}成功@delay2@`;
                    }
                    if (!chatdb) {
                      await sysDB.set(`对话${userId} *`, setdbmsg);
                    } else {
                      const olddbmsg = await sysDB.get(`对话${userId} *`);
                      if (setdbmsg !== olddbmsg) {
                        await sysDB.set(`对话${userId} *`, setdbmsg);
                      }
                    }
                  }
                }
              }
            } else if  (replydb.slice(0, 11) === '@recallmsg@') {
              if (sfrom === 'qq' || sfrom === 'tgBot') {
                s.delMsg(msgId);
              }
              if (sfrom === 'HumanTG') {
                const msgInfo = {
                  userId: botid || '0',
                  groupId: groupId || '0',
                }
                sysMethod.Adapters(msgInfo, sfrom, 'delMsg', [msgId]);
              }
            } else {
              let replydbtype = '';
              let replymsg = '';
              if (replydb.includes('@type@')) {
                replydbtype = replydb.split('@type@');
                replymsg = replydbtype[2];
              } else {
                replymsg = replydb;
              }
              await autoreply({
                type: replydbtype[0] || 'text',
                path: replydbtype[1] || '',
                msg: replymsg,
                nodelmsg: nodelmsgs || false,
              });
            }
            if (await s.isAdmin()) {
              if (debug) {
                sysMethod.pushAdmin({
                    platform: [`${sfrom}`],
                    msg: `管理员调试消息：\n  >来源:${sfrom}\n  >群组id:${groupId}\n  >用户id:${userId}\n  >关键词:${keyword}\n  >回复:${replydb}\n  >指令:${forwardline}`,
                });
              }
            }
            return '@noreply@';
          } else {
            return null;
          }
        }
      }
    } catch (e) {
      console.error('获取失败:', e);
      return '@noreply@';
    }
  }
  async function autoreply(info) {
    if (autodelmsg === 'y') {
      if (info.nodelmsg) {
        await s.reply(info);
        return null;
      }
      if (humanfroms.indexOf(sfrom) != -1) {
        if (botid == userId) {
          s.delMsg(await s.reply(info), { wait: autodelmsgdelay });
        } else {
          const newmsgid = await s.reply(info);
          const msgInfo = {
            userId: botid || '0',
            groupId: groupId || '0',
          }
          await sysMethod.sleep(autodelmsgdelay);
          sysMethod.Adapters(msgInfo, sfrom, 'delMsg', [newmsgid]);
        }
      } else {
        s.delMsg(await s.reply(info), { wait: autodelmsgdelay });
      }
    } else {
      await s.reply(info);
    }
  }
};
