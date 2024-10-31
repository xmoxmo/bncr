/**
 * @author xmo
 * @name skits
 * @team xmo
 * @version 0.0.3
 * @description 全网短剧查询
 * @rule ^短剧查询 ([\s\S]+)$
 * @admin false
 * @priority 0
 * @classification ["插件"]
 * @public true
 * @disable false
 */
module.exports = async s => {
  const userword = s.param(1);
  const apiurl = 'https://api.kuleu.com/api/action?text=';
  // console.log(`${apiurl}${userword}`);
  const request = require('request');
  const options = {
    'method': 'GET',
    'url': `${apiurl}${encodeURIComponent(userword)}`,
    'headers': {
    }
  };
  request(options, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      const sbody = JSON.parse(response.body);
      if (sbody.code != 200) {
        console.log(sbody);
        s.reply('接口出错');
        return;
      }
      // console.log(sbody);
      const infos = sbody.data || [];
      let videoinfo = `>>>短剧查询<<<`;
      for (const info of infos) {
        videoinfo = `${videoinfo}\n\n名称: ${info.name}\n事件: ${info.viewlink}\n事件: ${info.addtime}`
      }
      // console.log(hiday);
      s.reply(videoinfo);
    }
  });
};