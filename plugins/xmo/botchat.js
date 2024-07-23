/**
 * @author xmo
 * @name botchat
 * @team xmo
 * @version 2.1.3
 * @description 自动回复插件，可调用gpti，仅支持文本。
 * @rule ^(botreply)\s+(\S+)\s+([\s\S]+)$
 * @rule ^(botreply)\s+(\S+)\s+(del)$
 * @rule ^(botreply)\s+(list)$
 * @rule ^(botreply)\s+(empty)$
 * @rule ^(\S+)$
 * @rule ^(.*@.*)$
 * @admin false
 * @priority 9
 * @classification ["botchat"]
 * @public true
 * @disable false
 */

module.exports = async (s) => {
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
    } else {
      await handleAddReply(s, keyword, replyContent);
    }
  } else {
    await handleGetReply(s, commandType);
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
    } else {
      s.reply('更改失败：无标识符[|>>|]');
    }
    if (oldkey === newkey) {
      s.reply('更改失败：修改前后key一致');
    } else {
      let replymsg = '';
      // 获取原回复
      reply = await sysDB.get(oldkey);
      if (reply) {
        const addresult = await setReply(newkey, reply);
        replymsg = (addresult ? '' : '添加newkey失败');
      } else {
        s.reply('更改失败：请检查要修改的key是否正确');
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
    }
  }

  async function handleGetReply(s, keyword) {
    const sfrom = s.getFrom();
    const naDB = new BncrDB(sfrom);
    botname = await naDB.get("botname");
    let atbotmsg = '';
    if (botname) {
      atbotmsg = `@${botname}`;
    } else {
      botname = '';
      if (await s.isAdmin()) {
        if (sfrom !== 'web') {
          await s.reply(`警告：未读取到bot名称！\n    管理员发送[set ${sfrom} botname 机器人名称]设置bot的名称，否则@机器人的信息无法识别。`);
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
      if (!(reply === '@noreply@')) {
        await s.reply(reply);
      }
    } else {
      if (!groupId || groupId === '0') {
        s.inlineSugar(`aigptv2 ${keyword}`);
      } else {
        let newkeyword = '';
        if (atbotmsg) {
          if (keyword.includes(atbotmsg)) {
            newkeyword = keyword.replace(new RegExp(atbotmsg,'g'), "");
            newkeyword = newkeyword.replace(new RegExp(" ",'g'), "");
            if (newkeyword) {
              s.inlineSugar(`aigptv2 ${newkeyword}`);
            }
          } else {
            return "next";
          }
        } else {
          return "next";
        }
        if (!(newkeyword)) {
          newkeyword = keyword;
        }
        if (await s.isAdmin()) {
          // await s.reply(`管理员调试消息：\n  >来源:${s.getFrom()}\n  >群组id:${s.getGroupId()}\n  >用户id:${s.getUserId()}\n  >信息:${keyword}\n  >名字:${botname}\n  >内容:${newkeyword}`);
        }
      }
    }
  }

  async function handleListKeywords(s) {
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
                    keyword = keys[i];
                    break;
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
            if (replydb.slice(0, 7) === '@remsg@') {
              s.inlineSugar(replydb.slice(7));
              return "@noreply@";
            } else {
              await s.reply(replydb)
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
