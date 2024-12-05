/**
 * This file is part of the App project.
 * @author Aming
 * @name qq
 * @team xmo
 * @version 1.1.4
 * @description 外置qq机器人适配器
 * @adapter true
 * @public true
 * @disable false
 * @priority 10000
 * @classification ["官方适配器"]
 * @Copyright ©2023 Aming and Anmours. All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

/* 配置构造器 */
const jsonSchema = BncrCreateSchema.object({
  basic: BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('是否开启适配器').setDescription(`设置为关则不加载该适配器`).setDefault(false),
    mode: BncrCreateSchema.string().setTitle('适配器模式').setDescription(`1. “WebSocket”模式:</br>&emsp;远端QQ机器人填写反向ws地址: "ws://无界ip:端口/api/bot/qqws"</br>2. “Http”模式:</br>&emsp;填写以下“http交互发送地址”`).setEnum(['ws', 'http']).setEnumNames(['WebSocket', 'Http']).setDefault('ws'),
    sendUrl: BncrCreateSchema.string().setTitle('http交互发送地址').setDescription(`1. 仅当“适配器模式”选择“Http”时此项配置才会生效</br>2. 无界填写地址:"http://远端QQ机器人的地址:端口"</br>3. 远端QQ机器人填写地址:"http://无界ip:端口/api/bot/qqHttp"`).setDefault(''),
  }).setTitle('基本设置').setDefault({}),
  friend: BncrCreateSchema.object({
    autoApproveFriendRequest: BncrCreateSchema.boolean().setTitle('是否自动同意好友请求').setDescription('设置为开则自动同意所有的好友请求').setDefault(false),
    autoApproveGroupRequest: BncrCreateSchema.boolean().setTitle('是否自动同意加群').setDescription('设置为开则自动同意所有的加群请求和邀请，需把机器人设为管理员').setDefault(false),
  }).setTitle('自动同意').setDefault({}),
  joinrooms: BncrCreateSchema.array(BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('启用').setDescription('是否启用').setDefault(true),
    rule: BncrCreateSchema.object({
      joinIds: BncrCreateSchema.string().setTitle('进群监控').setDescription(`当有人进群后触发消息监控的群，多个用“|”隔开`).setDefault(""),
      joinMsg: BncrCreateSchema.string().setTitle('进群提示').setDescription(`当有人进群后触发消息，“\\n”换行`).setDefault("欢迎加入大家庭~"),
    }),
  })).setTitle('入群欢迎').setDefault([]),
  recalls: BncrCreateSchema.object({
    enableRecallMessage: BncrCreateSchema.boolean().setTitle('是否启用群撤回消息功能').setDescription('').setDefault(false),
    recallKeywords: BncrCreateSchema.string().setTitle('撤回消息关键词').setDescription('群内收到包含该关键词的消息时，执行撤回操作，多个关键词请用“|”分隔').setDefault(''),
  }).setTitle('撤回设置').setDefault({})
});

/* 配置管理器 */
const ConfigDB = new BncrPluginConfig(jsonSchema);

module.exports = async () => {
  await ConfigDB.get();
  /* 如果用户未配置,userConfig则为空对象{} */
  if (!Object.keys(ConfigDB.userConfig).length) {
    sysMethod.startOutLogs('未配置qq适配器,退出.');
    return;
  }
  if (!ConfigDB?.userConfig?.basic?.enable) return sysMethod.startOutLogs('未启用外置qq 退出.');
  let qq = new Adapter('qq');
  if (ConfigDB.userConfig.basic.mode === 'ws') await ws(qq);
  else if (ConfigDB.userConfig.basic.mode === 'http') await http(qq);

  // 伪装消息
  qq.inlinemask = async function (msgInfo) {
    return qq.receive(msgInfo);
  };

  // console.log('qq适配器..', qq);
  return qq;
};

