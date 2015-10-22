#嵌入式设备开发参考

#设备应用开发框架

对于嵌入式WiFi设备，AbleCloud提供了设备主控MCU的SDK，SDK软件逻辑框图如下所示：

![device_arch](../pic/reference/device_arch.png)
 
在使用SDK开发时，软件逻辑分如下三层：

1. APP层：该层实现设备的控制过程，此部分由厂商自行实现。
1. HAL层：该层属于硬件抽象层，它向上为APP提供控制逻辑接口，同时为API层提供回调函数，访问硬件资源。
1. API层：负责协议控制逻辑的实现，协议报文的解析，协议报文的组装等。


设备通过联网模块给云端发送的消息由消息头和消息payload构成。每个消息的构成说明见下图

![device_message_arch](../pic/reference/device_message_arch.png) 

每个消息由AC_MessageHead和AC_MessagePayload两部分构成：

|名称	 			|  	作用						    |
|-------------------|---------------------------    |
|AC_MessageHead     |	公共消息头，所有消息都要包含此头|
|AC_MessagePayload  |	具体的消息内容                |
|					|								|



##AC_MessageHead

![device_AC_MessageHead](../pic/reference/device_AC_MessageHead.png) 
 
格式定义如下所示： 
```
typedef struct
{
    u8  Version;
    u8  MsgId;        //消息ID
    u8  MsgCode;      //消息类型
    u8  OptNum;
    u16 Payloadlen;   //msg payload len + opt len + opt head len
    u16 TotalMsgCrc;
} AC_MessageHead;
```

AC_MessageHead中各个字段的说明：

|名称		|	作用						|
|-----------|---------------------------|   
|Version	|协议版本号，AbleCloud的SDK已经自动填写|
|MsgId		|消息序号，上报时填0；响应云端指令时必须填写云端指令携带的MsgId|
|MsgCode	|消息类型，云端根据对应的代码区分设备上报的AC_MessagePayload的消息的类型。所有的消息类型定义见“消息类型表”|
|OptNum		|用以指示AC_MessagePayload中AC_MessageOptHead和AC_MessageOption项的个数。OptNum大于等于0。|
|Payloadlen	|AC_MessagePayload消息体的总长度，不包括AC_MessageHead。|
|TotalMsgCrc|消息内容AC_MessagePayload的CRC校验。采用16bit CRC-CCITT|
|			|							|

消息类型表（MsgCode）如下：


|MsgCode|	消息类型				|消息类型说明			|
|-------|-----------------------|-------------------|
|0		|AC_CODE_EQ_BEGIN		|设备启动通知			|
|1		|AC_CODE_EQ_DONE		|Wifi回应设备启动通知	|
|2		|AC_CODE_WIFI_CONNECTED	|Wifi链接成功通知		|
|3		|AC_CODE_WIFI_DISCONNECTED|	Wifi断链通知		|
|4		|AC_CODE_CLOUD_CONNECTED|	云端链接成功通知	|
|5		|AC_CODE_CLOUD_DISCONNECTED|	云端链接断链通知|
|7		|AC_CODE_REGSITER		|注册接入请求			|
|8		|AC_CODE_REST			|重置wifi密码设置		|
|15		|AC_CODE_ACK			|回应消息			|
|16		|AC_CODE_ERR			|错误消息			|
|17		|AC_CODE_OTA_BEGIN		|OTA启动消息			|	
|18		|AC_CODE_OTA_FILE_BEGIN	|OTA文件传输消息		|
|19		|AC_CODE_OTA_FILE_CHUNK	|OTA文件传输			|
|20		|AC_CODE_OTA_FILE_END	|OTA文件传输结束		|
|21		|AC_CODE_OTA_END		|OTA结束				|
|35		|AC_CODE_OTA_CONFIRM		|OTA确认升级			|
|36		|AC_CODE_UNBIND			|解除设备的绑定		|
|45		|AC_CODE_GATEWAY_CTRL	|网关控制消息			|
|46		|AC_CODE_LIST_SUBDEVICES_REQ|查询所有子设备列表请求|
|47		|AC_CODE_LIST_SUBDEVICES_RSP|查询所有子设备列表请求|
|48		|AC_CODE_IS_DEVICEONLINE_REQ|查询子设备是否在线请求|
|49		|AC_CODE_IS_DEVICEONLINE_RSP|查询子设备是否在线响应|
|50		|AC_CODE_LEAVE_DEVICE		|从网络中移除子设备|
|60		|AC_CODE_KLV_RSP			|KLV响应消息|
|61		|AC_CODE_JSON_RSP			|JSON响应消息|
|63		|AC_CODE_EXT			|扩展消息|
|64		|AC_EVENT_BASE			|设备自定义控制消息基址|
|(64,200)|AC_EVENT_CONTROL_AND_RESPONSE|由服务或APP发给设备的控制消息以及设备的应答消息|
|[200,255]|	AC_EVENT_DEVICE_REPORT		|设备上报信息|
|		|						|					|

