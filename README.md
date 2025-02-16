****
**温馨提示**

    1、重定向配置有误，会造成循环重定向，本插件会自动拦截疑似循环的重定向，但可能不包含所有情况。
    2、后端调用ai回复的插件，可能存在两个机器人自动聊天情况。
       > 无特殊配置机器人不会主动发送消息，但人形可用机器人身份发送消息，对方若也是人形或机器人同时也有自动回复，将进行无终止的聊天。此时建议屏蔽人形的聊天模式。
  
****
**名称** botreply.js

**描述** 基于无界Dswang的自动回复插件修改

**依赖** gptiAI.js

**说明** 判断是否需要Ai回复，如果需要使用重定向插件调用aigptv2.js回复。
****
   >关键词：

    1、群组内任何人发言包含关键词，调用关键词信息回复，如果@机器人则Ai回复
    2、关键词可设置仅特定群组生效。
        botreply 关键词|@|群id[多个用@ones@连接，可省略、省略将所有有权限群响应] 回复内容
        botreply @keyblacklist@ 关键词 //关键词黑名单
        botreply @groupblacklist@ 群id //群黑名单
        botreply @groupwhitelist@ 群id //群白名单
        botreply @userblacklist@ 用户id //用户黑名单
        botreply @userwhitelist@ 用户id //用户白名单
        botreply @oneblacklist@ 用户id //私聊黑名单
        botreply @onewhitelist@ 用户id //私聊白名单
    3、相关命令
        botreply 关键词 回复内容 //向数据库中添加新的回复
        botreply list //数据库中关键词列表
        botreply empty //清空所有关键词
        botreply upkey 旧key|>>|新key //更新key，回复内容不变
    4、特别说明
        关键词内不应该有空格，若必须设置半角空格用“%20”全角空格用“%E3%80%80”代替进行设置

   >回复内容：

    1、回复内容开头为"@remsg@"，执行命令重定向
    2、其他直接回复
    3、相关命令
       botreply treply 旧回复中需要替换的词|tt|新回复中需要替换为的词 //替换旧回复中的特定词
    4、回复内容中的相关功能词
       @remsg@ 回复内容开头出现此词将执行重定向命令
       @mask@ 回复内容开头出现此词将执行伪装消息
       @admincmd@ 回复内容开头出现此词将执行管理命令
       @adminpush@ 回复内容开头出现此词将执行管理推送
       @userpush@ 回复内容开头出现此词将执行用户推送
       @chatcom@ 回复内容中出现此词将替换为适配器中填写的关键词一般配合执行重定向命令使用
       @ones@ 通用分隔符
       @type@ 示例【image@type@图片的URL@type@相关文本描述】 //指定消息类型回复，可发送图片视频
       |@@| 示例【botreply 关键词 回复内容1|@@|回复内容2】 //同一关键词多条回复用|@@|隔开
       @sfrom@ 平台
       @groupid@ 群组id
       @userid@ 用户id
       @admin@ 管理员权限
       @msgself@ 消息内容
       @msgid@ 消息id
       @groupname@ 群组名称
       @username@ 用户名称
       @nowdate@ 当前日期
       @nowtime@ 当前时间
       @userkeyword@ 消息内容(剔除模糊匹配词)
       @nodel@ 持久消息(不受自动删除的约束)
       @delayN@ 延时发送秒数(N改为整数)
       @recalldelayN@ 延时撤回消息的秒数(N改为整数)
       @requrl,url,get/post,back,body@ 请求网页获取返回的数据[back为返回的节点；多节点使用“|”分割；多层使用“&”分割]
       @reqext:back@ 请求网页返回的多节点存储定义
       data[]back1.back2:txt1.txt2:type.back 数组读取规范,配合requrl读取返回数组使用，back的读取方式的一种
       {[at]} 字符“@”的转义替代符
       

