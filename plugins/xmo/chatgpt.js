/**
 * @author Merrick
 * @name chatgpt
 * @origin xmo
 * @version 1.1.6
 * @description ChatGpt聊天，适配无界3.0
 * @team xmo
 * @rule ^(aichatgpt|aidraw) ([\s\S]+)$
 * @rule ^(aichatgpt)$
 * @admin false
 * @public true
 * @priority 99999
 * @classification ["插件"]
 * @disable false
 * @systemVersion >=:3.0.0
 * @authentication true
 */

/* 
基于sumuen大佬的插件修改，主要是适配了2.0界面，按自己的使用习惯进行了一些调整，原插件在这里https://github.com/sumuen/Bncr_plugin/blob/main/Bncr_ChatGPT.js
需要ApiKey，没有的可以看看这个项目https://github.com/aurora-develop/aurora

v1.0.1 修复了QQ和微信平台在编辑模式下不能正常回复的bug
v1.0.2 跟进大佬修改了调用chatgpt模块，用got发送请求（虽然我不懂但是我会复制粘贴）
v1.0.3 因为前期搭建的项目有问题，调试的时候找不到原因，干脆把代码重新梳理了一遍，具体改动如下：
       1. 修改api的调用方式，采用ChatGPT API官方文档里的方式调用，去除了原作者大量的错误处理代码，大幅度精简了代码
       2. 添加画图功能，设定需要单独配置画图的各项参数，方便用户的不同需求
       3. 修改HumanTG的编辑回复功能，可以支持各种回复类型（前提是适配器支持）
       注意：这个版本最主要是加入了画图功能，如果不需要画图也可以不更新，因为新的调用方式我没有深入测试，不确定比原作者的got方式更好，更新的话需要同步更新prompts.json文件
v1.0.4 适配无界3.0      

todo（其实是我想做不会做，大佬带我~~~~~）
1.用更优雅的方式实现HumanTG的编辑回复和直接回复的切换
2.选择预设角色的时候可以把Prompt直接显示出来，方便调整（下拉列表框和文本框联动）
3.添加画图功能（大佬的代码已经实现了，我没有4.0的ApiKey，无法测试）✔
*/