##AC_MessagePayload

![device_AC_MessagePayload](../pic/reference/device_AC_MessagePayload.png) 
 
AC_MessagePayload中的AC_MessageOptHead和AC_MessageOption是成对出现的可选项。由AC_MessageHead中的OptNum来定义这对可选项的数目。当OptNum为0时，AC_MessagePayload中就不存在此可选项。当OptNum大于0时，AC_MessageOptHead和AC_MessageOption在AC_MessagePayload中按照顺序依次排列。

###AC_MessageOptHead

![device_AC_MessageOptHead](../pic/reference/device_AC_MessageOptHead.png) 
 
格式定义如下所示：

```
typedef struct
{
    u16 OptCode;
    u16 OptLen;
}AC_MessageOptHead;
```

字段说明如下：

|名称	|作用										|
|-------|-------------------------------------------|
|OptCode|定义AC_MessageOption中的消息类型。参考OptCode表|
|OptLen	|可选Option的消息长度							|
|		|											|

可选Option类型定义表（OptCode表）：

|值|	消息类型			|说明			|
|--|----------------|---------------|
|0 |AC_OPT_TRANSPORT|	设备ID透传   |
|1 |AC_OPT_SSESSION	|链接SSESSION    |
|	|				|				|

###AC_MessageOption

![device_AC_MessageOption](../pic/reference/device_AC_MessageOption.png) 
 
AC_MessageOption是由AC_MessageOptHead定义的Option的内容。

**AC_OPT_TRANSPORT消息**

该消息用于将设备消息和消息一并上传，用来进行针对指定设备的控制管理。网关设备或子设备收到云端下发的子设备控制消息后，发送对应的回应消息时，也要包含该可选字段，消息定义如下：

```
typedef struct{
    u8 DomainId[8]; //子设备域名信息
    u8 DeviceId[16];//子设备物理id
} AC_TransportInfo;
```

**AC_OPT_SSESSION消息**

在APP和wifi模块直连模式下，会包含此字段，用以区分是链接SSESSION控制。设备收到直连控制消息后，发送对应的回应消息时，也要包含该可选字段。 消息定义如下：

```
typedef struct{
    u32 u32SsessionId;
}AC_SsessionInfo;
AC_MessagePayload
```
 
###AC_MessagePayload

![device_AC_MessagePayload2](../pic/reference/device_AC_MessagePayload2.png) 

是由AC_MessageHead中的MsgCode定义的消息类型的具体内容。各个类型的消息的具体内容如下：

***Message code 0:  AC_CODE_EQ_BEGIN*** 

设备启动消息，无实际消息内容。设备启动后，择机发送该消息，用以探测wifi模块是否启动完成。

***Message code 1:  AC_CODE_EQ_DONE***

wifi启动回应，无实际消息内容。Wifi收到AC_CODE_EQ_BEGIN消息后，回复该消息。

***Message code 2:  AC_CODE_WIFI_CONNECTED***

Wifi链接成功通知回应，无实际消息内容。

***Message code 3:  AC_CODE_WIFI_DISCONNECTED***

Wifi断链通知，无实际消息内容。

***Message code 4:  AC_CODE_CLOUD_CONNECTED*** 

Wifi链接云端成功通知，无实际消息内容。

***Message code 5:  AC_CODE_CLOUD_DISCONNECTED***

云端断链通知，无实际消息内容。

***Message code 7:  AC_CODE_REGSITER***

设备接入请求消息，用以设备发起接入云端的请求，wifi模块收到后，立即开始云端接入。 消息格式定义如下：

