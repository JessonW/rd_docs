#客户端相关

##Android端

####1问.uid和token怎么获取与保存？

PreferencesUtils.putLong(AC.context, ACConfiguration.KEY_USERID, uid);

PreferencesUtils.putString(AC.context, ACConfiguration.KEY_TOKEN, token);

##微信

####1.makeQRCode方法，会报service not available的错误
解决方法：
针对service not available的问题，可以检查一下ac.js文件里面第47附近的acServiceDevice的值，以及配置文件config.properties里第17行附近的device_service的值。这两个配置项的值应该都是zc-bind。

####2.在ac.js中，ac.config方法获取wxOpenid、acMajordomain和acsubdomain这三个参数都是从URL中获取的，只是不是意味着html的URL中必须要带有这三个参数
Ac.js支持通过url及cookie两种方式获取参数。如果用 /weixin/oauth2 做完了网页授权，那这个框架会自动在cookie里加上这三个参数，开发者就不用关心了。如果是其它途径加载的网页，那开发者要么用url传参，要么用cookie传参

####3.在js中获取deviceid的值
这个值需要在HTML中通过URL传入，再次需要保证HTML页面已经在微信授权过。

####4.设备现在出现了故障，需要向微信客户端及时报警！这种消息通过什么接口直接发给客户端？

（1）设备向我们的服务器上报数据，在UDS里接收到警报消息，然后由UDS推送消息给微信公众号服务器，最后公众号服务器推消息给微信客户端

（2）另外一种方法，要求设备自己向微信公众号服务器发起HTTP请求，报告消息，然后公众号服务器推消息给微信客户端


#设备相关

## <span class="skip">||SKIP||</span>

####问：AbleCloud现在支持模块类型有哪些？

答：网关型设备、wifi设备、蜂窝网络设备、以太网设备

####问：AbleCloud现在支持WIFI模块有哪些？

答：

对于市面上常见的WiFi模块，AbleCloud都进行了适配，已经完成适配的WiFi模块见下表：

|合作厂商|模块型号|WIFI芯片      | AirKiss|Smartconfig|
|-------|---------------|--------|----------|
|	汉枫   | LPB100         |MTK	         |	支持  |	支持|
|	      | LPB200         | Marvell	   |	支持  |	支持|
|	      | LPT100         |MTK	         |	支持  |	支持|  
|	      | LPT200         |MTK	         |	支持  |	支持|
|	庆科   | EMW3162|broadcom        |	支持  |	支持|
|	      | EMW3165|broadcom        |	支持  |	支持|
|	      | EMW3088| Marvell              |	支持  |	支持|
|	      | EMW1088| Marvell              |	支持  |	支持|
|江波龙 | WK1230         |QCA4004       |	支持   |	支持|
|       | GT1216         |QCA4004       |	支持   |	支持|
|       | GT141         |QCA4004       |	支持   |	支持|
|       | WK1221          |QCA4004       |	支持   |	支持|
|思存	  |ITM-IOE01       |QCA4004		           |	支持 |	支持|
|    	  |ITM-IOE20       |QCA4004		           |	支持 |	支持|
|航锐	  |   HR WF411        |QCA4004		           |	不支持 |	支持|
|   	  |   HR WF422        |QCA4004		           |	不支持 |	支持|
| Marvel|          |Marvel-88MC500|	不支持|	支持|
|联盛德 |          |HED10W07SN        |	支持|	支持|
|卓立合 | LH781         |MTK7681       |  不支持   |支持|
|新岸线 |        | NL6621      |  不支持   |支持|
|Realtek |          |RTL8711       |  支持   |支持|
|村田 |   MIDK       |QCA4002       |  不支持   |支持|
|TI |   cc3200       |  cc3200     |  不支持   |支持|

对于AbleCloud还没有进行适配的模块，AbleCloud提供上层交互所需要的SDK，厂商自己将下层驱动更改一下即可完成适配工作。

对于蜂窝网络和以太网设备，AbleCloud同样提供开发需要的SDk，厂商只需要更改和设备相关的下层驱动 即可完成适配。

对于安装Android、Linux、Windows、Mico操作系统的设备，AbleCloud已完成操作系统的适配。

