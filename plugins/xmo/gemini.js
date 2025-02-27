/**
 * @author Merrick
 * @name gemini
 * @origin xmo
 * @version 1.0.6
 * @description gemini聊天
 * @team xmo
 * @rule ^(aigeminis|aigeminic|aigeminip)([\s\S]+)$
 * @admin fasle
 * @public true
 * @priority 9999
 * @classification ["插件"]
 * @disable false
 * @systemVersion >=:3.0.0
 * @authentication true
 */

/*
使用方法：打开https://ai.google.dev/ 获取API key并填入配置界面（获取方法请自行搜索）

命令说明：aigeminis是单问答模式，aigeminic是聊天模式，aigeminip是识图模式（目前只能识别图片链接）
         命令+内容就可以触发，有人行的可以直接回复命令。

如后台提示"User location is not supported for the API use"，请尝试调整梯子

v1.0.1 优化代码，增加单问答模式，修改触发命令，界面增加Max Tokens选项
v1.0.0 基于sumuen大佬的插件修改，本人仅修复bug和适配2.0界面
v1.0.2 适配3.0
*/

/** Code Encryption Block[be188605b2af9d5e9f0e7db22a9634fc371b397d02bd0850c5c0c2298f94e73f5b1fc3c963a629f06dba9f13807e40a033536676388c4fbb05232dd23304f3b84ad008a3836b07981fe5bace61f9d6f8603c8bedd6b7d0932b360dd4196c40ed4f66f70216770ef8489278dec925d2ae54699d7c888ab62f68d4b16ac3f9661ca881315be0b7e5b3bed0c2436bd693eaa59904a65d49928d1fddbc937f00b0d4c5f574a65d83f26b8edcf4b4612a0580a6562be112f4e7e97753edb2061fea3d8c50d5e243eb6b42e760216bb93970ef61fa4ce7ac064cc244b0b10caaa1027fddec2b6ee3a306c7571b3466aea296872a8c7af218f8dbf3cdf13cb18b82834670ff733ba238963cec4f1e3d1ccc88145a85d1ae0f72b5040fcf2be3912c4da5f89bc69669c57e925b2e574f766517b08c8ab5a2e2d3eb11167e1772209df17dbd3a01360f29eccec4e7302bee8eecbd087b58b81401cd3d2de2ff06af5fd5cbfe707bed480f133a9971220101d09b43d5b1b3298810465bb31ea9292a85e1e69ecb1626196f491551e5113972edd2ba1b0ee4cafa9d9d6f2f2eb498a861a83056e66a8185491cd6b8359fc9a213569d7bdba9094fcebe93b4821a59acd410018c3d3bb4b2e1fca43dff322771c2d5bace58e55075d7cfcfe0ee0505cfea5463f9fe401f8d0fd117be1a100760f979f2f19e39f31f35ee2c4e86e7814d8b872cf42a48082d8635f4fbe1ff21a68446931374510b97bdad62bcf6723bcd9c07142e661e432c667c2d37d9bbee2de4768b1692dc0c33d99028a9182b291a8749607b7dbfa198c6ea8c25e81aa232310600395bed246713ecf49cc1015363090aaf76e330012331f7f60dcaca6c5f9858b3788e606df8817b8e2870190c62ec1e7d055b06e24d721360950c25bee1aef92030e9ccdfeda4eedbd309d00a3fb29910dae55a7892c733ba20faad77f7f8cfbf50d0fe845ece929b547afc1d0713653c09c9f6c3b38dec123a925d1112eaa9b28ec39a2d9b34d5e194c63c5466e2050ed7f0ea21d8bd8329954106829695be000c7ede3c280b965a3af1f91ab7e36f15f0fee7365b7796d3a702f2757a454ee43dee63d1f68ec372538a3a88909b5b74307eff6369a90902c926611b06de7cc9c574033e6e0a0f67b1cee1de232d27e2cd4cc4a0e1fdd01488fa5dd392aa89c5a800db2d9d1c63bf26f3ad78978bf75727c7c561182e9cb362e8c8ce6bf231b1a6ae91d77c93e0019ced670e951124371c15790fc66f8cbb2c5ab33359096e9328a443328f221f90ffaf5b504ecd85a1327b32aeb8c83551e39a358b061ad2630258a814d31030e026cea3882ff947eb1d9e43376775499c2cc775e746794456b5acf149b1488161165755494d2356cfb1ad98e3118d761eadfa483d3c3088293212fe8ecb62b16c9a39d1e4a8a8f69d6ff5acda12a4c01cc90ede644911bfbfa0803a6a65c2d2dadedf7fc8bc31c236987399442032e2bf0ea74b4cbbf643a261abeb14ed765bd402f641c208b9b25450a121f5f079497500cde03cb68f439cfea2714302fc416cb72730d3d1a4fc4bff180f01b82cd30a96e4a6b52d3417c6d5f93b6aa8a88fd9b20bd7da1304060c4ae3acf2cf06c2307399a847c7da8050424e9af5a15948fd84021f46d7854e5d8760781e5ac58fd263a4563f40d438ddb5eb81a36afa07266088f4c8a3015080f1cf600e748d520d33e90e9ea4f20a343592a59376c8e2b02685af019c0dee16f184844bc99e51d505e2034d41c66377889b9c38f47565a0603ea2367d42391e8603d3924b60581a28b4d7db264bb941f870432a536bb8acc6b7c80942d81ea367303fb4235d2e73e4092de00e76ff7e3f0ef61283cad96ecbec208a5a56054466f52aae00ddadbba2a2cbeb84fa423f372c5ed63de906df1352e79250e67806cc063288ccb44bd2d6e0be22ae57f95126e816c78fd13c1648a01323490be4caff756447a56bc3db3779190e5854063aa6553f1b008266186b6ec30570a12fb979abf2790553f380a0ee7ef5b931edccfd4fa3720856cf67a5ef5b98d71a58ad2ad5b7a535f00646ed692aa0ad59fb50f42ca984667598e267368c810d0ff04e76d254bbd8a61063a12a39e08c1228cd16e8348f00086de124dcb81b5aa341e5d568e7729c3af8a373431c008b8e3de521e3264ec84d71d4edc23c5dd892bc7d1dc113011c266b893cd5082eb0afb3749d40657e0ac19d43438db7a1b5527a0597a35e7e7a52d8110c93293f10ceb601fd9939ad78284ecb5f1c4045dce711f87e86536bc36e626d50944c2308ccdb730217dd98587c2f4c9902af9438b924256777f0e225a402d306e0a4240eac3b219a45f415c697f2fcaedecf9d28d7468f6dcdd836f2339ce89cc62af34e3adfbed4fd43a407424fb5f6e5b5adf95a954f8243cd1431de3fd0cd524d65ae47a220ca93abb69e8ba48128e1b3bbf5d4c788bd79c98633b5d89749114b0d7c340a4708b1bae8793e532c25305911e93145ea7eae1e2036ba097d740607f1d7d9d3dfca4ecfffd4f406bd4f1cd1e60a49e1b397bbee377a5f2a8a9c2b6575ff86fab4bb63ca9318450ef352646ff42dc8eab9fa5847dd0164b5efd2a911813d6279027411b1ae7d590422943ff96d8ed8fc1747d67efd42bf9ecbe1dfc874d369a5c33db94e2bd8c1ea0773a53d2c30f6a898913b2e26bb9bf31713e3ed1bfa174a214151633b269101689d9b5ce1f2ac9734725f882453910b247249d4837cacf2833c3ad4eaefa960091477015cc83d4f86e1cd3857360d2e4579fafb6bfa20f865a6e32a83d98e3ab3633b59963a2dd64c6da09a3fbc53dc95cff5cf4f64e89061779812ee82f80e8692338aa12d384253318cac6f345eb39520bef9846d9d38965b8f3e96429ec627077bd29c8378102aeaa75f62c515d2ed981f5dcc5e5594435ae2ec119b67d57e4770888b5b1dee99626d27b355d261af16a94544bb8b73751ab1659f67a274797338975a1cc7679562ac3d84de8a255b28f6cc2b7d4f9079a7f4b9cb8bc057836e0103af1f613b2e7265038952bf493823a4417997708015a14ec7418b26ae2544254f8c342134ac9c15292379749de6f769b51bfbfd667b4ec7e5ae568299635d8ef102344274bfb0f0bd003f83a4287cf7ba61b772ad33269f44cdbc9d6dc3e23569dc97560091d19bfa60e99166af31c42e55581ff8b77444e0c41c50f3884a79576f6a01de1591ff58ee3000fc1cd4694ec1d0e4c1266e992782381a78c1eb9453d820979ea586dc002a8bdcf3d17f36484b11c0a6b02fc1506181756a2f02da2126fbaeb18d735902150f5f4182456ebf308219989d3e511f13e551e715ace42ba1c2a9913051dbde14d466a814895ba6082ffa3a8f5a557e0fa650bed1124d1de0990d8add34af64272c1a84e53b3751327d92614446ecdfc7b006b6a64f02c124f8078b4ffe7bf7f7ca01afc5f5a4d4925a0da0195b39fd7407921c6378fa482fed4bace66c3430a20feb6f1d299df02bbeae38275b404d052b3f713345d14f50c808f3ac751429f7467c1f4c30865711b10d7a488cfd0e01cc7adea7288683ed3089e6c44e567dea6c35d7f1e0a785aa3342345f9d0002ebd7c5f51b5b4516f391a42cfd77e47bda34513b17ea3dfe7bbe24479eeb170163ca80ac3237d05896d95b514a4d16552be8d88ce6b03dc83db6e6cda5f5162c5b3a423fd779b9c03cb8483dd9b5182e3271206666cbf8a0395340bb7d3178f5b35ee841fa1959ce4832ec45a6e64792fe2b43b8fc7085bedf3f86512ad0780db9627410cb42a01c9ebc29dc3f61d64625373794a1612a92eef55439d3926257e4a4aa2cff9d22b0a813e3f7353644d05793dbf84ff05472e335bfbbfd7c971c2803c60bf04e586d163aa6e271dc786c40d90d32a0379f306a9da5381bed657b70661a4b2731e4704f9b6ca2898da7901f4f3a49ee21b7594596af33f80b9abb9668a8461c7b161e2e7d126f92ffb0f49d39971a43f3ae6834ee386d9479fafcc50d3e81a4e54feef80ebec85f061e25bc1550af60720179c9dfadc34079a0e387f987dcd77d6606fc855941be05b58420890840b943d44d53513ae92866685c79b7b1d57e007b41474f88998a055b425547fe4a2091bdd88416f584d99a27fb069a5b3e77bb89acd1f891a4b435a4982332077339daa29c863187eca498ac2f7d8f5a983432b361a2b8bbc88122116a66be979d6fa95d8ff53c0aa0aa832ba481c632b7135a4b5e595bdc8f79d2202289562e8a01a92bdace5e8ad45887fe1987ec8822677e5e27e412e4dd8e407d021cfa2b09a81cfee26108cbc7815805585de34fa74d5dc3c38fa2e84700eb52e285ab202ac7a402f9381307cc4f7c2531bb0d046dc450b303587041280c426343a143f1e3732d60f5c4d0c773e4a6728475a08fe67eec27d27e03508ec8ea1c01812f8d6f1144e9de162b061e1f82ea31095edb440a58d5b0397bea0a95df176b8c789c95f6d4369634d72ba3ab3815b4157107dec81312e914115fae8b169804788cd22305433d121f66f9381a386ab320920c750003640031fc597d3cce7ab291bdb8e257f3ad8d41bd82f2081075405b2884cf465213c1dda813b4e36e396f62ee2451d0a504d438f63cfadbc398d4804b364421e57898077376b346e4477c37174ac6e906c7851a32bd42ea332e2f932b34d86e6962ccf6ea6c41e011283db4914265917c3f6cbb31705869bd87eeed5e479ffc7a146704378166cf9aeab8dd236997af741f58993625827cf34d4f4a67a8623fea0d5668fde374b710afdc40462ded31d1cca92db4ff589fd27d2fd1d13bf9b33b049cf84c5045358b1c48d172e368f072137a20349fe2d35c6738ec0c3605fbfbcf60f2fa61add6f3d61e2a23bf992de1bc89a61cccc3398d95c2c1c49e43377c51f014d2141119094db10fb7cff33ad743828aae1206ed4aa5864ea8a0e0ba6e06a56ec4e679e5a1060dd99628871b3fb7bd7dd92260ff4858c62cf910356e135636f99aa036f495f35c15f45941afb0250cbb774922f0ff99311b62d1f0fd45e8071ec72abe907c83e5b7b9e3de1109c2d465ddee3e6d12bf78d8f18e8a6dbf839c3d0a75a94b7ddb9245d176249546d9bf466a57608be1d11a0d078288858367e5901a2639e968f76dba0947a18c067023c38b1b5f5ef008d9ad03ac696cacd3f8a91d8b1a587144dcc4de0b87c379ae16093bc38d940b1bfc04be435b4243eea05fbf270cc3cde2e7e1b321879053d4825950608854588d4e2331e2752aaa59c836f44995e77cc3bef7eca427ab2216a99a0d6fda306b997f8e7b0a950d0ed421141bb7a22f96013c2498f4266622e21172d0bb760eb8f45269086f26fffc0b9be8cc3368c5c8a48d7c213e2334cdc436c5d73eec3ded7a472df4d4cafb05841250dab3354f43d1411bb950992c875515be656b136fe01c4566c77617a1a73fa0f426d5732a24a2e07642a7dd5b2fb6da89745f040c67c6a2823385c4e8c72387dd8e9ed221a23246c5bfb494fc6dbe167984a866aed10df8543ab5001f52101091804f5b675bd6d492e9d87f53dec84f82e640b1121986a58750f757dd1245987340aa1df3c91998cbad0b854ad27b20c2996a73c9c688dc35e2ddd12e79ff14e19c0ea4beac76f5ac81237b296a7f313793b1142c56a0a92bdb36e22a651411f1df5cb015a1ee448bff40a1b2328a1033a3c9b9c157a5db6a11be754a8f225c379ccda5ae0c6356bb0e53512a0c13322d9167eb1fb013dbfa2ac0f2d67a41435bb40a5427b6050b52753ddf7ce97d7958359b0ca65bf6264abe3ce08151ad669d064ae64f8d33be294f14cb7c6be2de363d010f978ba049fe4c8e007f84bc84d9255950264ea48abf924b39cfba2a383063faae5edf5abb6243fc3aa04e138a349e38d4e0bc4e7c18ee0bf9597768998294ee509d0b6d7c3e342e2e2415ecbbe1de73f0fcf8e281e493953fc678c52e81072e2bc62e25538037f2e3f27a7622c01c954986df7bddaa0b4a0fbc9d736d15705de5ac3f53c184a98251c294ff274a162fd4999ecd3007164de9bfc720d2b0d5a15e97d3d7dcdbfdd470c1148022cfe3049f6268798a5f7ab30584d95feb64d0980a7e61888978bb4cfaf070380a50ad1933531649a52ea6df9b77168f03c7d0064bd58888172e7ebc6bc061bd094cd7baacb6442d9e9dd15a749c9646af51d2b80242bc33f7773d3316a3416a59c647e61e80357711951c7d19dde88b5bbec5035ededecc699d67b34f98c50be38c5555e45696417486ff050c2c2957f8a93c9a88a1219423225ea5e982422610e3223f6710f8b1b17a74bee3fa294fbd1d9dea17e2aafdfdd9da2ca66bc3666c800a08547aa59a16864478db0461ab5d2faa4eae068062b8356af304bedcade3625ef8aebc1e3f93bc209c24e1f559666dfa5f7f3803030a564de3bd28ac1d9166ee1dfe0add80ccf3d81132652cec54b6f262e8969728b90bf02d7887f4ceddf76908ed98ff4f20efd8a1f136b4b9feeb9b33ba3a2e66beb7529ef6881e7eb5805928dbf0c7a03a83c6a3320ffdf3fdc369278d5aef1940d21e3bcbde7c1c5c167fc62f3988fc2dca5de842aa7099bb1bceb264b08e569e38d73c28ee1a192fe642bd20b2f0c90ad09b907e22fbb1e63b1d9caa6df73af0e886bdf9f93f8fa46da6d56b27e8490f3c532ff598407555448b088f767758cda808e4a7e5ea801ea370f141327dbc52231bcf4e03dc5edd578d4ad4bb5b8cbea8c4a2ec11d64d7950a85a5e28ca0a986682a2b87117f89649e934b7ba7015a33055c5d3a0346595440ef273344ec7c5be24cfe9b0324a116d0ddaac4dfcfdc9e3beccef89716cb33d245c225d9eaf909b4b0095b7d3b6156b34f82f430732a92db53dcc1247af886c31cfd418ebc2e2f0c4aab8349aa056b6b009b48ebc28280eaa8a6532213a9fba1191676373b1172c2e08dd170a5f9f7021da49b5bcf2c6055db0a3eb03f2ce4d76efcdb7ed459b993de75e0d281f8ff3d74d6695b3462bafb96e42f9d04a6c0f423937f5f1e58e4c383fa48ef510fbb0eb7a0eb22d9b29511486cbf7445674da22f36880aa3db3e9dd9a951ffe70c4db98910b4d66a3db211b743353da24651a9eda9ebc948c7b74e4e92d99b34cd3d2093904cf414e2acf74de898b55b964b1be7b7eae09cd7bad1f2f4dde2ee7221727871f4c0f1519e2f71dfae6049f439de58b0ad43cc1344b561f92e5230b275ac005c5fdf8a746ffae9405e122d18648332ad2ef61ad1194c806b9e00ecbc1bb874290f39d70b0eef4786f27ee0ef2a404106bcd4cf38c0928e910f1b05c33a50e2e46f701c6fc9db7dda33df6c7d5c755d28bae6f14541c21eae0da95be7b433fb401809064f307560d5220d7cab86ed3cbbaaeb505f10299255eed023d8818ad1f3c2165a67458e016aafc8bfdfe0edbc3c698] */