```
typedef struct 
{
    u8  u8EqVersion[4];
    u8  u8ModuleKey[112];
    u8  u8Domain[8];
    u8  u8DeviceId[8];
}AC_RegisterReq
```

字段说明如下：

|名称		|作用						|
|-----------|---------------------------|
|u8EqVersion|设备版本信息，目前使用后3个字节确定目前设备版本，用于后续OTA升级。版本信息设备需要自行存储|
|u8ModuleKey|设备的秘钥Key，不同设备Key是唯一的|
|u8Domain	|设备域信息，不同设备类型不一样|
|u8DeviceId	|设备唯一标示					|
|			|							|

以上信息，都是在设备在出厂前进行相关的注册，注册成功后，自行存储。当设备启动后，先发送请求信息给wifi模块，wifi用来进行和云端认证。
另外设备版本信息需要云端后台填写的版本号一致，否则云端会反复进行ota升级。

***Message code 8:  AC_CODE_REST***

Wifi密码重置情况，消息体为空，当局域网的wifi AP更换，或者密码更换后，重置密码。

***Message code 15:  AC_CODE_ACK***

OTA消息的正确回应，msgid要和请求消息一一对应。

***Message code 16:  AC_CODE_ERR***

OTA消息的错误回应，msgid要和请求消息一一对应。

```
typedef struct{
    u8 ErrorCode;
}AC_ErrorMsg;
```


***Message code 17:  AC_CODE_OTA_BEGIN***

OTA升级启动请求。其后按照每个文件的顺序，云端依次发送AC_CODE_OTA_FILE_BEGIN消息，若干AC_CODE_OTA_FILE_CHUNK消息，AC_CODE_OTA_FILE_END消息给设备。所有文件升级完成后，云端发送 AC_CODE_OTA_END。 收到该消息后，设备端需要记录需要升级的文件数目，用于升级前的校验，该消息执行成功需要给云端回应AC_CODE_ACK消息，失败回应AC_CODE_ERR消息。 消息格式定义如下：

```
typedef struct
{
    u8 u8FileNum;
    u8 u8Pad[3];
}AC_OtaBeginReq;
```

字段说明如下：

|名称		|作用						|
|-----------|---------------------------|
|u8FileNum	|用以指示本次升级时文件个数|
|u8Pad		|填充位，无意义				|
|			|							|

***Message code 18:  AC_CODE_OTA_FILE_BEGIN***

OTA 文件传输启动请求，设备端需要记录本次升级文件的信息，用于升级前的文件校验,该消息执行成功需要给云端回应AC_CODE_ACK消息，失败回应AC_CODE_ERR消息。

```
typedef struct
{
    u8 u8FileType;
    u8 u8FileVersion;
    u16  u16TotalFileCrc;
    u32 u32FileTotalLen;
}AC_OtaFileBeginReq;
```

字段说明如下：

|名称		|作用			|
|-----------|---------------|
|u8FileType	|文件类型		|
|u8FileVersion|	文件版本号	|
|u16TotalFileCrc|	整个文件的CRC|
|u32FileTotalLen|	文件长度|
|				|			|

***Message code 19:  AC_CODE_OTA_FILE_CHUNK***

OTA 文件块传输请求，该消息执行成功需要给云端回应AC_CODE_ACK消息，失败回应AC_CODE_ERR消息。整个升级文件后，会被拆分成若干文件块进行传输。一次升级会有若干文件块。

```
typedef struct
{
    u32 u32Offset;
}AC_OtaFileChunkReq;
```

字段说明如下：

|名称		|作用		|
|-----------|-----------|
|u32Offset	|文件偏移	|
|			|			|

***Message code 20:  AC_CODE_OTA_FILE_END***

OTA升级文件传输结束消息，收到该消息后处理如下：

1.校验已接收到的文件长度与AC_CODE_OTA_FILE_BEGIN消息存储的文件长度匹配

2.校验已接收到的文件CRC与AC_CODE_OTA_FILE_BEGIN消息存储的文件CRC匹配  

上述1、2 如果都执行成功，需要给云端回应AC_CODE_ACK消息，失败回应AC_CODE_ERR消息。

***Message code 21:  AC_CODE_OTA_END ***

