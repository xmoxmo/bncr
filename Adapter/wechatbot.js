/**
 * This file is part of the Bncr project.
 * @author xmo
 * @name wechatbot
 * @origin xmo
 * @team xmo
 * @version 0.4.7
 * @description wechatbot适配器，项目地址：https://gitee.com/ilooli/wechat-bot
 * @adapter true
 * @public true
 * @disable false
 * @priority 100
 * @Copyright ©2024 xmo. All rights reserved
 * @classification ["适配器"]
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */
// 配置构造器
const jsonSchema = BncrCreateSchema.object({
  basic: BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('是否开启适配器').setDescription(`设置为关则不加载该适配器`).setDefault(false),
    getcards: BncrCreateSchema.boolean().setTitle('是否获取名片').setDescription(`设置为开则主动获取联系人名片辅助识别用户身份`).setDefault(true),
    sendUrl: BncrCreateSchema.string().setTitle('上报地址').setDescription(`wechatbot的地址`).setDefault('http://127.0.0.1:12345'),
    sendToken: BncrCreateSchema.string().setTitle('上报Token').setDescription(`wechatbot的地址Token`).setDefault('1AZ2WSX3EDC'),
    route: BncrCreateSchema.string().setTitle('登录通知方式').setDescription(`填写机器人下线后通知的其他平台管理员，多个用“,”分割，留空则通知其他所有平台管理员`).setDefault(''),
    notify: BncrCreateSchema.number().setTitle('登录通知次数').setDescription(`设置机器人下线后通知其他平台管理员的通知次数`).setDefault(20),
    keyblack: BncrCreateSchema.string().setTitle('通知黑名单').setDescription(`填写无需通知的消息关键词，多个用“,”分割，留空则通知全部消息`).setDefault(''),
  }).setTitle('基本设置').setDefault({}),
  rooms: BncrCreateSchema.array(BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('启用').setDescription('是否启用').setDefault(true),
    rule: BncrCreateSchema.object({
    joinIds: BncrCreateSchema.string().setTitle('进群监控').setDescription(`当有人进群后触发消息监控的群，多个用,隔开`).setDefault(""),
    joinMsg: BncrCreateSchema.string().setTitle('进群提示').setDescription(`当有人进群后触发消息，“\\n”换行`).setDefault("欢迎加入大家庭~"),
    }),
  })).setTitle('群聊相关').setDefault([])
});
// 配置管理器
const ConfigDB = new BncrPluginConfig(jsonSchema);
// 重置通知计次
let tzco = 0;
let tzzz = 0;
module.exports = async () => {
  // 读取用户配置
  await ConfigDB.get();
  // 如果用户未配置,userConfig则为空对象{}
  if (!Object.keys(ConfigDB.userConfig).length) {
    sysMethod.startOutLogs('未启用wechatbot适配器,退出.');
    return;
  }
  if (!ConfigDB.userConfig.basic?.enable) return sysMethod.startOutLogs('未启用wechatbot 退出.');
  let getcard = ConfigDB.userConfig.basic.getcards;
  if (getcard !== false) {
    getcard = true;
  }
  let wechatbotUrl = ConfigDB.userConfig.basic.sendUrl;
  if (!wechatbotUrl) return sysMethod.startOutLogs('wechatbot:配置文件未设置sendUrl');
  let wechatbotToken = ConfigDB.userConfig.basic.sendToken;
  if (wechatbotUrl) {
    if (wechatbotUrl.slice(-1) !== "/") {
      wechatbotUrl += '/';
    }
  }
  const notifyway = ConfigDB.userConfig.basic.route;
  const notifyco = ConfigDB.userConfig.basic.notify || 20;
  const keyblacklist = ConfigDB.userConfig.basic.keyblack || '';
  // 这里new的名字将来会作为 sender.getFrom() 的返回值
  const wechatbot = new Adapter('wechatbot');
  await sysMethod.testModule(['request', 'axios'], { install: true });
  const request = require('util').promisify(require('request'));
  const wxDB = new BncrDB('wechatbot');
  const botinfo = await updatebotinfo();
  const wxname = botinfo.botname;
  if (wxname) {
    sysMethod.startOutLogs(`wechatbot：Contact<${wxname}> 调用成功`);
  }
  // 接收消息API
  router.get('/api/bot/wechat', (req, res) => res.send('这是wechatbot Api接口，你的get请求测试正常~，请用post交互数据'));
  router.post('/api/bot/wechat', async (req, res) => {
    res.send('success');
    try {
      const rbody = req.body;
      let body = '';
      if (rbody.wtype) {
        if (rbody.wtype === 'MessageEvent') {
          let newcontent = rbody.content;
          newcontent = newcontent.replace(new RegExp('\n','g'), '\\n');
          newcontent = newcontent.replace(new RegExp('\t','g'), '\\t');
          newcontent = newcontent.replace(new RegExp('\r','g'), '\\r');
          if (await isJSON(newcontent)) {
            body = JSON.parse(newcontent);
          } else {
            if (newcontent) {
              sysMethod.startOutLogs('wechatbot处理数组出错:', `${newcontent}`);
            } else {
              sysMethod.startOutLogs('wechatbot接收数组出错');
            }
          }
        } else {
          const sysmsg = rbody.content;
          sysMethod.startOutLogs(`wechatbot收到系统事件:type{${rbody.wtype}}|toString{${sysmsg}}`);
          if (keyblacklist) {
            const keyblacklists = keyblacklist.split(',');
            for (const keybl of keyblacklists) {
              if (sysmsg.includes(keybl)) {
                sysMethod.startOutLogs(`wechatbot根据关键词{${keybl}}屏蔽系统事件{${sysmsg}}`);
                return;
              }
            }
          }
          let notifyways = '';
          if (notifyway) {
            notifyways = notifyway.split(",");
          }
          if (sysmsg.includes('[login]')) {
            if (!tzco) {
              tzco = 0;
            }
            const notify = notifyways || 'all';
            if (sysmsg.includes('登录二维码链接')) {
              sysMethod.startOutLogs('wechatbot扫码通知-平台：' + notify);                
              tzco = tzco + 1;
              if (tzco <= notifyco) {
                try {
                  sysMethod.pushAdmin({
                    platform: notifyways || [],
                    msg: `wechatbot通知: ${sysmsg}`,
                  });
                  sysMethod.startOutLogs('wechatbot扫码通知-计次：' + tzco);
                } catch (e) {
                  tzco = tzco - 1;
                  // 发送失败
                }
              } else {
                if (tzzz == 0) {
                  try {
                    sysMethod.pushAdmin({
                      platform: notifyways || [],
                      msg: `wechatbot登录消息发送超过指定次数，请进入ssh扫码登录或重启无界后等待重新发送扫码链接后登录`,
                    });
                    tzzz = 1;
                  } catch (e) {
                    // 发送失败
                  }
                }
              }
            }
            if (sysmsg.includes('成功登录')) {
              tzco = 0;
              tzzz = 0;
              try {
                sysMethod.pushAdmin({
                  platform: notifyways || [],
                  msg: `wechatbot通知: ${sysmsg}`,
                });
              } catch (e) {
                // 发送失败
              }
            }
          } else {
            try {
              sysMethod.pushAdmin({
                platform: notifyways || [],
                msg: `wechatbot通知: ${sysmsg}`,
              });
            } catch (e) {
              // 发送失败
            }
          }
          return;
        }
      } else {
        body = rbody;
      }
      // sysMethod.startOutLogs(body);
      let tostr = '';
      if (body.content) {
        tostr = body.content.toString();
      }
      if (body.type !== 'TEXT') {
        if (body.type === 'SYSTEM') {
          const tips = body.content;
          if (tips.includes('加入了群聊') || tips.includes('加入群聊')) {
            const topic = body.from.NickName;
            sysMethod.startOutLogs(`wechatbot：收到群员进群事件：${tips}[${topic}]`);
            const tipss = tips.split(`"`);
            let users = '';
            if (tips.includes('加入了群聊')) {
              users = tipss[3];
            }
            if (tips.includes('加入群聊')) {
              users = tipss[1];
            }
            const roomId = Buffer.from(topic, 'utf-8').toString('hex');
            const rooms = ConfigDB.userConfig.rooms.filter(o => o.enable) || [];
            for (const group of rooms) {
              const joinIds = group.rule.joinIds?.split(",") || [];
              const joinMsg = group.rule.joinMsg || '欢迎加入大家庭~';
              if ((joinIds.indexOf(roomId) != -1) && joinMsg) {
                const bodysys = {
                  target: topic,
                  type: 'NICK_NAME',
                  message: `@${users.replaceAll('、', ' @')}\n${joinMsg.replaceAll('\\n', '\n')}`,
                };
                bodysys && (await requestwxBot(bodysys, 'sendText'));
              }
            }
            return;
          }
        }
        if (body.type === 'VERIFY') {
          sysMethod.startOutLogs(`wechatbot：收到好友添加请求：type{${body.type}}|toString{${tostr}}`);
          sysMethod.pushAdmin({
            platform: ['wechatbot'],
            msg: `wechatbot收到好友添加请求：\n  >昵称:${body.recommend.NickName}\n  >来自:${body.recommend.Province}${body.recommend.City}\n  >验证:${body.recommend.Content}\n  >签名:${body.recommend.Signature}`,
          });
          return;
        }
        sysMethod.startOutLogs(`wechatbot收到暂不支持的消息:type{${body.type}}|toString{${tostr}}`);
        return;
      }
      await updatebotinfo();
      let fromnameid = body.from.UserName;
      let fromnickname = body.from.NickName;
      let membernameid = '';
      let membernickname = '';
      try {
        membernameid = body.member.UserName;
        membernickname = body.member.NickName;
      } catch (error) {
        //不处理
      }
      let botuserid = '';
      let botgroupname = '';
      let msgnname = '';
      let msgrname = '';
      // sysMethod.startOutLogs(body.from.UserName.slice(0, 2))
      if (fromnameid.slice(0, 2) === "@@") {
        botuserid = membernameid;
        botgroupname = fromnickname;
        msgnname = membernickname;
        msgrname = body.member.RemarkName;
      } else {
        botuserid = fromnameid;
        msgnname = fromnickname;
        msgrname = body.from.RemarkName;
      }
      const userinfo = await getcontact(botuserid, botgroupname);
      // sysMethod.startOutLogs(userinfo);
      const botselfid = await wxDB.get("botid");
      if (botselfid === botuserid) {
        sysMethod.startOutLogs(`wechatbot屏蔽自己发的消息:type{${body.type}}|toString{${tostr}}`);
        return;
      }
      if (!userinfo.nname && !msgnname) {
        sysMethod.startOutLogs(`wechatbot屏蔽空用户名发的消息:type{${body.type}}|toString{${tostr}}`);
        return;
      }
      let msgInfo = null;
      let name = userinfo.nname || msgnname;
      let group = userinfo.group;
      let rname = userinfo.rname || msgrname;
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
      // sysMethod.startOutLogs(msgInfo);
      msgInfo && wechatbot.receive(msgInfo);
    } catch (e) {
      sysMethod.startOutLogs('wechatbot接收信息出错:', e);
    }
  });

  // 回复消息
  wechatbot.reply = async function (replyInfo) {
    // sysMethod.startOutLogs(replyInfo);
    let body = null;
    let bodytext = null;
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
    let ntype = 'NICK_NAME';
    if (replyInfo.userName) {
      if (replyInfo.userName.includes('<||>')) {
        const names = replyInfo.userName.split('<||>');
        replyInfo.userName = names[0];
        replyInfo.userRemarkName = names[1];
        if (!replyInfo.groupId || replyInfo.groupId === '0') {
          ntype = 'REMARK_NAME';
        }
      }
    }
    if (!replyInfo.groupId || replyInfo.groupId === '0') {
      if (ntype === 'REMARK_NAME') {
        newname = replyInfo.userRemarkName;
      } else {
        newname = replyInfo.userName;
      }
      newmsg = replyInfo.msg;
    } else {
      newname = replyInfo.groupName;
      if (replyInfo.userName) {
        newmsg = '@' + replyInfo.userName + ' \n' + replyInfo.msg;
      } else {
        newmsg = replyInfo.msg;
      }
    }
    let way = replyInfo.path;
    // sysMethod.startOutLogs(way);
    fpath = await getfileinfo(way);
    // sysMethod.startOutLogs(fpath);
    let sendway = '';
    const fs = require('fs');
    if (replyInfo.type !== 'text') {
      if (replyInfo.msg) {
        bodytext = {
          target: newname,
          type: ntype,
          message: newmsg,
        };
      }
      const fileinfo = fpath;
      if (fileinfo.type === 'synctype') {
        fileinfo.type = replyInfo.type;
      }
      if (fileinfo.type === 'audio') {
        if (replyInfo.type !== 'file') replyInfo.type = 'file';
        if (fileinfo.type !== 'file') fileinfo.type = 'file';
      }
      if (replyInfo.type === fileinfo.type) {
        if (fileinfo.path) {
          sendway = 'file';
          way = fileinfo.path;
        }
      } else {
        sysMethod.startOutLogs('wechatbot检测到文件类型不匹配，尝试原始url发送');
        const wayext = await getext(way);
        if (wayext) {
          sysMethod.startOutLogs(`wechatbot检测到url中的存在的扩展名：${wayext}`);
        } else{
          sysMethod.startOutLogs(`wechatbot未在url中检测到扩展名`);
        }
        if (fileinfo.path) {
          if (fileinfo.path.includes('/wechatbot_filecache_')) {
            sysMethod.startOutLogs(await delfile(fileinfo.path), fileinfo.path);
          }
        }
      }
    }
    switch (replyInfo.type) {
      case 'text':
        // replyInfo.msg = replyInfo.msg.replace(/\n/g, '\r');
        body = {
          target: newname,
          type: ntype,
          message: newmsg,
        };
        stype = 'sendText';
        break;
      case 'image':
        if (sendway === 'file') {
          body = {
            target: newname,
            type: ntype,
            file: {
              value: fs.createReadStream(way),
              options: {
                filename: way,
                contentType: null,
              }
            }
          };
        } else {
          body = {
            target: newname,
            type: ntype,
            url: replyInfo.path,
          };
        }
        stype = 'sendImage'
        break;
      case 'video':
        if (sendway === 'file') {
          body = {
            target: newname,
            type: ntype,
            file: {
              value: fs.createReadStream(way),
              options: {
                filename: way,
                contentType: null,
              }
            }
          };
        } else {
          body = {
            target: newname,
            type: ntype,
            url: replyInfo.path,
          };
        }
        stype = 'sendVideo'
        break;
      case 'file':
        if (sendway === 'file') {
          body = {
            target: newname,
            type: ntype,
            file: {
              value: fs.createReadStream(way),
              options: {
                filename: way,
                contentType: null,
              }
            }
          };
        } else {
          body = {
            target: newname,
            type: ntype,
            url: replyInfo.path,
          };
        }
        stype = 'sendFile'
        break;
      default:
        return;
        break;
    }
    body && (await requestwxBot(body, stype));
    bodytext && (await requestwxBot(bodytext, 'sendText'));
    return;
  };

  // 推送消息方法
  wechatbot.push = async function (replyInfo) { 
    return await this.reply(replyInfo);
  };

  // 发送消息请求体
  async function requestwxBot(body, stype) {
    let options = '';
    if (stype === 'sendText') {
      options = {
        url: `${wechatbotUrl}${stype}?token=${wechatbotToken}`,
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        json: true,
        body: body,
      };
    } else {
      options = {
        url: `${wechatbotUrl}${stype}?token=${wechatbotToken}`,
        method: 'POST',
        headers: {
          "Content-Type": "multipart/form-data",
        },
        formData: body,
      };
    }
    const response = await request(options);
    try {
      if (options.url) {
        if (!options.url.includes('sendText?')) {
          const localurl = options.formData.url;
          // sysMethod.startOutLogs(localurl);
          if (!localurl) {
            const localoptions = options.formData.file.options;
            const localpath = localoptions.filename;
            // sysMethod.startOutLogs(localpath);
            if (response.body === 'success') {
              sysMethod.startOutLogs('wechatbot发送文件成功：', localpath);
            } else {
              sysMethod.startOutLogs('wechatbot发送文件失败：', localpath);
            }
            if (localpath) {
              if (localpath.includes('/wechatbot_filecache_')) {
                sysMethod.startOutLogs(await delfile(localpath), localpath);
              }
            }
          } else {
            if (response.body === 'success') {
              sysMethod.startOutLogs('wechatbot通过原始url发送文件成功');
            } else {
              sysMethod.startOutLogs('wechatbot通过原始url发送文件失败');
            }
          }
        }
      }
    } catch (error) {
      sysMethod.startOutLogs('wechatbot发送文件出错:', error);
    }
    if (response.body !== 'success') {
      response.body = 'failure';
    }
    return response.body;
  };

  // 下载文件
  async function getfileinfo(url) {
    return new Promise(async (cb) => {
      if (!url) {
        fileinfo = {
          path: '',
          type: '',
          ext: '',
        }
        cb(fileinfo);
        return;
      }
      const axios = require('axios');
      const path = require('path');
      const fs = require('fs');
      // sysMethod.startOutLogs(url + ' + ' + fs.existsSync(url));
      if (fs.existsSync(url)) {
        const spath = url;
        const spathext = await getext(spath);
        fileinfo = {
          path: spath,
          type: 'synctype',
          ext: spathext,
        }
        cb(fileinfo);
        return;
      }
      try {
        const response = await axios.get(url, {
          responseType: 'stream',
        });
        const info = response.headers['content-type'];
        // sysMethod.startOutLogs(info);
        let filetype = '';
        let fileext = '';
        if (info) {
          if (info.includes('/')) {
            let infos = info.split('/');  
            filetype = infos[0];
            fileext = infos[1];
          }
        }
        const filepath = path.join(process.cwd(), `BncrData/public/wechatbot_filecache_${Date.now()}.${fileext}`);
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        let fileinfo = null;
        fileinfo = {
          path: filepath,
          type: filetype,
          ext: fileext,
        }
        writer.on('error', async (err) => {
          sysMethod.startOutLogs('wechatbot下载文件时发生错误:', err);
        });
        writer.on('finish', async () => {
          sysMethod.startOutLogs('wechatbot下载文件成功：', fileinfo.path);
          cb(fileinfo);
        });
      } catch (error) {
        sysMethod.startOutLogs('wechatbot下载文件发生错误:', error);
      }
    });
  };

  // 删除文件
  async function delfile(path) {
    return new Promise((cb) => {
      const fs = require('fs');
      fs.unlink(path, (err) => {
        if (err) {
          sysMethod.startOutLogs('wechatbot删除文件失败：', err);
        } else {
          cb('wechatbot删除文件成功：');
        }
      });
    });
  };

  // 提取链接中的扩展名
  async function getext(path) {
    return path.split('.').pop().toLocaleLowerCase();
  }

  // 获取bot的名片
  async function getbotself() {
    let contact = '';
    contact = {
      botid: '',
      botname: '',
    };
    if (!getcard) {
      return contact;
    }
    const stype = 'getSelf';
    //  bot名片
    let options = '';
    options = {
      'method': 'GET',
      'url': `${wechatbotUrl}${stype}?token=${wechatbotToken}`,
      'headers': {
      }
    };
    const response = await request(options);
    try {
      if (await isJSON(response.body)) {
        let sbody = JSON.parse(response.body);
        contact.botid = sbody.UserName;
        contact.botname = sbody.NickName;
      } else {
        sysMethod.startOutLogs('wechatbot处理数组出错:', `${response.body}`);
      }
    } catch (error) {
      sysMethod.startOutLogs('wechatbot获取Bot名片信息出错:', `${error}`);
    }
    return contact;
  };

  // 获取联系人名片
  async function getcontact(usernamebotid, groupname) {
   let contact =null;
    let options = '';
    contact = {
      nname: '',
      rname: '',
      dname: '',
      group: groupname,
    };
    if (!getcard) {
      return contact;
    }
    if (!groupname) {
      return contact;
    }
    const stype = 'getContact';
    // 联系人名片
    options = {
      'method': 'GET',
      'url': `${wechatbotUrl}${stype}?token=${wechatbotToken}`,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        'target': usernamebotid,
        'type': 'USER_NAME',
      }
    };
    const response = await request(options);
    try {
      if (response.body !== '未找到联系人信息') {
        if (await isJSON(response.body)) {
          let sbody = JSON.parse(response.body);
          contact.nname = sbody.NickName;
          contact.rname = sbody.RemarkName;
          contact.dname = sbody.DisplayName;
        } else {
          sysMethod.startOutLogs('wechatbot处理数组出错:', `${response.body}`);
        }
      }
    } catch (error) {
      sysMethod.startOutLogs('wechatbot获取联系人名片信息出错:', `${error}`);
    }
    return contact;
  };

  // 更新bot信息
  async function updatebotinfo() {
    const botinfo = await getbotself();
    const wxname = botinfo.botname;
    const dbname = await wxDB.get("botname");
    if (wxname) {
      if (dbname !== wxname) {
        await wxDB.set("botname", wxname);
        sysMethod.startOutLogs(`wechatbot：botname<${wxname}> 更新成功`);
      }
    }
    const wxid = botinfo.botid;
    const dbid = await wxDB.get("botid");
    if (wxid) {
      if (dbid !== wxid) {
        await wxDB.set("botid", wxid);
        sysMethod.startOutLogs(`wechatbot：botid<${wxid}> 更新成功`);
      }
    }
    return botinfo;
  }

  // 判断字符串是否为json格式
  async function isJSON(str) {
    if (typeof str == 'string') {
      try {
        const obj = JSON.parse(str);
        if (typeof obj == 'object' && obj ) {
          return true;
        } else {
          return false;
        }
      } catch(e) {
        return false;
      }
    }
  }

  return wechatbot;
};
