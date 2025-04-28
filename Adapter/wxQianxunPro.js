/**
 * This file is part of the Bncr project.
 * @author 云隐
 * @name wxQianxunPro
 * @team 云隐
 * @version 1.1.4
 * @description 千寻Pro适配器
 * @adapter true
 * @public true
 * @disable false
 * @priority 2
 * @Copyright ©2023 Aming and Anmours. All rights reserved 基于官方wxqianxun修改
 * @classification ["千寻Pro适配器"]
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Modified by Merrick
 */

/* 更新日志：
    v1.1.4 修复表情转义，清理无用代码
    v1.1.3 修复表情转义
    v1.1.2 修复消息推送失败问题，增强错误处理和日志记录
    v1.1.1 修复无界内部消息无法发送的问题，优化消息来源判断逻辑
    v1.1.0 添加配置分组功能，优化名片推送逻辑，添加自动接收转账，添加表情转换功能
    v1.0.7 优化群wxid自动补全逻辑
    v1.0.6 移除管理员机制，添加转账通知功能
    v1.0.5 根据官方文档修正事件处理和接口调用逻辑
    v1.0.4 修复语法错误，优化名片推送逻辑
    v1.0.3 添加管理员发送名片功能，优化群聊wxid输入格式（云隐修改）
    v1.0.2 完善自动同意好友请求和自动拉群功能（云隐修改）
    v1.0.1 适配千寻pro（云隐修改）
*/

/* 配置构造器 - 分组优化版 */
const jsonSchema = BncrCreateSchema.object({
  // 基础设置分组
  basicSettings: BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('是否开启适配器').setDescription("设置为关则不加载该适配器").setDefault(false),
    sendUrl: BncrCreateSchema.string().setTitle('上报地址').setDescription("千寻框架HTTP接口地址，如http://127.0.0.1:7777").setDefault(''),
    debugMode: BncrCreateSchema.boolean().setTitle('调试模式').setDescription("开启详细日志输出").setDefault(false)
  }).setTitle('基础设置').setDescription('适配器基本配置'),
  // 好友管理分组
  friendSettings: BncrCreateSchema.object({
    autoAcceptFriend: BncrCreateSchema.boolean().setTitle('自动同意好友请求').setDescription("是否自动同意好友请求").setDefault(true),
    autoAddToGroup: BncrCreateSchema.boolean().setTitle('自动拉群').setDescription("同意好友请求后自动拉入指定群聊").setDefault(false),
    groupId: BncrCreateSchema.string().setTitle('群聊ID').setDescription("自动拉群的目标群聊ID(只需输入数字部分如123456)").setDefault(''),
    welcomeMsg: BncrCreateSchema.string().setTitle('欢迎消息').setDescription("新好友加入后发送的欢迎消息").setDefault('欢迎加入！')
  }).setTitle('好友管理').setDescription('好友相关设置'),
  // 名片推送分组
  cardSettings: BncrCreateSchema.object({
    cardWxid: BncrCreateSchema.string().setTitle('名片wxid').setDescription("要发送的名片wxid").setDefault(''),
    cardNick: BncrCreateSchema.string().setTitle('名片昵称').setDescription("名片显示昵称").setDefault(''),
    triggerKeyword: BncrCreateSchema.string().setTitle('触发关键字').setDescription("发送此关键字触发名片推送").setDefault('推送名片')
  }).setTitle('名片推送').setDescription('名片相关设置'),
  // 转账管理分组
  transferSettings: BncrCreateSchema.object({
    autoAcceptTransfer: BncrCreateSchema.boolean().setTitle('自动接收转账').setDescription("是否自动接收转账").setDefault(true),
    transferNotifyWxid: BncrCreateSchema.string().setTitle('转账通知wxid').setDescription("接收转账通知的用户wxid或群ID(群ID只需输入数字部分)").setDefault('')
  }).setTitle('转账管理').setDescription('转账相关设置'),
});

