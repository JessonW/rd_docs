#客户端相关



#设备相关
问：AbleCloud现在支持模块类型有哪些？

答：网关型设备、wifi设备、蜂窝网络设备、以太网设备

问：AbleCloud现在支持WIFI模块有哪些？

答：

|WIFI芯片 |模块厂商|AirKiss|Smartconfig|
|--------|-------|--------|----------|
|MTK7681 |卓立合  |不支持   |支持|
|QCA4004 |	江波龙|	支持   |	支持|
|		 |思存	 |	不支持 |	支持|
|		 |航锐	 |	不支持 |	支持|
|MTK	 |	汉枫 |	支持  |	支持|
|Marvel-88MC500| Marvel |	不支持|	支持|
|Marvel  |	庆科 |	支持  |	支持|
|QCA4004 |	RAK  |	不支持|	支持|
|联盛德   |联盛德 |	不支持|	支持|

问：AbleCloud支持ANDROID和LINUX操作系统设备吗？

答：内测ing，敬请期待


问：wifi模块怎么连接云端？

答：如果使用的Wi-Fi模块是上述WIFI模块，我们会提供上述WIFI模块的固件，烧写固件后则可正常接入AbleCloud。如果使用自选的WIFI模块，可以联系我们BD，签署相关协议后，可获得相关文档和参考代码资源。

问：设备端如何从测试环境迁移正式环境

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

问：HF-LPB100的针脚定义是什么？

答：http://gb.hi-flying.com/products_detail/&productId=68f4fd7b-39f8-4995-93ab-53193ac5cf22&comp_stats=comp-FrontProducts_list01-111.html

问：HF-LPB100如何升级？

答：

1.下载适用于汉枫wifi模块（LPB-100）的AbleCloud联网固件：LPBS2W_UPGARDE.bin。
2.	配置WIFI模块，使其联网：

①安装Android手机APP端，注册一个用户，然后登录。

②点击添加新设备，输入WIFI的密码，接着把汉枫模块上电，然后按下Reload键（第4个），接着在APP端点击开始连接，当汉枫模块的Ready和Link指示灯常亮，已联网。

③ 访问路由器，通过汉枫wifi模块的MAC地址，查询到分配给它的IP地址。
 
④在浏览器中输入获取到的IP地址，会弹出如下的界面，然后输入用户名和密码，默认的都为：admin
 
⑤然后点击软件升级，选择刚刚下载的BIN文件，再点击开始升级。
 

问：如果在设备升级过程中突然遭遇断电或者断网，那么设备再次接入云端后，云端是否会继续向该设备发起升级？

答：当在升级过程中出现异常导致升级失败，在本次升级过程中，只要设备在线，就会再次向该设备重新发起OTA升级。



#云端服务相关




#管理后台使用相关