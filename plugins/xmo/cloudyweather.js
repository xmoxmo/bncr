/**
 * @author xmo
 * @name cloudyweather
 * @team xmo
 * @version 0.0.3
 * @description 彩云查天气
 * @rule ^彩云天气 ([\s\S]+)$
 * @admin false
 * @priority 0
 * @classification ["插件"]
 * @public true
 * @disable false
 */

const jsonSchema = BncrCreateSchema.object({
  basic: BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('开关').setDescription(`开启将启用彩云查天气`).setDefault(true),
    gaoapikey: BncrCreateSchema.string().setTitle('高德Web服务Key').setDescription(`前往“https://lbs.amap.com/”申请高德应用Web服务的Key`).setDefault(''),
    caiapikey: BncrCreateSchema.string().setTitle('彩云天气Token').setDescription(`前往“https://platform.caiyunapp.com/login”申请彩云天气的Token`).setDefault(''),
  }).setTitle('基本设置').setDefault({})
});
const ConfigDB = new BncrPluginConfig(jsonSchema);

module.exports = async s => {
  if (!Object.keys(ConfigDB.userConfig).length) {
    s.reply('请前往前端web"插件配置"来完成插件首次配置。');
    return 'next';
  }
  const enable = ConfigDB.userConfig.basic.enable;
  let gaodekey = '';
  let caiyuntoken = '';
  if (enable) {
    gaodekey = ConfigDB.userConfig.basic.gaoapikey || '';
    caiyuntoken = ConfigDB.userConfig.basic.caiapikey || '';
  }
  if (!gaodekey || !caiyuntoken) {
    if (!gaodekey && !caiyuntoken) {
      console.log(`请先到配置文件填写“高德Web服务Key”和“彩云天气Token”`);
    } else {
      if (!gaodekey) {
        console.log(`请先到配置文件填写“高德Web服务Key”`);
      }
      if (!caiyuntoken) {
        console.log(`请先到配置文件填写“彩云天气Token”`);
      }
    }
    return;
  }
  const userword = s.param(1);
  const ndate = sysMethod.getTime('yyyy-MM-dd');
  let apiurl = '';
  let sbody = '';

  // 高德API
  let locinfo = {
    formatted_address: '',
    adcode: '',
    location: '',
  };
  apiurl = `https://restapi.amap.com/v3/geocode/geo?key=${gaodekey}&address=${encodeURIComponent(userword)}`;
  sbody = await get(apiurl);
  if (sbody.infocode != "10000") {
    console.log(`高德API接口异常：\n${sbody}`);
  } else {
    locinfo.formatted_address = sbody.geocodes[0].formatted_address;
    locinfo.adcode = sbody.geocodes[0].adcode;
    locinfo.location = sbody.geocodes[0].location;
  }
  // console.log(locinfo);

  if (!locinfo.location) {
    console.log(`转换地址为经纬度失败，插件即将退出`);
    return;
  }

  // 彩云天气API
  apiurl = `https://api.caiyunapp.com/v2.6/${caiyuntoken}/${locinfo.location}/weather?alert=true&dailysteps=1&hourlysteps=24`
  sbody = await get(apiurl);
  // console.log(sbody);
  if (sbody.status != "ok") {
    console.log(`彩云天气API接口异常：\n${sbody}`);
  } else {
    const wcode = ['CLEAR_DAY','CLEAR_NIGHT','PARTLY_CLOUDY_DAY','PARTLY_CLOUDY_NIGHT','CLOUDY','LIGHT_HAZE','MODERATE_HAZE','HEAVY_HAZE','LIGHT_RAIN','MODERATE_RAIN','HEAVY_RAIN','STORM_RAIN','FOG','LIGHT_SNOW','MODERATE_SNOW','HEAVY_SNOW','STORM_SNOW','DUST','SAND','WIND'];
    const wdesc = ['晴（白天）','晴（夜间）','多云（白天）','多云（夜间）','阴','轻度雾霾','中度雾霾','重度雾霾','小雨','中雨','大雨','暴雨','雾','小雪','中雪','大雪','暴雪','浮尘','沙尘','大风'];
    const fxcode = [11.26,33.76,56.26,78.76,101.26,123.76,146.26,168.76,191.26,213.76,236.26,258.76,281.26,303.76,326.26,348.76,360];
    const fxdesc = ['北','北东北','东北','东东北','东','东东南','东南','南东南','南','南西南','西南','西西南','西','西西北','西北','北西北','北'];
    let fxi = 0;
    for (const f of fxcode) {
      if (sbody.result.realtime.wind.direction < f) {
        break;
      }
      fxi = fxi + 1;
    }
    const flcode = [1,6,12,20,29,39,50,62,75,89,103,118,134,150,167,184,202,300];
    const fldesc = ['0 级-无风','1 级-微风徐徐','2 级-清风','3 级-树叶摇摆','4 级-树枝摇动','5 级-风力强劲','6 级-风力强劲','7 级-风力超强','8 级-狂风大作','9 级-狂风呼啸','10 级-暴风毁树','11 级-暴风毁树','12 级-飓风','13 级-台风','14 级-强台风','15 级-强台风','16 级-超强台风','17 级-超强台风'];
    let fli = 0;
    for (const f of flcode) {
      if (sbody.result.realtime.wind.speed < f) {
        break;
      }
      fli = fli + 1;
    }
    let sformat = `>>>彩云天气<<<
  
位置：${locinfo.formatted_address}
坐标：${locinfo.location}
日期：${ndate}
天气：${wdesc[wcode.indexOf(sbody.result.realtime.skycon)]}
温度：${sbody.result.realtime.temperature}℃
体感：${sbody.result.realtime.apparent_temperature}℃
湿度：${sbody.result.realtime.humidity * 100}%
气压：${sbody.result.realtime.pressure}帕
风向：${fxdesc[fxi]}
风力：${fldesc[fli]}
能见度：${sbody.result.realtime.visibility}千米
空气指数：${sbody.result.realtime.air_quality.aqi.chn}
空气质量：${sbody.result.realtime.air_quality.description.chn}
PM2.5：${sbody.result.realtime.air_quality.pm25}
紫外线：${sbody.result.realtime.life_index.ultraviolet.desc}
舒适度：${sbody.result.realtime.life_index.comfort.desc}
预报：${sbody.result.forecast_keypoint}`;
    if (sbody.result.alert) {
      sformat = `${sformat}
预警：[${sbody.result.alert.content.status}]${sbody.result.alert.content.description}`;
    }
    // console.log(sformat);
    s.reply(sformat);
  }

  // get
  async function get(url) {
    const request = require('request');
    const options = {
      'method': 'GET',
      'url': `${apiurl}`,
      'headers': {
      }
    };
    return new Promise(async (cb) => {
      request(options, function (error, response) {
        if (error) throw new Error(error);
        let sbody = '';
        try {
          sbody = JSON.parse(response.body);
        } catch (e) {
          // 不处理
        }
        cb(sbody);
      });
    });
  }
};