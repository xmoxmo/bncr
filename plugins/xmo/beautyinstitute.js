/**
 * @author 烟雨
 * @name beautyinstitute
 * @team xmo
 * @origin 烟雨阁
 * @version 1.0.6
 * @description 美女研究所
 * @rule ^(mvyjs)$
 * @admin flase
 * @public true
 * @priority 9999
 * @disable false
 * @service false
 * @classification ["插件"]
 */

const request = require('request');

module.exports = async s => {
    //you code
    url = 'http://jiuli.xiaoapi.cn/i/img/mnyjs.php'

    request(url, async (err, res, body) => {
        if (err) { return console.log(err); }
        //把body转换成json对象
        var obj = JSON.parse(body);
        //用正则表达式去掉标题中的百度搜索
        const str = obj.title;
        const regex = / - 百度搜索\[久黎API\]更多精彩内容不容错过/;
        const result = str.replace(regex, '');
        //打印标题
        //console.log(result);
        //发文字
        await s.reply(result);
        //打印图片链接
        for (var i = 0; i < obj.img.length; i++) {
            //console.log(obj.img[i]);
            //发图片
            await s.reply({
                type: 'image',
                /* 发送网络图片 */
                path: obj.img[i],
                // msg: jpgURL,
            });
        }
    })
    return;
}