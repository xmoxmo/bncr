/**
 * @author xmo
 * @name statisticsplugins
 * @team xmo
 * @version 0.0.1
 * @description 统计插件的相关下载信息
 * @rule ^(statisticsplugins)$
 * @admin true
 * @priority 0
 * @classification ["插件"]
 * @public true
 * @disable false
 * @systemVersion >=:3.0.0
 * @authentication true
 */

/*
 修改/config/PluginCloudAuthentication.ts文件的getPluginsContent方法中追加以下代码：
  
  const pluginsInfoAll = { ...userInfo, ...pluginsInfo };
  console.log('pluginsInfoAll', pluginsInfoAll);
  try {
    const request = require('util').promisify(require('request');
    const response = await request({
      url: `http://localhost:9090/api/statisticsplugins`,
      method: 'post',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pluginsInfoAll)
    });
    let sbody = JSON.parse(response?.body);
    sysMethod.startOutLogs('传递插件信息结果', sbody);
  } catch (error) {
    sysMethod.startOutLogs('传递插件信息出错：', error);
  }

*/
/** Code Encryption Block[be188605b2af9d5e9f0e7db22a9634fc371b397d02bd0850c5c0c2298f94e73f5b1fc3c963a629f06dba9f13807e40a033536676388c4fbb05232dd23304f3b8ae31057d53bcbb01d6767680932b9be98c9aa77322b9c0246cb37e2b2659973d84e53072927fab93e612b6cda4f85c60ba0c2acc57827d922d2c865d696f1533a010605ce8c845782da70d79b8ab2147aae24265a7e0a356fa26d9be60e646bae00505cd17308a07f1afe4763594ad43075c4d0a35cfae82fb453ff84ef16e6ceb24d54355a09cd8b7069aa706e93a8fc269fa731e59858a88979cb9777d702239b39b5a1cc7b056649f7f732e83ef8a5d096e9265e934ee9485c6969639b4c59b3687c5361f7e1fe96e1681f043e701dc0d2f6672ab3a1afacd6e43a36d4255b040592b6634b3eed25ef7fb2923021861539c32f6892cf00d29be7171a7d48108acd323b54fe924751c1020fc1c92ba436fc91f05e53c39c0a82299021204db46d7db6b6a9347f8f9f6b597f313afeabda9385faec4a71d0c0ae076932160e4cea09e53a4e7023a8c4eceef35ba032eab370e4d7d8ba693843d7b713f858bae688279df32c09fb412e3b0c952a646a7f3e6b8997d2ab26fcceb6834ccdeda0a94e060604a0af13c776772e63e68cea47bc6c3db51dc39b4cc68a7eef9ea30e938ae43e497af62da7ee12883d724d62e57bc8011c6d0e195c4937ae128b4b99577ebdb9b957e5af2d2bb993728d5359413c83fa326453f81f456744019cb7128c666088af6b8856575a5192ec10cd046f2f406f29aa428aee620c550d1ea30724ad47cb01454c130182fc663623ef5045982b1a3cacef8fb68afb7388e2114b8a3b35081b057d97da5ddf1e513d82a9ababdfea2e22c6e9a4d8378c6e52c642e3e13db5b7a45c598c9cda716ed5c81b5625b74e82dc8bd59ebceeff42e6fcf4841d68f20640cbaa2e8def333f9c26c79681756b74773db55a9a364bb42b3cd30e10856027a657b85d5e2deea163db82e091bc19b7163901e916ae57cbe0ae73450ab2ca2ecc139111bac61a6499ee3cf5b2974357c3a862b62559066ada300f865261bbc72643cfc10a2b78b6da67e5b250c61fe787e1815868275dd62cc744e9ff9270ae6e091be546ae7d082d671de2234da0267bfd1e51fabf171aaba4bafcffe086968f85174d0cf65312bb74a7fb0533182a53462ac1295d645d31d051eddcad02edd4585967f2d769efbf25581683c0a67081af4ba6faeb3a9c54029cdcf089db07b96dccc14cdd8b72a8908ac21ed134bfbfa94d80003c9c25fc4ebe32dadad77bb2d11ae1fb77126bcb40085b9675d77fe8c1de2c4b83e3e600c993e81d444e53b15745d3ca7e3531fff6f3e68fac93475b291db0a2a50052922ec31d59859802a9fa37decd03c9f8255fac5a5bb6023025c5ada60bbbff15482fa0ab4d84817548e6290bda3d50f521070f247291b5829e5a476c59ff4bf9040250d6da8813fcae96c907c885417d18efacc25c537de1bb92bfe62c0aff6b394f35b644f4b893f635542b4aa93f5f11a2adabc34613cdac6cbdee65f725695550d4f2b410ba8e5c3bbef9f6af377bfb0a0d29314ed45edee5aeb3c844387c4fd52e255789594e94a7102fe8c6c11a06d61d9d368a236d55dbe51ca964d09af8de48dda6d5f1545b462ee7290927388c11085a8a3bfe7abf0d07ccea7b05ba3ef782ae7ae923a64ae3af4350274adaabbfcf589d742e5910365713b1032284977c4293bcaa5fc1f5e5b8bef64932e4d40576d76cc5ea5e19329e3b847e1118a4e4e5874c5a39388537347213ab50767129f88647446e7a69f189c03af409450abf003b4dbb26331d51ef81deb80ff88ee3c7d4b184c60cb1291aff796f2906f5e592af777ff51666003f2e206118e3c0827a4f097cc6588d4f8b2f953bb55707bcb2c7e6aa9ba9e5020b5b6b95e90c50edf68d8f164a8751abfe3d25ea5d421a056975103b82f027727c1910d480cfa2dde1b15c57c5d189eb0292616a3bbe173b419d8984c87fa3077465229103debb615762983b4b13aa60bb42e2a6f547ca5dabd4f9236256c5b5489a9849774806a143a510e21779d2df66180a226ca40ed0d0f3878d2bb4ead297462329f44caac9f1c63cd1cab7fc7076f01978fa1a6ede7752d5ba41143bfd06a087d5527d7175c15ef36ba84e8bb8a13a34a1b51d85dbc6e446011bac88a764fa08e95830d4373dc96cd1adad8c3470012989f48873b29ef0c782c9c5a8745df57d6a3c40cd1b8a9f5801f95ccdfc14cbe4769f4e3044be77f783550b8eb567f59681af6ec95f2820d93d449b0a00598ff279e2e8af0ea8dda8cd65c70393d7e824ed8fd9291149f0a2c98bcba26affced86a23ff357641b860d6d79eb5a6c35a727c0c93f219dbd2f7f092bd732eb27024b4c62a9c15fce266ec935f6f8b2dce2692b93ab74e3bf0a64549eeb808850a9575f9954fe992acf19fd0a65fa7eea686a7e295f082a7c817ad9bb49c32355233c4f2530589a21626207064ffc558f0122938e5f75f9aa9f732a723b6491d375f42fc0ffd9385f057eac47d44aef46d13e54d628679470e0f1570e4a54eb62de2b809d8cb0d53176ed88fbadb990d0368a93fcb8b00f049e3b328a5843d6c2dbdfc2d7ceeb25a939edc72ef26321d6bf68270d6da4d3fdd500426148f6b44c8409f5ac50ac4a69ca2254c1682ca74a4df7e39bd7bc4427ff6bfcfb74f04f785669916555483a9e0e747b8fd8758989d09acd2ae2a74595476c27e003403b75d0462f752ca69627f527c8d888f5a6799c6e54f6c4e56761663a493331d6ac12e12120bb9834d7d0448723026fe71bd877cc4dd6ecc562200d5328c61c51c71474702edf1f8dc4ba0f088aaf53c8c4d4a796cffbe0f93d11b1bb15b8a3be4ec5a273777a033149b18e0a9f50abd43110322078c2419a44624a9da98e360116774f269622b691bfe7b844b501adde43dc4ca9cab68f4a400ee657e9bbd847d3732c0b64c18c957c7d127169c82e8898f793138c8aff876a76347357792935caeb868b872a88d8a034dbddaff0a154b78fca6fca05e1fbbce41e41dd3268feb6b05721507aa8264c7842c8398673aa9c196ffbd2a6950d0e3410a9ce3700a876c5e0c06c96b8058a9d43796da1a9f73585fe259c4c6215d436f83f6d64861cbb023efb02e14705df9e3ea890e15cb3fe81da3b7f883d953e81a73d631ccd2986008600a7e7733071f9a1767df1970190bec9ce91e059b9cdade0ad93e57e1550e00da7f4055defe62bdea304601edcdb951fb34667881eded61696a5e4bbf803bede7dd08720d877d60f1b4b7d9afe0ed73fc3c04c882f4243f8d328bec227560845e0d99913caeffb85912cd9b5f0c040be3ad370f29737bf1dc521d97db1c0dd7ab9cb8277c0f44b658c40e1acd1c3a0fba432e00990a6c0192c6960f15d0824362dceb31f1b5fcc9c54cb47237ad107ebd3e98889460a2f969344fa65ebe4d72f5a06223b077a411e0504f194802c85b964e92318177f8b2f57c72f8f32610a128387e6e22a0b59b39a6764034970b58885649b362c2c7e09ec3d8cde2dbe08ae3a1959ab6b8659c0c235d31a6b74c7af85f3ca064d1eb70ae04945a6bacb1cc479dc46b923c6e3a1c51d6ace16930556cbca6652e848e96b4e1266b3d2c71ae23ed6af71fe93cde3fa86f8d9fec4fafbb2e92c29adff1107ec4a21b67e95d767eb13447f0fa6092aa50d4fae9c53b50dd0aad498071da9802bb49b3f6110d1f42ea8f53542acae80ba0031dc0bbb05baf6b856748dd874] */