**示例**

     关键词回复，响应所有群
     > botreply 测试 这是一条测试消息
     
     关键词回复并重定向调用任意插件内容回复（示例中调用60s插件），响应|@|之后的指定群，其他群不响应
     > botreply 新闻|@|群id@ones@群id2 @remsg@60s
     
     关键词回复并重定向调用Ai回复，响应|@|之后的指定群，其他群不响应
     > botreply 绿萝|@|群id@ones@群id2 @remsg@aigitv2 用简短的语言介绍下家里养绿萝有什么好处

     管理员获取wechaty用户或群组id
     > botreply wxid:* @remsg@eval Buffer.from('@userkeyword@', 'utf-8').toString('hex')@admin@
       使用：wxid:文件传输助手 //发送“wxid:微信名或群组名”，中间用英文“:”隔开
     > botreply wxna:* @remsg@eval Buffer.from('@userkeyword@', 'hex').toString('utf-8')@admin@
       使用：wxna:e69687e4bbb6e4bca0e8be93e58aa9e6898b //发送“wxid:微信id”，中间用英文“:”隔开

     获取当前消息相关id信息
     > botreply ids @sfrom@/@groupid@@@userid@

     获取api并返回结果-文本
     > botreply 脑筋急转弯 @requrl,https://api.dragonlongzhu.cn/api/yl_njjzw.php,get@

     获取api并返回结果-文本，传参
     > botreply 星座运势%20* @requrl,https://api.dragonlongzhu.cn/api/xzys.php?msg=@userkeyword@,get@

     获取api并返回结果-json，传参
     > botreoly 文本转拼音%20* @requrl,https://www.hhlqilongzhu.cn/api/pinyin/pinyin.php?text=@userkeyword@,get,text_noe@

     获取api并返回结果-图片
     > botreply 黑丝 image@type@http://api.yujn.cn/api/heisi.php
     > botreply 百丝 image@type@http://api.yujn.cn/api/baisi.php

     获取api并返回结果-图文
     > botreply 抽签 @requrl,https://api.lolimi.cn/API/chouq/api.php,get,data&draw|data&image|data&format|data&annotate|data&explain|data&details|data&source@image@type@@reqext:data&image@@type@签名: @reqext:data&draw@\n\n签号: @reqext:data&format@\n\n注解: @reqext:data&annotate@\n\n解签: @reqext:data&explain@\n\n详情: @reqext:data&details@\n\n出处: @reqext:data&source@

     获取api并返回数组结果-文本
     > botreply 新闻文本 @requrl,https://api.yujn.cn/api/new.php?count=10,get,data&[]time.title.brief:时间.标题.详情@

     获取api并返回数组结果-图文
     > botreply 新闻图文 @requrl,https://api.yujn.cn/api/new.php?count=10,get,data&[]time.title.brief:时间.标题.详情:image.image:{[at]}deldelay30{[at]}@

     获取api并返回结果-视频
     > botreply 新小姐姐 video@type@http://api.yujn.cn/api/zzxjj.php?type=video



****
**名称** botaudit.js

**描述** 基于无界Dswang的自动回复插件修改

**依赖** gptiAI.js

**说明** 按关键词设置的黑名单模式。
****
   >关键词：

    1、群组内任何人发言包含关键词，调用数据库回复。
    2、关键词可设置可选黑名单模式或白名单模式，如果设置白名单就删除设置的黑名单，存在黑名单时不响应白名单。
        botaudit 关键词 屏蔽时回复内容，默静模式输入@noreply@
        botaudit 关键词@sfrom@@black@ 平台 //平台黑名单
        botaudit 关键词@sfrom@@white@ 平台 //平台白名单
        botaudit 关键词@group@@black@ 群id //群组黑名单
        botaudit 关键词@group@@white@ 群id //群组白名单
        botaudit 关键词@one@@black@ 群id //私聊黑名单
        botaudit 关键词@one@@white@ 群id //私聊白名单
        botaudit 关键词@user@@black@ 用户id //用户黑名单
        botaudit 关键词@user@@white@ 用户id //用户白名单
        botaudit @botnoreplyuserid@ 用户id //屏蔽不响应屏蔽时回复内容的用户id
    3、相关命令
        botaudit 关键词 回复内容 //向数据库中添加新的回复
        botaudit list //数据库中关键词列表
        botaudit empty //清空所有关键词
        botaudit upkey 旧key|>>|新key //更新key，回复内容不变
    4、特别说明
        关键词内不应该有空格，若必须设置半角空格用“%20”全角空格用“%E3%80%80”代替进行设置

   >回复内容：

    1、回复内容开头为"@remsg@"，执行命令重定向
    2、相关命令
       botaudit treply 旧回复中需要替换的词|tt|新回复中需要替换为的词 //替换旧回复中的特定词
    3、回复内容中的相关功能词
       @remsg@ 回复内容开头出现此词将执行重定向命令
       @chatcom@ 回复内容中出现此词将替换为适配器中填写的关键词一般配合执行重定向命令使用
       @type@ 示例【image@type@图片的URL@type@相关文本描述】 //指定消息类型回复，可发送图片视频
       |@@| 示例【botreply 关键词 回复内容1|@@|回复内容2】 //同一关键词多条回复用|@@|隔开
       @sfrom@ 平台
       @groupid@ 群组id
       @userid@ 用户id
       @msgself@ 消息内容
       @msgid@ 消息id
       @groupname@ 群组名称
       @username@ 用户名称
       

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
****