OTA升级结束消息，收到该消息后需要校验已收到的文件数目与AC_CODE_OTA_BEGIN是否对应，如果对应则给云端回应AC_CODE_ACK消息，失败回应AC_CODE_ERR消息。

***Message code 23:  AC_CODE_ZOTA_FILE_BEGIN***

关于wifi模块，目前支持两种方式的wifi模块的升级方式，一种方式是wifi模块和云端直接进行OTA交互，一种方式是设备先和云端进行交互，获得wifi模块的文件，然后再由设备触发wifi模块升级。 该消息用在第二种方式下wifi模块升级。 消息格式同AC_CODE_OTA_FILE_BEGIN。

***Message code 24:  AC_CODE_ZOTA_FILE_CHUNK ***

消息格式同AC_CODE_OTA_FILE_CHUNK。

***Message code 25:  AC_CODE_ZOTA_FILE_END***

消息格式同AC_CODE_OTA_FILE_END。

***Message code 26:  AC_CODE_ZOTA_END***

该消息用以wifi OTA升级完成后，通知设备，设备收到后，择机复位wifi模块，建议收到后，尽快断电复位wifi。
***Message code 35:  AC_CODE_OTA_CONFIRM***

OTA确认升级消息，收到该消息设备侧启动设备内部更新固件流程，该消息需要回应AC_CODE_ACK消息，失败回应AC_CODE_ERR消息。
***Message code 36: AC_CODE_UNBIND***

该消息用以设备解除自己绑定。相当于管理员删除设备。
消息格式定义如下：
```
typedef struct
{   
    u8 UnbindFlag;//0:解绑，1：重置wifi密码并解绑
    u8 Pad[3]; 
}AC_GateWay_Ctrl;
```
|名称		|	作用								|
|-----------|-----------------------------------|
|UnbindFlag |解绑功能标志位，0:解绑，1：重置wifi密码并解绑|
|			|	 								|
***Message code 45:  AC_CODE_GATEWAY_CTRL***

该消息执行成功需要给回应AC_CODE_ACK消息，失败回应AC_CODE_ERR消息。

消息格式定义如下：

```
typedef struct
{   
u32 timeWindows;
}AC_GateWay_Ctrl;
```

字段说明如下：

|名称		|	作用								|
|-----------|-----------------------------------|
|timeWindows|打开网络，时间窗的单位和含义开发者自己定义|
|			|	 								|

***Message code 46:  AC_CODE_LIST_SUBDEVICES_REQ消息***

云端下发到网关，请求罗列所有子设备。

***Message code 47:  AC_CODE_LIST_SUBDEVICES_RSP***

网关响应到云端所有子设备信息。

```
typedef struct
{
    u8 DomainId[AC_DOMAIN_LEN]; //用户ID，定长ZC_HS_DEVICE_ID_LEN（8字节），子设备域名信息
    u8 DeviceId[AC_HS_DEVICE_ID_LEN];//用户ID，定长ZC_HS_DEVICE_ID_LEN（16字节），子设备id
}ZC_SubDeviceInfo;
typedef struct
{
    u8 u8ClientNum;	//子设备数目
    u8 u8Pad[3];
    ZC_SubDeviceInfo StruSubDeviceInfo[0];
}ZC_SubDeviceList;
```
***Message code 48:  AC_CODE_IS_DEVICEONLINE_REQ***

云端下发到网关，查询子设备是否在线。

```
typedef struct
{
    u8 DomainId[AC_DOMAIN_LEN]; //用户ID，定长ZC_HS_DEVICE_ID_LEN（8字节），子设备域名信息
    u8 DeviceId[AC_HS_DEVICE_ID_LEN];//用户ID，定长ZC_HS_DEVICE_ID_LEN（16字节），子设备id
}ZC_SubDeviceInfo;
```
***Message code 49:  AC_CODE_IS_DEVICEONLINE_RSP***

网关响应到云端子设备在线信息。

```
typedef struct
{
    u8 u8DeviceOnline;	//Online ?
    u8 u8Pad[3];
}ZC_DeviceOnline;
```
***Message code 50:   AC_CODE_LEAVE_DEVICE信息***

云端下发给网关，将指定的子设备移除对应的网络。

该消息成功需要回应AC_CODE_ACK消息，失败回应AC_CODE_ERR消息。

