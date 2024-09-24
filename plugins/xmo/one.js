/**
 * @author xmo
 * @name one
 * @team xmo
 * @version 0.0.2
 * @description 一言 鸡汤 心灵鸡汤
 * @rule ^(一言|鸡汤|心灵鸡汤)$
 * @admin false
 * @priority 0
 * @classification ["插件"]
 * @public true
 * @disable false
 */
module.exports = async s => {
  const apiurl = 'https://v1.hitokoto.cn/';
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
      // console.log(sbody);
      s.reply(sbody.hitokoto);
    }
  });
};