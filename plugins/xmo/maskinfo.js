/**
 * @author xmo
 * @name maskinfo
 * @team xmo
 * @version 0.0.2
 * @description 伪装消息 (平台) (群组) (用户) (内容) 
 * @rule ^伪装消息\s+(\S+)\s+(\S+)\s+(\S+)\s+([\s\S]+)$
 * @admin false
 * @priority 0
 * @classification ["插件"]
 * @public true
 * @disable false
 */
module.exports = async s => {
  const sfromme = s.getFrom();
  let sfrom = s.param(1);
  if (sfrom == 0) {
    sfrom = sfromme;
  }
  let groupid = s.param(2);
  if (groupid == 0) {
    groupid = '0';
  }
  let userid = s.param(3);
  if (userid == 0) {
    userid = '0';
  }
  let msg = s.param(4);
  if (groupid == 0 && userid == 0) {
    s.reply('伪装消息群组和用户不能同时为空');
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
  }
  console.log(msgInfo);
  sysMethod.Adapters(msgInfo, sfrom, 'inlinemask', msgInfo);
};