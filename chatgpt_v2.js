/**
 * @author YuanKK
 * @name chatgpt_v2
 * @team 红灯区
 * @version 1.0
 * @description ChatGPT v2 触发命令aigv2
 * @rule ^aigptv2([\s\S]+)$
 * @rule ^([\s\S]+)aigptv2$
 * @rule ^aigptv2清空上下文$
 * @admin false
 * @priority 9999
 * @disable false
 * @service false
 * @public false
 * @classification ["GPTI"]
 */
/**
 * 2024/04/29： gpti版本升级为2.1.3
 * 2024/07/04： 修改触发命令为aigptv2，防止误触发
 */

/* 配置构造器 */
const jsonSchema = BncrCreateSchema.object({
    markdown: BncrCreateSchema.boolean().setTitle('MarkDown开关').setDefault(false),
    withoutMarkdown: BncrCreateSchema.array(BncrCreateSchema.string()).setTitle('不使用Markdown的适配器').setDescription(`qq、wechaty等`).setDefault(['qq', 'wechaty']),
});

/* 完成细化后 BncrPluginConfig传递该jsonSchema */
/* 初始化插件默认配置信息 */
const ConfigDB = new BncrPluginConfig(jsonSchema);

const log = require('log4js').getLogger('XMOChatGPTV2');
log.level = 'INFO';

module.exports = async s => {
    /* 补全依赖 */
    await sysMethod.testModule(['gpti'], { install: true });
    const { gpt } = require("gpti");

    await ConfigDB.get();
    if (!Object.keys(ConfigDB.userConfig).length) {
        s.reply('请先发送"修改无界配置",或者前往前端web"插件配置"来完成插件首次配置');
        return '';
    }
    // MarkDown
    let markdown = ConfigDB.userConfig.markdown;
    // 不使用Markdown的适配器
    let withoutMarkdown = ConfigDB.userConfig.withoutMarkdown;
    const GPTV2Storage = new BncrDB('ChatGPTV2');
    let platform = s.getFrom(),
        userId = s.getUserId(),
        content = s.param(1);
    markdown = withoutMarkdown.includes(platform)  ? false: markdown;
    if (content === '清空上下文') {
        await GPTV2Storage.del(`${platform}:${userId}`);
        return s.reply('清空上下文成功...');
    }
    /* 获取上下文 */
    let messagesSave = await GPTV2Storage.get(`${platform}:${userId}`) || [];
    messagesSave.push({ role: 'user', content: content });
    log.info(messagesSave);
    gpt.v2({
        messages: messagesSave,
        markdown: markdown,
        stream: false
    },  async (error, result) => {
        if (error) {
            log.error(error);
            s.reply('遇到了一些问题，请反馈控制台日志给开发者');
            return '';
        } else {
            if (result.code === 200) {
                let responseMessage = result.gpt;
                if (responseMessage) {
                    s.reply({
                        type: markdown ? 'html' : 'text',
                        msg: responseMessage
                    });
                    // 不保存上下文
                    // await GPTV2Storage.set(`${platform}:${userId}`, [...messagesSave, { role: 'assistant', content: responseMessage }]);
                }
                return '';
            } else {
                s.reply('远程服务器返回错误代码 ' + result.code + ' ，请等待开发者修复');
                return '';
            }
        }
    });
};
