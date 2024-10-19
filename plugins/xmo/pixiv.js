/**
 * @name pixiv
 * @author 啊屁
 * @team xmo
 * @version 1.0.0
 * @description 随机获取一组涩涩纸片人
 * @rule ^zpr$
 * @admin true
 * @public true
 * @priority 50
 * @classification ["插件"]
 */

// 常量定义
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 常量定义
const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.42"
};
const dataPath = path.join(__dirname, 'data', 'zpr');

// JSON Schema 定义
const jsonSchema = BncrCreateSchema.object({
  r18: BncrCreateSchema.boolean()
    .setTitle('R18内容')
    .setDescription('是否允许获取R18内容')
    .setDefault(false),
  pageHost: BncrCreateSchema.string()
    .setTitle('反代页面')
    .setDescription('配置反代页面地址')
    .setDefault('i.yuki.sh'),
});

const ConfigDB = new BncrPluginConfig(jsonSchema);

// 获取图片
async function getResult(sender, r18 = 0, tag = "", axiosConfig = {}, pageHost = defaultPageHost) {
    const size = "regular";
    let description = "出错了，没有纸片人看了。";
    let setuList = [];

    try {
        const { data } = await axios.get(`https://api.lolicon.app/setu/v2?num=1&r18=${r18}&tag=${tag}&size=${size}&size=original&proxy=${pageHost}&excludeAI=true`, { 
            headers, 
            timeout: 10000,
            ...axiosConfig 
        });
        const result = data.data;

        for (let i = 0; i < result.length; i++) {
            const { urls, pid, title, width, height } = result[i];
            const imgURL = urls[size];
            const originalURL = urls.original;

            // 添加图片到 setuList
            setuList.push({
                type: 'photo',
                media: imgURL,
                caption: `**${title}**\nPID:[${pid}](https://www.pixiv.net/artworks/${pid})\n查看原图:[点击查看](${originalURL})\n原图尺寸:${width}x${height}`,
                has_spoiler: r18 === 1
            });
        }
    } catch (error) {
        console.error(error);
        description = "连接二次元大门出错。。。";
    }

    return { setuList, description };
}

module.exports = async (sender) => {
    try {
        // 确保必要的包已安装
        await sysMethod.testModule(['axios'], { install: true });

        await ConfigDB.get();
        if (!Object.keys(ConfigDB.userConfig).length) {
            return await sender.reply('请先发送"修改zpr配置"，或者前往前端web"插件配置"来完成插件首次配置');
        }

        const config = ConfigDB.userConfig;
        let r18 = config.r18 ? 1 : 0;
        let tag = "";
        let pageHost = config.pageHost || defaultPageHost;

        const msg = sender.getMsg();
        const params = msg.split(" ");
        
        if (params.includes("r18")) {
            r18 = 1;
        }
        if (params.length > 1) {
            tag = params.slice(1).join(" ").trim();
        }

        await sender.reply("正在前往二次元。。。");

        const { setuList, description } = await getResult(sender, r18, tag, {}, pageHost);
        if (setuList.length === 0) {
            return await sender.reply(description);
        }
        
        await sender.reply("传送中。。。");

        // 根据平台处理图片发送
        if (['tgBot', 'HumanTG'].includes(sender.getFrom())) {
            // 发送本地文件的绝对路径
            for (const item of setuList) {
                await sender.reply({
                    type: 'image',
                    path: item.media,
                    msg: item.caption,
                });
            }
        } else {
            // 发送网络图片
            for (const item of setuList) {
                await sender.reply({
                    type: 'image',
                    path: item.media,
                    msg: item.caption,
                });
            }
        }
    } catch (error) {
        console.error(error);  // 记录错误日志
        await sender.reply(`发生错误：\n${error}`);
    } finally {
        if (fs.existsSync(dataPath)) {
            fs.rmdirSync(dataPath, { recursive: true });
        }
    }
};