```
typedef struct
{
    u8 DomainId[AC_DOMAIN_LEN]; //用户ID，定长ZC_HS_DEVICE_ID_LEN（8字节），子设备域名信息
    u8 DeviceId[AC_HS_DEVICE_ID_LEN];//用户ID，定长ZC_HS_DEVICE_ID_LEN（16字节），子设备id
}ZC_SubDeviceInfo;
```

***Message code 63:  AC_CODE_EXT ***

设备下发给联网模块，消息定义如下：

```
typedef struct
{
    u8  ExtMsgCode;//扩展消息号
    u8  Pad[3];            
}AC_ExtMessageHead;
```

扩展消息类型表（ExtMsgCode）如下：

|ExtMsgCode|	消息类型		    |消息类型说明			|
|-------|-----------------------|-------------------|
|0		|AC_CODE_EXT_REGSITER	|使用mac地址注册接入请求|
|1		|AC_CODE_EXT_REBOOT		|WIFI设备重启	     |

AC_CODE_EXT_REGSITER消息体同AC_CODE_REGSITER，AC_CODE_EXT_REBOOT无消息体


***Message code 64:  AC_EVENT_BASE ***

除了上述公共控制消息外，设备可以自行定义消息内容，所有消息类型的基址为AC_EVENT_BASE，根据需要进行累加，最多支持到255。

<font color="red">说明</font>：
开区间(64,200)内的代码表示由服务或APP发给设备的控制消息以及设备的应答消息, 注意控制消息和应答消息使用不同的消息类型；闭区间[200,255]内的代码表示设备上报信息。






#设备接口定义

##数据发送接口

函数定义
```c
void AC_SendMessage(u8 *pu8Msg, u16 u16DataLen);
```
参数

|字段|类型|说明|
|----|----|----|
|pu8Msg|u8 *|待发送的数据缓存|
|u16DataLen|u16|待发送的数据长度|

##协议消息组包接口

函数定义
```c
void AC_BuildMessage(u8 u8MsgCode, u8 u8MsgId, 
    u8 *pu8Payload, u16 u16PayloadLen,
    AC_OptList *pstruOptList,
    u8 *pu8Msg, u16 *pu16Len);
```
参数

|字段	|类型	|说明|
|----|----|----|
|u8MsgCode|	u8	|消息类型|
|u8MsgId|	u8	|消息ID，上报写0，响应填写云端指令填写的msgid|
|pu8Payload|	u8	|消息实际内容|
|u16PayloadLen|	u16|	消息实际长度|
|pstruOptList	|AC_OptList *|	Option项列表|
|pu8Msg|	u8 *	|组好的消息数据的存储buffer|
|pu16Len|	u8 *	|组好的数据长度|

##KLV协议解析包接口
函数定义
```c
s8 AC_GetKeyValue(u8 *pu8Playload, u16 u16PayloadLen, u8 u8Key,void *pValue,u16 *pu16Length,u8 *pu8Type)
```
参数

|字段|类型|说明|
| ----|----|----|
|pu8Playload|u8 *|待解析的消息|
| u16PayloadLen|u16|待解析的消息长度|
| u8Key|u8|传入的键值|
| pValue|void *|该键值对应的数据|
|pu16Length|u16 *|该键值对应的数据长度|
|  pu8Type|u8 *|该键值对应的数据类型|

##KLV协议内存分配接口
函数定义
```c
AC_KLV * AC_CreateObj()
```
返回值： 申请出来的内存指针。

##KLV协议内存释放接口
函数定义
```c
void AC_FreeObj(AC_KLV * pOut);
```
参数

|字段|类型|说明|
| ----|----|----|
|pOut|AC_KLV *|需要释放的内存指针|

##KLV协议组包接口
函数定义
```c
s8 AC_SetKeyValue(AC_KLV *pOut,u8 u8Key,u16 u16Length,u8 u8Type, void *pValue);
```
参数

| 字段|类型|说明|
| ----|----|----|
| pOut|AC_KLV *|待组包数据的消息|
| u8Key|u8|传入的键值|
| pu16Length|u16 *|该键值对应的数据长度|
| pu8Type|u8 *|该键值对应的数据类型|
| pValue|void *|该键值对应的数据|

