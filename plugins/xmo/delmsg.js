/**
 * @author xmo
 * @name delmsg
 * @team xmo
 * @version 0.0.4
 * @description 拓展人行tg撤回消息功能
 * @create_at 2024-11-08 19:27:24
 * @rule ^(\.tgde) ([0-9]+) ([0-9]+)$
 * @rule ^(\.tgde) ([0-9]+)$
 * @priority 1000
 * @admin true
 * @public true
 * @disable false
 * @classification []
 */

module.exports = async s => {
  if (s.getFrom() !== 'HumanTG' || !(await s.isAdmin())) return;
  const userId = +s.getUserId();
  const groupId = +s.getGroupId();
  const friendId = +s.msgInfo.friendId;
  const ChatID = +groupId || +friendId || +userId;
  let num = +s.param(2);
  let delay = +s.param(3) || 1;
  let info = '';
  info= await s.Bridge.getUserMsgId(ChatID, s.getUserId(), num + 1);
  info.length && s.delMsg(...info, { wait: delay });
  return;
};
