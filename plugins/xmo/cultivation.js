/**
 * @title 每日一练
 * @create_at 2023-02-17 15:41:25
 * @origin 
 * @create_at 2022-11-19 10:23:27
 * @rule ^(每日一练|每日二练)$
 * @description 🐒这个人很懒什么都没有留下。
 * @author onz3v
 * @version v1.0.1
 * @public false
 * @name cultivation
 * @admin true
 * @team x
 */

module.exports = async s => {
  const userword = s.param(0);
  let api = '';
  if (userword === '每日一练') {
    api = 'https://www.pgxdy.com/api/json.php';
  } else {
    api = 'https://www.xrbsp.com/api/json.php';
  }
  const request = require('request');
  const options = {
    'method': 'GET',
    'url': api,
    'headers': {
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    let sbody = JSON.parse(response.body);
    // console.log(sbody);
    const videoinfo = sbody.list || [];
    // console.log(videoinfo);
    let videoshow = '练习册之' + userword;
    for (const info of videoinfo) {
      videoshow = `${videoshow}\n\n编码：${info.vod_id}\n类型：${info.type_name}\n分类：${info.vod_class}\n名称：${info.vod_name}\n年份：${info.vod_year}\n下载链接：${info.vod_play_url}\n更新时间：${info.vod_time}`;
    }
    s.reply(videoshow + '\n\n请到 << https://m3u8-player.com >> 进行观看')
  });
}