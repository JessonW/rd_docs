#iOS客户端开发指导
**iOS的开发的环境配置参考[开发框架-iOS-开发环境配置](../framework/iOS#开发环境配置)**

#帐号管理
建议的用户交互流程见 [用户交互-帐号管理](../user_interaction.md#账号管理)

##1、普通帐号注册

![account_register](../pic/develop_guide/account_register.png)

<font color="red">**补充开发指导**</font>	

**获取账号管理对象**

```ObjC
    
```

**普通帐号注册流程**

1、检查手机号是否已注册



```ObjC

```


2、发送验证码

```ObjC

```

3、检测验证码正确性

```ObjC

```

4、注册

```ObjC

```
 
##2、第三方登录
 
![account_Oauth](../pic/develop_guide/account_Oauth.png)

<font color="red">**补充开发指导**</font>	

1、直接使用第三方登录

```ObjC

```

2、在已有普通账号登录时绑定第三方账号

```ObjC

```

#设备管理
##独立设备

用户登录/注册后，需要绑定设备才能够使用。对于没有二维码的设备，绑定设备时，首先需在APP上给出配置设备进入Smartconfig状态的提示。然后填写当前手机连接的WiFi的密码，调用startAbleLink将WiFi密码广播给设备，设备拿到WiFi密码后连接到云端然后开始局域网广播自己的subdomainID。App拿到这些信息后调用bindDevice接口绑定设备。

![DM_wifi](../pic/develop_guide/DM_WiFi.png)

<font color="red">**补充开发指导**</font>

##网关设备

网关的绑定流程和WiFi设备是一样的。网关绑定以后绑定子设备的建议流程如下：

![DM_gateway](../pic/develop_guide/DM_gateway.png)

该流程只是建议流程的一种。其中openGatewayMatch和closeGatewayMatch接口都是为了方便软件开启配对而开发的接口。如果使用硬件上的操作（如网关上有按钮等）完成网关和子设备的配对，则不需要用到这两个接口。

<font color="red">**补充开发指导**</font>


##home模型
说明参见[基本介绍-功能介绍-home模型](../introduction.md#功能介绍##home模型)

建议的用户交互参见[用户交互-home模型](../user_interaction.md#home模型)

###home模型下添加独立设备

建议的流程如下：

![DM_home_WiFi](../pic/develop_guide/DM_home_wifi.png)

<font color="red">**补充开发指导**</font>

###home模型下添加网关型设备且网关没有二维码

网关没有二维码时，一般是网管在连接云端以后在局域网广播自己的物理ID。APP接收广播然后绑定设备。

![DM_home_gateway](../pic/develop_guide/DM_home_gateway.png)

<font color="red">**补充开发指导**</font>

###home模型下添加网关型设备且网关有二维码

网关有二维码时，不需要通过接收广播来获取设备物理ID。流程如下：

![DM_home_gateway2](../pic/develop_guide/DM_home_gateway2.png)

<font color="red">**补充开发指导**</font>

#OTA
说明参见[基本介绍-功能介绍-OTA](../introduction.md#功能介绍##OTA)

建议的用户交互参见[用户交互-OTA](../user_interaction.md#OTA)

![OTA](../pic/develop_guide/OTA.png)

<font color="red">**补充开发指导**</font>	

开发OTA之前需要在开发环境中配置友盟的推送服务，配置方法参见：[开发框架-安卓-环境配置](../framework/android#环境配置)

1、在应用的主Activity onCreate() 函数中开启推送服务

```ObjC

```


2、在登录成功之后添加推送别名
```ObjC

```

3、设置友盟的消息处理
```ObjC

```
4、在退出登录之后移除掉旧的别名
```ObjC

```



#推送
见[开发框架-开发环境配置](../framework/android#开发环境配置)

<font color="red">**补充开发指导**</font>

#实时消息

<font color="red">**补充开发指导**</font>

#和云端通信
说明参见[基本介绍-功能介绍-和云端通信](../introduction.md#功能介绍##云端通信)

建议的用户交互参见[用户交互-和云端通信](../user_interaction.md#云端通信)

##1、发送到设备

<font color="red">**补充开发指导**</font>

##2、发送到服务

<font color="red">**补充开发指导**</font>

#局域网通信
说明参见[基本介绍-功能介绍-局域网通信](../introduction.md#功能介绍##局域网通信)

建议的用户交互参见[用户交互-局域网通信](../user_interaction.md#局域网通信)

<font color="red">**补充开发指导**</font>

#定时任务


#Error Code

## <span class="skip">||SKIP||</span>

完整的错误码定义如下
###请求相关常用错误码 (3000 - 3500)

|错误码(code)|错误消息(error)|
|-----------|--------------|
|3000|internal error|
|3001|invalid header|
|3002|invalid param|
|3003|not supported|
|3004|not allowed|
|3005|no privilege|
|3006|invalid request uri|
|3007|major domain not exist|
|3008|sub domain not exist|
|3009|service not exist|
|3010|message not supported|
|3011|service not available|
|3012|request timeout|
|3013|network error|
|3014|signature timeout|
|3015|invalid signature|
|	|				|

###帐号管理相关错误码 (3501 - 3600)

|错误码(code)|错误消息(error)|
|-----------|--------------|
|3501|account not exist|
|3502|account already exist|
|3503|invalid name|
|3504|password wrong|
|3505|invalid verify code|
|3506|verify code timeout|
|3507|invalid email address|
|3508|invalid phone number|
|3509|invalid account status|
|	|				|

###设备分组管理相关错误码 (3601 - 3900)

|错误码(code)|错误消息(error)|
|-----------|--------------|
|3601|group not exist|
|3602|group already exist|
|3603|invalid group status|
|3604|member not exist|
|3605|member already exist|
|3606|invalid member status|
|3801|invalid message code|
|3802|device not exist|
|3803|device exist|
|3804|invalid device|
|3805|bind code timeout|
|3806|invalid bind code|
|3807|device offline|
|3808|master device not exist|
|3809|device is master|
|3810|device is slave|
|3811|device already bound|
|3812|device not bound|
|3813|invalid device status|
|	|				|

###存储服务相关错误码 (3901 - 4000)

|错误码(code)|错误消息(error)|
|-----------|--------------|
|3901|file not exist|
|3902|file already exist|
|3903|invalid file state|
|3904|file checksum error|
|3905|invalid file content|
|3920|class not exist|
|3921|class already exist|
|3922|data error|
|3923|data already exist|
|3924|data not exist|
|3925|class mismatch|
|	|				|

###平台相关错误码 (5001 - 5300)

|错误码(code)|错误消息(error)|
|-----------|--------------|
|5001|project not exist|
|5002|major domain already exist|
|5003|domain format invalid|
|5004|too many key pairs|
|5005|service is online|
|5006|version not exist|
|5007|version rollback|
|5008|too many version published|
|5009|invalid rollback|
|5010|version compatible|
|5011|version not compatible|
|5012|invalid major version|
|5013|invalid minor version|
|5014|invalid patch version|
|5015|instance not exist|
|5016|instance already exist|
|5017|empty app file from blobstore|
|5018|port already in use|
|5019|port not in use|
|5020|port exhausted|
|5021|invalid container name|
|5022|agent already registered|
|5023|agent not registered yet|
|5024|agent already exist|
|5025|agent not exist|
|5026|exceed agent capacity|
|5027|can not log at ALL level|
|	|				|

###AbleCloud内部错误码 (6001 - ~)

|错误码(code)|错误消息(error)|
|-----------|--------------|
|6001|null value|
|6002|invalid config|
|6003|not inited|
|6004|already inited|
|6005|entry not dir|
|6006|invalid encrypt key|
|6007|entry not exist|
|6008|entry already exist|
|6009|iterator end|
|6011|invalid version|
|6012|invalid result|
|6013|encode error|
|6014|decode error|
|6015|data type error|
|6016|database not exist|
|6017|partition not exist|
|6018|no privilege send message|
|6019|no valid endpoint|
|6020|endpoint not in white list|
|6021|device connection exception|
|6022|invalid device message|
|6023|invalid inner request|
|6024|check payload length failed|
|6025|decrypt message error|
|6026|encrypt message error|
|6027|invalid format|
|6028|invalid meta name|
|	|				|