/**
 * @author xmo
 * @name chatverify
 * @team xmo
 * @version 0.1.2
 * @description 私聊人机验证器，理论支持所有平台，完美支持tgBot、HumanTG
 * @rule ^([\s\S]+)$
 * @admin false
 * @priority 1000000000
 * @classification ["ChatVerify"]
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
  5、增强验证逻辑，发送第一条消息是不响应，30秒内发送第二条消息才会触发验证。”
*/

/** Code Encryption Block[419fd178b7a37c9eae7b7426c4a04203d45e01cd4c8344ffddd8d874f1b64a318191f9514b98d644c03366d9e6625065597b44c40fe359823193461209910021d20355ef6c613e3e77d706027a900182627300fb08ba356223bc797624e6d975520e1d5326da9ddd510a3fc16f6e4795d7affde6d6f853482bfd7a2ecf82489fb6d89fdcc7e9f4cde8b215c09e6a1100308c39703cd813f807c94b8fb5ce935bd81f0618439361c5c0843569aa0e24a3002b251ab5bbc2ce4d0f5ba0fe7a2301a7c1d49a8bda94c2f2bebda7c266a5d4d973722d917098ac986f659954a83032ee99e918625ab3ed4404830d5fea67bf2d6d93fbffa3792fc46370e40e90632cd299c0663fc4d38ed1f87a3c69e1ee7ca12579042fc0dc45845b2a0831d7d886381b35db3c76385dcaf755867ccc99ba560e3d59e1f7b60c9016384772f85516075b48c7b0dd49bd2107eb7315f43c5974e00e2067cf9567ae36c1fd7d3338e06e0da8165ee0946bd613009c68ffcdecbc7202acf426948522493aa51b07af76ab19dee278649a1c26740906fc653abc18e5b3166b516dbe3db7ba1b54c24620054eedff890e4c9d8572fb0892f9793479c092efda5d317dd34f24394195ebc4bee0a997b8975358e42fa14958bdd498453cdc09411c9bfcea00e9faf481a96ece34dab58e93ff3a519d081ece223eeaab52e24be7dc194595cba45a8c4da4e78eef0c11dda2becaec9cad023a6e470af293cb19335ac14b6e276af561d2584e687b9b9d20c04969ebdc4e1ee45d5bc1520ac9814066e698b43ff60afbf6294d8250c2a261026dbd7177f7f3ddca576d3567501c1a19e5fe246c4485cf83e1e4164607a1a81285abaecc1eb1e06eae5a60e8515d9cb9b4e4cf9082c59b2ac7c1aba1f879610e9f27766a0effcae21d7848dd40232db8464b41a86ee52fa886c60020ef8d6f6a5ee353da54170aad1bd36cd9261bdb59b55ed61c71518db883bb10b7288c034ae9881e68d2b526a66dd0beba3dae0dc276947c733a7cb5d8067e4e72f90a7d38237baeebb13c7012d80f6c883658f667e9929293a0ddbaf37a1981711ddace4709565a82eba4c9ef5095043cd019b4c70f964aca84df20d5846abb101cecb5042a6cf90bc8eeba93bb20aa74091b6dd0a11a2dda4823548153fcfdee03e2caaa7642de44c6171d2f56d58021b54dfb01fed93630fd5b97ff07060c1de804a5d69fb0ad9c29a4cd2ab610f5a1dd9c5bdf879bc7a93a5c383b10fafd5bd01934bc840452d9fad4561ee8e688ae14e2012005afb6a07edf69a33df7c38893cb8c5cfa756ac68c18eaf00966e12ceb9042aa2a9450046fb1ca608e9b8d4666aa7e3b1409d990cdf348c3fa3a98871b0b70d0cca2d7773cd63f5e3824d98bbc43170f173ad5aad269395033c18b5c2a2cb122552768cae4bf6c27fc6bfa8ff7b11ede271537aabff80f7446f59b56bd28eb3ef33855fbc2029c0cac2746ab96fc54793dadf85bf6b441cf09554b7c8103c3c12cbc2efbb7c13e4a401f2490706ee3daa162d16b242152f9bbe9a86080f7f005fb3af43847894485413a9b841c406f54f2aee2162dee73774dbe337272df4149940e78ea3e338852477ff566d68d8f8e15c2cc3f96b24b55654ed608046c38a8893385a5444dd01624b3520f589023dd70b1710dd5d76c91b1a45e2572655f22f40256c3032716e85be64646c24937c527ed56b30bfe1ff747cfd0e1a3cc1a2a0eeaa8a57748b6ef1001d0c98f1967b4b1f704e73ff23355460044dc4dc025ebf457e32861e4eab2fb2d6139904fd8c0cfd8ccda4ca8ac4d031cd4f65017b19b9aa463ec05df659e89226fe9cc316456bd70ce9759babcfedf35b50d1f7051aa836e7f1bf3c3d656d87c25a9abbcd2a3df276aa481c1596267cfa89524f12058bde25416badc4785633e4ae68e9d2ff8c18d15c6e525a95e4dca1895bd394453287931ba863430d7288960d7cf86ffa9e7f69b0c957300298c9a67e401e29f98364a0403eb7d080aebcb25a0ef88ece4de55ec77f482ef21028050c01154ffaae5f20ff706eb3a936c50ee8d095eb90a31bf9b53800f74ff0314f6865dab63f85d2c4545e264ef312d9aa237c2ab49a22e06765da6614187c70ccb8ffe3f063189699e4da586a08f7d6195af306c4b9f24a48df3c0dfb0b46d487d2045b716793955267c35841302d3067e82a3a39a4c1aaf1aee177c8103cca8bfa768404a731ca967291b13cd25aac03b90ebd6f20827910b36a1fbb9824c80c9055ecc23dc795ffe686043c1bad2f55b54c0ff26f8520b44e7ce8b741c1a813e0cd0b6655fe365bcfe98ed7140109d8ec888478a46846da9a15dc934260e1fc202d71cdc1e544140cc5c3d190dc492b01d21e754f53cc740a9875a1c931d4d0b6ca2c178216a64542fa868e5b3a428add3202f7848d3cb4ba779e1d922f734d8a3392e8771cc08486b6538b4c749eb0836a4c53d00cb7b55ccfb75b74bea069991f3615191dc22abc7b38db73639ad2dc3f8cbb3706cb736fc83c98e9f6621da3e2917f9cb5098ae9730572116b19eb844c8411041f0b4e76c83bc9ccfdeec9e47428ca5d71394358781169e9e38cf4f92fdcf46cbba8cd8191ddbc94038f3ce0e61514a6268efab75d2de6f7935ba22c51fb69c3e5f7f945c7f93603293d1593ce3286d5c1f5daf2bd8449970eb6613153a00918423d92b0b75005b12fa8805f4976bc45546a614428a084e1ffe72ed23e28c5bd638b83ee49932c68df7bfd28392e0706351980c6b37788284e4ecf4ce50eba3be8b4851ddec15f5f1a6fdd29d747c7d7156dc379049217aaa29642b64f79db75cdcf9ef96479aeb02c4c91fc988015910ed3b2c382363ed89e667ffba05bfeaeded1f129fada6db1952cd7b198c8fdc897f0a209dfa112179308c38f3ec5ea5ea742e214e68ea05de60290c29c5430bd71918a88823f21c5f6a13985b9da5431c10346e453eeb6329a0e0fc0788af561e985a33e54cf4a3e670388f3a3ab866fe1ec0588267304b509bbc063e012549fdc8be5054019d5522a7b1073dd0667ceac2ccfb5a81ae7627def3f6c559758ad87343e555ee1f28dcc7a305acdbb58fcdb4e6aef39d5c2d8c0c883e85d1cceca760fc37753d4cdaf1824cd800b59598b8c9818ce34e2d9cc78281426d4d2cbbd038b7b45ca9cfb4a0e92e5b55a19abea54f6a5505345f83403bb2efb42a83b594db9ea4909c06a492e77642af03df1734a1c27128444ff716b45d12d0ce65c855286716b92e3aac05b5f535175dd45f3db8611477a4786884b9268b8b088ed4d9a9ab4ebf58a9c46add1580bf1d32e1ac11f83952402ea0228127d42a427851964e32cd892743500285e90b6a340dabbb69fbe947959451f27b15878dcaaa918eaa0255120c06540a7b74198826e5a0a936cd1cda8a8fa3a55c53b905f25b2f4e6e8f8d1bfa0bdd7af0c8e0457c5fc288a03fe552b77a6f43edbb62a234339c70320945c0ef2ddb208cd24bba55a45c5f888d44a4901596a458e03929afe87034aa6cc4496b5429bf4fe0ec706b1f79d4fe2fc85f1febe0b406a41796685a0e35944a1510b94665ea47a1c97730b8d6f1ba7cf047101d68cb139f58dc603395e7bbd5c598864e3ee032791d34a4fb62fbf69dece3dd6f27c207ecb76636c3a8fbcd2371fc2352c3ee4b39f64c9346d74313260c693deda2a5dc128454e17221ddfbd497a9b5e0d206f38957e65a05dc255c84a8b6edd5c6779cd5c7b775bd342498309006a307a88086d643de6b7a5dbf5cd83041d560b9408ca6a0cf7ffa7d077bae0ba6b3fca008a4c0fe08b764c4ffb216720d387db0ce8c799f5f26058e3ed0de760d2820f6d6259c2234a91ffcbb1f4ed2f88fbaa277527f11e4eac98e3ea616b56f59ba1e710e48468b4dc1d8bf7994250f8176319595eecc88769bbaa46917c8f0d0a21107a073731ab40900c8ac2c19ea3615a94dee754d994d601d5fc7768e95629bcff4b1398532f0f4f0f9ba3fe659932a6a5390a57eea71792e7e70c72c415831f0004dd2b62efd66248335aff3b6120a0db3f0389bee24240f1773ae6a6050d6f9c90c031dd71674d7aab773771ccc1baeaef3964a002c561fba772bb32db96470cc340a56e5761fdec332e9c31f08fcab241136cac0be0270c93f9381760a0d570ebcf89e93c2789e4c3826a52a10c05f402f1d8546b4511722f5578720425e7aecfd3b274df7481ecd9238241d81b63133392a71693c6a2ab908b161b4a1bc41d7a2c4589b71fb4459b4ca424b7dc5d1ff9d73494028ffa33430f2a990ca523a758b99283eaf71d9324220d906b38a7ffce76c102e94f9a15f74ba4460adb1fd74c132037c21863d52e5e65489669fd61e51a54ecfe1d9f14451cfb3817a9062153ffbe27dddff6613c3b340c83f84368e952a687d79eb41063a5f32b93d3a34a4022a9269f76083d43c679f3c42eb6d70018565ce9dc9337ddbf2507e7461a9aab58fee3e4b25d10ffeea3f5b119f52eaa3a3ef2598ceb8adc64320dc6db6f1e3174ae7497a04570157075d459f2b1982a4d0a164c27dbfd8e81f9a5b8b4d65a45360130caab4e6002367a350ff2247e348b18fec7b296e601fda22d3ad996f1d14a4f0db390b8e2224443091ae1c5d19193cab80a78f2829502c8f3bf429339cbe8d2b2b8784cbf5bb87d72843e0451bb3be59817ae812190dc1b86ab3d669b7e39457d8aaee1d0924d49fafc4927555421c875e94015cd5aceb988e2e2efd19cda7fc0144dc8a53492c47590fbc7fed125e493a747f06e075bedadadeeb6a632705b1cfc1f78d7d87d99ab2f8c86b26f95989e09bd7db0899253e6dc31d5505d96e569202d9fc786fde0305a6b3a1032ea44730417c70a2ad2ea5e83c6075d96813fc9f2b85b0006a248b50f97e868c6834895216f3d4c56615e012d1fdf6e16233cd67acdb1dd5bdffc8664710aa0723b71e463ffcebe42dc56baa1fc4a5c9182b7ba49bd2252dac54123d9161607fb6b605b3535633e91fefe7381c10266b451d8b2003ff9b85a3d89cc8402483ec667e6ba26f38b4a897400e5b1177dbec278c64f5bad64f48c74c44f0f886f8df90892e60b306ad74462484143569d94745e5565a306b612165fe409e45f4baf3c2bd1e7c879af262e4b51cccc5f09cc210bf35deae705d80ce40ce2d62a69bb0db0709237e15453f7dba9ec1f3c1e939f19fa32a729ef8c6bec2c9a3f012b8bf01fc5a6bfc65926b7496d919ec36852245b5c01e60ae3aa7a9d2cadd0b0ee9854ede86aa21dd4eca8a4fecfafb1a346d0997f6d52f7027e05e718ebcb5a25719b5a3a4558e4e5a875e405d28710a4aed37bbe8c6b4239034835d393d351db14e05e7b226274681b0cb8305ff303c94b61b42ec6c5d0f2e9c9e6b0513d5109a2bf5de9cfdea98bb5c89b3a007cf8e54f21cf5698398c809677113872a6349255770c6cb641921e9059f641163618bf665c902741ba6dbe09e3665e0f9a632c11453d7b740b693eb401cfc796a8084757a9f7df833799db5452e97b09c8ba2a20dc682f8979ef6d406aff6ae84d2f8330392f7225e2810a86676f3f20527f7286d7b04af2cd43781bccb215292d33cd48b1f79f7448ef97c4a2ae88a6a703384a8780b8974b44216f02019b8433e6395363bbdd5c408d5583808c297d4a756267c5786889a5a0c025ad743254419284c1873e317cca56320a8e3b18a0d423614bcb1af66b67a6dc42e365d0b2392c62fb7b8d249907f5f04d6303a22923bee8693de540c5eed6db015375108bff8e895edf322a5763025f55542d33b037c491a29c3b099f0d7ee78caa35539b81f0c3736622742caad6cbdc925be5ab50d1d092fd14776cbf63f0ee61b6a97e370a6e1fa303c3b821dd4c7d3146102f51e32f13e95b9703fa4e28068665c4cbabac957b9f13e] */