/**
 * @author xmo
 * @name wnl
 * @team xmo
 * @version 0.0.3
 * @description 万年历 或 万年历 2024-09-16
 * @rule ^(万年历)$
 * @rule ^(万年历) ([^ \n]+)$
 * @admin false
 * @priority 0
 * @classification ["插件"]
 * @public true
 * @disable false
 */
module.exports = async s => {
  const moment = require('moment');
  const apiurl = 'https://www.36jxs.com/api/Commonweal/almanac?sun=';
  const nowdate = moment().format('YYYY-MM-DD');
  let handledate ='';
  let userdate = s.param(2);
  handledate = userdate;
  if (!handledate) {
    handledate = nowdate;
  }
  if (!isdate(handledate)) {
    s.reply('日期输入有误，退出');
    return '';
  }
  const request = require('request');
  const options = {
    method: 'GET',
    url: `${apiurl}${handledate}`,
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; U; Linux x86_64; zh-CN; rv:1.9.2.10) Gecko/20100922 Ubuntu/10.10 (maverick) Firefox/3.6.10",
    },
  };
  // console.log(`${apiurl}${handledate}`);
  request(options, function (error, response) {
    if (error) {
      console.log(error);
    }
    // console.log(response.body);
    const sbody = JSON.parse(response.body);
    // console.log(sbody.msg);
    if (sbody.msg === '成功获取') {
      const data = sbody.data;
      // console.log(data);
      const gldate = moment(data.GregorianDateTime, 'YYYY-M-D').format('YYYY-MM-DD');
      const nldate = moment(data.LunarDateTime, 'YYYY-M-D').format('YYYY-MM-DD');
      const sformat =`>>>>>>>>>万年历<<<<<<<<<

公历日期：${gldate}
农历日期：${nldate}
农历节日：${data.LJie}
公历节日：${data.GJie}
宜：${data.Yi}
忌：${data.Ji}
神位：${data.ShenWei}
胎神：${data.Taishen}
冲煞：${data.Chong}
岁煞：${data.SuiSha}
五行甲子：${data.WuxingJiazi}
纳音五行年：${data.WuxingNaYear}
纳音五行月：${data.WuxingNaMonth}
纳音五行日：${data.WuxingNaDay}
农历月名称：${data.MoonName}
星宿吉凶：${data.XingEast}
星座：${data.XingWest}
彭祖百忌：${data.PengZu}
黄历12值神建：${data.JianShen}
天干地支年：${data.TianGanDiZhiYear}
天干地支月：${data.TianGanDiZhiMonth}
天干地支日：${data.TianGanDiZhiDay}
农历月名称：${data.LMonthName}
生肖：${data.LYear}
农历月：${data.LMonth}
农历日：${data.LDay}
农历节气的名称：${data.SolarTermName}`;
      s.reply(sformat);
    }
  });
  function isdate(date) {
    const IsDateValid = (...val) => !Number.isNaN(new Date(...val).valueOf());
    return IsDateValid(date);
  }
};