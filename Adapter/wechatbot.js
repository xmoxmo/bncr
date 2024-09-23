/**
 * This file is part of the Bncr project.
 * @author xmo
 * @name wechatbot
 * @origin xmo
 * @team xmo
 * @version 0.3.7
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
      const body = req.body;
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
    getfileinfo(way, function(fpath) {
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
        if (replyInfo.type === fileinfo.type) {
          if (fileinfo.path) {
            sendway = 'file';
            way = fileinfo.path;
          }
        } else {
          sysMethod.startOutLogs('wechatbot检测到文件类型不匹配，尝试原始url发送');
          if (getext(way)) {
            sysMethod.startOutLogs(`wechatbot检测到url中的存在的扩展名：${getext(way)}`);
          } else{
            sysMethod.startOutLogs(`wechatbot未在url中检测到扩展名`);
          }
          if (fileinfo.path) {
            if (fileinfo.path.includes('/wechatbot_filecache_')) {
              delfile(fileinfo.path, function(e) {
                sysMethod.startOutLogs(e, fileinfo.path);
              });
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
      asyncrequestwxBot(body, bodytext, stype);
    });
    return '';
  };

  // 推送消息方法
  wechatbot.push = async function (replyInfo) { 
    return await this.reply(replyInfo);
  };

  // 异步发送
  async function asyncrequestwxBot(body, bodytext, stype) {
    body && (await requestwxBot(body, stype));
    bodytext && (await requestwxBot(bodytext, 'sendText'));
  }

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
                delfile(localpath, function(e) {
                  sysMethod.startOutLogs(e, localpath);
                });
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
  async function getfileinfo(url, cb) {
    if (!url) {
      fileinfo = {
        path: '',
        type: '',
        ext: '',
      }
      cb(fileinfo);
      return '';
    }
    const axios = require('axios');
    const path = require('path');
    const fs = require('fs');
    // sysMethod.startOutLogs(url + ' + ' + fs.existsSync(url));
    if (fs.existsSync(url)) {
      const spath = url;
      fileinfo = {
        path: spath,
        type: 'synctype',
        ext: getext(spath),
      }
      cb(fileinfo);
      return '';
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
  };

  // 删除文件
  async function delfile(path, cb) {
    const fs = require('fs');
      fs.unlink(path, (err) => {
        if (err) {
          sysMethod.startOutLogs('wechatbot删除文件失败：', err);
        } else {
          cb('wechatbot删除文件成功：');
        }
      });
  };

  // 提取链接中的扩展名
  function getext(path) {
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
      let sbody = JSON.parse(response.body);
      contact.botid = sbody.UserName;
      contact.botname = sbody.NickName;
    } catch (error) {
      sysMethod.startOutLogs('wechatbot获取Bot名片信息出错:', `${response.body}\n${error}`);
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
        let sbody = JSON.parse(response.body);
        contact.nname = sbody.NickName;
        contact.rname = sbody.RemarkName;
        contact.dname = sbody.DisplayName;
      }
    } catch (error) {
      sysMethod.startOutLogs('wechatbot获取联系人名片信息出错:', `${response.body}\n${error}`);
    }
    return contact;
  };

  // 更新bot信息
  async function updatebotinfo() {
    const botinfo = await getbotself();
    const wxname = botinfo.botname;
    const dbname = await wxDB.get("botname");
    if (dbname !== wxname) {
      await wxDB.set("botname", wxname);
      sysMethod.startOutLogs(`wechatbot：botname<${wxname}> 更新成功`);
    }
    const wxid = botinfo.botid;
    const dbid = await wxDB.get("botid");
    if (dbid !== wxid) {
      await wxDB.set("botid", wxid);
      sysMethod.startOutLogs(`wechatbot：botid<${wxid}> 更新成功`);
    }
    return botinfo;
  }

  return wechatbot;
};
