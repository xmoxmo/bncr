/**
 * @author xmo
 * @name botchat
 * @team xmo
 * @version 2.5.6
 * @description 自动回复插件，可调用聊天插件如ChatGPT等回复，仅支持文本。
 * @rule ^(botreply)\s+(\S+)\s+([\s\S]+)$
 * @rule ^(botreply)\s+(\S+)\s+(del)$
 * @rule ^(botreply)\s+(list)$
 * @rule ^(botreply)\s+(empty)$
 * @rule ^(\S+)$
 * @rule ^(.*@.*)$
 * @rule ^(.*CQ:at,qq=.*)$
 * @admin false
 * @priority 9
 * @classification ["botchat"]
 * @public true
 * @disable false
 */

const jsonSchema = BncrCreateSchema.object({
  basic: BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('指令开关').setDescription(`开启将启用匹配其他插件指令，开启并填写指令关键词后生效。`).setDefault(true),
    forward: BncrCreateSchema.string().setTitle('指令关键词').setDescription(`请输入其他插件匹配指令关键词，留空则不启用调用，仅读取数据库内容。`).setDefault('aigptv2'),
    forwardchat: BncrCreateSchema.string().setTitle('聊天模式指令关键词').setDescription(`为聊天模式单独设置其他插件匹配指令关键词，留空则使用"指令关键词"。`).setDefault(''),
  }).setTitle('基本设置').setDefault({}),
  nobotname: BncrCreateSchema.array(BncrCreateSchema.string()).setTitle('Bot设置').setDescription(`填写未设置bot名称不提示引导操作的适配器名称，设置bot名称主要用来识别群组内是否被@。若bot所在适配器无群组功能则无需设置bot名称，并将此适配器名称填写到以下表单。`).setDefault(['web', 'ssh']),
  noreplychat: BncrCreateSchema.array(BncrCreateSchema.string()).setTitle('聊天设置').setDescription(`禁用聊天模式的适配器，填写数据库中无匹配数据时不再调用"指令关键词"进行额外回复的适配器名称。`).setDefault([]),
  debug: BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('调试开关').setDescription(`开启将开启调试模式，对应平台管理员将收到额外的调试信息。`).setDefault(false),
  }).setTitle('调试设置').setDefault({})
});
const ConfigDB = new BncrPluginConfig(jsonSchema);
module.exports = async (s) => {
  if (!Object.keys(ConfigDB.userConfig).length) {
    s.reply('请前往前端web"插件配置"来完成插件首次配置。');
    return 'next';
  }
  
  const forward = ConfigDB.userConfig.basic.enable;
  let forwardline = '';
  let forwardlinechat = '';
  if (forward) {
    forwardline = ConfigDB.userConfig.basic.forward || '';
    forwardlinechat = ConfigDB.userConfig.basic.forwardchat || '';
  }
  const nonamearr = ConfigDB.userConfig.nobotname || [];
  const noreplychatarr = ConfigDB.userConfig.noreplychat || [];
  const sfrom = s.getFrom();
  const debug = ConfigDB.userConfig.debug.enable;
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
    if (endreturn ='next') {
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
    const naDB = new BncrDB(sfrom);
    botname = await naDB.get("botname");
    let atbotmsg = '';
    if (botname) {
      if (sfrom === 'qq') {
        atbotmsg = `CQ:at,qq=${botname}`;
      } else {
        atbotmsg = `@${botname}`;
      }
    } else {
      botname = '';
      if (await s.isAdmin()) {
        if (nonamearr.indexOf(sfrom) == -1) {
          await s.reply(`警告：未读取到bot名称或qq账号！\n    管理员发送[set ${sfrom} botname 机器人名称或机器人qq账号]设置bot的名称，否则@机器人的信息无法识别。`);
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
    groupId = s.getGroupId();
    if (reply) {
      // console.log(`Replying with: ${reply}`);
      if (reply !== '@noreply@') {
        await s.reply(reply);
      }
    } else {
      if (forwardlinechat) {
        forwardline = forwardlinechat;
      }
      if (noreplychatarr.indexOf(sfrom) != -1) {
        forwardline = '';
      }
      if (!groupId || groupId === '0') {
        if (forwardline) {
          s.inlineSugar(`${forwardline} ${keyword}`);
        } else {
          return "next";
        }
      } else {
        let keywordstr = '';
        let newkeyword = '';
        let sreturn = '';
        if (atbotmsg) {
          if (keyword.includes(atbotmsg)) {
            newkeyword = keyword;
            if (sfrom === "qq") {
              keywordstr = keyword.replace(new RegExp(/CQ:at,qq=/, 'g'), "@");
              newkeyword = newkeyword.replace(new RegExp(/\[CQ:at,.*?\]/, 'g'), "");
            }
            newkeyword = newkeyword.replace(new RegExp(atbotmsg,'g'), "");
            newkeyword = newkeyword.replace(new RegExp(" ",'g'), "");
            newkeyword = newkeyword.replace(new RegExp(" ",'g'), "");
            if (newkeyword) {
              if (forwardline) {
                s.inlineSugar(`${forwardline} ${newkeyword}`);
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
        if (keyword.includes('CQ:at,qq=')) {
          keyword = keyword.replace(new RegExp(/CQ:at,qq=/, 'g'), "@");
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
                msg: `管理员调试消息：\n  >来源:${sfrom}\n  >群组id:${s.getGroupId()}\n  >用户id:${s.getUserId()}\n  >信息:${keywordstr}\n  >名字:${botname}\n  >内容:${newkeyword}\n  >指令:${forwardline}`,
            });
          }
        }
        if (sreturn) {
          return sreturn;
        }
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
      if (keyword.slice(0, 7) === '@remsg@') {
        return "@noreply@";
      } else {
        groupId = s.getGroupId();
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
            if (keygjc) {
              if (groupId && groupId !== '0') {
                if (keyword.includes(keygjc)) {
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
                    let getgroup = await sysDB.get(`@group@${keydyy}|@|0`);
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
            await funreplydb(keywords[k]);
          }
          return "@noreply@"
        } else {
          return await funreplydb(keyword);
        }

        async function funreplydb(keyword) {
          replydb = await sysDB.get(keyword);
          if (replydb) {
            if (replydb.includes('|@@|')) {
              let replydbs = replydb.split('|@@|');
              for (var k = 0; k < replydbs.length; k++) {
                await funsendreply(replydbs[k]);
              }
              return "@noreply@"
            } else {
              return await funsendreply(replydb);
            }
          } else {
            return null;
          }
        }
        
        async function funsendreply(replydb) {
          if (replydb) {
            if (replydb === '@noreply@') {
              return "@noreply@";
            }
            if (replydb.slice(0, 7) === '@remsg@') {
              if (replydb.includes('@chatcom@')) {
                if (forwardline) {
                  s.inlineSugar(replydb.slice(7).replace('@chatcom@',forwardline));
                } else {
                  if (await s.isAdmin()) {
                    if (debug) {
                      sysMethod.pushAdmin({
                          platform: [`${sfrom}`],
                          msg: `管理员调试消息：\n  >来源:${sfrom}\n  >群组id:${s.getGroupId()}\n  >用户id:${s.getUserId()}\n  >关键词:${keyword}\n  >回复:${replydb}\n  >指令:${forwardline}`,
                      });
                    }
                  }
                }
              } else {
                s.inlineSugar(replydb.slice(7));
              }
              return "@noreply@";
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
              return "@noreply@";
            }
          } else {
            return null;
          }
        }
      }
    } catch (e) {
      console.error('获取失败:', e);
      return "@noreply@";
    }
  }
};
