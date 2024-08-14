/**
 * @author xmo
 * @name botaudit
 * @team xmo
 * @version 1.1.1
 * @description 黑名单模式按平台、群组、用户屏蔽关键词响应。
 * @rule ^(botaudit)\s+(\S+)\s+([\s\S]+)$
 * @rule ^(botaudit)\s+(\S+)\s+(del)$
 * @rule ^(botaudit)\s+(list)$
 * @rule ^(botaudit)\s+(empty)$
 * @rule [\s\S]+
 * @admin false
 * @priority 100000000
 * @classification ["botaudit"]
 * @public true
 * @disable false
 */

const jsonSchema = BncrCreateSchema.object({
  basic: BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('指令开关').setDescription(`开启将启用匹配其他插件指令，开启并填写指令关键词后生效。`).setDefault(true),
    forward: BncrCreateSchema.string().setTitle('指令关键词').setDescription(`请输入其他插件匹配指令关键词，使用本插件润色数据库回复内容。`).setDefault('aigptv2'),
  }).setTitle('基本设置').setDefault({}),
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
  if (forward) {
    forwardline = ConfigDB.userConfig.basic.forward || '';
  }
  const sfrom = s.getFrom();
  const groupId = s.getGroupId();
  const userId = s.getUserId();
  const debug = ConfigDB.userConfig.debug.enable;
  const sysDB = new BncrDB('BotAuditDB');
  const commandType = s.param(1);
  const keyword = s.param(2);
  const replyContent = s.param(3);

  // console.log(`Received command: ${commandType}, Keyword: ${keyword}, ReplyContent: ${replyContent}`);

  if (commandType === 'botaudit') {
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
    if (keyword.includes('@')) {
      if (!(await s.isAdmin())) {
        keyword = await keyconvert(keyword);
      }
    }
    let reply = '';
    reply = await getReply(keyword);
    // console.log(`Get reply for keyword ${keyword}: ${reply}`);
    if (reply) {
      // console.log(`Replying with: ${reply}`);
      if (reply !== '@noreply@') {
        await s.reply(reply);
      }
    } else {
      return "next"
    }
  }

  async function keyconvert(keyword) {
    let newkeyword = keyword;
    newkeyword = newkeyword.replace(new RegExp('@black@','g'), "");
    newkeyword = newkeyword.replace(new RegExp('@white@','g'), "");
    newkeyword = newkeyword.replace(new RegExp('@sfrom@','g'), "");
    newkeyword = newkeyword.replace(new RegExp('@group@','g'), "");
    newkeyword = newkeyword.replace(new RegExp('@user@','g'), "");
    return newkeyword;
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

  async function keycheck(keyword) {
    let check = 0;
    if (keyword.includes('@black@')) {
      check = check + 1;
    }
    if (check != 0) {
      return 'black';
    }
    if (keyword.includes('@white@')) {
      check = check + 1;
    }
    if (check != 0) {
      return 'white';
    }
    if (check == 0) {
      return null;
    }
  }

  async function getReply(keyword) {
    try {
      if (keyword.slice(0, 7) === '@remsg@') {
        return "@noreply@";
      } else {
        let getreply = await sysDB.get(keyword);
        if (!getreply) {
          let keys = await sysDB.keys();
          keys = await sortArray(keys);
          if (keys.length > 0) {
            let newkeyword = '';
            for (var i = 0; i < keys.length; i++) {
              let str = keys[i];
              if (!(await keycheck(str))) {
                if (keyword.includes(str)) {
                  newkeyword = keys[i];
                  break;
                }
              }
            }
            if (newkeyword) {
              keyword = newkeyword;
            } else {
              return null;
            }
          }
        }


        let checkblack = 0;
        let getsfrom = await fungetlist('sfrom', 'black');
        if (!getsfrom) {
          getsfrom = await fungetlist('sfrom', 'white');
          if (!getsfrom) {
            checkblack = checkblack + 1;
          }
        }
        let getgroup = await fungetlist('group', 'black');
        if (!getgroup) {
          getsfrom = await fungetlist('group', 'white');
          if (!getsfrom) {
            checkblack = checkblack + 1;
          }
        }
        let getuser = await fungetlist('user', 'black');
        if (!getuser) {
          getsfrom = await fungetlist('user', 'white');
          if (!getsfrom) {
            checkblack = checkblack + 1;
          }
        }
        if (checkblack == 3) {
          return null;
        }

        async function fungetlist(way, mode) {
          let getdb = await sysDB.get(`${keyword}@${way}@@${mode}@`);
          if (getdb) {
            let getdbarr = getdb.split('|');
            let sway = '';
            if (way === 'sfrom') {
              sway = sfrom;
            }
            if (way === 'group') {
              sway = groupId;
            }
            if (way === 'user') {
              sway = userId;
            }
            if (getdbarr.indexOf(sway) == -1) {
              sreturn = 'no';
            } else {
              sreturn = 'yes';
            }
          } else {
            sreturn = 'no';
          }
          if （sreturn = 'no' && mode = 'black') {
            rerurn null;
          }
          if （sreturn = 'yes' && mode = 'white') {
            rerurn null;
          }
        }
        
        return await funreplydb(keyword);

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
          if (replydb === '@noreply@') {
            return "@noreply@";
          }
          if (replydb) {
            if (replydb.slice(0, 7) === '@remsg@') {
              if (replydb.includes('@chatcom@')) {
                if (forwardline) {
                  s.inlineSugar(replydb.slice(7).replace('@chatcom@',forwardline));
                } else {
                  if (await s.isAdmin()) {
                    if (debug) {
                      sysMethod.pushAdmin({
                          platform: [`${sfrom}`],
                          msg: `管理员调试消息：\n  >来源:${sfrom}\n  >群组id:${groupId}\n  >用户id:${s.getUserId()}\n  >关键词:${keyword}\n  >回复:${replydb}\n  >指令:${forwardline}`,
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
