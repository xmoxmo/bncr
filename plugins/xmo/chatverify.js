/**
 * @author xmo
 * @name chatverify
 * @team xmo
 * @version 0.0.2
 * @description 私聊人机验证器，理论支持所有平台，完美支持tgBot、HumanTG
 * @rule ^([\s\S]+)$
 * @admin false
 * @priority 1000000000
 * @classification ["botreply"]
 * @public true
 * @disable false
 * @systemVersion >=:3.0.0
 * @authentication true
 */

/*
常见问题：
  1、若人形无法撤回消息，任意有管理员权限的平台发送[set 平台 botid 人形id]设置人形id
  2、伪装消息用户为非管理员且未通过验证时，会影响伪装消息的执行，任意有管理员权限的平台发送[set ChatVerify 伪装消息的用户id true]
  3、手动过验证，任意有管理员权限的平台发送[set ChatVerify 用户id true]
  4、为了防止两个机器人一直相互验证，目前验证失败时无提示，验证成功提示“恭喜验证通过！现在可以开始聊天啦。”
*/

/** Code Encryption Block[419fd178b7a37c9eae7b7426c4a04203d45e01cd4c8344ffddd8d874f1b64a318191f9514b98d644c03366d9e6625065597b44c40fe359823193461209910021d20355ef6c613e3e77d706027a9001823ac0f7b72b0db2ddd0434499d4f977f6e0ba142f4eb44adc194421d1bb8448cb801960817d079b70ab901daad7780399aca402bccf0fc3907abf4ce80a5fa263fa84d7f29ecaf43969eab6aca1f1f14c9407e89516aad8faa052400797eaf80112992629b3ae2c66028b8fbc3669ab7d8f294b65302d82a4adac3afd90284eb4aa89bafc80d1ed90d8b8627c4fd04cc7900111cf221e6c5e34d18e0e274e24e4a0ac16a42e9ecdf41ed6cd4b2a4bb43eb91bf0ecfb503ae613707e887f3420e88f5e18d199801155e531147e94bc0a99091790e6ac0ad5ad898a976ab9a9df6431d11650b0f3e7b7f229d5679023ba094a6e9cada74f38655d6e7f336862196a8ec05a83225251738c0a8e4cc18c0b6264ba84d51e05d539ee6627f6bc628e25224c08f58dac95e49febd537e3c9f61ba268bf2e0129d458651ec1fc1159a399d1a458d403fdea9c47e6e0f5f8ceabae80851f9f6decd1f5a72b2d9a43bb335c428567e90cca0702455929d43d12cd12682a3963dcb01de1db8864941406de6cb30ef8cdde951da0dbda5d617d9504167bc6c93131c023a223b27c89081b2a9718885fd793b11f14826f50d2e85825312afa83c5f8f75c83d1e3b93bf67103baef046b4cf470454bf9784b45d06b05e1e14ecd4fe90eed09ead380fbbaec4af588c3221ce8d446b49e7cbb4650045ba53a50f34e7b2616a9050257a1382c64a00d91633184ec2ea2133a5021479f68b9e20736affed5a69e28929ccd7e2aa4960e91078ffc722dcc14e20cd874ae0cafd50cb4ed4379cb7422346c6f0f02c1ee052e4724a5077555ae021e153c28f322f5bb972312fa2e45113dee98236ccf6fd41ac399098117bde50efd3b5d34ecc9cb0fb34b63c6eb179151971bf1e248cbe5354eba137850d970e78019edfc89fdf7fe3096a0e809ecbc6fc0c47ade0c61248b9db9a9111d7f0ae8be20b53a6b85b6514ad09e684aa2cf790f3cc498b0543a5a7590f3af4efd96ee8f1c93a62666fe4e1ab568e1ed6195f15ee18917f934ad42864c3febb1bcf5f0f818f7f67699067b395c492cbcf0382b741d1017543b8043f4b267aa8e0bd6e6110d2f907e693000ff567037c406b7690b892e3b37f1df197031f61e5071a5483b9ca67295013a160e6f402ae5b3fddfd202fbbcb284aa64c79703954cf06208603bb969b19cbfe4b9a10bc0d9f8b102b4733e5d72d2864e2ad588d755d5f8ad3f2c4b115fa6403c392a5fbbb4edc1bd6fada70c5c3743016e0eaf308240a6ee2dad7e71ca694c7c8c2536f9f294a1d851e44da5f37e499af60499fe76f8310a8620d7b72d781878ba34acd7676fece34b0a6d6a263429b8e3aad594f44375a5e48fd6c8668f131c09e37194a794d49cccd752aa518fea70b0ec2d01a1495c114960bce7e6b5111dc95f4d65a22f77cd9dc30ad17faf1fb525c5e829d753494739af00194cab66f40c10d242e8bc6d3199ac3b7d6d2f73b7dffff1640a1c7552e64e0fb14e1f1a6caed324e4006a24a351e78e63c9cd2d2dfdf34d16cb68574aa90a33e6811a4a1febf71fa6c6f05326ce252f497ac3df417718f6829766e0d9db7eb1d7708632cd9650177eaed8e8b6f3fd987a855c8569027b839cccf0120737a52e8b931241903f12f4472f79cb8e82c26902c86a5342486274ff60c0ace9b5e900ec09f669d5ae93966bf85f32fcedb221875c3707b80cfe8dac8ee06fb3add749aaef5c8aaa8acd0e74a8c976e422a6c04592a0daa2c28d526a6df091d33fcd5b48c5e73faeaba6c7dd2d19bd31595b6e96ad8013a29d3ff7c501454be0b59ab28f0a96ee0c020cf65ec6a7324b9121d4baee07816fe209d33ba9c095dae76e8744f90992ba73763e42af530c41c040157f4fa1a37faab744ad758b8cb41cdb833d9105af70867c00f8ee4125ddb2a88711f862358b9c6847cd5f8259463b5f93f1fa0b2a2ba0bcb2eafba419a7a0f33413cc3328c2387b9ed36381a0af6405a10f43fb7a190322297cec31d0b70b61f6c8d84e441ea0e2ad8d06832e68191def01bc5fef2410476478ef784c8e6c6c5bb3a3faf967b053ec7492d92c6ad0c3a9ea5cb5ecdba678e435698f5cf49c493f88c485da4bba569735dec07b1c453b353a534b81c25f48ec4de095c6222eee5858b9a55ff448024a035df886d27d417e7ad035afc16e48cf88f3ae7a813113a2ef98bb856f8a0372d4c57a91a57427794034ce6253bece349746927346e1ac9b72016efb904913d1cd1a9c1d1116d6083f9bdc000c60189024f138cb0454a00ddb375583cf8cf8e10dec9dd0530f049c4792581ee41aeb4aeaa3c764af8b20bc068eb7b90ce4bfb55f96d5d8ee6ed697fed15c19f3d13d68e7fbe69c271348d29c9894e450e301669d4549bc2e4df377cdbe8898b5c21c056965c22e1e60f2610f0fe731571bef0bf386c5fe12b68b1f9f29ab04809470c45d0914782fec4cdd2adb673ee8ad9541cccfc9044915ab2c31dbb33ccf9c7965128b23285a1ac6ca4d11ff4d58fcd9ed06e0aa9343f30f5a6fa8cc60461f223a165317ba4a421c670f676ff0a66d837e6d0bade5171f6d3a3e45e7ccf388cce5157abcfde6f54923e722e8654a9a5c941648762e83b8d0ae3a10b2f7157ed75b457cd9858446d2c7c8c5ed44f1ac7c77c737b22d4b6f5916d5850ec15a680784c48918336adc131e13ecca520ee5bb7bca7f7f59296777062d55c23086a5f5d34c64c385ba80617c25ca49917cae172a5fb0e69d7539428de404ca47e9a4684c1fdc55f1106e1be1f81c2318e80123e3352b55fe3002516d3f04d67d3bb68f6173c289e9cef364e2fbda2728e3904ea80246810b244ebb08671274d8bd35e4ef9a466a9211b3516e74c103278a14d83b67d2e9c815490482fb7a79f79ed3ecbc67249ca23514c8b107ab996d83e105e59676f9442bd0c0f9b176b2d0704c5d4ed5f9bd910255194facd78755bb365bd304151e7f652fbd615aee9f63b94a366641cca77919fd58c09233526409b42114268b943dcbb1983002b4df2c9cf525a294e44232eddcb6244612938b8648cc69c1140e82813ac9a7c9e1f084e5e3e6fd0c511676a1e860b1fef376e7d07b9d8ac3ec31d36f2cb4af66d1bda3f3b386b6ca3392f4c1f1e8fe8f00d4cbb65f0656c858fb79d4d9f5a39703ae2c1ddf487bd9c77353d002757a0d561c10f5778ff501e9ed7cc93fc178732c073e3a144b163bbc24863ece827a27de4179f1122c489018f8f290eb607ae1f1cbf8c94cc81caae27faa6cccd9a253281c66604e5d2cf724de48aa65ac797c968f7cf1c6422de5bcb41a3aa36acf297577a0744ff2b2dfd661d0293e658cdef07f06124126b8140e4291b217e2df821f2d4a3f058a4c560b86633210c3334092a1a04c702afe6c68f14a926a5d3c1c77d636b27ecc33d3eaa5c5e68c981c89555ca57513e5ead7216e80bf21973b2b2c6cb6d505c5ae49842b5d29a0ad0216cd0b2b19cd6ea00452d34b1c25087a47758cf06abef4c3f4396c78810b32d4d0206497a1f8065cd23e365a9e0fcceb94434fd994f690ba58b9784a2208952b777bd4b1dcfaba8693e6e5981ab2bc61785ca646cc3a19e81ab7535c060b28e5af7bf83b947da8a640b07871af1093ba4a132fd2a79cc682a16880e17481272d2b75ae6bf3a68b55146165df870580edc67cc6f77685461baa964ba2d1bf6f544ed4b378ffee981f0f45ce5dbda4c314c221c599207b8838638c2dd367fa9159b6e29d4f2ab0c1739caa37e7c506c4b0e73ec2f4e66112e4a14b912fbd19b2427226a2b6b36aaf76c50cf932d9ad2281a826f304d5ea0bb05d10241286ca0f1dc1f1a7433a1e76b8e71c4970662ba9cbfe694e35e8ff9af081d65ee95709c02ff30cb8db073ef7d542c16a25f959b85bbeb19893bc9b5e7cdc30d512222b9cc098ae25d118cd7b2d6165f205c752303fb353f73ba57eb0402d0ea03905a362c732b6f70aa7045242e1adf48f7880af9716bdc6b0ce35c812d1edb8454edc8971509d1e3691ac0ee693222dd815022bad904b759307c7cad354b734d81375224b54ee9194754afd09dca554e9a69544070d14c504893d63f16e5875d1e7d7f19ed6eaf1648fca165bff7d44e9e7db9276d31a3c6559ecbfaadc0b02c195cb9ffbb811d74f2feaca564e2526ccc713e25c75a003] */