####问：AbleCloud支持ANDROID和LINUX操作系统设备吗？

答：内测ing，敬请期待


####问：wifi模块怎么连接云端？

答：如果使用的Wi-Fi模块是上述WIFI模块，我们会提供上述WIFI模块的固件，烧写固件后则可正常接入AbleCloud。如果使用自选的WIFI模块，可以联系我们BD，签署相关协议后，可获得相关文档和参考代码资源。

####问：设备端如何从测试环境迁移正式环境

答：对于已经再测试服务器调试的版本，需要修改AC_ConfigWifi函数内容
将
       
     struConfig.u16Port = AC_HTONS(9100); 
     memcpy(struConfig.u8CloudAddr, "test.ablecloud.cn", AC_CLOUD_ADDR_MAX_LEN);
修改为

     struConfig.u16Port = AC_HTONS(9100); 
     memcpy(struConfig.u8CloudAddr, "device.ablecloud.cn", AC_CLOUD_ADDR_MAX_LEN);

打开加密开关

     struConfig.u32SecSwitch = AC_HTONL(1);       //Sec data switch, 1:open, 0:close, 2:close RSA, default 1
待连上云端之后可以将AC_ConfigWifi调用出注释掉，对于新烧写硬件直接将AC_ConfigWifi注释掉即可，再将ac_cfg.h文件中DEFAULT_IOT_PRIVATE_KEY修改为ablecloud后台分配的设备私钥

####问：HF-LPB100的针脚定义是什么？

答：http://gb.hi-flying.com/products_detail/&productId=68f4fd7b-39f8-4995-93ab-53193ac5cf22&comp_stats=comp-FrontProducts_list01-111.html

####问：HF-LPB100如何升级？

答：

1.下载适用于汉枫wifi模块（LPB-100）的AbleCloud联网固件：LPBS2W_UPGARDE.bin。
2.配置WIFI模块，使其联网：

①安装Android手机APP端，注册一个用户，然后登录。

②点击添加新设备，输入WIFI的密码，接着把汉枫模块上电，然后按下Reload键（第4个），接着在APP端点击开始连接，当汉枫模块的Ready和Link指示灯常亮，已联网。

③ 访问路由器，通过汉枫wifi模块的MAC地址，查询到分配给它的IP地址。
 
④在浏览器中输入获取到的IP地址，会弹出如下的界面，然后输入用户名和密码，默认的都为：admin
 
⑤然后点击软件升级，选择刚刚下载的BIN文件，再点击开始升级。
 

####问：如果在设备升级过程中突然遭遇断电或者断网，那么设备再次接入云端后，云端是否会继续向该设备发起升级？

答：当在升级过程中出现异常导致升级失败，在本次升级过程中，只要设备在线，就会再次向该设备重新发起OTA升级。

#云端服务相关

## <span class="skip">||SKIP||</span>

####1.UDS返回查询结果为NULL
H5中获取的时间单位是秒，我们需要的是毫秒。

####2.UDS服务不能上线
配置文件中没有Service的name和classname

####3.报错subdomain不存在
请看DeveloperID填写是否错误



#设备接入相关

## <span class="skip">||SKIP||</span>

####1.设备不能接入云端
设备不能接入云端有以下几种情况：

(1)设备物理的ID重复。一个domain下的设备物理ID不能重复，如果使用相同的物理ID但是subDomain不同，云端会认为设备信息有无，拒绝接入。

(2)如果设备采用加密通信，可能是设备密钥不匹配或者设备没有入库，云端不清楚设备的公钥，无法加密。

(3)网络原因.请确保网络稳定可靠。


####2.APP/UDS 控制设备失败
控制设备失败可能的原因有：

(1)控制频率太高，设备响应不及时导致请求超时。设备能力有限，如果控制频率较高时可能会出现设备响应不及时的问题。

(2)设备MCU异常导致设备无法响应控制请求命令。

(3)设备Wifi模块与MCU之间通信异常。

(4)设备不在线。


