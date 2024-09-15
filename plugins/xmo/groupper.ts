/**
 * @author xmo
 * @name groupper
 * @team xmo
 * @version 1.0.1
 * @description 测试
 * @rule ^(监听|屏蔽|回复|禁言)群 ([^ \n]+) ([^ \n]+)$
 * @admin true
 * @public true
 * @priority 0
 * @disable false
 * @classification ["插件"]
 * @disable false
*/

//插件入口
module.exports = async (s: Sender) => {
  let ctype = s.param(1);
  let sfrom = s.param(2);
  let sgroupid = s.param(3);
  // s.reply(`${ctype}\n${sfrom}\n${sgroupid}`)
  switch (ctype) {
    case '监听':
      if (!(await s.isAdmin())) return;
      if (!sgroupid || sgroupid === '0') return s.reply('非群组禁用');
      //异步设置
      new BncrDB('groupWhitelist').set(`${sfrom}:${sgroupid}`, true);
      return s.reply('ok');
      break;
    case '屏蔽':
      if (!(await s.isAdmin())) return;
      if (!sgroupid || sgroupid === '0') return s.reply('非群组禁用');
      //异步设置
      new BncrDB('groupWhitelist').del(`${sfrom}:${sgroupid}`);
      return s.reply('ok');
      break;
    case '禁言':
      if (!(await s.isAdmin())) return;
      if (!sgroupid || sgroupid === '0') return s.reply('非群组禁用');
      //同步设置
      const tempValue = await new BncrDB('noReplylist').set<boolean>(`${sfrom}:${sgroupid}`, true);
      return s.reply(tempValue ? 'ok' : '失败');
      break;
    case '回复':
      if (!(await s.isAdmin())) return;
      if (!sgroupid || sgroupid === '0') return s.reply('非群组禁用');
      const tempValues = await new BncrDB('noReplylist').set<boolean>(`${sfrom}:${sgroupid}`, false);
      return s.reply(tempValues ? 'ok' : '失败');
      break;
    default:
      break;
  }
};