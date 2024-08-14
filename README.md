**名称** botchat.js

**描述** 基于无界Dswang的自动回复插件修改

**依赖** aigptv2.js

**说明** 判断是否需要Ai回复，如果需要使用重定向插件调用aigptv2.js回复。
     
   >关键词：

    1、群组内任何人发言包含关键词，调用关键词信息回复，如果@机器人则Ai回复
    2、关键词可设置仅特定群组生效。
        botreply 关键词|@|群id[多个用|连接，可省略、省略将所有有权限群响应] 回复内容
    3、相关命令
        botreply 关键词 回复内容 //向数据库中添加新的回复
        botreply list //数据库中关键词列表
        botreply empty //清空所有关键词
        botreply upkey 旧key|>>|新key //更新key，回复内容不变

   >回复内容：

    1、回复内容开头为"@remsg@"，执行命令重定向
    2、其他直接回复
    3、相关命令
       botreply treply 旧回复中需要替换的词|tt|新回复中需要替换为的词 //替换旧回复中的特定词
    4、回复内容中的相关功能词
       @remsg@ 回复内容开头出现此词将执行重定向命令
       @chatcom@ 回复内容中出现此词将替换为适配器中填写的关键词一般配合执行重定向命令使用
       @type@ 示例【image@type@图片的URL@type@相关文本描述】 //指定消息类型回复，可发送图片视频
       |@@| 示例【botreply 关键词 回复内容1|@@|回复内容2】 //同一关键词多条回复用|@@|隔开
       

**示例**

     关键词回复，响应所有群
     > botreply 测试 这是一条测试消息
     
     关键词回复并重定向调用任意插件内容回复（示例中调用60s插件），响应|@|之后的指定群，其他群不响应
     > botreply 新闻|@|群id|群id2 @remsg@60s
     
     关键词回复并重定向调用Ai回复，响应|@|之后的指定群，其他群不响应
     > botreply 绿萝|@|群id|群id2 @remsg@aigitv2 用简短的语言介绍下家里养绿萝有什么好处





**名称** botaudit.js

**描述** 基于无界Dswang的自动回复插件修改

**依赖** aigptv2.js

**说明** 按关键词设置的黑名单模式。
     
   >关键词：

    1、群组内任何人发言包含关键词，调用数据库回复。
    2、关键词可设置可选黑名单模式或白名单模式，如果设置白名单就删除设置的黑名单，存在黑名单时不响应白名单。
        botaudit 关键词 屏蔽时回复内容，默静模式输入@noreply@。
        botaudit 关键词@sfrom@@black@ 平台 //平台黑名单
        botaudit 关键词@sfrom@@white@ 平台 //平台白名单
        botaudit 关键词@group@@black@ 群id //群组黑名单
        botaudit 关键词@group@@white@ 群id //群组白名单
        botaudit 关键词@user@@black@ 用户id //用户黑名单
        botaudit 关键词@user@@white@ 用户id //用户白名单
    3、相关命令
        botreply 关键词 回复内容 //向数据库中添加新的回复
        botreply list //数据库中关键词列表
        botreply empty //清空所有关键词
        botreply upkey 旧key|>>|新key //更新key，回复内容不变

   >回复内容：

    1、回复内容开头为"@remsg@"，执行命令重定向
    2、其他直接回复
    3、相关命令
       botreply treply 旧回复中需要替换的词|tt|新回复中需要替换为的词 //替换旧回复中的特定词
    4、回复内容中的相关功能词
       @remsg@ 回复内容开头出现此词将执行重定向命令
       @chatcom@ 回复内容中出现此词将替换为适配器中填写的关键词一般配合执行重定向命令使用
       @type@ 示例【image@type@图片的URL@type@相关文本描述】 //指定消息类型回复，可发送图片视频
       |@@| 示例【botreply 关键词 回复内容1|@@|回复内容2】 //同一关键词多条回复用|@@|隔开
       

**示例**

     关键词time，默静屏蔽wechaty平台响应
     > botaudit time @noreply@
     > botaudit time@sfrom@@black@ wechaty
     
     关键词“天气”，默静屏蔽指定群组响应
     > botaudit 天气 @noreply@
     > botaudit 天气@group@@black@ 群id1|群id2
     
     关键词“60s”，默静屏蔽指定人响应
     > botaudit 60s @noreply@
     > botaudit 60s@user@@black@ 用户id1|用户id2
