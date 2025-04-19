/**
 * @author xmo
 * @name statisticsplugins
 * @team xmo
 * @version 0.0.6
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
    const request = require('util').promisify(require('request'));
    const response = await request({
      url: `http://localhost:9090/api/statisticsplugins`,
      method: 'post',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pluginsInfoAll)
    });
    let sbody = JSON.parse(response?.body);
    sysMethod.startOutLogs('pluginsInfoRes', sbody);
  } catch (error) {
    sysMethod.startOutLogs('pluginsInfoErr', error);
  }

 */

/** Code Encryption Block[be188605b2af9d5e9f0e7db22a9634fc371b397d02bd0850c5c0c2298f94e73f5b1fc3c963a629f06dba9f13807e40a033536676388c4fbb05232dd23304f3b8ae31057d53bcbb01d6767680932b9be98c9aa77322b9c0246cb37e2b2659973d84e53072927fab93e612b6cda4f85c60ba0c2acc57827d922d2c865d696f1533a010605ce8c845782da70d79b8ab2147aae24265a7e0a356fa26d9be60e646bae00505cd17308a07f1afe4763594ad43075c4d0a35cfae82fb453ff84ef16e6ceb24d54355a09cd8b7069aa706e93a8fc269fa731e59858a88979cb9777d702239b39b5a1cc7b056649f7f732e83ef8a5d096e9265e934ee9485c6969639b4c59b3687c5361f7e1fe96e1681f043e701dc0d2f6672ab3a1afacd6e43a36d4255b040592b6634b3eed25ef7fb2923021861539c32f6892cf00d29be7171a7d48108acd323b54fe924751c1020fc1c92ba436fc91f05e53c39c0a82299021204db46d7db6b6a9347f8f9f6b597f313afeabda9385faec4a71d0c0ae076932160e4cea09e53a4e7023a8c4eceef35ba032eab370e4d7d8ba693843d7b713f858bae688279df32c09fb412e3b0c952a646a7f3e6b8997d2ab26fcceb6834ccdeda0a94e060604a0af13c776772e63e68cea47bc6c3db51dc39b4cc68a7eef9ea30e938ae43e497af62da7ee12883d724d62e57bc8011c6d0e195c4937ae128b4b99577ebdb9b957e5af2d2bb993728d5359413c83fa326453f81f456744019cb7128c666088af6b8856575a5192ec10cd046f2f406f29aa428aee620c550d1ea30724ad47cb01454c130182fc663623ef5045982b1a3cacef8fb68afb7388e2114b8a3b35081b057d97da5ddf1e513d82a9ababdfea2e22c6e9a4d8378c6e52c642e3e13db5b7a45c598c9cda716ed5c81b5625b74e82dc8bd59ebceeff42e6fcf4841d68f20640cbaa2e8def333f9c26c79681756b74773db55a9a364bb42b3cd30e10856027a657b85d5e2deea163db82e091bc19b7163901e916ae57cbe0ae73450ab2ca2ecc139111bac61a6499ee3cf5b2974357c3a862b62559066ada300f865261bbc72643cfc10a2b78b6da67e5b414aa2374067070f1a19e13b1ba57ad8b346b3e6985ed2c3ddbb387258545c9efa7fe6794ea945404b429280f28b36a6cac8ac0583d7589916404e0c0e7173f625e6db2d02355a853c97f434560a614aad97f8b4245650fa638b90666cf65197bc28ca15db03826f24740da3090b463c0418af1d79c227aeab360a4df0594e9c855671b36f4b5f79f256b78a08e846877cd339f693dc0a0272f3bb143044cc49d4bf88780695a116fbf06698377d415d87c9b2a376afb93005e744a9fbe7dea6079bd25e0aaae026e0d9c0bd0a11dd965251e3f4e349d87284ed42798b9872643fa21ce7462fddfbfbfbd5cc30b7d35e1fa6443fcf3f0e160404d39f74e0e60418154be62f63d2c93b340ce2663353891b711bf1855d130509856e0c0f098280169dba2c3042e70a1c695d2ae058b018c359279c811f08005f6c64b42c13bda509c6632a4c37730edfe5ff05bee81c53cdf8f619957d7055bb717d013d9871bb49ddf6485072f80ad137761167cabfcf2d9c088a1da6e92758c383ca5cd5cc26f400d5c6f135517e3233ff340a04edcfa48812242f803792f0cccb53b318b78e4c5b1e59e27e2e5905654467c511a5b3856f710c0d7242589e147fe78c8580a91b56d880660ecfc8baa8bbf6734fa52e5bab4614ce3cf69a6eb9192972f7787d8e92cf95fbee73ba065f444cee9489cc1dc10bd1fb7bf7a8c13c1a4c3c9633a5f605a75683903a225b0f187453757fe45398c42cb97bdb90e3ec8b840e2476fb572c6bb9b84e003aeae8ffdfeb916884635962062eec9ac9ddcd5a665fb20f74665c21991091269049ffc3d30aea109cf9cf4c0195d352d2f9ae48a63713cad2adcbd752c9e895fe162b529c55d46092c4565b09420554641b7554d6e10c9c29c7cd547cc71963f7c4e41d2c598f1c5f833cb3081249aae203552d3a1a10b02ac89c32848c8523977f5ecf784bdbe917485835e0913b7729fd8d3d0e8b5e2d2fe7f82ee101b82e2f4c59d15ba168cda375887dc8dfe6e9e32321128f268d8d85e453c339fa0d354c84b9121290ba7e5a1fd5426494aefe51382e7f8b9b864e6cabef4efc180d79e5c240985d02c32cab546e9a5110c51d9989c1e2c7a7b612c54d00b0e433b6cc2ca5da33679f8cd6a5ccc6c8861e65efe2fac3f580351e3422cbf9128a1089a3bc51f5588af47cb6a51a0544574c4a284f4cafd4bab2effb01219dbc0ca437e6d76fee2bcd62eedb052541a9574010855a5f4c6bd55688df850cedec0f1c21f3ea296fd5c0e39360b451d1882fca7d7b54b78bdd94a3c726eac0c2d1cb524908dd42ddb98f4250628241001e28282359cb5d1d85f685aff1239d4598eb40e1af392984f018beb0209c21b1d46de459d447ec8a52c395438c681b256ae723d465fc709ea87d502b7e62b6a99f2100227d7b41d290f3cd30b704a8f97344c12dfe8de7c5f916e27d4e071cb1ee3d599d0333796a5cdb0118162dc0037154272c87cd0f8b2a223c5e699418f93f78bba944025b78a8ac5ae29549bc78a42975b0091c6be61d5d0e06d238d75302a91cfe05477f86b9c49ac3adabfeb2533cc54efc45e687920f78e2f994e25a6ab4e9fdbbac6df2bc29c7a06d095964b8b047995eb4e8a4cd07463cc40176ee2b6e24145b6296e085e4ab9ca37397be4657130636381d36857472ab8c821bbc469b8f5d55c00861d4cc2960a0eaaab6a62e44c824dad43d0abf182b9278a39142d4f67dc217ab9ef0a6fcbb7b30f80f0baea0bb102e16f91ff353242e87e52703e1e23af78bb3af8d2a0d93c31af9f287645218a753ba71da57028392b3d4d9878035d98cba15506de7f4b62ea9367e76105f8f9b03948b4d956510274997ed7ff3b8a6ee9a684309006c0aa68da734e6ac7f0684a339f12052c0b1dc595e1c03a0ae6042c103a39bfca8b5f2cbe48f47a7c91bec49d1dc0135731c3addeb3c24ac61ad826f8d1fd4271f0f0fcb561aef180565545a07798ea7acdfbf77cce1771c4718bc693c340264f8f762dd19ca96b0b6ba40b760648c126b46150c017365f9fe435de4d693e18896512dfc60c7e0dd370d2e9ab7141653f136a167060e5af7841f3dd33655be0979882c07ba3e25a3af430f7d23336a1a1dc845c56983ad113ce52198658c31b1ead6cd616dd4c906a549c815a2cf2421d0ee295e22f06329a5edd89bb11d2df18bf876d023858174b3f50af0ac578792880370bc677e13d6f1203218a27664780935bbd0cabfd3ed0873700d80445bfef15e24f05a554e9053a9c537cd691ee1a96ce50da8e1ed42ac1e8ae7a8ce13173289464471193a1c020e3e6cd6f7775bd702e6e950e465ae95dd240f8472913166a5f8a44ceed50da027204ff49f410df47f9226eb4956f38f911376125f58435882bd39195c61cf1be75d6a8f166112323f3ccce94f39bcaa2ce977ecdcecc220c86b0aa74fe93a2cb077b4a2436baa726d1a9952f805d4560fa12fdaa52668a03f8901fad501e2c9f12f6946c9700db0ab8ceff6f8ceddf5cd62e941753c15254872f6aad97a9a452b2da79e1844cc82ff86f23e091d942776380873e5e8d03e13e986f4919e347422467e8399861a8a9c9e41c379cb10d351b255b203229661c31625689ed3e17b3d4ffb924d64088995e305b4c3229c44f7337b78fa78be8a8a2854366d38753b74e53dbd287ba2679952d74e5d4b94d52004f2ce70caf03a52c3c0e081e09ca3bd9e765f14f84d8ec6789cf5a0eb6e47070e3340d4161325dceea6a9d4504009221d2a8e3d0b261dcf6dd1d0041d90b92de81f1d41c6093cd9ab5ce82411816562c5c9299e6a0388d805aa60f2f2f028675f3bb297fa0c7afa82c3d080a70d0e3d0883ca450d8180d245ca6805570901b2b167b429808c5a4dcfa9e41992416546a469fec2a455d74d8a92ff20cb8602033af4314008dd638a7b151740c72aa08c7f30412d710999d6d510134a35a5dbec5ead39ed0263a4a09b826bef6921836d807ae126d02b114b9c9c8ad913b70459003aa118830a7b36732b6386aa9be964a18418fe7dfb2823804e37d1ad65f09740639aa5f561ee89528fb793341dcb2fcabb752b78609bd0f9f7465db448c3e60ed25a9768e8b07d3ecf4160e46e0ba35648612e658f90275b0d9e93c910ad018ebea139c0fa4eb98a33f57df4a04bb12809b904db11d15b7c3342a43a539c5bfc14705793d64d47356cbc6683acca3ea075913731f7b255385b2089a526f1fc5601b9e4598b517cb2db6444f1e539cca59e56459077f8bb1d8f051c5076d2b24a079df6f9c6bc25e246d4e7a16564f960a36e6f74a013d36863d2f4f5eec8fffa2175f9dbf6ddf0410501ae6c072890d01f74de0980c693684b4e52ca7aab11b8e4e785b111557fd84662bde2f7d2c0719251ef130ec2407f5d30f02b94435d7a6d8c70974bf6b7bdcef64e84d4ca98ad09a1bf5a09b856cb238c124051380e99179547d1b8d9df8b35b2e8712f37f5772c4f24177eb89c41e5cf9515d1faf2617267adb2ef7076aff98885ee79ad281fd73b8e36cb947eb0cb990c627a3267650bae84d6ffb11f6d2829b441fe591dd14ee4f5f9bd6cf3a904549caf2c758bb8efaf47b05c81cd961edf599df3b44ff8487b1ad551b58912426fe9ded98ae818c72c0347f4002082058e9cfba1b43af269f0ed8a465906ea160eb394573a26a00d0360d62bb38d92f5a38110aca1c38c3dfd1a973e528cbf187dd6325167f230333a4bfe7a045b8ca73ff6a13707584a7f7530d5e01f86cb08adc53835ebd63feb1db8d01fcec1a65af210aeeba8bf2f46ee0be0df2fb986235d319c5feb2e1a7b66528bf7f9dda6f9ff7127552df9344a459fc76e767f56a85aad47f4098ba60e7e760fad4a7ea47fe79ca25113f4178e63f4e8b5f3b7b44510d4d5b1934276b7398a9ee588593888f583b89d3393643caa7b0d206953b2dcc0a1f9f154b9c6bf14fa486385d28c372bf9408c0972919b58f4cd16d324ffad51e26371e298290bb0b6679aec336190f554c5c503bdc9c8db41912a5aa953c64626632797e75e75bc335a853fa5fc088761e7019158ffd40ef4dc8449df7f43917f3c14fe03aac72dfbfbf722b43d59d3eb08c2c0b56b3cec25b595cb4a4b230cddbdb6cf64a88887e2d042221ec7447bacd320d80ee3e8618353d758298c3a2adabc880e1e6d03cf9aba02a59eb2ba] */