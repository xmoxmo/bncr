/**
 * @author xmo
 * @name cronjobplus
 * @team xmo
 * @version 0.0.6
 * @description 定时任务Plus。
 * @rule ^(初始化定时任务)$
 * @admin true
 * @priority 100
 * @classification ["cronjobplus"]
 * @public true
 * @disable false
 */

const jsonSchema = BncrCreateSchema.object({
  basic: BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('总开关').setDescription(`是否启用`).setDefault(false),
  }).setTitle('基本设置').setDefault({}),
  maskmsg: BncrCreateSchema.array(BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('启用').setDescription('是否启用').setDefault(true),
    rule: BncrCreateSchema.object({
      name: BncrCreateSchema.string().setTitle('定时名称').setDescription(`输入定时名称`).setDefault(""),
      cron: BncrCreateSchema.string().setTitle('定时规则').setDescription(`输入定时规则，例如：“0 0 8 * * *”`).setDefault("0 0 8 * * *"),
      form: BncrCreateSchema.string().setTitle('伪装平台').setDescription(`输入要伪装的平台`).setDefault(""),
      userid: BncrCreateSchema.string().setTitle('伪装用户').setDescription(`输入要伪装的用户ID`).setDefault(''),
      groupid: BncrCreateSchema.string().setTitle('伪装群组').setDescription(`输入要伪装的群组ID`).setDefault(''),
      msg: BncrCreateSchema.string().setTitle('命令内容').setDescription(`输入命令或内容`).setDefault(""),
    }),
  })).setTitle('伪装消息').setDefault([]),
  admin: BncrCreateSchema.array(BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('启用').setDescription('是否启用').setDefault(true),
    rule: BncrCreateSchema.object({
      name: BncrCreateSchema.string().setTitle('定时名称').setDescription(`输入定时名称`).setDefault(""),
      cron: BncrCreateSchema.string().setTitle('定时规则').setDescription(`输入定时规则，例如：“0 0 8 * * *”`).setDefault("0 0 8 * * *"),
      msg: BncrCreateSchema.string().setTitle('命令内容').setDescription(`输入命令或内容`).setDefault(""),
    }),
  })).setTitle('管理命令').setDefault([]),
  adminpush: BncrCreateSchema.array(BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('启用').setDescription('是否启用').setDefault(true),
    rule: BncrCreateSchema.object({
      name: BncrCreateSchema.string().setTitle('定时名称').setDescription(`输入定时名称`).setDefault(""),
      cron: BncrCreateSchema.string().setTitle('定时规则').setDescription(`输入定时规则，例如：“0 0 8 * * *”`).setDefault("0 0 8 * * *"),
      form: BncrCreateSchema.string().setTitle('发送平台').setDescription(`输入要发送的平台，多个用“,”分割，留空推送所有平台`).setDefault(""),
      type: BncrCreateSchema.string().setTitle('发送类型').setDescription(`输入要发送类型`).setDefault(""),
      msg: BncrCreateSchema.string().setTitle('发送内容').setDescription(`输入要发送内容，使用“\\n”换行`).setDefault(""),
      path: BncrCreateSchema.string().setTitle('发送路径').setDescription(`输入要发送路径`).setDefault(""),
    }),
  })).setTitle('管理推送').setDefault([]),
  userpush: BncrCreateSchema.array(BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('启用').setDescription('是否启用').setDefault(true),
    rule: BncrCreateSchema.object({
      name: BncrCreateSchema.string().setTitle('定时名称').setDescription(`输入定时名称`).setDefault(""),
      cron: BncrCreateSchema.string().setTitle('定时规则').setDescription(`输入定时规则，例如：“0 0 8 * * *”`).setDefault("0 0 8 * * *"),
      form: BncrCreateSchema.string().setTitle('发送平台').setDescription(`输入要发送的平台`).setDefault(""),
      userid: BncrCreateSchema.string().setTitle('发送用户').setDescription(`输入要发送的用户ID`).setDefault(''),
      groupid: BncrCreateSchema.string().setTitle('发送群组').setDescription(`输入要发送的群组ID`).setDefault(''),
      type: BncrCreateSchema.string().setTitle('发送类型').setDescription(`输入要发送类型`).setDefault(""),
      msg: BncrCreateSchema.string().setTitle('发送内容').setDescription(`输入要发送内容，使用“\\n”换行`).setDefault(""),
      path: BncrCreateSchema.string().setTitle('发送路径').setDescription(`输入要发送路径`).setDefault(""),
    }),
  })).setTitle('用户推送').setDefault([])
});

const ConfigDB = new BncrPluginConfig(jsonSchema);

sysMethod.createStartupCompletionHook('outStartOK', async () => {
  sysMethod.inline('初始化定时任务');
});

