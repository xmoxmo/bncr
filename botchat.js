/**
 * @author Dswang
 * @name 自动回复
 * @team Dswang & SmartAI
 * @version 1.0.2
 * @description 自动回复插件。参考傻妞自动回复功能。仅支持文本
 * @rule ^(reply)\s+(\S+)\s+([\s\S]+)$
 * @rule ^(reply)\s+(\S+)\s+(del)$
 * @rule ^(reply)\s+(list)$
 * @rule ^(reply)\s+(empty)$
 * @rule ^(\S+)$
 * @rule ^(.*@.*)$
 * @admin false
 * @priority 9
 * @classification ["自动回复"]
 * @public false
 * @disable false
 */

module.exports = async (s) => {
  const sysDB = new BncrDB('Dswang_autoReplyDB');

  const commandType = s.param(1);
  const keyword = s.param(2);
  const replyContent = s.param(3);

  // console.log(`Received command: ${commandType}, Keyword: ${keyword}, ReplyContent: ${replyContent}`);

  if (commandType === 'reply') {
    if (keyword === 'list') {
      await handleListKeywords(s);
    } else if (keyword === 'empty') {
      await handleEmptyKeywords(s);
    } else if (replyContent === 'del') {
      await handleDelReply(s, keyword);
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

    const result = await setReply(keyword, reply);
    // console.log(`Set reply result for keyword ${keyword}: ${result}`);
    s.reply(result ? '设置成功' : '设置失败');
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

  async function handleGetReply(s, keyword) {
    const wxDB = new BncrDB('wechaty');
    wxname = await wxDB.get("wxname");
    atbotmsg = `@${wxname}`;
    let reply = '';
    if (!(keyword.includes(atbotmsg))) {
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
        s.inlineSugar(`aigv2 ${keyword}`);
      } else {
        let newkeyword = '';
        if (keyword.includes(atbotmsg)) {
          newkeyword = keyword.replace(new RegExp(atbotmsg,'g'), "");
          newkeyword = newkeyword.replace(new RegExp(" ",'g'), "");
          if (newkeyword) {
            s.inlineSugar(`aigv2 ${newkeyword}`);
          }
        }
        if (!(newkeyword)) {
          newkeyword = keyword;
        }
        if (await s.isAdmin()) {
          await s.reply(`管理员调试消息：\n  >群组id:${s.getGroupId()}\n  >用户id:${s.getUserId()}\n  >信息:${keyword}\n  >名字:${wxname}\n  >内容:${newkeyword}`);
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

  async function getReply(keyword) {
    try {
      if (keyword.slice(0, 7) === '@remsg@') {
        return "@noreply@";
      } else {
        groupId = s.getGroupId();
        if (groupId && groupId !== '0') {
          const keys = await sysDB.keys();
          if (keys.length > 0) {
            for (var i=0;i<keys.length;i++) {
              if (keyword.includes(keys[i])) {
                keyword = keys[i];
                break;
              }
            }
          }
        }
        replydb = await sysDB.get(keyword);
        if (replydb) {
          if (replydb.slice(0, 7) === '@remsg@') {
            s.inlineSugar(replydb.slice(7));
            return "@noreply@";
          } else {
            return replydb;
          }
        } else {
          return null;
        }
      }
    } catch (e) {
      console.error('获取失败:', e);
      return null;
    }
  }
};
