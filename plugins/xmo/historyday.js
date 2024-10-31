/**
 * @author xmo
 * @name historyday
 * @team xmo
 * @version 0.0.2
 * @description 历史上的今天
 * @rule ^(历史上的今天)$
 * @admin false
 * @priority 0
 * @classification ["插件"]
 * @public true
 * @disable false
 */
module.exports = async s => {
  const apiurl = 'https://api.kuleu.com/api/lsjt';
  const request = require('request');
  const options = {
    'method': 'GET',
    'url': `${apiurl}`,
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
      const events = sbody.result || [];
      let hiday = `>>>历史上的今天<<<`;
      for (const event of events) {
        hiday = `${hiday}\n\n时间: ${event.date}\n事件: ${event.title}`
      }
      // console.log(hiday);
      s.reply(hiday);
    }
  });
};