/** Code Encryption Block[be188605b2af9d5e9f0e7db22a9634fc212a7ad0a1e72494f09b567ed405599e3a6969c7bfc1217e57a59f2120e0f9542850a3d41954a72effbd7a1d5c4eab4bf188beb4f3e3dbec38f4ae588c4f37080b06085c349e7e725519765f0d138b461a28ed42fe7e883b0eb70234cde01738624108424084077d17630ced0cb199a8171e6aaf17cf64933c3ef4c8b1e11daadde35f592c013bf37ee4537a95dd3a7c2b22416cf55052d6073c6cc14edab78009a388351d452c06f44272ae84fb6586c8ed5b4667bf2859ed80006e6f9917c97962b44b4a62fa01dddef3e2a2930d71e9755cb394163dcf128776391432d9525a7969cd380d0c6d88bae4bbbee3038b10122f82953c1c9fa62366e3c1d6170f2ced4177eaec63c5a149e730c86b5de4f29c2a714d0d11abe211c90d954904b82551d27a18b3fde5e9fbb601e53835a0097e3169f1925726c1cb16b835c2e3f83ac46f82b1297bf9c9aa3d0fa10cd692ef82c6d3cb9cf4b0d8464b60387e98bf98b25fb58efbe0cd3c1f810472f4c82b2e79c1ca9a8d7c3c90ce8b30af216434185db87dcb0226a72e91ffbfa3f1b28e4459620794e7d1f78ab736f2a3d7b7f9211e65502fbe59ab72b2b74b121648eac744182b876e6260875b24445f9f6a8cbbc4c9f1af4e1041e3a53643fa9baf97a3e17b3c60b91ccacd3c1162163a15d69923c6bded45258971353c3608d10bb638fda2f26623e9149b22c640580464555872331f70a5248f0b11b9e034b2f09d3bd55bb2f89c345fed47288f6e9029f0e653bcb2145326353cae3898545f3cdedf38bf0b3d3f1d21e0c51f85a0e0aea30a2cc3f253e52b8965977d48bb7dd957f91c8ad68b8ff993445a1dd216305a3b411580a21ed1d590403db80463b776a0527067f93bafaef7679572f32ab4f40add490e5dedb9513220366a23ff4b7fb92f3fda99a03c9bd77b8be22322307c74b7b090abe6669f9e4bb1c9243fae9448657d2c4e18a015755cc2670c369879b1d273a73c8ced660692389ebced6fc5bf32a89fa03671bc7f6fd4c5122ec4774be2cfe503fef48ab5c1f8d77d46eeb283371aa7f635942d42f4e33ad10cb4423e3ccfcbb7b1c3a4c7bf19fb3392d239d5ee731fa9f2ae3c2ec098735463336ee399a1a4d72261bd2a8cda33aa9d1f86f8e27273bdcdc14d46178f9e0aad699ffab98ea9f989b26e74a71b8c47ad0655c2dfa8e5908d554efb032baa07ed53250d9e3c9fdb96b131a38f0979cb9cb64e0ed886499304e3164f176912dd724d19047732d0f5928dedb160a89fe02a4f433dea84210dd4332044a2b553e09b4539832fe8f9dd3ae375a86d05c7d6314264f64ba0a0232c0ee30bfffc38637feda50f39570de0e14ba2793ebf09dbb1a9df8c9dab6a649829a186ad5bfedfee4ff2614986286dbbe94134ada3db906a9ca95e8b0abdef6e73b3871e72725b836e007a59cbcf7dc95abc0ff08961561ff5cd853a7238df560295ec03c6e06d2c5de798e816d8754db325fc1726ac9ff4446276f119badd99651da447a48fa918e34ee48360b4297ee6cd62b49a5d4c719caed946425e4da286f2058debaa7f3a97d096fdf846e4f2ee31bfa5062bf7362e6e30f1ad9dc23246ec45be6a484a8ef6a4824564798f96b1c68c1a29aece97662d9f34cad1ea437811253fc5f30df3b47c9d19543d3ee615e2395db10a0fab44bcfbba45fbd8ff0e4485c174353063da13ec83567f1dd0790504e1c315f6c09248027210f28d3ea95836b7971d90bb94151a47c7e3feaaecaaf3021ebd0fe50d6b92afa4bd56b7ad0c8e4acce26fc7ff342c8f5cdd7bc933e22ebcfe95f66cbef06f5f8a3272cefaa6defcabb5f190895bba5fbcf32fc46b13639fc1263f9a1754695ebbe791145df6b868dc01f96cb35a59af959179e20853714b711172992e5476c798b8a472d3cc405c1ece0e3381b70d6f5bb50e180e8834a5f13ea787bc2448983b08c5c5fe944123cd48958c8da2c043e7d42933eb86c6d49bba52dfa32180e64740c93b1e5c283be01736422da08d2920bf55b3dcfcb74e0587e75e9d7d782e1687b230ec000620555bd21dc60a2fd508c9bdd5200f3aee201385a862380176fcd63bc8d76666c5363ccadbc62b58c4ef988d40080379e2b81799f102e4846134d29d916431ce8b08b85cc8e324a23df40f0517bb62f52adf14de2f5cd6b03335bc213a95eca3ab9d77af236be985808c55c9fade4a13b77c8c92b0bffd48f5fdb9d82e4dea2591fa3a705381e300a81f074b358c8d9f980e33b57a346f62675748f598f7d9d6365388ee1d58c4c335b91ea2e87b25b0f2316097debb458c133362453ec0b08fbfd6559d2f27166996d73adb3ca0f3724e3bc248966f25457d652cd8711d474aca37c15ddc4f83d895b2c89e820a49aa80d0cf99943f0e671789baa9af4b1c3b95af2b6c555ed15db4cd7e57305341f8efaeff0a12616482f8456765c1e4df43eb81eae2a9759d08af546f1aac83dc2114cd4519b2fb1a3346fcd056131fb74d812b9acc16f61d162b98f6daca95d28b7a9d094b37f619f8e03bffc79373dfad61dc66360f637a5b831145f1cf5b94c8d5668dd3a832bd974efd5e16569e41a67e357631ea3430c9970535aa49223a442d94edcef08dbb575d5505d3a8de7329503cb2daf841b3421ad91f7dd48e7f718b71dbfa74693a609f21292bda7822b03c625151c2a164633c34e2cfbbb101137acab09fb03dafb635026cbcc624812d95a13d0f879715fafda3e0f29ec849223b6215afc995668d2bdeedb77deed6ef9609b1dc181c4b45d37a6804875d00141d32b05ef120e6a4f396b64ebd3e53a1551bc076a098079d15601181acec9b6ae7579b929450f7728e48b5d7c76166d313fae16d73f046e44f7aceeb48cbd7d847c561488e69fa6113b93ab8ac54daf9f0dd511899e0cf2bd04c650bf5ce0611b3bc34d8e9b9b4df7d0fdc264d52c771655d8faba23b9769af8e9b72d8df0255af61d4527492cc4484259d70fae25a3ab37c17308e4dde9def80edfb8189d744ad643aab7b87fb308929cc90962edce0417cfe86e59c62a105004c5a9f264784cb11fcb03118a897d7ddc1e42674c9b32f5f6d4175e7a775a642e684a751679359b03d5b4786b2149b719f4898873abf060e38fc498bcc5fe36c70617771471bba0fc4ebeb36a46058eae33aa6890dada4c979694be89055f9c7e844528be87606c89492841b01d90fdaac47a7e5de8a099958d380a7568b1ccc84455bc4768527c6021a150d303048d9d81e624d031cdda52dd900a6880008a6ddfa45ab717fe75b98809dbe3e6c5e15acf6ac34f5022f99cdfc02bba352c5bf027854b04e5716dd7ff828eb210f23956e38d2ed339fb42a07ad153d4999e209edb5e3d72a1bc893b7dbfe0d8bf1d4bd540730323bd3dd1294ee8092f7e128e22b2d8f3629df671e648d7724b5129dcaf65ebad26b81d5459308623a4589f98b775eb9fdcf0c25338c76f9bac4ed8fe9c0b985830a59f95be58fdfab54394f20fcfdf2982b523666a813f404a0b7ff556aebb7408b59485b12fb311aed2e481ed1b1bc533c6bdbd39aa444bf6534d1e1b1ab2f089e1205b45daa21bd5593e6acf0cce11b443202c54da343a9e43c31622419197583505aa6f5265ea7116544223fcfea7198ae1995e7dae2d1519e5ca3ff1e58751ac8f68dda0157ea717cf8b0093e4eeaf385a24283efa65bae872d6434536236f67f3ab727329716e40c4be3a1b2a5d81df7778784fffbea69e77cb7b8991b848b8a33c0a8b611e40c04d6805803921d823e8a0cb162b3cd60ec65af375090cc0ac03b7abfbb909c182b6ab650e6b3ed28e482b5fcb7f4457f625b82987c2b34b92427392c91ed2e0d6a3201302756c1d89edf6aefdf4476d660fa845a58a1c9dc6840e446722728f0437ae67c124339e49e0f24a34011474f3d72b2fd320cc9f6e23290d1b68e5c7a00d97145ac852a0efd02bddb7a65b1e39ada51e7329c9689889500fe0cad08911167a6c5c3d9cca7c9e42bcd98f08c082053b9f95cb0184b3bf01942c8129c66ef63ccbaf197cd19d5b07d819caf60772bd9d4db88ac11d40176a2ee5bff2c991071ab09cc526d4aeb03b3765e6cafee1d664bdc36cf7a8212c30165109e585ada40cae1dbe16a2cdd4e9c0dd87579f4535d3d5d1fb1537861ee80a2f974a053220835c799946859dfc35baa143c9b39c6c48778315e932211a582b387cef93820e7c8cb6ce371cf9eda132231e2a29fa130c4395cf9fa7efa0503921da6278c47b18f837263554813a4a6db328fd832e1f1aa63b130c32413a21bf4c3aab51c527c0425345c4a4e25d004758dbd6cb99bf0871587ac32dc9ff6dfd46451b547bea3af1d9531963e5849c3ba682aaf073f0cf2136f21bc78be8e3accceff21113f4daf2fbf0d7fb03739491929123b32188828d21a95c85d6d6f30bc1b11db316510a1f28e382e4e645c546f6667ffc0d40fea294a688f19c3691b34a5a7483e5b0152d9383d2b36855cbd866118ac1c6943114564351f4bd3cc9794ed411c6a1c2e080032b3da8ecbb3b1a57b7a60150e7f4ad1fa59ddcf3ca8ad4b188ba863f455adc0b30111c4a15878a9a18a345929cef94b97fb5e72cc3116914ec9fc6fa1e32d83d8725967379824dcfc118fe0ecf83ef28d10ede231916fc6e2511f0abc2ff39cbc45eb9ecb4836db1a2e728ff14a5710f51f71261685ba5a6b666f1e0f8da605368d9ae23bf052d9f1e393f3e145f16337d1063d4e0477734809ee8307190eb91dbb64df14d0af3722581598ce7b08d4aa85c0e87fda88e515a6dae63ca0909ea3afd057e497f4b063c447ebe3f67715ad6d8b56a8012f1edc4833bcf0bdc16aee302435eb254de8df3fff7e695de184e447207a0eddfb7d7993dbd97ec309df124006849616109621d5884277421baa5105e48e819c7f55c4a9410238597dddbdc57e5aac54a76bb702de8d32f034e8116d924e1c9f9329421f43959b1c5a1eb85084901f54842c99d3aec9a5a5416ba40a23e39816b5361eed906e1597df7eb85b97d08bd63b78ff7c82278060b7efa81e84d2b293f59558d435de952ed048e4c2bde0482bedca7e06b44eac303aaa4f5cfe2ea4c01c81d1f13db797f8ee84b05a0d4d57eb2ceae90d481b18ac73f2cb9858276f311abef89cf4de08a146d090ee8852542d0ff560b2270347e14e4fc92a8465d890c1116c56217dd89bdc5aaec3370e3a04e7b2559921fd9bbe27edcfcceadb1f26f7b348f558748f33c553df9f31331fa1b531f873f107e438aab72c7f1d60928bf9a3a1ed052837137d9baaeff185f6a2bc5d2ca5d3a5e549d67690e12e6a642819251fa4ebebbdb05fa9d35a7212790dd7b5ba4d37a331fb2054ce68021ce3f0f8bd899d8b98278668ab9b63456cc81053f97b0b67704395954bb5cd36dd4b18866ff19f19f7d0218bb395a07234ec51a41f24906c328818363d7a1f6a06be6c5995ab8dbb8e4961293eb17fbc2baa9445b9a1f96cca2bfe8f2156e0e8c844d11b92461bf01b94dc0a2f1e69434259c683dc40922607b2ad13d24a578066ee59f970de7b9765fdfb66c6e0fcfa07a0b8d692b1410eddc9796252e26ee3aba389d1067655d1cca49f7bddc9fdcc174c2e7d324ddf1aa24b6cea47952ab65bf0b7eae7de190dfb089ec2a19cf006efe29d7d01f886b85be9b4ac2823cc2b5bfa1bf90a74dec86076038dfe8f31e732a535ee7a0fddcff141099fff7ad97affd125b2b57f135baace75e25a1eab14a294ffd3ffb9b835c84b04da4b171539dec120cdfc09ff5505012d6f7dc926c10a2dff3ed4ad2e27dec6428af9a81ad5d57a465b620755ce9ede25f4799f60c1f9fdaa08fdf0c93dfa0dccea77ab071647df74ee685e36a7596f7b0b2e9ac1e865339596ef25888113fb7d6f20a143044ff42c85a0269ec4c724238d45cba038d6a2211d7f86744e6fe7eec22ba7064707739c0c4f12e02bc289dd66b4eabe1cc3c4778859d9101e28778cc798da3823fc64483b04e53f3b91354784ee751caa5a025c211bfcb55f850f4b6218c4693b2e9b9d5adb4c2da43374503be90883ae25e8002f7c089f8f67860f23136f7082f75cfce76a9cd7f00802b1aa250b073a587a0e143ab5ada61d168b3d655c78a3756a28efe229c84657905a14b6d75b4593f1bacf8e1582f1973f241fa394ee2932a8c3faf1aec536ec517b0286dc9f3c086279c1d097bd1636865c906a597b07ffaff90026517a1617ab9b26c7e6e18c936b82d2a1b67ef83fd724268ce3af352db8d4d05ff917ec7a0d51e667b873c3585535fb79848d5359c4572ab6c3bf4f148673282009c6c28b038dd516d88258094c40638bd3671dd80828ba8470ed58581d6a1cbd319d7b63b3d1fac912c155b8e35e0c7cb17ff4aa964ce51169a4214db59fb014e84a899aa92b5749c968f6203f84f0cb6997e24ee9db0bb7898e85a0c119580d44324c1ba34efba47be0c5e2b3264d565d64e284343ce08b6da93872659e07da1c94611fd63a9accc614731d973b3162e845a46314796e986a0ab79cbc34e8492c457f8df83650e7b6a52578503042562d012e501851bbfd1f6ec8b94ceba56cb1eeec03c431d6a5d06968ddf6087872a20a94d2bd7d78b82f3fcefcd289522d0a9c6736f487d25c96133c5a596c97ec1fdbaae70561f39d0ba23edbc9c0294f4b3cddcdf93152edad61a858c9114230c4d1067ae179543006922d3f6eeff2c0a9e6bc58c313a2c027d7f7cab4b0028f43eda7fd8d0adf08b18fe67b2aeaac77f3736b42970a288dbc00c66a964237932187e902f6db2fd32f2ddf3e361d3a567ab432fe4643fd68b6848a03767cca6531863abdea0325dc9a22e59aa542822706c1b7eb963d470cbe5f20201f1a3d6a7bfec24fdec8354d324e15b8e19bb66f8300f44e43dcbed064bea0fdfbb6c584dad8bdcd47557a5188e09eb5d1b58b6d676dff53f1f3b628b64c3e0b892b33c64b1905b7f17b36f46c15e35fae312578dc27f152659f54e8426538a356a44849f3b2b804ed04b3e9e53b963559e0e82d14ef4810342f83b444870b2751fdcb7eed70dad02c2b3ec7b180e5c6b2d62eefc57b9b8261122e53ee5b30dc73428e66a5b07fd488a6514a7a3bdf8718f569f2cb309a0481e8ffd4b3d048ea51e61a5ef5d7f31b86f6225a6834e4ca180465777a6c3abfa014a09b451d288ee6dd8da02566ea9f277580d454a539cc89fba14f2ae296bfbc9be1cffb34840d1869d35fd4763a9b25c689b6a48d4adfe61f8861e79f573f6bcdc7b9908a3a678349de816f3612e0755d4ad84d42ea7102630d6b0090fa0c7d9a3b1962a4f7e671fe95328869a1a1cc880d23d52a98ebed71f6399c69b0807156fb28715f5bbeac59435dba057fc907183d9e7310c31523fa29bcc87bf51003ecf355a907af4e4a20f723a79d97dc558874307c0c064c628147593d738018248e6580c621ce93753b881783fd9f43ce1703fc7e74bcc4fd217dd2b05d49edcdc509c6ac85155bf93df11f34fccffaa231c2e8df4127514ffc165b0ac14486ad3332b3afd9cfe7f57cdb24a38afdf62e14f3ca6f4cf26076d9a790bdcce6d8fbbab40c9ac9eb43995d34e90d0fa3cf65047ca947b0a179db470d30016cb66b9b859e026826c31461013024b88b297c2d8ddf3ea52163a581ff067309c10ffd999aabacc0a2f96023663fe553dbc0a3df5da53c8df1833322e8daaed21d88910a32f104b1c4e518199baa7c50f822550d4bd03c2808d197fb8f4eed05b50a219bfda27a8499bb6aaae0dbea187048d5e4b9c115a43531673ba8996ece3b6930d1a6e976e16f29aef470d0f0372d1d9bb71179040f968a96762863093212aa92474671eaa3744750356a32556afec5d14d8009074ec14bb20840fa86e784e736711696deae9c5751287e93af2360e2fec14162a15e3e8e79eb05efbf6ef5bfcdc966d9df4552ff854185237f2794926902b8783b134a63f8b5d59e9fa1b8db7f87821368b53668b378e4f526b83c472e6b540d4920e1f9e4de5823e93d1f3009a1953b3259038452e2cb329a106fd4e48c512033d2bdf92a72131514e76b9c86c0022399a340b500c88ef5d10ab78f6c857443090ac0386094f0ac4c160d27e46b0d2217f54ab3c0a4c65175bd338bc18d893b59c0c5a4222ef2966ebc3081edb28fce1b145bf0848bea5232fc01c00d6515d30a49ebddaaace8e53bc0dedfc14952ef1c4462da2db74ad8b5270db74c2ae51d6f33feda2c8a0952bf0a33393a4eb62a5a6e8f82777818061cbc97a75b9876813bc522038d9b90e6f215d6d6e06d0ed308725ce4e96d0099cf73ce6bbc89736ac855aff5df2946213c077590fe0281d3a4b6b7a3138b97d89c4482e189316338eac7eb0295f23641f2c49786a7542535ef7f78187e60613d601a6e6708492ce16d3f4cbaea7b653b0dddf3abcd757d0d004f7e66a5a4db5bb76612feabcecf39515f5cc6631b76f5a9dbde9fb8f07ca79901c0adb0bde35024a682894d3916f5acc9f478804e50eee48c90137234605d848432cddf967ecf8749d4176862aa3f675f9d3e31dada0b71bf4395a71e02d6492a9979b2e6e63c6c350791e6b6abffd7c0651b48578e131a92f2abe4e882bb175d60a78376b447ae8ee8a9155aa8b708f155565d8bc4fa3c0d2f8d49a5732d4a97fe46d6bdc1cf005c48cf813c6425d4d85c5404aef23035cc34ba8b8923402bfb258b24765303bb10ac5a814c8c2ff98450f4d7a050f2d6e977cb14d572415f956203826149de12182a970a3a884112c834d7c320920c62c7a072e8182f761546e614aa52020135950971747aaf670ca79dbfa5bdc3c65458d696a100d795300dfcebea2a5801afc6cd4304519e0364779d0e97f179cdd22cd305d9b543a98162154e46893a69f23e50daabd94ad36431c0fcb333c3b01e49c0a72ced55bfa0ed4b37a4fcad341f3c13a33d493251298e369e8a9f4953a74774c9ab20ccdb0511bd2ae5cb6f3c3b2e5c5810c0b1ca170466a16a367721f5e45c35aa2f] */