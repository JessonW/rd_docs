#IOS客户端开发指导

#开发环境设置
####系统准备
在进行开发前，需要对系统以及环境进行设置。目前框架支持Objective-C、C语言，因此系统准备基本都是和iOS开发相关，如Mac OS X、Xcode等。

+ **OS X**
系统建议采用Mac OS X 10.11以上的版本
+ **Xcode**
安装Xcode，建议采用7.2以上版本
+ **ablecloud**
下载ablecloud开发框架并解压

####Xcode

1. **新建工程**
选择新建iOS Application，根据需要选择，建议选择Single View Application。
点击**Next**进入下一个页面，根据情况填写Product Name/Organization Name/Organization Identifier等信息。
填好后点击**Next**，进入下一步，填写好存放路径。
至此，新建工程完成。
2. **导入AbleCloudLib**
按照步骤1完成了工程的新建，接下来需要将AbleCloudLib导入到工程中。
右键点击工程中想要导入的Group选择 **Add Files to "your project name"...**
选择AbleCloudLib的路径，勾选**Copy items if needed**，点击**Add**添加。
完成上述步骤后，我们将在工程视图里面看到该目录。
至此，开发者开发服务所以来的ablecloud开发框架库添加成功。
3. **添加依赖库** SDK依赖`libicucore.tbd` `libresolv.tbd` `libz.tbd`, 请分别添加进自己的工程。
4. **本地运行**
Xcode下直接**Command + R**运行。


####应用程序初始化
在你的应用使用AbleCloud服务之前，你需要在代码中对AbleCloud SDK进行初始化。
建议在APP启动方法`didFinishLaunchingWithOptions:`中调用此方法来进行初始化

```objc

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

    //设置主域, 主域id
    [ACloudLib setMajorDomain:<#主域名#> majorDomainId:<#主域ID#>];
    
    //设置环境
    //测试开发阶段使用
    [ACloudLib setMode:ACLoudLibModeTest Region:ACLoudLibRegionChina];
    //上线正式环境使用, Region请根据实际情况自己选择, 详见 ACLoudLib.h
    [ACloudLib setMode:ACloudLibModeRouter Region:ACLoudLibRegionChina];

    return YES;
}

```


#帐号管理