####3.设备已经从云端下线，管理后台仍然显示设备在线
这是因为设备与云端采用TCP通信协议，如果设备下线时主动释放链路，那么云端可以立即检测到设备下线；当设备是异常掉电等场景导致设备不能主动断开连接的时候云端需要依赖设备与云端的心跳检测机制去检测设备是否在线，所以存在一定的延时。


####4.UDS未收到设备的上报
出现这种情况的可能原因有：

(1)设备未被用户绑定。云端不允许未绑定的设备进行设备上报。(大部分是这种场景)

(2)设备上报使用的messagecode不应小于200.ablecloud规定200~255之间的message code用于设备上报。


#OTA相关

## <span class="skip">||SKIP||</span>

####1.创建OTA失败

(1)这是因为新创建的OTA与之前存在的OTA基本信息重复。OTA的基本信息有：产品渠道，产品批次，OTA版本号，OTA类型。

(2)OTA文件较大，在网络不稳定的时候出现文件上传失败导致创建OTA失败。

####2.发布OTA失败

这是因为存在未停止发布的OTA版本的升级范围与当前要发布的OTA版本的升级范围有交集。这种情况下可以停止之前发布的OTA版本或者修改将要发布的OTA版本的升级范围直到没有交叉覆盖的时候才能发布成功。举例来说，如果有一个已经发布的版本0-0-1，产品渠道指定为“京东”，如果要发布一个新的OTA版本0-0-2，产品渠道也指定为“京东”，那么这种情况先，0-0-2的版本在0-0-1停止发布之前发布会失败。

#设备管理相关

## <span class="skip">||SKIP||</span>

####1.用户绑定设备失败

用户不能绑定设备的原因有以下几种可能：

（1）设备不在线，设备绑定时要求设备必须在线.

（2）设备被其他用户绑定过了，云端不允许多人绑定同一个设备，用户可通过分享的方式获得对设备的控制权。

（3）绑定过程中云端与设备交换token时，设备未响应导致绑定失败。

####2.控制设备失败

控制设备失败可能的原因有:

(1)控制频率太高，设备响应不及时导致请求超时。设备能力有限，如果控制频率较高时可能会出现设备响应不及时的问题。

(2)设备MCU异常导致设备无法响应控制请求命令。

(3)设备Wifi模块与MCU之间通信异常导致控制命令不能到达MCU。

(4)设备不在线。

(5)设备已经被管理解绑，分享设备的用户与设备的绑定关系自动解除，没有权限控制设备。

(6)控制设备的message code的范围是64~200，云端会检查message code，不符合要求的请求消息会返回错误，开发者可以根据返回的错误信息及时发现问题。

####3.用户解绑设备失败

用户解绑设备失败可能的原因有：

(1)设备已经被管理员解绑了，提示用户要解绑的设备不存在。

(2)设备自己强制解除与所有用户的绑定关系（应用场景：恢复出厂设置，或者设备变更拥有者），导致原绑定的用户不能解绑成功。

(3)网络原因设备已经解绑成功，但是APP解绑请求超时，用户认为解绑失败，重复发起解绑操作。


#HOME模型相关

## <span class="skip">||SKIP||</span>

####1.网关类设备的子设备如何加入home中
网关类设备的子设备比较特殊，只能使用addSubDevice方法加入网关，当网关在home中时，子设备自动加入home中，网关移出home后，子设备自动移出home，当网关移入home后，子设备默认也移入home，需要用户自行将设备移入指定的room。子设备单独移出home也只能通过deleteSubDevice方法将其从网关中移出，云端自动将其从home中移出。

####2.加入home或者room的设备，可以调用unbind方法解绑吗？
当设备在home模型中的时候，不可以调用unbind方法解绑设备，需要调用deleteDeviceFromHome方法将设备解绑

####3.在设备加入home前，分享给某用户，当设备加入home后，该分享用户是否也加入了home？
在设备加入home前的分享关系在设备加入home后保持不变，分享用户可以单独解绑设备。如果用户被邀请加入该home，那么该用户对home中所有的设备用户控制权，包括之前分享给他的设备。

#APP与云端通信相关

## <span class="skip">||SKIP||</span>

####1.APP提示签名失败
(1)APP的本地时间不正确，导致签名超时。

(2)用户未登录。


#管理后台使用相关