module.exports = async s => {
  if (!ConfigDB.userConfig.basic.enable) {
	  return;
	}
	if (!Object.keys(ConfigDB.userConfig).length) {
		sysMethod.startOutLogs('请先发送"修改无界配置",或者前往前端web"插件配置"来完成插件首次配置');
		return;
	}
  if (s.msgInfo.from !== 'system') {
    sysMethod.startOutLogs('设置完成，为了避免定时任务重复注册，重启后生效');
    s.reply('设置完成，为了避免定时任务重复注册，重启后生效');
    return;
  }
  const Config = ConfigDB.userConfig;
  // 伪装消息
  const msgmasks = Config.maskmsg.filter(o => o.enable) || [];
  for (const job of msgmasks) {
    const msg = job.rule.msg || '';
    const name = job.rule.name || msg;
    const cron = job.rule.cron;
    if (!sysMethod.cron.isCron(cron)) {
      sysMethod.startOutLogs(`定时任务Plus:伪装消息{${name}}定时{${cron}}失败`);
      continue;
    }
    const msgInfo = {
      type: 'text',
      msg: msg,
      userId: job.rule.userid || '0',
      groupId: job.rule.groupid || '0',
    }
    const sfrom = job.rule.form;
    sysMethod.cron.newCron(cron, async () => {
      sysMethod.Adapters(msgInfo, sfrom, 'inlinemask', msgInfo);
    });
    sysMethod.startOutLogs(`定时任务Plus:注册伪装消息{${name}}定时{${cron}}完成`);
  }
  // 管理命令
  const admins = Config.admin.filter(o => o.enable) || [];
  for (const job of admins) {
    const cron = job.rule.cron;
    const msg = job.rule.msg || '';
    const name = job.rule.name || msg;
    if (!sysMethod.cron.isCron(cron)) {
      sysMethod.startOutLogs(`定时任务Plus:注册管理命令{${name}}定时{${cron}}失败`);
      continue;
    }
    sysMethod.cron.newCron(cron, async () => {
      sysMethod.inline(msg);
    });
    sysMethod.startOutLogs(`定时任务Plus:注册管理命令{${name}}定时{${cron}}完成`);
  }
  // 管理推送
  const adminpushs = Config.adminpush.filter(o => o.enable) || [];
  for (const job of adminpushs) {
    const cron = job.rule.cron;
    let msg = job.rule.msg;
    const name = job.rule.name || msg;
    if (!sysMethod.cron.isCron(cron)) {
      sysMethod.startOutLogs(`定时任务Plus:注册管理消息{${name}}定时{${cron}}失败`);
      continue;
    }
    const sfrom = job.rule.form;
    let sfroms = '';
    if (sfrom) {
      sfroms = sfrom.split(",");
    }
    sysMethod.cron.newCron(cron, async () => {
      const ndate = sysMethod.getTime('yyyy-MM-dd');
      const ntime = sysMethod.getTime('hh:mm:ss');
      msg = msg.replaceAll('\\n', '\n');
      msg = msg.replaceAll('@date@', ndate);
      msg = msg.replaceAll('@time@', ntime);
      sysMethod.pushAdmin({
        platform: sfroms || [],
        msg: msg,
        type: job.rule.type || 'text',
        path: job.rule.path || '',
      });
    });
    sysMethod.startOutLogs(`定时任务Plus:注册管理消息{${name}}定时{${cron}}完成`);
  }
  // 用户推送
  const userpushs = Config.userpush.filter(o => o.enable) || [];
  for (const job of userpushs) {
    let msg = job.rule.msg || '';
    const name = job.rule.name || msg;
    const cron = job.rule.cron;
    if (!sysMethod.cron.isCron(cron)) {
      sysMethod.startOutLogs(`定时任务Plus:注册用户消息{${name}}定时{${cron}}失败`);
      continue;
    }
    const sfrom = job.rule.form;
    let sfroms = '';
    if (sfrom) {
      sfroms = sfrom.split(",");
    }
    sysMethod.cron.newCron(cron, async () => {
      const ndate = sysMethod.getTime('yyyy-MM-dd');
      const ntime = sysMethod.getTime('hh:mm:ss');
      msg = msg.replaceAll('\\n', '\n');
      msg = msg.replaceAll('@date@', ndate);
      msg = msg.replaceAll('@time@', ntime);
      sysMethod.push({
        platform: sfroms || [],
        groupId: job.rule.groupid,
        userId: job.rule.userid,
        msg: msg,
        type: job.rule.type || 'text',
        path: job.rule.path || '',
      });
    });
    sysMethod.startOutLogs(`定时任务Plus:注册用户消息{${name}}定时{${cron}}完成`);
  }
}
