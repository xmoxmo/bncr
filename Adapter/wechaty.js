/**
 * This file is part of the App project.
 * @author 小寒寒
 * @name wechaty
 * @team xmo
 * @version 1.3.4
 * @description wx机器人内置适配器，微信需要实名。
 * @adapter true
 * @public true
 * @disable false
 * @priority 100
 * @classification ["官方适配器"]
 * @Copyright ©2024 Aming and Anmours. All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

/* 配置构造器 */
const jsonSchema = BncrCreateSchema.object({
    basic: BncrCreateSchema.object({
        enable: BncrCreateSchema.boolean().setTitle('是否开启适配器').setDescription(`设置为关则不加载该适配器`).setDefault(false),
        name: BncrCreateSchema.string().setTitle('机器人标识').setDescription(`设置后后续自动登录，更换微信时请更换标识`).setDefault('wechaty'),
        route: BncrCreateSchema.string().setTitle('登录通知方式').setDescription(`填写机器人下线后通知的其他平台管理员，多个用,分割，留空则通知其他所有平台管理员`).setDefault(''),
        notify: BncrCreateSchema.number().setTitle('登录通知次数').setDescription(`设置机器人下线后通知其他平台管理员的通知次数`).setDefault(20),
    }).setTitle('基本设置').setDefault({}),
    friend: BncrCreateSchema.object({
        accept: BncrCreateSchema.boolean().setTitle('自动同意好友申请').setDescription(`设置后自动同意微信好友申请`).setDefault(true),
        hello: BncrCreateSchema.string().setTitle('好友验证消息').setDescription(`设置后需要验证消息后才会自动同意好友`).setDefault(''),
        autoReply: BncrCreateSchema.string().setTitle('通过好友后自动发送的消息').setDescription(`留空则不回复`).setDefault(''),
    }).setTitle('好友相关').setDefault({}),
    rooms: BncrCreateSchema.array(BncrCreateSchema.object({
        enable: BncrCreateSchema.boolean().setTitle('启用').setDescription('是否启用').setDefault(true),
        rule: BncrCreateSchema.object({
            joinIds: BncrCreateSchema.string().setTitle('进群监控').setDescription(`当有人进群后触发消息监控的群，多个用,隔开`).setDefault(""),
            joinMsg: BncrCreateSchema.string().setTitle('进群提示').setDescription(`当有人进群后触发消息，“\\n”换行`).setDefault("欢迎加入大家庭~"),
        }),
    })).setTitle('群聊相关').setDefault([])
});

