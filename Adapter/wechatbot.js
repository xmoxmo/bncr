/**
 * This file is part of the Bncr project.
 * @author xmo
 * @name wechatbot
 * @origin xmo
 * @team xmo
 * @version 0.0.2
 * @description wechatbot适配器，暂不支持发送图片和文件
 * @adapter true
 * @public true
 * @disable false
 * @priority 2
 * @Copyright ©2024 xmo. All rights reserved
 * @classification ["适配器"]
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */
/* 配置构造器 */
const jsonSchema = BncrCreateSchema.object({
  enable: BncrCreateSchema.boolean().setTitle('是否开启适配器').setDescription(`设置为关则不加载该适配器`).setDefault(false),
  sendUrl: BncrCreateSchema.string().setTitle('上报地址').setDescription(`wechatbot的地址`).setDefault('http://127.0.0.1:12345'),
  sendToken: BncrCreateSchema.string().setTitle('上报Token').setDescription(`wechatbot的地址Token`).setDefault(''),
  fileServer: BncrCreateSchema.string().setTitle('文件服务器地址').setDescription(`和微信在同一机器的文件服务器地址,需单独部署`).setDefault('http://127.0.0.1:3000'),
});
/* 配置管理器 */
const ConfigDB = new BncrPluginConfig(jsonSchema);
module.exports = async () => {
  /* 读取用户配置 */
  await ConfigDB.get();
  /* 如果用户未配置,userConfig则为空对象{} */
  if (!Object.keys(ConfigDB.userConfig).length) {
    sysMethod.startOutLogs('未启用wechatbot适配器,退出.');
    return;
  }
  if (!ConfigDB.userConfig.enable) return sysMethod.startOutLogs('未启用wechatbot 退出.');
  let wechatbotUrl = ConfigDB.userConfig.sendUrl;
  let fileServer = ConfigDB.userConfig.fileServer;
  if (!wechatbotUrl) return console.log('wechatbot:配置文件未设置sendUrl');
  let wechatbotToken = ConfigDB.userConfig.sendToken;
  if (wechatbotUrl) {
    if (wechatbotUrl.slice(-1) !== "/") {
      wechatbotUrl += '/';
    }
  }
  if (fileServer) {
    if (fileServer.slice(-1) !== "/") {
      fileServer += '/';
    }
  }
  //这里new的名字将来会作为 sender.getFrom() 的返回值
  const wechatbot = new Adapter('wechatbot');
  const request = require('util').promisify(require('request'));
  const wxDB = new BncrDB('wechatbot');
  // 向/api/系统路由中添加路由
  router.get('/api/bot/wechat', (req, res) => res.send({ msg: '这是wechatbotUrl Api接口，你的get请求测试正常~，请用post交互数据' }));
  router.post('/api/bot/wechat', async (req, res) => {
    try {
      const body = req.body;
      // console.log(body);
      let msgInfo = null;
      // console.log(body.from.UserName.slice(0, 2))
      let name = '';
      let group = '';
      let rname = '';
      if (body.from.UserName.slice(0, 2) === "@@") {
        name = body.member.DisplayName;
        group = body.from.NickName;
        rname = body.member.NickName;
      } else {
        name = body.from.NickName;
        rname = body.from.RemarkName;
      }
      if (rname === name) {
        rname = '';
      }
      if (rname) {
        name = name + '<||>' + rname;
      }
      msgInfo = {
        userId: Buffer.from(name, 'utf-8').toString('hex') || '',
        userName: name || '',
        groupId: Buffer.from(group, 'utf-8').toString('hex') || '0',
        groupName: group || '',
        msg: body.content.replace(new RegExp('<br/>','g'), '\n') || '',
        msgId: body.id || '',
        atme: body.atMe,
      };
      // console.log(msgInfo);
      msgInfo && wechatbot.receive(msgInfo);
      res.send({ status: 200, data: '', msg: 'ok' });
    } catch (e) {
      console.error('wechat:', e);
      res.send({ status: 400, data: '', msg: e.toString() });
    }
  });

  wechatbot.reply = async function (replyInfo) {
    // console.log(replyInfo);
    let body = null;
    if (!replyInfo.userName) {
      if (replyInfo.userId) {
        replyInfo.userName = Buffer.from(replyInfo.userId, 'hex').toString('utf-8');
      }
    }
    if (!replyInfo.groupName) {
      if (replyInfo.groupId) {
        replyInfo.groupName = Buffer.from(replyInfo.groupId, 'hex').toString('utf-8');
      }
    }
    let newname = '';
    let newmsg = '';
    let stype = '';
    if (replyInfo.userName) {
      if (replyInfo.userName.includes('<||>')) {
        const names = replyInfo.userName.split('<||>');
        replyInfo.userName = names[0];
      }
    }
    if (!replyInfo.groupId || replyInfo.groupId === '0') {
      newname = replyInfo.userName;
      newmsg = replyInfo.msg;
    } else {
      newname = replyInfo.groupName;
      if (replyInfo.userName) {
        newmsg = '@' + replyInfo.userName + ' \n' + replyInfo.msg;
      } else {
        newmsg = replyInfo.msg;
      }
    }
    switch (replyInfo.type) {
      case 'text':
        // replyInfo.msg = replyInfo.msg.replace(/\n/g, '\r');
        body = {
          nickname: newname,
          message: newmsg,
        };
        stype = 'sendText';
        break;
      /*
      case 'image':
        body = {
          nickname: newname,
          file: fileServer ? await getLocalPath(replyInfo.path, "img") : replyInfo.path,
        };
        stype = 'sendImage'
        break;
      case 'video':
        body = {
          nickname: newname,
          file: fileServer ? await getLocalPath(replyInfo.path, "video") : replyInfo.path,
        };
        stype = 'sendFile'
        break;
      default:
        return;
        break;
      */
    }
    body && (await requestwxBot(body, stype));
    return '';
  };

  // 推送消息方法
  wechatbot.push = async function (replyInfo) {
    return this.reply(replyInfo);
  };
  
  // 发送消息请求体
  async function requestwxBot(body, stype) {
    const options = {
      url: `${wechatbotUrl}${stype}?token=${wechatbotToken}`,
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      json: true,
      body: body,
    };
    return (
      await request(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          // console.log(body);
        } else {
          console.error(error);
        }
      })
    );
  }
  ;

  // 获取windows文件路径
  async function getLocalPath(url, type) {
    let req = { url: url, type: type }
    console.log("开始下载:",type,"文件:",url)
    return (
      await request({
        url: `${fileServer}download`,
        method: 'post',
        body: req,
        json: true,
      })
    ).body.path;
  }
  return wechatbot;
};