/* 配置管理器 */
const ConfigDB = new BncrPluginConfig(jsonSchema);
module.exports = async () => {
  /* 读取用户配置 */
  await ConfigDB.get();
  if (!Object.keys(ConfigDB.userConfig).length || !ConfigDB.userConfig.basicSettings?.enable) {
    sysMethod.startOutLogs('未启用千寻Pro适配器,退出.');
    return;
  }

  // 合并配置对象
  const config = {
    ...ConfigDB.userConfig.basicSettings,
    ...ConfigDB.userConfig.friendSettings,
    ...ConfigDB.userConfig.cardSettings,
    ...ConfigDB.userConfig.transferSettings,
    ...ConfigDB.userConfig.emojiSettings
  };

  if (!config.sendUrl) {
    console.error('千寻Pro:必须配置sendUrl(千寻框架HTTP地址)');
    return;
  }

  // 调试日志函数
  const debugLog = (...args) => {
    if (config.debugMode) {
      console.log('[千寻Pro调试]', ...args);
    }
  };

  // 格式化群相关wxid（新增自动补全逻辑）
  const formatGroupWxid = (wxid) => {
    if (!wxid) return '';
    if (wxid.endsWith('@chatroom')) return wxid;
    return /^\d+$/.test(wxid) ? `${wxid}@chatroom` : wxid;
  };
  config.groupId = formatGroupWxid(config.groupId);
  config.transferNotifyWxid = formatGroupWxid(config.transferNotifyWxid);

  const { randomUUID } = require('crypto');
  const wxQianxunPro = new Adapter('wxQianxunPro');
  const request = require('util').promisify(require('request'));

  // wx数据库
  const wxDB = new BncrDB('wxQianxunPro');
  let botId = await wxDB.get('qianxun_botid', '');

  /** API路由 */
  router.get('/api/bot/QianxunPro', (req, res) => res.send({ msg: 'Bncr QianxunPro API' }));

  router.post('/api/bot/QianxunPro', async (req, res) => {
    try {
      const body = req.body;
      debugLog('收到千寻事件:', JSON.stringify(body, null, 2));

      // 更新botId
      if (body.wxid && botId !== body.wxid) {
        botId = await wxDB.set('qianxun_botid', body.wxid);
        debugLog('更新botId:', botId);
      }

      let msgInfo = null;

      // 处理注入成功事件(10000)
      if (body.event === 10000) {
        debugLog(`千寻框架注入成功，PID: ${body.data.pid}, 端口: ${body.data.port}`);
        return res.send({ status: 200 });
      }

      // 处理私聊消息(10009)
      if (body.event === 10009 && body.data.data.fromType === 1) {
        const userId = body.data.data.fromWxid;
        let msg = body.data.data.msg;

        // 表情转换处理
        debugLog('接收消息原文', msg);
        msg = unicodeEscapeToEmoji(msg);
        debugLog('转换接收消息', msg);

        // 触发名片推送
        if (config.cardWxid && msg === config.triggerKeyword) {
          const cardXml = generateCardXml(config.cardWxid, config.cardNick);
          await requestQianxun({
            type: 'sendCard',
            data: {
              wxid: userId,
              msg: cardXml
            }
          });
        }

        msgInfo = {
          userId: userId,
          userName: '',
          groupId: '0',
          groupName: '',
          msg: msg,
          msgId: body.data.data.msgId || randomUUID(),
          fromType: 'Social',
          isUserMessage: true
        };
      }
      // 处理群聊消息(10008)
      else if (body.event === 10008 && body.data.data.fromType === 2) {
        const userId = body.data.data.finalFromWxid;
        const groupId = body.data.data.fromWxid;
        let msg = body.data.data.msg;

        // 表情转换处理
        debugLog('接收消息原文', msg);
        msg = unicodeEscapeToEmoji(msg);
        debugLog('转换接收消息', msg);

        // 触发名片推送
        if (config.cardWxid && msg === config.triggerKeyword) {
          const cardXml = generateCardXml(config.cardWxid, config.cardNick);
          await requestQianxun({
            type: 'sendCard',
            data: {
              wxid: groupId,
              msg: cardXml
            }
          });
        }

        msgInfo = {
          userId: userId,
          userName: '',
          groupId: groupId.replace('@chatroom', ''),
          groupName: '',
          msg: msg,
          msgId: body.data.data.msgId || randomUUID(),
          fromType: 'Social',
          isUserMessage: true
        };
      }
      // 处理好友请求(10011)
      else if (body.event === 10011 && config.autoAcceptFriend) {
        const friendData = body.data.data;

        // 同意好友请求
        const agreeResult = await requestQianxun({
          type: 'agreeFriendReq',
          data: {
            v3: friendData.v3,
            v4: friendData.v4,
            scene: friendData.scene || '30',
            role: '0'
          }
        });

        if (agreeResult.code === 200) {
          debugLog(`已同意好友请求: ${friendData.nick} (${friendData.wxid})`);

          // 发送欢迎消息
          if (config.welcomeMsg) {
            await requestQianxun({
              type: 'sendText',
              data: {
                wxid: friendData.wxid,
                msg: config.welcomeMsg
              }
            });
          }

          // 自动拉群（使用格式化后的群ID）
          if (config.autoAddToGroup && config.groupId) {
            await requestQianxun({
              type: 'addMembers',
              data: {
                wxid: config.groupId,
                objWxid: friendData.wxid
              }
            });
          }
        }

        msgInfo = {
          userId: 'EventFriendVerify',
          userName: '好友申请通知',
          groupId: '0',
          groupName: '',
          msg: `收到好友添加请求: ${friendData.nick} (${friendData.wxid})`,
          msgId: friendData.msgId || randomUUID(),
          fromType: 'Friend',
          isUserMessage: false
        };
      }

      // 处理转账事件(10006)
      else if (body.event === 10006) {
        const transData = body.data.data;
        const notifyMsg = `💰 收到转账通知：
▸ 转账人：${transData.fromWxid}
▸ 金额：${transData.money}元
▸ 备注：${transData.memo || '无'}`;

        // 自动接收转账
        if (config.autoAcceptTransfer) {
          const acceptResult = await requestQianxun({
            type: 'acceptTransfer',
            data: {
              wxid: transData.fromWxid,
              transferid: transData.transferid
            }
          });

          if (acceptResult.code === 200) {
            debugLog(`已自动接收来自 ${transData.fromWxid} 的转账`);
          }
        }

        // 表情转换处理
        debugLog('转账消息原文', notifyMsg);
        notifyMsg = emojiToUnicodeEscape(notifyMsg);
        debugLog('转换转账消息', notifyMsg);

        // 发送转账通知（使用格式化后的wxid）
        if (config.transferNotifyWxid) {
          await requestQianxun({
            type: 'sendText',
            data: {
              wxid: config.transferNotifyWxid,
              msg: notifyMsg
            }
          });
        }

        debugLog(notifyMsg);
      }

      // 处理撤回事件(10013)
      else if (body.event === 10013) {
        debugLog(`消息被撤回: ${body.data.data.msg}`);
      }

      // 关键修改：无论是否用户消息都传递给receive方法
      if (msgInfo) {
        debugLog('准备传递消息给receive:', msgInfo);
        wxQianxunPro.receive(msgInfo);
      }
      res.send({ status: 200 });
    } catch (e) {
      console.error('千寻消息处理错误:', e);
      res.send({ status: 500, msg: e.message });
    }
  });

  // 生成名片XML
  function generateCardXml(wxid, nick) {
    return `<?xml version="1.0"?>
      <msg bigheadimgurl="http://wx.qlogo.cn/mmhead/ver_1/xxxx" 
      smallheadimgurl="http://wx.qlogo.cn/mmhead/ver_1/xxxx" 
      username="${wxid}" 
      nickname="${nick}" 
      alias="" 
      imagestatus="3" 
      scene="17" 
      province="" 
      city="" 
      sign="" 
      sex="1" 
      certflag="0" 
      certinfo="" />`;
  }

  // 消息回复方法 - 关键修改：增强错误处理和日志记录
  wxQianxunPro.reply = async function (replyInfo) {
    try {
      debugLog('收到回复请求:', replyInfo);

      if (!replyInfo) {
        console.error('回复失败：缺少回复信息');
        return '';
      }

      const toWxid = replyInfo.groupId && replyInfo.groupId !== '0'
        ? `${replyInfo.groupId}@chatroom`
        : replyInfo.userId;

      if (!toWxid) {
        console.error('发送失败：缺少接收方wxid');
        return '';
      }

      let body = null;

      // 处理表情转换
      let processedMsg = replyInfo.msg;
      debugLog('回复消息原文', processedMsg);
      processedMsg = emojiToUnicodeEscape(processedMsg);
      debugLog('转换回复消息', processedMsg);

      switch (replyInfo.type) {
        case 'text':
          body = {
            type: 'sendText',
            data: {
              wxid: toWxid,
              msg: processedMsg.replace(/\n/g, '\r')
            }
          };
          break;

        case 'image':
          body = {
            type: 'sendImage',
            data: {
              wxid: toWxid,
              path: replyInfo.path
            }
          };
          break;

        case 'file':
          body = {
            type: 'sendFile',
            data: {
              wxid: toWxid,
              path: replyInfo.path
            }
          };
          break;

        case 'card':
          body = {
            type: 'sendCard',
            data: {
              wxid: toWxid,
              msg: replyInfo.cardXml || generateCardXml(replyInfo.cardWxid, replyInfo.cardNick)
            }
          };
          break;

        case 'friend':
          body = {
            type: 'agreeFriendReq',
            data: {
              v3: replyInfo.v3,
              v4: replyInfo.v4,
              scene: replyInfo.scene || '30',
              role: replyInfo.role || '0'
            }
          };
          break;

        case 'group':
          body = {
            type: 'addMembers',
            data: {
              wxid: replyInfo.groupId,
              objWxid: replyInfo.userId
            }
          };
          break;

        default:
          console.error('未知的消息类型:', replyInfo.type);
          return '';
      }

      debugLog('准备发送消息到千寻:', body);
      const result = await requestQianxun(body);
      debugLog('千寻接口返回:', result);

      if (result.code !== 200) {
        console.error('千寻接口返回错误:', result.msg);
        return '';
      }

      return result.result?.sendId || '';
    } catch (e) {
      console.error('消息发送过程中出错:', e);
      return '';
    }
  };

  // 关键修改：确保push方法也能正常工作
  wxQianxunPro.push = async function (pushInfo) {
    try {
      debugLog('收到push请求:', pushInfo);

      // 如果pushInfo是字符串，转换为标准格式
      if (typeof pushInfo === 'string') {
        pushInfo = {
          userId: botId, // 默认发给机器人自己
          msg: pushInfo,
          type: 'text'
        };
      }

      // 确保有必要的字段
      pushInfo.type = pushInfo.type || 'text';
      pushInfo.userId = pushInfo.userId || botId;

      const result = await this.reply(pushInfo);
      debugLog('push结果:', result);
      return result;
    } catch (e) {
      console.error('push方法执行出错:', e);
      return '';
    }
  };

  wxQianxunPro.delMsg = () => { };

  // 请求千寻接口 - 增强版
  async function requestQianxun(body) {
    try {
      debugLog('请求千寻接口:', body);

      const options = {
        url: `${config.sendUrl}/qianxun/httpapi`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'wxid': botId || ''
        },
        body: JSON.stringify(body),
        timeout: 10000 // 10秒超时
      };

      const response = await request(options);
      debugLog('千寻接口原始响应:', response.body);

      let result;
      try {
        result = JSON.parse(response.body);
      } catch (e) {
        console.error('解析千寻接口响应失败:', e);
        return { code: 500, msg: '解析响应失败' };
      }

      if (result.code !== 200) {
        console.error('千寻接口错误:', result.msg || '未知错误');
      }
      return result;
    } catch (e) {
      console.error('请求千寻接口失败:', e);
      return { code: 500, msg: '请求失败: ' + e.message };
    }
  }

  /** Code Encryption Block[419fd178b7a37c9eae7b7426c4a04203eaec70a98af42c4053e2a9bd104dca6894ba991d22a33f01eeb8e67763a28a1f9d525cadcd3f325e8cf13773045d6f050076a5198fa0760ed617fc6950ce2186f31e074161871a1ba5c4b751e252c09467d02eee799c856f723c3971fa04b8af2d166a4663c9aca78bc5fea602d2ac7bb98e30f6eb203e2680c21113decb4b8a70a2ff885c360c331451a6f7e3289bd429bed02c5a6f2ee4b20a5c070e91e95482fc1a69a52f478e6fced4ed06687004fbf5c1838f06f8abe51dbb6c821604726f0fce9ef751d24034d9c81e7faf438d9cf26e97a3e88e5171d551871eedab7625669d6fb3fc504f157df5aa099cf4d11a95306ad49a3a9d7347cf1893f95fa961624329ef98c8af0535a0bbd85d0a6da815abfeb451fa109ff3671cda4227d7d920d514bdfb7a4c4306c9797dcf0400b9550ea89af4334bbb965d63dace59a5da6aaa5737865860a1ca4c3fb65b13b31eb960e99354ff5b591386f96a57f04747bdf3d87816476f955697de7724061e4d6c8959c5706a13bf3a858b8dfffed6851a35a28540a853def3ac0e5c4f75713b02c2fa5bcbc0e36881655adb9b9373f2f0135df2b4281234dccec39a502115f01f2fb04751247f5ad48552a7ac28937126083fec463e2f5f12ecc93e437df95b7057a8c083e661c0c8262de9ff3a67fa006ddde3e8efa4eaccae8396d1d234be167080c6a2e74adafa31909c54383e5251ff6ea124ad44fe31ea76309ce634e4fd55e8087fc4d8bc1237aa89b8f813d3e632240b5f4d53325f96475be80a4de59be1c145082480a8b2146bfe4abd65544527d2da93d853666352d05b20ad4ece8fedfd6f788137670bbd2a05a9f6f7f248cec18b27d9b29dbb3fbfa17dc42c63aedc37543fe53551043dcf230afd42e3935586217f7f175009cf11192363477fa9317c21925dc3dfbc0dfbb1dbc46eba965a38c0cad3de6b130ed0dc8f9d2de54992368990da065ece6b5a24237b61c590da76650a07370fc2f0bdeaceb4ac5621f48884b44ab11a3ca265dda08ea8ddf153da5dce1424cba04b6e145a851bc076668a6b1de2e5372eb3c15b3a90d9c3a24b15c455cecdfe2852277323f79e868343ccfb7896834b0e7ea19da72c8de79b7584f2d1f7b6f504aec3393b89c54e9d30f18ebe18612545da0057626a86942fd0c8440fc6a56184d326b394b4f58a2200c1f682354589d75dc09b611464fd1ebdd88b922ef917845663545595261617e42b4a77dc87c1661a2fc64c885847fdd2b2ecccfe3b4dc68819466c89f91e331139d17a12b912a73078864c9c9cee40e44e1531d23fb0a04d4bd41809bdc579a17674566010c35556656959df88f597b301b3af2778a8f370bdc946a4d01d9758d202d48d0c4665ce5147a84f898f1ebc7c373e087809a69dc5c5c24e673d2c7631570f10b77113ace5db6a50bef36ff9b7da6d1de4b8e32614c0fb9ab42596c16bf90fc9377e9b26bbcb0a7e786e440e0151e737f6a23e80a7390471bafa5569d4c262f5b33e9158fa2f368f64e606f73c8c37916efcd0f448c14f600e859125bf3ffea48f5ba759514ad2638fb9dd0e8407edcfea4a8a2094bbfb11dba46699c41071fa5eaf799195cb20163b1eafe1dc164d054dc361e6a2101a7cd81c01e1adc48dbeb5ede2b6b0ddd78e2db9e4d1fae77199bda99bb6a6e02925c832b6143645f39d4b6effe03f585397f57c0d49d2df89d9d64906496d83b04f288b5a47a7671d4284c244124853b64ae9cdcb21c122f6ccdd9970dcda23fb313a6760c145f827da36675278c36b46738e2be6088c24996c3e7a354050a2ff2cb959d272f31fa247b1f3e300b544eba05602d5f49d41afa5e6fdadbca017b3ceec7e0cf8ceff6405f807e06b16c3fa4970eca68d4c7e47a5f31963eb64d9315b7690bf08d200179786cea84a45ca34d7427063860dafa5b3bd7789c3e6774b0faceb1fb53be15ff4918cd5649b0d699f0a49d16525a7963bb2cda7272c797766ae5f4bf436436f4b28b3510415bebc102c077e39456715aa2449f76d891776f276fcdfd5724dcd03f61e130e8b0bf09a33c8cf72bc83826cf8f5aae8fbb7060995a1df0eb3bd80c21cafac33c81963f8e212f865a2ba36c74039aba53e0fa1f7c3a64601d27ec9b306f22991dea46667365927dae6423787824ae8181939bbfa838f3d29f90ec42090b1905de561e4ac95bc3efe24850a4c4500f113dcd51afadeedabb4750b010ef6ab483d65b0fc3cbc257e282a9f48156d4342ffd705bc3ebb7a190c4cd0ee5ca202312d86df82480ef4c5191cc78c74295b788dd6d3ef1432644a7c8aa201aeffd44527266817ab1a3e37fdcfb430a06cef17e7f8e2dbdad478e509ebb1985d8106822bd32d828d7e9f17e46b44ca337ddae53f70653f3859eda1da1456556ec3e14152ca32b2abc60ea624d34b90035771a58cafe40e19bc1fb9e68e416c6f08076b5419f16a4df5e569810ce8f3842a4f9de643b4848da7385e0fd90303610a901579c4f842562e4d92086f32fc8e97ef5cf95005a9d7ce8f8db52da879f056d8426cdd099df65811664436affb14911c316d1d0862ea5ad780c7409a7fc17c242d64b90b296e1f28f68744c7f4b24f4a9c8299acec62aeabf55bcbb3f19e1339064ebc9f620bdcfc3eb7be28895afb0dfae8ec2fa409503ee7e804390c3ca108c1cbbb602d0160dd87c7a1c32c553401752b6fc9850c7200df0db67dea70830763f32f712013094ddd8e5762d23c992e137ee681f8544d51fab39cc713cc6dc979906ad936d5d36a644a5085aa4c923b7834c622fa3a2c1ef476928a3692d026d74d9521c56f78fd94eefaad26da6309c5d79048f3e6b1fe84cb7b92e1e004f54da10baec73c78a44991841dee8ca2363e76b2b0d9cca52e1619f537f8fb646cd8f8ba3f8f04d010270afea4a831fb83acd8d869e62635477d6fc30b2d4093c35aeb55e3672c70c859e85f3cdff96a6a50df6e9c1d44c3b35585de7cc8bd572a7ed0e1be1541e32bf99e4efabd4810ea93ad467d50b8cf60b132df2541405a377015de1fa5fb63e0b0959f503989b01317583864ff0ee8a2c10dee4307c15d4eebb3f895117d6fba105ff177b2e8989a0b283ee811a20b9dac352e22370bd5f1c5a5d1eaa0197348ccb88372c5f6715d4b3d6cbdc32d6d80d1a082d1fc1e8467e70e5dc04428b50254f608afdbd6557277f92642ee5ca15b6bc382da0977d74bf70076d5cb9e786ff720995e4e521a05e06e9b0f697f55] */

  // 添加心跳检测
  setInterval(async () => {
    try {
      if (config.sendUrl && botId) {
        const result = await requestQianxun({
          type: 'getLoginStatus',
          data: {}
        });
        debugLog('心跳检测结果:', result);
      }
    } catch (e) {
      console.error('心跳检测失败:', e);
    }
  }, 300000); // 每5分钟一次

  return wxQianxunPro;
};