async function ws(qq) {
  const events = require('events');
  const eventS = new events.EventEmitter();
  const { randomUUID } = require('crypto');
  const listArr = [];
  /* ws监听地址  ws://192.168.31.192:9090/api/qq/qqws */
  router.ws('/api/bot/qqws', ws => {
    ws.on('message', async msg => {
      const body = JSON.parse(msg);
      /* 拒绝心跳链接消息 */
      // console.log('收到ws请求', body);
      if (body.post_type === 'meta_event') return;

      // console.log('收到ws请求', body);
      // 加好友
      if (body.post_type === 'request' && body.request_type === 'friend') {
        if (ConfigDB.userConfig.friend.autoApproveFriendRequest) {
          const approve = true;
          const requestBody = {
            action: 'set_friend_add_request',
            params: {
              flag: body.flag,
              approve: approve
            }
          };
          ws.send(JSON.stringify(requestBody));
          sysMethod.startOutLogs('已自动同意加好友请求');
        }
        return;
      }

      // 加群
      if (body.post_type === 'request' && body.request_type === 'group') {
        if (ConfigDB.userConfig.friend.autoApproveGroupRequest) {
          const approve = true;
          const requestBody = {
            action: 'set_group_add_request',
            params: {
              flag: body.flag,
              sub_type: body.sub_type,
              approve: approve
            }
          };
          ws.send(JSON.stringify(requestBody));
          sysMethod.startOutLogs(`已自动同意${body.sub_type === 'add' ? '加群请求' : '加群邀请'}`);
        }
        return;
      }

      // 入群欢迎
      if (body.sub_type === 'approve') {
        const roomId = body.group_id.toString();
        const rooms = ConfigDB.userConfig.joinrooms?.filter(o => o.enable) || [];
        for (const group of rooms) {
          const joinIds = group.rule.joinIds.split('|') || [];
          const joinMsg = group.rule.joinMsg || '欢迎加入大家庭~';
          if ((joinIds.indexOf(roomId) != -1) && joinMsg) {
            const formattedWelcomeMessage = joinMsg.replace(/\\n/g, '\n');
            const atMessage = {
              type: 'at',
              data: {
                qq: body.user_id
              }
            };
            const sendGroupMsgBody = {
              action: 'send_group_msg',
              params: {
                group_id: body.group_id,
                message: [
                  atMessage,
                  { type: 'text', data: { text: `\n${formattedWelcomeMessage}` } }
                ]
              }
            };
            ws.send(JSON.stringify(sendGroupMsgBody));
          }
        }
        return;
      }

      if (body.echo) {
        for (const e of listArr) {
          if (body.echo !== e.uuid) continue;
          if (body.status && body.status === 'ok')
            return e.eventS.emit(e.uuid, body.data.message_id.toString());
          else return e.eventS.emit(e.uuid, '');
        }
      }
      /* 不是消息退出 */
      if (!body.post_type || body.post_type !== 'message') return;
      let msgInfo = {
        userId: body.sender.user_id + '' || '',
        userName: body.sender.nickname || '',
        groupId: body.group_id ? body.group_id + '' : '0',
        groupName: body.group_name || '',
        msg: body.raw_message || '',
        msgId: body.message_id + '' || '',
      };
      // console.log('收到ws请求', body);
      // console.log('最终消息：', msgInfo);

      // 撤回
      const recallson = ConfigDB.userConfig.recalls?.enableRecallMessage || false;
      if (msgInfo.groupId && msgInfo.groupId !== '0' && recallson) {
        const recallKeywords = ConfigDB.userConfig.recalls.recallKeywords.split('|').filter(Boolean);

        if (recallKeywords.length > 0 && recallKeywords.some(keyword => msgInfo.msg.includes(keyword))) {
          await qq.delMsg([msgInfo.msgId]);
          sysMethod.startOutLogs(`撤回消息：来自发送者QQ：${msgInfo.userId}，包含关键词的消息：${msgInfo.msg}`);
        } else if (recallKeywords.length === 0) {
          sysMethod.startOutLogs('撤回关键词为空，跳过撤回操作。');
        }
      }

      qq.receive(msgInfo);
    });

    // console.log('qq适配器..', qq);

    /* 发送消息方法 */
    qq.reply = async function (replyInfo) {
      try {
        let uuid = randomUUID();
        let body = {
          action: 'send_msg',
          params: {},
          echo: uuid,
        };
        let bodytxt = {
          action: 'send_msg',
          params: {},
          echo: uuid,
        };
        +replyInfo.groupId
          ? (body.params.group_id = replyInfo.groupId)
          : (body.params.user_id = replyInfo.userId);
        if (replyInfo.type === 'text') {
          if (replyInfo.groupId && replyInfo.groupId != 0) {
            if (replyInfo.userId && replyInfo.userId != 0) {
              body.params.message = `[CQ:at,qq=${replyInfo.userId}]\n${replyInfo.msg}`;
            } else {
              body.params.message = replyInfo.msg;
            }
          } else {
            body.params.message = replyInfo.msg;
          }
        } else {
          if (replyInfo.type === 'image') {
            body.params.message = `[CQ:image,file=${replyInfo.path}]`;
          } else if (replyInfo.type === 'video') {
            body.params.message = `[CQ:video,file=${replyInfo.path}]`;
          } else if (replyInfo.type === 'audio' || replyInfo.type === 'music') {
            body.params.message = `[CQ:record,file=${replyInfo.path}]`;
          }
          if (replyInfo.msg) {
            bodytxt.params.user_id = replyInfo.userId;
            if (replyInfo.groupId && replyInfo.groupId != 0) {
              bodytxt.params.group_id = replyInfo.groupId;
              if (replyInfo.userId && replyInfo.userId != 0) {
                bodytxt.params.message = `[CQ:at,qq=${replyInfo.userId}]\n${replyInfo.msg}`;
              } else {
                bodytxt.params.message = replyInfo.msg;
              }
            } else {
              bodytxt.params.message = replyInfo.msg;
            }
          }
        }
        // console.log('推送消息运行了', body);
        ws.send(JSON.stringify(body));
        bodytxt.params.message && ws.send(JSON.stringify(bodytxt));
        return new Promise((resolve, reject) => {
          listArr.push({ uuid, eventS });
          let timeoutID = setTimeout(() => {
            delListens(uuid);
            eventS.emit(uuid, '');
          }, 60 * 1000);
          eventS.once(uuid, res => {
            try {
              delListens(uuid);
              clearTimeout(timeoutID);
              resolve(res || '');
            } catch (e) {
              console.error(e);
            }
          });
        });
      } catch (e) {
        console.error('qq:发送消息失败', e);
      }
    };

    /* 推送消息 */
    qq.push = async function (replyInfo) {
      // console.log('replyInfo', replyInfo);
      return await this.reply(replyInfo);
    };

    /* 注入删除消息方法 */
    qq.delMsg = async function (argsArr) {
      try {
        argsArr.forEach(e => {
          if (typeof e !== 'string' && typeof e !== 'number') return false;
          ws.send(
            JSON.stringify({
              action: 'delete_msg',
              params: { message_id: e },
            })
          );
        });
        return true;
      } catch (e) {
        console.log('qq撤回消息异常', e);
        return false;
      }
    };
  });

  /**向/api/系统路由中添加路由 */
  router.get('/api/bot/qqws', (req, res) =>
    res.send({ msg: '这是Bncr 外置qq Api接口，你的get请求测试正常~，请用ws交互数据' })
  );
  router.post('/api/bot/qqws', async (req, res) =>
    res.send({ msg: '这是Bncr 外置qq Api接口，你的post请求测试正常~，请用ws交互数据' })
  );

  function delListens(id) {
    listArr.forEach((e, i) => e.uuid === id && listArr.splice(i, 1));
  }
}

