/**
 * @author xmo
 * @name maskinfo
 * @team xmo
 * @version 0.0.4
 * @description 伪装消息 (平台) (群组) (好友) (用户) (内容) 
 * @rule ^伪装消息\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+([\s\S]+)$
 * @rule ^伪装消息\s+(\S+)\s+(\S+)\s+(\S+)\s+([\s\S]+)$
 * @admin true
 * @priority 0
 * @classification ["插件"]
 * @public true
 * @disable false
 */
module.exports = async s => {
  if (!await s.isAdmin()) {
    s.reply('你没有权限执行此操作');
    return;
  }
  const sfromme = s.getFrom();
  let sfrom = s.param(1);
  if (sfrom == 0) {
    sfrom = sfromme;
  }
  let groupid = s.param(2);
  if (groupid == 0) {
    groupid = '0';
  }
  let friendid = s.param(3);
  if (friendid == 0) {
    friendid = '0';
  }
  let userid = s.param(4);
  let msg = s.param(5);
  if (!s.param(5)) {
    friendid = '0';
    userid = s.param(3);
    msg = s.param(4);
  }
  if (userid == 0) {
    userid = '0';
  }
  if (groupid == 0 && friendid == 0) {
    s.reply('伪装消息群组和好友不能同时为空');
    return;
  }
  if (userid == 0) {
    s.reply('伪装消息用户不能为空');
    return;
  }
  if (!msg) {
    s.reply('伪装消息内容不能为空');
    return;
  }
  const msgInfo = {
    type: 'text',
    msg: msg,
    userId: userid || '0',
    groupId: groupid || '0',
    friendId: friendid || '0',
  }
  // console.log(msgInfo);
  sysMethod.Adapters(msgInfo, sfrom, 'inlinemask', msgInfo);
};