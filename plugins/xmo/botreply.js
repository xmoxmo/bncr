/**
 * @author xmo
 * @name botreply
 * @team xmo
 * @version 3.1.2
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
  debug: BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('调试开关').setDescription(`开启将开启调试模式，对应平台管理员将收到额外的调试信息。`).setDefault(false),
  }).setTitle('调试设置').setDefault({})
});
const ver = '3.1.1';
const ConfigDB = new BncrPluginConfig(jsonSchema);
module.exports = async (s) => {
  if (!Object.keys(ConfigDB.userConfig).length) {
    s.reply('请前往前端web"插件配置"来完成插件首次配置。');
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
  const keyword = s.param(2);
  const replyContent = s.param(3);

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
      return s.reply('你没有权限执行此操作');
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
      s.reply('设置失败：无关键词');
    } else {
      const result = await setReply(keyword, reply);
      // console.log(`Set reply result for keyword ${keyword}: ${result}`);
      s.reply(result ? '设置成功' : '设置失败');
    }
  }

  async function handleDelReply(s, keyword) {
    if (!(await s.isAdmin())) {
      // console.log('User does not have admin privileges');
      return s.reply('你没有权限执行此操作');
    }

    let keys = await sysDB.keys();
    if (keys.indexOf(keyword) == -1) {
      s.reply(`删除失败：数据库中无[${keyword}]`);
      return null;
    }
    const result = await deleteReply(keyword);
    // console.log(`Delete reply result for keyword ${keyword}: ${result}`);
    s.reply(result ? '删除成功' : '删除失败');
  }

  async function handleModifykey(s, keyword) {
    if (!(await s.isAdmin())) {
      // console.log('User does not have admin privileges');
      return s.reply('你没有权限执行此操作');
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
        s.reply('更改失败：' + replymsg);
      } else {
        const delresult = await deleteReply(oldkey);
        replymsg = (delresult ? '' : '删除oldkey失败');
        if (replymsg) {
          s.reply('更改失败：' + replymsg);
        } else {
          s.reply('更改成功');
        }
      }
    } else {
      s.reply('更改失败：无标识符[|>>|]');
    }
  }

  async function handlereplacekeyword(s, keyword) {
    if (!(await s.isAdmin())) {
      // console.log('User does not have admin privileges');
      return s.reply('你没有权限执行此操作');
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
        s.reply('替换失败：' + replymsg);
      } else {
        s.reply('替换成功');
      }
    } else {
      s.reply('替换失败：无标识符[|tt|]');
    }
  }

  async function handleGetReply(s, keyword) {
    if (!keyword) return 'next';
    let getlastmsg = await sysDB.get('@botreplylastmsg@');
    let nowmsginfo = `${sfrom}/${groupId}@${userId}:${keyword}`;
    let nowmsg = `${getTime}|${nowmsginfo}`;
    if (getlastmsg) {
      if (getlastmsg.includes('|')) {
        let getlastmsgs = getlastmsg.split('|');
        msgstamp = getlastmsgs[0];
        msginfo = getlastmsgs[1];
        let lag = Number(getTime) - Number(msgstamp);
        if (Number(lag) < 200) {
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
          await s.reply(list);
        } else {
          await s.reply('未设置');
        }
        return null;
      } else {
        s.reply('你没有权限执行此操作');
        return null;
      }
    }
    await sysDB.set('@botreplylastmsg@', nowmsg);
    if (keyword === 'botreply_ver') {
      await s.reply(ver);
      return null;
    }
    let keyblacklist = await sysDB.get('@keyblacklist@');
    if (keyblacklist) {
      if (keyblacklist.includes('|')) {
        let keyblacklists = keyblacklist.split('|');
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
      if (userblacklist.includes('|')) {
        let userblacklists = userblacklist.split('|');
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
        if (userwhitelist.includes('|')) {
          let userwhitelists = userwhitelist.split('|');
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
        if (oneblacklist.includes('|')) {
          let oneblacklists = oneblacklist.split('|');
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
          if (onewhitelist.includes('|')) {
            let onewhitelists = onewhitelist.split('|');
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
        if (groupblacklist.includes('|')) {
          let groupblacklists = groupblacklist.split('|');
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
          if (groupwhitelist.includes('|')) {
            let groupwhitelists = groupwhitelist.split('|');
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
          await s.reply(list);
        } else {
          await s.reply('未设置');
        }
        return null;
      } else {
        s.reply('你没有权限执行此操作');
        return null;
      }
    }
    if (keyword.includes('@keyblacklist@') || keyword.includes('@userblacklist@') || keyword.includes('@groupblacklist@') || keyword.includes('@botreplylastmsg@') || keyword.includes('@userwhitelist@') || keyword.includes('@groupwhitelist@') || keyword.includes('@oneblacklist@') || keyword.includes('@onewhitelist@')) {
      if (await s.isAdmin()) {
        s.reply('指令有误');
      } else {
        s.reply('你没有权限执行此操作');
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
    const naDB = new BncrDB(sfrom);
    botname = await naDB.get('botname');
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
              await s.reply(`警告：未读取到bot名称或qq账号！\n    管理员发送[set ${sfrom} botname 机器人名称或机器人账号]设置bot的名称，否则@机器人的信息无法识别。`);
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
        await s.reply(reply);
      }
      return null;
    } else {
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
      return s.reply('你没有权限执行此操作');
    }
    
    const keys = await sysDB.keys();
    // console.log(`Listing keywords: ${keys}`);
    if (keys.length > 0) {
      s.reply(`当前关键词列表:\n${keys.join('\n')}`);
    } else {
      s.reply('当前没有关键词');
    }
  }

  async function handleEmptyKeywords(s) {
    if (!(await s.isAdmin())) {
      // console.log('User does not have admin privileges');
      return s.reply('你没有权限执行此操作');
    }

    try {
      const keys = await sysDB.keys();
      for (const key of keys) {
        await sysDB.del(key);
      }
      // console.log('All keywords cleared');
      s.reply('所有关键词已清空');
    } catch (e) {
      // console.error('清空失败:', e);
      s.reply('清空失败');
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
      let newkeyword = '';
      let userkeyword = keyword;
      if (keyword.slice(0, 7) === '@remsg@') {
        return '@noreply@';
      } else {
        if (keyword.includes(':')) {
          let keywords = keyword.split(':');
          keyword = keywords[0];
          try {
            userkeyword = userkeyword.replace(new RegExp(`${keyword}:`,'g'), '');
          } catch (e) {
            // console.error('正则替换失败:', e);
          }
        }
        let keys = await sysDB.keys();
        keys = await sortArray(keys);
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
            let userkeyword = '';
            if (keygjc) {
              if (groupId && groupId !== '0') {
                let smatch = '';
                if (keygjc.includes('*')) {
                  keygjc = keygjc.replace(new RegExp(/\*/,'g'), '');
                  smatch = keyword.includes(keygjc);
                } else {
                  smatch = keyword === keygjc;
                }
                if (smatch) {
                  if (!keydyy) {
                    keydyy = groupId;
                  }
                  if (keydyy.includes(groupId)) {
                    let keydyyarr = keydyy.split('|');
                    if (keydyyarr.indexOf(groupId) != -1) {
                      keyword = keys[i];
                      break;
                    }
                  } else {
                    let getgroup = await sysDB.get(`${keydyy}@group@|@|0`);
                    if (getgroup) {
                      let getgrouparr = getgroup.split('|');
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
                }
                if (keyword === keygjc) {
                  newkeyword += `|@@|${keys[i]}`;
                  // break;
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
                s.reply('你没有权限执行此操作');
                return '@noreply@';
              }
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
            } else {
              let replydbtype = '';
              let replymsg = '';
              if (replydb.includes('@type@')) {
                replydbtype = replydb.split('@type@');
                replymsg = replydbtype[2];
              } else {
                replymsg = replydb;
              }
              await s.reply({
                type: replydbtype[0] || 'text',
                path: replydbtype[1] || '',
                msg: replymsg,
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
};
