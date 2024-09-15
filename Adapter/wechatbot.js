/**
 * This file is part of the Bncr project.
 * @author xmo
 * @name wechatbot
 * @origin xmo
 * @team xmo
 * @version 0.1.0
 * @description wechatbot适配器，项目地址：https://gitee.com/ilooli/wechat-bot
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
  sendToken: BncrCreateSchema.string().setTitle('上报Token').setDescription(`wechatbot的地址Token`).setDefault('1AZ2WSX3EDC'),
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
  //这里new的名字将来会作为 sender.getFrom() 的返回值
  const wechatbot = new Adapter('wechatbot');
  await sysMethod.testModule(['request', 'axios'], { install: true });
  const request = require('util').promisify(require('request'));
  const wxDB = new BncrDB('wechatbot');
  // 向/api/系统路由中添加路由
  router.get('/api/bot/wechat', (req, res) => res.send({ msg: '这是wechatbotUrl Api接口，你的get请求测试正常~，请用post交互数据' }));
  router.post('/api/bot/wechat', async (req, res) => {
    try {
      const body = req.body;
      // console.log(body);
      if (body.type !== 'TEXT') {
        let tostr = '';
        if (body.content) {
          tostr = body.content.toString();
        }
        sysMethod.startOutLogs(`wechatbot收到暂不支持的消息:type{${body.type}}|toString{${tostr}}`);
        return;
      }
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
      console.error('wechatbot接收信息出错:', e);
      res.send({ status: 400, data: '', msg: e.toString() });
    }
  });

  wechatbot.reply = async function (replyInfo) {
    // console.log(replyInfo);
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
    // console.log(way);
    getfileinfo(way, function(fpath) {
      // console.log(fpath);
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
        if (replyInfo.type === fileinfo.type) {
          if (fileinfo.path) {
            sendway = 'file';
            way = fileinfo.path;
          }
        } else {
          console.log('wechatbot检测到文件格式不匹配，尝试原始url发送');
          if (fileinfo.path) {
            delfile(fileinfo.path, function(e) {
              console.log(e, fileinfo.path);
            });
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
      body && (requestwxBot(body, stype));
      if (bodytext) {
        body = bodytext;
        stype = 'sendText';
        body && (requestwxBot(body, stype));
      }
      

      
      
    });
    return '';
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
        method: 'post',
        headers: {
          "Content-Type": "application/json",
        },
        json: true,
        body: body,
      };
    } else {
      options = {
        url: `${wechatbotUrl}${stype}?token=${wechatbotToken}`,
        method: 'post',
        headers: {
          "Content-Type": "multipart/form-data",
        },
        formData: body,
      };
    }
    // console.log(`${wechatbotUrl}${stype}?token=${wechatbotToken}`);
    request(options, function (error, response) {
      if (error) {
        console.log(error);
      }
      // console.log(options);
      // console.log(options.url);
      if (options.url) {
        if (!options.url.includes('sendText?')) {
          const localurl = options.formData.url;
          // console.log(localurl);
          if (!localurl) {
            const localoptions = options.formData.file.options;
            const localpath = localoptions.filename;
            // console.log(localpath);
            if (response.body === "success") {
              console.log('wechatbot发送文件成功：', localpath);
            }
            if (localpath) {
              delfile(localpath, function(e) {
              console.log(e, localpath);
              });
            }
          }
        }
      }
    });
  };

  // 下载文件的方法
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
    try {
      const response = await axios.get(url, {
        responseType: 'stream',
      });
      const info = response.headers['content-type'];
      // console.log(info);
      let filetype = '';
      let fileext = '';
      if (info) {
        if (info.includes('/')) {
          let infos = info.split('/');  
          filetype = infos[0];
          fileext = infos[1];
        }
      }
      const filepath = path.join(process.cwd(), `BncrData/public/file_${Date.now()}.${fileext}`);
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      let fileinfo = null;
      fileinfo = {
        path: filepath,
        type: filetype,
        ext: fileext,
      }
      writer.on('error', async (err) => {
        console.error('wechatbot下载文件时发生错误:', err);
      });

      writer.on('finish', async () => {
          console.log('wechatbot下载文件成功：', fileinfo.path);
          cb(fileinfo);
      });
    } catch (error) {
      console.error('wechatbot下载文件发生错误:', error);
    }
  };

  // 删除文件的方法
  async function delfile(path, cb) {
    const fs = require('fs');
      fs.unlink(path, (err) => {
        if (err) {
          console.error('wechatbot删除文件失败：', err);
        } else {
          cb('wechatbot删除文件成功：');
        }
      });
  };
  return wechatbot;
};