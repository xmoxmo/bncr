****
**wechatbot端配置** 
****
   >1、拉取docker镜像

    // x86
    docker run -dit \
      --name wechatbot \
      --restart always \
      -v /root/wechatbot:/app \
      -p 12345:12345 \
    xmoxmo/wechat-bot

    // arm64
    docker run -dit \
      --name wechatbot \
      --restart always \
      -v /root/wechatbot:/app \
      -p 12345:12345 \
    xmoxmo/wechat-bot-arm64

   >2、配置机器人管理员

    a 修改挂载路径“/app/config/config.yml”文件owner为自己（管理员）的昵称【若机器人给管理云备注了名字，填写备注】
    b 设置管理员权限后，若要重启docker，向机器人发送“/restart”，请勿从docker直接重启，将会造成数据异常
    c 管理员可控制机器人自己支持的插件和系统命令，详情参考官网介绍：https://gitee.com/ilooli/wechat-bot

   >3、对接无界地址

    a 修改挂载路径“/app/plugin/http/config.yml”文件的webhook地址，改成无界的域名[ip]和端口
    b 修改后机器人可将信息转发给无界

****
**无界端配置** 
****
   >1、安装适配器“wechatbot.js”

   >2、插件配置“wechatbot.js”的上报地址和token

    a 配置上报地址：http://docker的wechatbot的能访问的地址:docker映射的端口
    b 配置token：可自定义与wechatbot端保持一致即可
    c 配置测试网址：http://docker的wechatbot的能访问的地址:docker映射的端口/?token=你的token

   >3、设置无界平台管理员

    a 向机器人私发“我的id”，
    b shh[或其他有管理权限的平台管理员]发送：set wechatbot admin 我的id

   >4、接入后无界的命令都可使用

    a 比如群内的“监听该群”、“回复该群”

****
**加强安全性配置** 
****
   >使用手机登录机器人账号，给管理员任意备注一个名字，则不会出现别人改成你的昵称就有管理权限。

   >如果通讯录中有两个相同昵称的，你也可以给他们备份来区分开

****
**其他说明** 
****
   >为了适配群员入群自定义提示语0.1.5版本重构配置文件，升级到该版本重新配置无界端