/* 配置管理器 */
const ConfigDB = new BncrPluginConfig(jsonSchema);
/* 重置通知计次 */
let tzco = 0;
let tzzz = 0;
module.exports = async () => {
    /* 读取用户配置 */
    await ConfigDB.get();
    /* 如果用户未配置,userConfig则为空对象{} */
    if (!Object.keys(ConfigDB.userConfig).length) {
        sysMethod.startOutLogs('未配置wechaty适配器,退出.');
        return;
    }
    if (!ConfigDB.userConfig.basic?.enable) return sysMethod.startOutLogs('未启用wechaty 退出.');
    const robotName = ConfigDB.userConfig.basic.name || 'wechaty';
    const accept = ConfigDB.userConfig.friend.accept;
    const hello = ConfigDB.userConfig.friend.hello || '';
    const autoReply = ConfigDB.userConfig.friend.autoReply || '';
    const notifyco = ConfigDB.userConfig.basic.notify || 20;
    const notifyway = ConfigDB.userConfig.basic.route;

    /** 定时器 */
    let timeoutID = setTimeout(() => {
        throw new Error('wechaty登录超时,放弃加载该适配器');
    }, 2 * 1000 * 60);
    let wx = new Adapter('wechaty');
    /* 补全依赖 */
    await sysMethod.testModule(['wechaty', 'wechaty-plugin-contrib'], { install: true });
    const { WechatyBuilder, types, log } = require('wechaty');
    log.level('error')
    const { QRCodeTerminal } = require('wechaty-plugin-contrib');
    const { FileBox } = require('file-box')
    const bot = WechatyBuilder.build({
        name: robotName
    });

    // /* 注入发送消息方法 */
    wx.reply = async function (replyInfo, sendRes = '') {
        try {
            let namenew = Buffer.from(replyInfo.userId, 'hex').toString('utf-8');
            let contact = '';
            if (namenew) {
                if (namenew.includes('<||>')) {
                    let namenews = namenew.split('<||>');
                    contact = await bot.Contact.find({ alias: namenews[1] });
                } else {
                    contact = await bot.Contact.find({ name: namenew });
                }
            }
            const room = replyInfo.groupId != "0" ? await bot.Room.find({ topic: Buffer.from(replyInfo.groupId, 'hex').toString('utf-8') }) : null;
            if (replyInfo.type === 'text') {
                if (room) {
                    sendRes = contact ? await room.say("\n" + replyInfo.msg, contact) : await room.say(replyInfo.msg)
                }
                else {
                    sendRes = await contact.say(replyInfo.msg);
                }
            }
            else if (['image', 'video'].includes(replyInfo.type)) {
                const file = FileBox.fromUrl(replyInfo.path);
                file['_name'] += replyInfo.type == 'image' ? '.png' : '.mp4';
                sendRes = room ? await room.say(file) : await contact.say(file);
                if (replyInfo.msg) {
                    if (room) {
                        contact ? await room.say("\n" + replyInfo.msg, contact) : await room.say(replyInfo.msg);
                    } else {
                        await contact.say(replyInfo.msg);
                    }
                }
            }
            return sendRes ? sendRes.id : '0';
        } catch (e) {
            log.error('wechaty：发送消息失败', e);
        }
    };
    wx.push = async function (replyInfo, send = '') {
        return this.reply(replyInfo);
    };

    bot.on('scan', (qrcode, status) => {
        sysMethod.startOutLogs(`wechaty: 正在登录，${status}\nhttps://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`);
        if (!tzco) {
            tzco = 0;
        }
        let notifyways = '';
        if (notifyway) {
            notifyways = notifyway.split(",");
        }
        const notify = notifyways || 'all';
        sysMethod.startOutLogs('wechaty扫码通知-平台：' + notify);
        if (status == 2) {
            tzco = tzco + 1;
            if (tzco <= notifyco) {
                try {
                    sysMethod.pushAdmin({
                        platform: notifyways || [],
                        msg: `wechaty登录: https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`,
                    });
                    sysMethod.startOutLogs('wechaty扫码通知-计次：' + tzco);
                } catch (e) {
                    tzco = tzco - 1;
                    // 发送失败
                }
            } else {
                if (tzzz == 0) {
                    try {
                        sysMethod.pushAdmin({
                            platform: notifyways || [],
                            msg: `wechaty登录消息发送超过指定次数，请进入ssh扫码登录或重启无界后等待重新发送扫码链接后登录`,
                        });
                        tzzz = 1;
                    } catch (e) {
                        // 发送失败
                    }
                }

            }
        }
        if (status == 3) {
          tzco = 0;
          tzzz = 0;
            try {
                sysMethod.pushAdmin({
                    platform: notifyways || [],
                    msg: `wechaty扫码成功，请在手机端确认登录`,
                });
            } catch (e) {
                // 发送失败
            }
        }
    });

    bot.on('login', (user) => {
        sysMethod.startOutLogs(`wechaty：${user} 登录成功`);
        tzco = 0;
        tzzz = 0;
        wxname = user.payload.name;
        setname(wxname);
        async function setname(wxname) {
            const wxDB = new BncrDB('wechaty');
            const dbname = await wxDB.get("botname");
            if (wxname) {
               if (dbname !== wxname) {
                    await wxDB.set("botname", wxname);
                    sysMethod.startOutLogs(`wechaty：botname<${wxname}> 更新成功`);
                }
            }
        }
    });

    bot.on('logout', (user) => {
        sysMethod.startOutLogs(`wechaty：${user} 下线了`);
    });

    bot.on("room-join", async (room, inviteeList, invite) => {
        log.warn(`wechaty：收到群员进群事件`);
        await room.sync();
        const topic = await room.topic();
        const roomId = Buffer.from(topic, 'utf-8').toString('hex');
        const rooms = ConfigDB.userConfig.rooms.filter(o => o.enable) || [];
        for (const group of rooms) {
            const joinIds = group.rule.joinIds?.split(",") || [];
            const joinMsg = group.rule.joinMsg || '欢迎加入大家庭~';
            if ((joinIds.indexOf(roomId) != -1) && joinMsg) {
                await room.say(`${joinMsg.replaceAll('\\n', '\n')}`);
            }
        }
    });

    // 邀请进群
    bot.on("room-invite", async (roomInvitation) => {
        log.warn(`wechaty：收到邀请机器人进群事件`);
    });

    bot.on("room-topic", async (room, newTopic, oldTopic, changer) => {
        log.warn(`wechaty：收到群聊名称修改事件`);
        await room.sync();
        //todo：同步修改监听或回复的群id
    });

    bot.on('friendship', async friendship => {
        log.warn("wechaty：收到微信好友申请事件");
        try {
            if (friendship.type() === types.Friendship.Receive && (friendship.hello() === hello || hello == "") && accept) {
                await friendship.accept();
                const contact = friendship.contact();
                await contact.sync();
                await new Promise((resolve) => setTimeout(resolve, 1000));
                autoReply && await contact.say(autoReply);
            }
        } catch (e) { }
    });

    /* 心跳，防止掉线 [貌似没啥用，暂时屏蔽，后续观察]
    bot.on('heartbeat', async data => {
        let nbec = 0;
        if (bot.logonoff()) {
            try {
                const contact = await bot.Contact.find({ name: "文件传输助手" });
                await contact.say("[爱心]");
                nbec = 0;
            } catch (e) {
                nbec = nbec + 1;
                sysMethod.startOutLogs('wechaty：心跳同步出错 ', nbec);
                if (nbec > 3) {
                    sysMethod.startOutLogs('wechaty：心跳同步出错，尝试重启');
                    await bot.stop();
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    await bot.start();
                }
            }
        } else {
            // sysMethod.startOutLogs('wechaty：机器人下线了，停止同步心跳');
        }
    });
    */

    bot.on('error', async (error) => {
        if (error.message.includes('Network error')) {
            sysMethod.startOutLogs('wechaty：网络连接错误，尝试重启');
            await bot.stop();
            await new Promise((resolve) => setTimeout(resolve, 5000));
            await bot.start();
        }
    });

    bot.on('message', async message => {
        try {
            const contact = message.talker();
            if (contact.self()) return; // 屏蔽自己的消息
            const type = message.type();
            // 屏蔽非文本消息
            if (type != 7) {
                sysMethod.startOutLogs(`wechaty收到暂不支持的消息:type{${type}}|toString{${message.toString()}}`);
                return;
            }
            const room = message.room();
            let topic = ''
            if (room) {
                !room.payload.topic && await room.sync();
                topic = await room.topic();
            }
            const msg = message.text();
            const alias = await contact.alias();
            let name = '';
            if (alias) {
                name = contact.name() + '<||>' + alias;
            } else {
                name = contact.name();
            }
            let msgInfo = {
                userId: Buffer.from(name, 'utf-8').toString('hex') || '',
                userName: name || '',
                groupId: topic ? Buffer.from(topic, 'utf-8').toString('hex') : '0',
                groupName: topic,
                msg: msg || '',
                msgId: message.payload.id || '',
            };
            // sysMethod.startOutLogs(msgInfo);
            wx.receive(msgInfo);
        } catch (e) {
            log.error('wechaty接收器报错:', e);
        }
    });

    bot.use(QRCodeTerminal({ small: true }))
    bot.start().catch(e => sysMethod.startOutLogs(e));

    clearTimeout(timeoutID);
    return wx;
};