async function http(qq) {
  const request = require('util').promisify(require('request'));
  /* 上报地址（gocq监听地址） */
  let senderUrl = ConfigDB?.userConfig?.basic?.sendUrl;
  if (!senderUrl) {
    console.log('qq:配置文件未设置sendUrl');
    qq = null;
    return;
  }

  /* 接受消息地址为： http://bncrip:9090/api/bot/qqHttp */
  router.post('/api/bot/qqHttp', async (req, res) => {
    res.send('ok');
    const body = req.body;
    // console.log('req', req.body);
    /* 心跳消息退出 */
    if (body.post_type === 'meta_event') return;
    // console.log('收到qqHttp请求', body);
    /* 不是消息退出 */
    if (!body.post_type || body.post_type !== 'message') return;
    let msgInfo = {
      userId: body.sender['user_id'] + '' || '',
      userName: body.sender['nickname'] || '',
      groupId: body.group_id ? body.group_id + '' : '0',
      groupName: body.group_name || '',
      msg: body['raw_message'] || '',
      msgId: body.message_id + '' || '',
    };
    qq.receive(msgInfo);
  });

  /**向/api/系统路由中添加路由 */
  router.get('/api/bot/qqHttp', (req, res) =>
    res.send({ msg: '这是Bncr 外置qq Api接口，你的get请求测试正常~，请用ws交互数据' })
  );
  router.post('/api/bot/qqHttp', async (req, res) =>
    res.send({ msg: '这是Bncr 外置qq Api接口，你的post请求测试正常~，请用ws交互数据' })
  );

  /* 回复 */
  qq.reply = async function (replyInfo) {
    try {
      let action = '/send_msg',
        body = {},
        bodytxt = {};
      +replyInfo.groupId ? (body['group_id'] = replyInfo.groupId) : (body['user_id'] = replyInfo.userId);
      if (replyInfo.type === 'text') {
        if (replyInfo.groupId && replyInfo.groupId != 0) {
          if (replyInfo.userId && replyInfo.userId != 0) {
            body.message = `[CQ:at,qq=${replyInfo.userId}]\n${replyInfo.msg}`;
          } else {
            body.message = replyInfo.msg;
          }
        } else {
          body.message = replyInfo.msg;
        }
      } else {
        if (replyInfo.type === 'image') {
          body.message = `[CQ:image,file=${replyInfo.path}]`;
        } else if (replyInfo.type === 'video') {
          body.message = `[CQ:video,file=${replyInfo.path}]`;
        } else if (replyInfo.type === 'audio') {
          body.message = `[CQ:record,file=${replyInfo.path}]`;
        }
        if (replyInfo.msg) {
          bodytxt.user_id = replyInfo.userId;
          if (replyInfo.groupId && replyInfo.groupId != 0) {
            bodytxt.group_id = replyInfo.groupId;
            if (replyInfo.userId && replyInfo.userId != 0) {
              bodytxt.message = `[CQ:at,qq=${replyInfo.userId}]\n${replyInfo.msg}`;
            } else {
              bodytxt.message = replyInfo.msg;
            }
          } else {
            bodytxt.message = replyInfo.msg;
          }
        }
      }
      let sendRes = await requestPost(action, body);
      bodytxt.message && await requestPost(action, bodytxt);
      return sendRes ? sendRes.message_id : '0';
    } catch (e) {
      console.error('qq:发送消息失败', e);
    }
  };
  /* 推送消息 */
  qq.push = async function (replyInfo) {
    return await this.reply(replyInfo);
  };

  /* 注入删除消息方法 */
  qq.delMsg = async function (argsArr) {
    try {
      argsArr.forEach(e => {
        if (typeof e === 'string' || typeof e === 'number') {
          requestPost('/delete_msg', { message_id: e });
        }
      });
      return true;
    } catch (e) {
      console.log('qq撤回消息异常', e);
      return false;
    }
  };

  /* 请求 */
  async function requestPost(action, body) {
    return (
      await request({
        url: senderUrl + action,
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        json: true,
      })
    ).body;
  }
}