功能介绍参考： [功能说明-功能介绍-帐号管理](../features/functions.md#_1)

用户调用登录接口成功之后，会在app本地存储一个token，下次启动app时即默认app已经登录，无需再进行登录，从v1.09版本之后，这个token具有有效期，在长期未使用app的情况下会过期，这个时候需要进行重新登录处理，所以建议:

**主页获取设备列表的错误回调里对3516的错误码进行单独处理，返回登录页让用户重新登录。**

##一、普通帐号注册

![account_register](../pic/develop_guide/account_register.png)

###账号管理类
```objc
@interface ACAccountManager : NSObject
```
###普通帐号注册流程

####1、检查手机号是否已注册

```objc
    [ACAccountManager checkExist:<#accoun#> callback:^(BOOL exist, NSError *error) {
        if (error) {
            //错误处理
            return;
        }
        if (exist) {
            //提示手机号已经存在, 不可注册
            return;
        }
        //手机号可用, 发送验证码
    }];
```



####2、发送验证码

```objc
    //1代表Ablecloud短信内容的模版，具体开发需要先把短信内容模版提交到Ablecloud再获取对应的参数
    [ACAccountManager sendVerifyCodeWithAccount:<#account#> template:<#(NSInteger)#> callback:^(NSError *error) {
        if (error) {
            //错误处理
            return;
        }
        //发送成功, 检验验证码正确性
    }];
```


####3、检测验证码正确性

```objc
    [ACAccountManager checkVerifyCodeWithAccount:<#account#> verifyCode:<#verifyCOde#> callback:^(BOOL valid, NSError *error) {
        if (error) {
            //错误处理
            return;
        }
        if (!valid) {
            //提示验证码错误
            return;
        }
        //验证成功
    }];
```
####4、注册
用户注册提供了两个api接口, 开发者可根据需求自主选择

```objc
    //phoneNum和email二选一
    [ACAccountManager registerWithPhone:<#phoneNum#> email:<#email#> password:<#passord#> verifyCode:<#verifyCode#> callback:^(NSString *uid, NSError *error) {
        if (error) {
            //错误处理
            return;
        }
        //注册成功, 返回用户的uid
    }];
    
   //phoneNum和email二选一
    [ACAccountManager registerWithNickName:<#nickName#> phone:<#phoneNum#> email:<#email#> password:<#password#> verifyCode:<#verifyCode#> callback:^(ACUserInfo *user, NSError *error) {
        if (error) {
            //错误处理
            return;
        }
        //注册成功, 返回用户信息对象, 详见ACUserInfo.h
    }];    

```

##二、第三方登录

![account_Oauth](../pic/develop_guide/account_Oauth.png)

####1、直接使用第三方登录

```objc
    //provider详见ACAccountManager.h
    [ACAccountManager loginWithOpenId:<#openId#> provider:<#provider#> accessToken:<#accessToken#> callback:^(ACUserInfo *user, NSError *error) {
        if (error) {
            //错误处理
            return;
        }
        //登陆成功, 返回用户信息对象, 详见ACUserInfo.h
    }];
```

####2、在已有普通账号登录时绑定第三方账号

```objc
[ACAccountManager registerWithNickName:userName phone:self.phoneNum email:nil password:passwd verifyCode:self.verifyCode callback:^(ACUserInfo *user, NSError *error)
{
           if(error){
           //返回失败信息，根据error做不同的提示或者处理
            }else{
            //绑定第三方账号成功
            }
}];
```
> 注：该接口需要在使用普通账户登录之后才可以调用




##三、添加帐号扩展属性

使用账号扩展属性需要先到AbleCloud官网平台上的用户管理添加扩展属性

![userExtned](../pic/develop_guide/userExtend.png)

####2、设置用户自定义扩展属性

```objc
	//设置拓展属性值, 要与官网上设置的值一直(类型和名称)
    ACObject *userProfile = [[ACObject alloc] init];
    [userProfile put:@"age" value:@18];
    [userProfile put:@"desc" value:@"用户的个人简介"];
    [userProfile putInteger:@"sex" value:<#性别枚举#>];
	
    [ACAccountManager setUserProfile:userProfile callback:^(NSError *error) {
        if (error) {
            //错误处理
            return;
        }
        //设置成功
    }]; 
```

####3、获取用户自定义扩展属性

```objc
    [ACAccountManager getUserProfile:^(ACObject *profile, NSError *error) {
        if (error) {
            //错误处理
            return;
        }
        //获取用户拓展属性信息, 可使用 profile.getObjectData 获取具体列表
    }];
```

#设备管理

##独立设备

功能介绍参见 [功能说明-功能介绍-设备管理](../features/functions.md#_2)

**用户登录/注册后，需要绑定设备才能够使用。
对于wifi设备:
绑定设备时，首先需在APP上给出配置设备进入Smartconfig(配网)状态的提示
然后填写当前手机连接的WiFi的密码，调用startAbleLink将WiFi密码广播给设备
设备拿到WiFi密码后连接到云端然后开始局域网广播自己的物理Id和域名信息
APP拿到这些信息后调用`bindDevice`接口绑定设备。**

**对于GPRS设备:
则无需以上设备激活的流程，通过扫码或其他方式获取物理Id后调用`bindDevice`进行绑定。**

![DM_wifi](../pic/develop_guide/DM_WiFi.png)

###一．绑定设备

###WiFi设备

####1.ACWifiLinkManager类

Ablecloud提供了ACWifiLinkManager类激活器供你使用

>注: 模拟器不能使用该类, 如需要配网绑定设备, 请使用真机测试

```objc

@interface ACWifiLinkManager : NSObject

- (id)initWithLinkerName:(NSString *)linkerName;
```

><font color="red">注</font>：linkerName表示开发板型号，如果用的是其它的开发板，则需要改成相对应的值。
目前支持的开发板有：
`smartlink`(汉枫)
`oneshot`(联胜德)
`easyconfig`(RAK)
`easylink`(庆科)
`smartconfig`(MTK)
`esptouch`(乐鑫)
`realtek`(瑞昱)
`xlwdevice`(新力维)
`cc3x`(TI) 。

####2.获取WiFi SSID (WIFI的用户名)

```objc
NSString *ssid = [ACWifiLinkManager getCurrentSSID];
```

####3.激活设备
APP通过startAbleLink广播自己的WiFi密码，设备成功连上云之后通过广播通知APP同时获取设备物理Id和域名信息（用来区分设备类型）。**只支持配置当前手机连接的WiFi。**

```objc

    //LinkerName为开发板的名字, 详见文档或ACWifiLinkManager.h
    ACWifiLinkManager *manager = [[ACWifiLinkManager alloc] initWithLinkerName:<#linkerName#>];


//SSID是WiFi名字 password是WiFi密码
    [manager sendWifiInfo:<#SSID#> password:<#password#> timeout:<#timeout#> callback:^(NSArray *localDevices, NSError *error) {
        if (error) {
            //错误处理
            return;
        }
        //拿到本地设备的列表, 其中NSArray中存储的是 ACLocalDevice对象, 详见ACLocalDevice.h
    }];
```
设备无法激活时，请检查以下问题：

- 0. 设备是否进入了配网模式。
- 1. 确认WIFI密码是否输入正确。
- 2. 确认路由器的广播功能有没有被禁用。
- 3. 设备的秘钥可能存在问题。


####4.绑定设备
通过配网获取到的设备列表, 拿到设备返回的`subDomain`和设备`物理id`, 然后调用绑定接口进行设备的绑定

```objc
    [ACBindManager bindDeviceWithSubDomain:<#subDomain#> physicalDeviceId:<#物理id#> name:<#name#> callback:^(ACUserDevice *userDevice, NSError *error) {
        if (error) {
            //绑定失败, 错误处理
            return;
        }
        //绑定成功, 返回设备属性列表, 详见ACUserDevice.h
    }];
```
设备无法绑定时，请检查以下问题：

- 1.设备已经被其他人绑定过了。
- 2.设备的domain和subdomain信息有误。
- 3.电源供电是否正常。
- 4.确保设备的天线正常。
- 5.确保网络环境不是公共环境。

绑定成功后，通过`listdevice`接口可以得到已经绑定的设备列表。

###GPRS设备
**<font color="red">注</font>：GPRS设备无需激活流程，设备连接到GPRS后会自动连接云端完成激活。因此设备上电后就可以直接进入绑定流程。**建议通过扫二维码的形式获取物理Id进行绑定。

```objc
    [ACBindManager bindDeviceWithSubDomain:<#subDomain#> physicalDeviceId:<#物理id#> name:<#name#> callback:^(ACUserDevice *userDevice, NSError *error) {
        if (error) {
            //绑定失败, 错误处理
            return;
        }
        //绑定成功, 返回设备属性列表, 详见ACUserDevice.h
    }];
```

><font color="red">建议流程</font>：若设备上有是否连接上AbleCloud云端的指示灯，则可以提示用户在指示灯亮起的时候绑定设备。若无指示灯，则可在用户点击开始绑定之后，建议通过Timer每隔2s钟绑定一次设备，在连续绑定几次之后再提示用户失败或成功。

###二．分享设备

+ **第一种分享方式是管理员输入用户的帐号（手机号或邮箱）直接把设备分享给用户**
+ **第二种方式为管理员分享二维码后，用户再通过扫码的形式绑定设备获得设备的使用权。推荐使用第二种分享机制。**

####1、管理员直接分享设备给普通用户
```objc
    [ACBindManager bindDeviceWithUserSubdomain:<#subDomain#> deviceId:<#deviceId#> account:<#account#> callback:^(NSError *error) {
        if (error) {
            //分享设备给用户失败, 错误处理
            return;
        }
        //分享成功
    }];
```


####2、管理员通过分享设备二维码的形式分享设备
```objc
	//管理员调用接口
    [ACBindManager getShareCodeWithSubDomain:<#subDomain#> deviceId:<#deviceId#> timeout:<#timeout#> callback:^(NSString *shareCode, NSError *error) {
        if (error) {
            //获取分享码失败, 错误处理
            return;
        }
        //获取分享码shareCode成功
    }];

//普通用户通过分享码绑定设备
    [ACBindManager bindDeviceWithShareCode:<#shareCode#> callback:^(ACUserDevice *userDevice, NSError *error) {
        if (error) {
            //绑定失败, 错误处理
            return;
        }
        //绑定成功, 返回设备属性列表, 详见ACUserDevice.h
    }];
}];
```
<font color ="red"> 注：</font>管理员分享的二维码有有效期。默认为一个小时。调用getShareCodeWithSubDomain接口时开发者可以自定义有效时间。具体使用方法请参考[Reference->客户端-iOS->SDK接口列表->设备管理](../reference/iOS/#_8)

###三．设备解绑

####1、管理员或普通用户解绑设备
<font color=red>注意：</font>如果是管理员解绑设备，那么其他绑定该设备的普通成员也会失去该设备的绑定权。

```objc
    [ACBindManager unbindDeviceWithSubDomain:<#subDomain#> deviceId:<#deviceId#> callback:^(NSError *error) {
        if (error) {
            //解绑失败, 错误处理
            return;
        }
        //解绑成功
    }];
```

####2、管理员取消其他普通成员对该设备的控制权

```objc
    [ACBindManager unbindDeviceWithUserSubDomain:<#subDomain#> userId:<#userId#> deviceId:<#deviceId#> callback:^(NSError *error) {
        if (error) {
            //取消用户权限失败, 错误处理
            return;
        }
        //取消用户权限成功
    }];
}];
```




##网关型设备


功能介绍参见 [功能说明-功能介绍-设备管理](../features/functions.md#_2)

网关的绑定流程和WiFi设备是一样的。网关绑定以后绑定子设备的建议流程如下：

![DM_gateway](../pic/develop_guide/DM_gateway.png)

该流程只是建议流程的一种。其中`openGatewayMatch`和`closeGatewayMatch`接口都是为了方便软件开启配对而开发的接口。如果使用硬件上的操作（如网关上有按钮等）完成网关和子设备的配对，则不需要用到这两个接口。

###一．绑定网关

###WiFi网关

####1.获取ACWifiLinkManager激活器
AbleCloud提供了ACWifiLinkManager激活器供你使用。

```objc
@interface ACWifiLinkManager : NSObject

- (id)initWithLinkerName:(NSString *)linkerName;
```

><font color="red">注</font>：linkerName表示开发板型号，如果用的是其它的开发板，则需要改成相对应的值。
目前支持的开发板有：
`smartlink`(汉枫)
`oneshot`(联胜德)
`easyconfig`(RAK)
`easylink`(庆科)
`smartconfig`(MTK)
`esptouch`(乐鑫)
`realtek`(瑞昱)
`xlwdevice`(新力维)
`cc3x`(TI) 。

####2.获取WiFi SSID (WIFI的用户名)
```objc
NSString *ssid = [ACWifiLinkManager  getCurrentSSID];
```


####3.激活网关
APP通过startAbleLink广播自己的WiFi密码，设备成功连上云之后通过广播通知APP同时获取设备物理Id和域名信息（用来区分设备类型）。**只支持配置当前手机连接的WiFi。**

```objc

    //LinkerName为开发板的名字, 详见文档或ACWifiLinkManager.h
    ACWifiLinkManager *manager = [[ACWifiLinkManager alloc] initWithLinkerName:<#linkerName#>];


	//SSID是WiFi名字 password是WiFi密码
    [manager sendWifiInfo:<#SSID#> password:<#password#> timeout:<#timeout#> callback:^(NSArray *localDevices, NSError *error) {
        if (error) {
            //错误处理
            return;
        }
        //拿到本地设备的列表, 其中NSArray中存储的是 ACLocalDevice对象, 详见ACLocalDevice.h
    }];
```

设备无法激活时，请检查以下问题：

- 0. 设备是否进入了配网模式。
- 1. 确认WIFI密码是否输入正确。
- 2. 确认路由器的广播功能有没有被禁用。
- 3. 设备的秘钥可能存在问题。


####4.绑定网关
在成功激活设备后的回调方法中，通过物理Id绑定网关。

```objc
    [ACBindManager bindDeviceWithSubDomain:<#subDomain#> physicalDeviceId:<#物理id#> name:<#name#> callback:^(ACUserDevice *userDevice, NSError *error) {
        if (error) {
            //绑定失败, 错误处理
            return;
        }
        //绑定成功, 返回设备属性列表, 详见ACUserDevice.h
    }];
```

###以太网网关

<font color="red">注</font>：以太网网关无需激活流程，在网关插上网线连上云端之后即可以直接进入绑定设备的流程。建议通过扫码的形式获取网关物理Id进行绑定。

```objc
    [ACBindManager bindDeviceWithSubDomain:<#subDomain#> physicalDeviceId:<#物理id#> name:<#name#> callback:^(ACUserDevice *userDevice, NSError *error) {
        if (error) {
            //绑定失败, 错误处理
            return;
        }
        //绑定成功, 返回设备属性列表, 详见ACUserDevice.h
    }];
```

###二．绑定子设备

####1．开启网关接入配对
由于子设备接入网关是一个异步的过程，所以建议在这里new一个Timer去定时获取新加入的子设备列表，在activity退出时停止Timer

```objc
    [ACBindManager openGatewayMatchWithSubDomain:<#subDomain#> gatewayDeviceId:<#deviceId#> time:<#timeout#> callback:^(NSError *error) {
        if (error) {
            //开启失败, 错误处理
            return;
        }
        //开启成功
    }];
```

####2．列举所有新加入的子设备列表

```objc
    [ACBindManager listSubDevicesWithSubDomain:<#subDomain#> gatewayDeviceId:<#deviceId#> callback:^(NSArray *devices, NSError *error) {
        if (error) {
            //获取失败, 错误处理
            return;
        }
        //获取成功. 数组中是ACUserDevice对象, 详见ACUserDevice.h
    }];
```

<font color="red">注</font>：该接口可以在APP端列出所有当前被网关扫描出来的但之前尚未被添加到该网关的子设备。即列表中的设备都可以直接调用addSubDevice接口添加到网关。

####3．绑定子设备
通过上一步获取的子设备列表获取`physicalDeviceId`进行绑定。
如有用户确认过程的话，则在用户点击确认之后循环调用此接口绑定用户选择的子设备。

```objc
    [ACBindManager addSubDeviceWithSubDomain:<#subDomain#> gatewayDeviceId:<#deviceId#> physicalDeviceId:<#physicalDeviceId#> name:<#name#> callback:^(ACUserDevice *device, NSError *error) {
        if (error) {
            //添加子设备失败, 错误处理
            return;
        }
        //添加成功, 返回子设备信息, 详见ACUserDevice.h
    }];
```

<font color="red">注</font>：在绑定子设备addSubDevice的success回调里只是成功绑定该physicalDeviceId的单个设备，建议在成功绑定所有子设备之后再提示绑定成功。

若无法添加子设备时，请检查是否有以下问题：

- 0. 网关掉线
- 1. 子设备已经被其他人绑定
- 2. 子设备subdomain填写错误
- 3. 子设备和网关的连接断开了

##Home模型

功能介绍参见 [功能说明-功能介绍-设备管理](../features/functions.md#_2)


创建Home，然后绑定WiFi设备的建议流程如下图：

![DM_home_wifi](../pic/develop_guide/DM_home_wifi.png)

创建Home，然后绑定以太网或者GPRS设备的建议流程如下图：

![DM_home_gprs](../pic/develop_guide/DM_home_gprs.png)

创建Home，然后绑定WiFi网关，再向网关添加Zigbee子设备的建议流程如下图：

![DM_home_gateway_wifi](../pic/develop_guide/DM_home_gateway_wifi.png)

创建Home，然后绑定以太网网关，再向网关添加Zigbee子设备的建议流程如下图：

![DM_home_gateway_wired](../pic/develop_guide/DM_home_gateway_wired.png)


###一、创建Home

 
####1、创建Home
```objc
    [ACGroupManager createHomeWithName:<#name#> callback:^(ACHome *home, NSError *error) {
        if (error) {
            //创建失败, 错误处理
            return;
        }
        //返回创建成功的home模型, 详见ACHome.h
    }];
```


####2、创建Room

```objc
    [ACGroupManager createRoomWithHomeId:<#homeId#> name:<#name#> callback:^(ACRoom *room, NSError *error) {
        if (error) {
            //创建失败, 错误处理
            return;
        }
        //创建成功, 返回room模型, 详见ACRoom.h
    }];

```

###二、添加或移动设备到Home里

><font color="red">特别注意</font>：

>1、添加设备到Home的流程与独立设备和网关型设备的绑定流程相同，均要求设备是已经激活（在线）的状态。建议独立设备在激活设备之后通过addDeviceToHome直接添加设备到home里；GPRS设备或以太网网关则直接使用addDeviceToHome添加设备。

>2、不能跨home移动设备。比如独立设备要移到room里，则需要先把它移动到home，再移动到room，不允许直接移动设备到room里。

####添加设备到Home里
创建完Home之后，需要添加绑定设备，绑定流程见上篇独立设备或网关开发指导，把bindDevice改成如下接口即可。

```objc
    //旧设备
    [ACGroupManager addDeviceToHomeWithSubDomain:subDomain deviceId:deviceId homeId:homeId name:name callback:^(BOOL isSuccess, NSError *error) {
        if (!error) {
            if (isSuccess) {
                //添加设备成功
            }
        } else {
            //错误处理
        }
    }];
    //新设备
    [ACGroupManager addDeviceToHomeWithSubDomain:subDomain physicalDeviceId: physicalDeviceId homeId:homeId name:name callback:^(BOOL isSuccess, NSError *error) {
        if (!error) {
            if (isSuccess) {
                //添加设备成功
            }
        } else {
            //错误处理
        }
    }];
```

####移动设备到Room里
```objc
[ACGroupManager moveDeviceToRoomWithDeviceId:devideId homeId:homeId roomId:roomId callback:^(BOOL isSuccess, NSError *error) {
        if (!error) {
            if (isSuccess) {
                //移动设备成功
            }
        } else {
            //错误处理
        }
    }];
```
<font color-"red">注:</font>若出现错误，请检查该Room和Deivce是否在同一Home下。

##设备扩展属性

功能介绍参见 [功能说明-功能介绍-设备管理](../features/functions.md#_2)
deviceProfile
**<font color="red">注意</font>：设备扩展属性需要先进入到控制台产品管理-->产品列表-->管理-->产品属性-->扩展属性-->新建属性，建立完扩展属性列表后才能使用如下接口。**

![deviceProfile](../pic/develop_guide/deviceProfile.png)

####一、设置或者更新设备扩展属性

```objc
    ACObject *deviceProfile = [[ACObject alloc] init];
    [deviceProfile putInteger:@"price" value:500];
    [deviceProfile put:@"color" value:@"red"];
    [deviceProfile put:@"description" value:@"设备介绍"];
    
    [ACBindManager setDeviceProfileWithSubDomain:<#subDomain#> deviceId:<#deviceId#> profile:deviceProfile callback:^(NSError *error) {
        if (error) {
            //设置失败, 错误处理
            return;
        }
        //设置成功
    }];
```

####二、获取设备扩展属性

```objc
    [ACBindManager getDeviceProfileWithSubDomain:<#subDomain#> deviceId:<#deviceId#> callback:^(ACObject *profile, NSError *error) {
        if (error) {
            //错误处理
            return;
        }
        //获取用户拓展属性信息, 可使用 profile.getObjectData 获取具体列表
    }];
```


#云端通信

功能介绍参见 [功能说明-功能介绍-云端通信](../features/functions.md#_12)

**说明**：在设备尚未开发完成时，在管理后台可以启动虚拟设备用于APP的调试。虚拟设备和真实设备使用方法相同，需要先绑定再使用。虚拟设备能够显示APP发到设备的指令，上报数据到云端、填入数据供APP查询。

##一、发送消息到设备
发送消息到设备支持局域网发送和云端发送两种模式,
局域网通讯支持三种安全级别, 详见`ACDeviceMsg`中的`ACDeviceSecurityMode`枚举
局域网通讯动态加密方式需先调用`ACBindManager`中的`listDevice/listDeviceWithStatus`接口获取设备信息,
局域网通讯非动态加密需调用`ACFindDeviceManager`中的`findDevice`接口获取本地设备信息


###二进制格式

**在新建产品的时候选择数据格式为二进制，然后在功能点里面创建了数据包**

【数据包】
![binary_datapackage](../pic/develop_guide/cloud_communication_binary_pkg.png)

**例如**：以开关设备为例,协议如下:

```
//请求数据包
{ 68 ：
    //开关灯(二进制流，由厂商自己解析)，其中0代表关灯，1代表开灯
    [ 0/1 , 0 , 0 , 0 ]
}
//响应数据包  
{ 102 ：
    //结果(二进制流，由厂商自己解析)，其中0代表失败，1代表成功
    [ 0/1 , 0 , 0 , 0 ]
}
```
截取开灯代码，如下:

```objc
//开灯的二进制指令
Byte content[] ={1, 0, 0, 0};
NSData *payload = [NSData dataWithBytes:content length:sizeof(content)];
    
ACDeviceMsg *msg = [[ACDeviceMsg alloc] initWithCode:68 binaryData:payload];
//通讯的加密模式, 默认是动态加密方式
[msg setSecurityMode:ACDeviceSecurityModeNone];
    
[ACBindManager sendToDeviceWithOption:<#ACDeviceCommunicationOption#>
                           SubDomain:<#subdomain#>
                    physicalDeviceId:<#physicalDeviceId#>
                                 msg:msg
                            callback:^(ACDeviceMsg *responseMsg, NSError *error) {
                                
                                if (error) {
                                    //错误处理
                                    return;
                                }
                                //开灯成功
}];
```

###json格式

**在新建产品的时候选择数据格式为JSON，并填写功能点里的数据点与数据包。**

这里创建的数据点和数据包如下所示：

【数据点】
![json_datapoint](../pic/develop_guide/cloud_communication_json.png)

【数据包】
![json_datapackage](../pic/develop_guide/cloud_communication_json_pkg.png)


**例如**：以开关设备为例,协议如下:

```objc
//请求数据包
{ 70 ：
    {
        //开关灯，其中0代表关灯，1代表开灯
        "switch" : 0/1
    }
}
//响应数据包  
{
     //结果，其中false代表失败，1代表成功
     "result" : false/true
}
```

```objc
//开灯的json格式指令
ACMsg *obj = [[ACMsg alloc] init];
[req putInteger:@"switch" value:1];
    
ACDeviceMsg *msg = [[ACDeviceMsg alloc] initWithCode:68 ACObject:obj];
//通讯的加密模式, 默认是动态加密方式
[msg setSecurityMode:ACDeviceSecurityModeNone];
   
[ACBindManager sendToDeviceWithOption:<#ACDeviceCommunicationOption#>
                           SubDomain:<#subdomain#>
                    physicalDeviceId:<#physicalDeviceId#>
                                 msg:msg
                            callback:^(ACDeviceMsg *responseMsg, NSError *error) {
                                if (error) {
                                    //错误处理, 开灯失败
                                    return;
                                }
                                //开灯成功
}];

```

###KLV格式

KLV协议介绍请参考：[功能介绍-KLV协议介绍](../features/functions.md#klv)。

**在新建产品的时候选择klv通讯协议，并填写功能点里的数据点与数据包。**
这里创建的数据点和数据包如下所示：

【数据点】
![klv_datapoint](../pic/develop_guide/cloud_communication_klv.png)

【数据包】
![klv_datapackage](../pic/develop_guide/cloud_communication_klv_pkg.png)


**例如**：以开关设备为例,协议如下:

```objc
//请求数据包
{ 69 ：[
//数据点[key：value(int8)]，其中0代表关灯，1代表开灯
{ 1 : 0/1 }
]}
//响应数据包  
{ 60 ：[
//数据点[key：value(boolean)]，其中false为失败，true为成功
{ 1 : false/true }
]}
```

```objc
//开灯的klv指令
ACKLVObject *klvObj = [[ACKLVObject alloc] init];
[klvObj putInt:1 value:1];
ACDeviceMsg *klvMsg = [[ACDeviceMsg alloc] initWithCode:69 KLVObject:klvObj];

//通讯的加密模式, 默认是动态加密方式
[msg setSecurityMode:ACDeviceSecurityModeNone];
   
[ACBindManager sendToDeviceWithOption:<#ACDeviceCommunicationOption#>
                           SubDomain:<#subdomain#>
                    physicalDeviceId:<#physicalDeviceId#>
                                 msg:klvMsg
                            callback:^(ACDeviceMsg *responseMsg, NSError *error) {
                                if (error) {
                                    //错误处理, 开灯失败
                                    return;
                                }
                                //开灯成功
}];

```


##二、发送消息到服务

####访问普通UDS服务
<font color="red">注意</font>：serviceName对应服务管理里UDS服务里的**服务名称**，务必保持一致。进入版本管理之后，查看已上线版本。serviceVersion为**主版本号**，比如1-0-0，则version为1。

```objc
    ACMsg *msg = [[ACMsg msgWithName:<#name#> subDomain:<#subDomain#>];
    
    ACServiceClient *serviceClient = [[ACServiceClient alloc] initWithHost:[ACloudLib getHost]
                                                                   service:<#service#>
                                                                   version:1];
                   
    [serviceClient sendToService:msg callback:^(ACMsg *responseObject, NSError *error) {
        
        if (error) {
            //网络错误或其他,根据error.code作出不同提示和处理,此处一般为UDS云端问题,可到AbleCloud平台查看log日志
            return;
        }
        //发送成功并接受服务的响应消息
    }];
```
####匿名访问UDS服务

```objc
    ACMsg *msg = [[ACMsg msgWithName:<#name#>];
    
    [ACServiceClient sendToServiceWithoutSignWithSubDomain:<#subDomain#> ServiceName:<#serviceName#> ServiceVersion:1 Req:msg Callback:^(ACMsg *responseMsg, NSError *error) {
        if (error) {
            //网络错误或其他,根据error.code作出不同提示和处理,此处一般为UDS云端问题,可到AbleCloud平台查看log日志
            return;
        }
        //发送成功并接收服务的响应消息
    }];
```

##三、实时消息

实时消息第一版的设计与store数据集直接相关，当数据表格的存储有发生变化时，如创建、更新、添加、删除操作时才会下发数据到APP。也就是说，如果要APP上实时显示数据变化，需要在管理后台创建数据集，并指定是否监控该数据集。然后写云端自定义服务，将需要实时显示的数据存储到该数据集中。这样当该数据集有变化时，APP端才能够实时显示对应的数据变化。

![cloud_syn](../pic/develop_guide/cloud_syn.png)

####1、获取实时消息管理器

```objc
#import "ACPushManager.h"
ACPushManager *pushManager = [[ACPushManager alloc] init];
```

####2、创建与服务器的连接
```objc
    [manager connectWithCallback:^(NSError *error) {
        if (error) {
            //建立连接失败, 错误处理
            return;
        }
        //建立连接成功, 订阅数据集
    }];
```

####3、订阅实时数据
以如下数据集为例：

![cloud_syn_1](../pic/develop_guide/cloud_syn_1.png)

```objc
//实例化ACPushTable对象
ACPushTable *table = [[ACPushTable alloc] init];
//设置订阅的表名
table.className = @"<#name#>";
//设置订阅的columns行
table.cloumns = @[<#Valve1#>, <#value2#>,...];
//设置监听类型，如以下为只要发生创建、删除、替换、更新数据集的时候即会推送数据
table.opType =  OPTYPE_CREATE |OPTYPE_DELETE | OPTYPE_REPLACE | OPTYPE_UPDATE;
//设置监听主键，此处对应添加数据集时的监控主键(监控主键必须是数据集主键的子集)
ACObject *primaryKey = [[ACObject alloc] init];
[primaryKey putInteger:@"deviceId" value:<#value#>];
table.primaryKey = primaryKey;
//可以多次调用以下此方法watch多个table
[pushManager watchWithTable:table Callback:^(NSError *error) {
	   if (!error) {
	   //订阅成功
	   }else{
	   //订阅失败，请自行检查参数类型，表名，columns以及监听主键是否与AbleCloud平台新建的数据集监听主键一致等是否有误。
	   }
}];
```

####4、接收已订阅的实时数据

```objc
[pushManager onReceiveWithCallback:^(ACPushReceive *pushReceive, NSError *error) {
   if (!error) {
   //pushReceive.className 表名
   //pushReceive.opType 接收类型，如ACPushTableOpType.CREATE
   //pushReceive.Payload 接收数据ACObject格式
   ACObject *obj = pushReceive.payload;
   }
}];
```

####5、取消订阅
建议在退出订阅的activity之后调用，避免造成流量浪费。

```objc
//table为上面的表对象
[pushManager unWatchWithPushTable:table Callback:^(NSError *error) {
             if (!error) {
             //取消订阅成功
            }else{
            //取消订阅失败，请自行检查参数类型，表名以及监听主键是否与AbleCloud平台新建的数据集监听主键一致等是否有误。
            }
}];
```


#局域网通信

功能介绍参见 [功能说明-功能介绍-局域网通信](../features/functions.md#_18)

获取设备列表（在网络环境差的情况下如果获取不到设备列表会从本地缓存里取设备列表）。

```objc
    [ACBindManager listDevicesWithStatusCallback:^(NSArray *devices, NSError *error) {
        if (error) {
            //获取设备列表失败
            return;
        }
        //获取设备列表, devices里存放的是ACUserDevice对象. 详见ACUserDevice.h
        [devices enumerateObjectsUsingBlock:^(ACUserDevice *device, NSUInteger idx, BOOL * _Nonnull stop) {
            /**
             * 设备在线状态(listDeviceWithStatus时返回，listDevice不返回该值)
             * 0不在线 1云端在线 2局域网在线 3云端和局域网同时在线
             * 若只选择直连的通讯方式，则只有在2和3的状态下才能往设备发送成功
             */
            //设备在线状态
            NSInteger status = device.status;
        }];
    }];
```
><font color=red>注意</font>：app启动初始化AbleCloud时会自动获取局域网设备，由于获取局域网设备是一个异步过程（默认时间为2s），用户可在自定义设置超时的timeout(建议为闪屏页的时间)，所以建议在启动app到打开设备列表页面之间根据实际情况增加一个闪屏页面。

因为局域网通讯要求设备与APP处于同一个WiFi下，若网络环境变化，如切换WiFi时，或者设备掉线时，直连的状态会发生改变，所以建议在设备页通过定时器手动定时更新局域网状态。

```objc
    //手动调用局域网发现 subDomainId:子域ID(传0即可) timeout:(根据实际需求自定义设置)
    ACloudLib *cloud = [[ACloudLib alloc] init];
    [cloud findDeviceTimeout:<#timeout#> SudDomainId:<#subDomainId#> callback:^(NSArray *localDeviceList) {
        //数组里存放的是局域网设备列表, ACLocalDevice对象, 详见ACLocalDevice.h
    }];
```
><font color=red>注意</font>：使用定时器时建议放于主线程处理
最后，至于如何通过直连方式给设备发消息，详情见[和云端通讯](#_19)部分。


#定时任务

功能介绍参见 [功能说明-功能介绍-定时任务](../features/functions.md#_19)


## <span class="skip">||SKIP||</span>

####获取定时管理器－－ACTimerManager类
**使用默认时区**

```objc
ACTimerManager *manager =［[ACTimerManager alloc］init;
```

**使用自定义时区**

```objc
ACTimerManager *manager = [[ACTimerManager alloc] initWithTimeZone:<#timeZone#>];
```

####添加定时任务
>**<font color="red">注意</font>：**

>**1、timePoint的格式为`"yyyy-MM-dd HH:mm:ss"`，否则会失败。**

>**2、timeCycle需要在timePoint时间点的基础上,选择循环方式。**

>+ **"once":**单次循环

>+ **"hour":**在每小时的**`mm:ss`**时间点循环执行

>+ **"day":**在每天的**`HH:mm:ss`**时间点循环执行

>+ **"month":**在每月的**`dd HH:mm:ss`**时间点循环执行

>+ **"year":**在每年的**`MM-dd HH:mm:ss`**时间点循环执行


>+ **"week[0,1,2,3,4,5,6]":**在每星期的**`HH:mm:ss`**时间点循环执行(如周一，周五重复，则表示为"week[1,5]")

####添加定时任务

```objc
    //payload根据厂商而定，此处只是示例
    Byte content[] = {1, 0, 0, 0};
    NSData *data =  [NSData dataWithBytes:content length:sizeof(content)];
    
    ACDeviceMsg *msg = [[ACDeviceMsg alloc] initWithCode:68 binaryData:data];
                        
    [manager addTaskWithDeviceId:<#deviceId#> name:<#name#> timePoint:<#timePoint#> timeCycle:<#timeCycle#> deviceMsg:msg OnType:<#type#> callback:^(NSError *error) {
        if (error) {
            //添加定时任务失败, 错误处理
            return;
        }
        //添加定时任务成功
    }];
```

####修改定时任务
接口为modifyTask，其他参数与定义与创建定时任务相同。

####开启定时任务

```objc
    [manager openTaskWithDeviceId:<#deviceId#> taskId:<#taskId#> callback:^(NSError *error) {
        if (error) {
            //开启定时任务失败, 错误处理
            return;
        }
        //开启定时任务成功
    }];
    
```

####关闭定时任务

```objc
    [manager closeTaskWithDeviceId:<#deviceId#> taskId:<#taskId#> callback:^(NSError *error) {
        if (error) {
            //关闭定时任务失败, 错误处理
            return;
        }
        //关闭定时任务成功
    }];

```

####删除定时任务

```objc
    [manager deleteTaskWithDeviceId:<#deviceId#> taskId:<#taskId#> callback:^(NSError *error) {
        if (error) {
            //删除定时任务失败, 错误处理
            return;
        }
        //删除定时任务成功
    }];
```

####获取定时任务列表

```objc
    [manager listTasksWithDeviceId:<#deviceId#> callback:^(NSArray *timerTaskArray, NSError *error) {
        if (error) {
            //获取失败, 错误处理
            return;
        }
        //获取任务列表, 数组存放的是ACTimerTask对象, 详见ACTimerTask.h
    }];
```



#OTA

功能介绍参见 [功能说明-功能介绍-OTA](../features/functions.md#ota)


## <span class="skip">||SKIP||</span>


##普通设备OTA (非蓝牙设备OTA)

![OTA](../pic/develop_guide/OTA.png)

若使用场景为开启APP之后自动检测升级，建议把检测升级过程放在application里，并维护一个deviceId和ACOTAUpgradeInfo的映射关系，通过static修饰放到内存里，在进入OTA升级页面后可以直接取出来显示。如想实现用户取消升级之后不再提示功能，则可以自己维护一个变量记录。

####一.获取OTA管理器对象--ACOTAManager类

```objc
@interface ACOTAManager : NSObject
```

####二. 检查升级

检查设备是否有新的OTA版本

```objc

    ACOTACheckInfo *checkInfo = [ACOTACheckInfo checkInfoWithDeviceId:<#deviceId#> otaType:ACOTACheckInfoTypeSystem];
    [ACOTAManager checkUpdateWithSubDomain:<#subDomain#> OTACheckInfo:checkInfo callback:^(ACOTAUpgradeInfo *checkInfo, NSError *error) {
        NSLog(@"资源:%@---meta:%@",checkInfo, checkInfo.meta);
        if (!checkInfo.update) {
            NSLog(@"不需要升级");
            return;
        }
       //调用确认升级接口
    }];

```

####三．确认升级
```objc
[ACOTAManager confirmUpdateWithSubDomain:subDomain deviceId:deviceId newVersion:newVersion callback:^(NSError *error) {
          if(error) {
          //返回失败信息，根据error.code做不同的提示或者处理
          } else {
          //确认升级
         }
}];
```

##蓝牙设备OTA

####一、获取OTA管理器对象
```objc
@interface ACOTAManager : NSObject
```

####二、查询OTA新版本信息

```objc
- (IBAction)checkUpdate:(id)sender {
    ACOTACheckInfo *checkInfo = [ACOTACheckInfo checkInfoWithPhysicalDeviceId:<#PhysicalDeviceId#> version:<#version#>];
    
    [ACOTAManager checkUpdateWithSubDomain:<#subDomain#>
                              OTACheckInfo:checkInfo
                                  callback:^(ACOTAUpgradeInfo *checkInfo, NSError *error) {
                                  if (error) {
                                          //错误处理
                                          return;
                                      }
                                      if (!checkInfo.update) {
                                          //不需要升级
                                          return;
                                      }
                                      //提示是否下载ota文件
    }];
}
```

####下载OTA文件

```objc

- (void)downloadOTA:(ACOTAUpgradeInfo *)checkInfo {
	//获取文件管理器对象
    ACFileManager *manager = [[ACFileManager alloc] init];
    [manager downFileWithsession:checkInfo.meta.downloadUrl checkSum:checkInfo.meta.checksum callBack:^(float progress, NSError *error) {
    //进度回调
        NSLog(@"%f---error:%@", progress, error);
    } CompleteCallback:^(NSString *filePath) {
        NSLog(@"下载完成:%@", filePath);
    }];
}
```


#推送

功能介绍参见 [功能说明-功能介绍-推送](../features/functions.md#20)


AbleCloud的推送使用[友盟](http://www.umeng.com/)的服务，在开发功能之前，现需要进行一些配置。

##推送开发准备

下面以友盟推送为例，介绍开发推送功能前需要做的准备工作。

首先，需要创建友盟推送账号，并创建应用（安卓和iOS版本需要单独创建），如下图所示。

![push1](../pic/develop_guide/push1.png) 

记录“应用信息”中的AppKey和App Master Secret，将其填写到test.ablecloud.cn中。AbleCloud和友盟已经达成合作协议，服务器IP地址一项不需要填写。

![push2](../pic/develop_guide/push2.png) 

友盟平台配置完成后，到AbleCloud的管理后台的推送管理页面填写对应信息即可使用AbleCloud提供的推送服务。
![push3](../pic/develop_guide/push3.png)

在AbleCloud平台中添加应用，并填写App Key和App Master Secret

><font color="red">注意</font>

>1、调试的时候若开发环境配置有变化的话尽量手动卸载APP之后再重新安装。

>2、推荐先登录友盟推送的后台进行推送测试，若能收到推送通知即代表流程通过，最后再与UDS服务进行下一步测试。

>3、推荐先使用友盟推送后台的设备状态查询（通过接口获取）或者设备别名查询（即登录成功之后的userId）等工具确认是否成功注册推送服务。若注册成功之后仍没有收到通知消息，再检查一下开发环境配置。


##一、推送准备

####添加 AppKey 和 Umeng Message Secret


##二、开启推送服务

AbleCloud在SDK中提供了与推送服务相关的接口（封装了友盟的部分接口），定义如下：

####1、获取推送管理器－－ACNotificationManager类
```objc
@interface ACNotificationManager : NSObject
```

####2、在应用的启动函数中开启推送服务
```objc
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions 
{
        [ACNotificationManager       startWithAppkey:@"您的appKey" launchOptions:launchOptions];
}
```

####3、在登录成功之后添加推送别名
```objc
[ACNotificationManager addAliasWithUserId:user.userId callback:^(NSError *error) {
         if(error){
         NSLog(@"推送添加别名失败");
         }else{
         //成功
         }
}];
```

####4、在退出登录之后移除掉旧的别名
```objc
[ACNotificationManager removeAliasWithUserId:uid callback:^(NSError *error){
           if(error){
             //移除失败，处理错误信息
            }else{
            //移除成功
            }
}
```


#文件存储

功能介绍参见 [功能说明-功能介绍-文件存储](../features/functions.md#_21)

><font color="red">注意</font>：

>1、iOS权限原因，下载文件上传文件的操作只能在本应用的沙盒中操作

>2、文件下载功能是基于系统自带的NSURLSession框架实现

>3、上传下载支持断点续传功能




##一、获取文件管理器

```objc
ACFileInfo *fileInfo = [ACFileInfo fileInfoWithName:<#name#> bucket:<#bucket#> CheckSum:0];
```

##二、下载文件
###1、获取下载url

```objc
//expireTime URL有效期，单位秒，国内环境下若小于等于0则默认为永久有效，国外环境暂时不支持长期有效
    ACFileManager *manager = [[ACFileManager alloc] init];
    [manager getDownloadUrlWithfile:fileInfo ExpireTime:0 payloadCallback:^(NSString *urlString, NSError *error) {
        if (error) {
            //获取下载链接失败, 错误处理
            return;
        }
        //获取下载链接
    }];
```
###2、根据url下载文件

```objc
    [manager downFileWithsession:<#urlString#> checkSum:<#checkSum#> callBack:^(float progress, NSError *error) {
        if (error) {
            //下载失败, 错误处理
            return;
        }
        //完成进度的回调
    } CompleteCallback:^(NSString *filePath) {
        //下载成功路径
    }];
```
<font color = "red">注: </font>如果需要下载的是图片, 开发者也可以在获取到urlString以后调用SDWebImage等第三方图片加载库加载网络图片.

##三、上传文件
如果对文件的管理有权限管理方面的需求的话，则需要使用到以下接口；如果不设置情况下则默认所有用户都有读取权限，只有上传者本人有修改写文件的权限
###1、设置上传文件的权限管理

```objc
/**
* 设置全局可读访问权限，不设置则默认为所有人可读
* @param allow 是否全局可读
*/
-(void)setPublicReadAccess:(BOOL)allow;

/**
* 设置全局可写访问权限，不设置则默认为除自己外的所有人不可写
* @param allow 是否全局可写
*/
-(void)setPublicWriteAccess:(BOOL)allow;

/**
* 设置用户可访问权限（白名单）
* @param opType 权限类型，OpType.READ为可读权限，OpType.WRITE为可写权限
* @param userId 被设置用户Id
*/
-(void)setUserAccess:(OpType)optype userId:(long)userId;

/**
* 设置用户访问权限（黑名单）
* @param opType 权限类型，OpType.READ为可读权限，OpType.WRITE为可写权限
* @param userId 被设置用户Id
*/
-(void)setUserDeny:(OpType)optype userId:(long)userId;
```

<font color="red">**规则**：</font>优先判断黑名单，黑名单命中后其他设置无效，其次判断白名单，最后判断全局设置属性。例如同时设置userId为1的用户为黑名单和白名单，则设置的白名单无效。

###2、上传文件
####1)、设置上传文件信息－－ACFileInfo类

```objc
@interface ACFileInfo : NSObject
```
####2)、上传

```objc
//上传小型文件(图片, 视频)
    UIImage *image = [UIImage imageNamed:@"1.pic_hd.jpg"];
    NSData *data = UIImagePNGRepresentation(image);
    ACFileInfo *fileInfo = [ACFileInfo fileInfoWithName:@"image" bucket:@"bucket" CheckSum:0];
    fileInfo.data = data;
    [[[ACFileManager alloc] init] uploadFileWithfileInfo:fileInfo progressCallback:^(float progress) {
        //上传进度
    } voidCallback:^(ACMsg *responseObject, NSError *error) {
        if (error) {
        	//上传失败, 错误处理
       	return;
        }
        //上传成功
    }];
```

```objc

//上传路径文件
	ACFileInfo * fileInfo = [[ACFileInfo alloc] initWithName:@"3.jpg" bucket:@"jpg"];
	fileInfo.filePath = <#path#>;
	fileInfo.acl = [[ACACL alloc] init];
	upManager = [[ACFileManager alloc] init];
	[[[ACFileManager alloc] init] uploadFileWithfileInfo:fileInfo progressCallback:^(float progress)｛
	        //上传进度
	    } voidCallback:^(ACMsg *responseObject, NSError *error) {
	        if (error) {
	        	//上传失败, 错误处理
	       	return;
	        }
	        //上传成功
	}
```

```objc 
/**
* //取消上传
* @param subDomain     用户subDmomain
* @param fileInfo      文件信息
*/
-(void)cancleUploadWithfileInfo:(ACFileInfo *)fileInfo;
```

#辅助功能
SDK提供了一些额外的辅助功能
##用户意见反馈
AbleCloud提供APP端的用户意见反馈接口。开发者可以开发用户提交意见的页面。用户意见反馈可以反馈的项由开发者自己定义。
使用意见反馈前,需要先在控制台设置反馈项参数
![cloud_syn_1](../pic/develop_guide/submitFeedback.png)


###一 建议的开发流程
参考以下代码示例, 如果不需要上传图片等资源, 只需要调用第四步. 

如果需要上传图片资源, 请按下以下顺序调用接口

流程如下:

1. 初始化`ACFileInfo`，设置图片上传到云端的目录`bucket`、文件名`name`、文件等

2. 根据`ACFileInfo`将要反馈的图片信息上传到云端

3. 上传成功后根据`ACFileInfo`获取图片下载的urlString

4. 将反馈信息和第三步获取到的URLString作为参数填入意见反馈接口对应的value位置


###二 代码示例

####1. 设置要上传图片的fileInfo
```objc
    ACFileManager *manager = [[ACFileManager alloc] init];
    ACFileInfo *fileInfo = [ACFileInfo fileInfoWithName:<#fileName#> bucket:<#bucket#> CheckSum:0];
    //开发者自行选择以下两种上传方式
    //大文件, 提供filePath, 支持断点续传
    fileInfo.filePath = [[NSBundle mainBundle] pathForResource:@"xxx.jpg" ofType:nil];
    //小文件, 提供data, 不支持断点续传
    fileInfo.data = <#data#>;
```
####2. 调用上传接口
```objc
    [manager uploadFileWithfileInfo:fileInfo progressCallback:^(float progress) {
        NSLog(@"%f", progress);
    } voidCallback:^(ACMsg *responseObject, NSError *error) {
        if (error) {
            //错误处理
            return;
        }
        NSLog(@"%@", responseObject.name);
    }];
```
####3. 获取上传的图片的url
```objc
    //expireTime URL有效期，单位秒，国内环境下若小于等于0则默认为永久有效，国外环境暂时不支持长期有效
    [manager getDownloadUrlWithfile:fileInfo ExpireTime:0 payloadCallback:^(NSString *urlString, NSError *error) {
        if (error) {
            //错误处理
            return;
        }
        NSLog(@"%@", urlString);
    }];
```
####4. 提交用户反馈信息
```objc  
    ACFeedBack *feedback = [[ACFeedBack alloc] init];
    //这里的键值对需要跟自己在后台定义的一致
    [feedback addFeedBackWithKey:@"description" value:@"descriptionValue"];
    [feedback addFeedBackWithKey:@"telephoneNumber" value:@"130xxxxxxxx"];
    //将上面获取到的 urlStringg放到对应的value
    [feedback addFeedBackPictureWithKey:@"pictures" value:<#urlString#>];
    
    [ACFeedBackManager submitFeedBack:feedback callback:^(BOOL isSuccess, NSError *error) {
        if (error) {
            //错误处理
            return;
        }
        //提交成功
    }];
```

##获取室外的天气状况
SDK可以获取到室外的pm2.5, AQI(空气质量)以及天气状况.

###1. 使用类

```
@interface ACWeatherManager : NSObject
```

###2. 代码示例

####PM25

```
///  获取最近n天的pm25值
///
///  @param area        支持到地级市, area填写中文如: "北京"
///  @param days        0表示7天
///  @param callback    pm25模型数组
- (void)getLastDaysPM25 {
    [ACWeatherManager getLastDaysPM25WithArea:_area days:3 callback:^(NSArray *pm25List, NSError *error) {
        [pm25List enumerateObjectsUsingBlock:^(ACPM25 *pm25, NSUInteger idx, BOOL * _Nonnull stop) {
            NSLog(@"%@", pm25);
        }];
    }];
}
```

####AQI

```
///  获取最近n天的aqi值
///
///  @param area        支持到地级市, area填写中文如: "北京"
///  @param days        0表示7天
///  @param callback    aqi模型数组
- (void)getLastDaysAQI {
    [ACWeatherManager getLastDaysAqiWithArea:_area days:3 callback:^(NSArray *aqiList, NSError *error) {
       [aqiList enumerateObjectsUsingBlock:^(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
           NSLog(@"%@", obj);
       }];
    }];
}
```
####weather

```
///  获取最近n天的weather
///
///  @param area        支持到地级市, area填写中文如: "北京"
///  @param days        0表示7天
///  @param callback    weather模型数组
- (void)getLastDaysWeather {
    [ACWeatherManager getLastDaysWeatherWithArea:_area days:5 callback:^(NSArray *weatherList, NSError *error) {
        [weatherList enumerateObjectsUsingBlock:^(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
            NSLog(@"%@", obj);
        }];
    }];
}
```

#Error Code
参考[reference-Error Code](../reference/error_code.md)

>+ **建议在调用AbleCloud云服务接口之前先判断网络处于可访问状态之后再调用相关接口，可以省去对error回调里网络错误的处理。**
>+ **调试阶段，可通过返回的ACMsg 调用- (NSInteger)getErrCode;
和- (NSString *)getErrMsg;获取错误信息。**

