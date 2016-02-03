#IOS客户端开发参考
#简介

SDK即Software Develop Kit，开发者将基本对象结构基于此，快速的开发出APP。本文详细介绍IOS平台的SDK。ablecloud为开发者提供了一些通用的云端服务。
><font color="red">注意:</font>SDK里所有与云端交互的接口均采用异步回调方式，避免阻塞主线程的执行。

#交互协议

首先，我们从基础的数据结构开始。我们知道，APP会与后端服务和设备交互，因此AbleCloud定义了两种格式的消息：

+ **ACMsg：**APP与service之间的交互消息。
+ **ACDeviceMsg：**APP与device之间的交互消息，使用二进制或json通讯协议。

##ACMsg 
介绍ACMsg之前，我们先来了解一下AbleCloud的基本数据结构ACObject
####ACObject
ACObject用于承载交互的具体数据，我们称之为payload（负载）。上文提到通过put存入ACObject的数据内部以json方式处理，因此ACObject中的某一value也可以是嵌套的ACObject，能满足大部分需求场景。
```c
@interface ACObject : NSObject

/**
 * Get各种类型的参数值，务必保证Get和Put参数名和类型是一致的
 * @param name  参数名
 * @return      参数值
 */
- (id)get:(NSString *)name;
- (NSArray *)getArray:(NSString *)name;
- (BOOL)getBool:(NSString *)name;
- (long)getLong:(NSString *)name;
- (long long)getLongLong:(NSString *)name;
- (NSInteger)getInteger:(NSString *)name;
- (float)getFloat:(NSString *)name;
- (double)getDouble:(NSString *)name;
- (NSString *)getString:(NSString *)name;
- (ACObject *)getACObject:(NSString *)name;

/**
 * Put各种类型的参数值，务必保证Put与Get的参数名和类型是一致的
 * @param name  参数名
 * @param value 参数值
 * @return
 */
- (void)put:(NSString *)name value:(id)value;
- (void)putBool:(NSString *)name value:(BOOL)value;
- (void)putLong:(NSString *)name value:(long)value;
- (void)putLongLong:(NSString *)name value:(long long)value;
- (void)putInteger:(NSString *)name value:(NSInteger)value;
- (void)putFloat:(NSString *)name value:(float)value;
- (void)putDouble:(NSString *)name value:(double)value;
- (void)putString:(NSString *)name value:(NSString *)value;
- (void)putACObject:(NSString *)name value:(ACObject *)value;

/**
 * 添加一个参数到Array类型中
 * @param name  参数名
 * @param value 参数值
 */
- (void)add:(NSString *)name value:(id)value;
- (void)addBool:(NSString *)name value:(BOOL)value;
- (void)addLong:(NSString *)name value:(long)value;
- (void)addInteger:(NSString *)name value:(NSInteger)value;
- (void)addFloat:(NSString *)name value:(float)value;
- (void)addDouble:(NSString *)name value:(double)value;
- (void)addString:(NSString *)name value:(NSString *)value;
- (void)addACObject:(NSString *)name value:(ACObject *)value;

/**
 * 判断是否存在此参数
 * @param name  参数名
 */
- (BOOL)contains:(NSString *)name;

/**
 * 获取所有参数名列表
 * @param name  参数名
 */
- (NSArray *)getKeys;

/**
 * ACObject对象的序列化和反序列化
 */
- (NSData *)marshal;
+ (NSData *)marshal:(ACObject *)object;
+ (instancetype)unmarshal:(NSData *)data;

@end
```
><font color="brown">**注：**最常用的三个接口是put/add/get，通过**add**接口保存在ACObject中的数据实际为NSArray，相应的，get出来也是一个NSArray。</font>

####ACMsg
ACMsg继承自ACObject，扩展了一些功能，比如设置了交互的方法名name以及**其它形式**的负载payload信息。通常采用ACMsg进行数据交互，较多的使用默认的**OBJECT_PAYLOAD**格式，该格式只需要使用ACObject提供的put、add、get接口进行数据操作即可。因为在使用OBJECT_PAYLOAD格式时，框架会对数据进行序列化/反序列化。ACMsg也提供另外的数据交互格式，如json、stream等。如果用json格式，则通过setPayload/getPayload设置/获取序列化后的json数据并设置对应的payloadFormat，开发者后续可自行对payload进行解析。
```c
@interface ACMsg : ACObject

@property (nonatomic, strong) NSString *name;
@property (nonatomic, strong) ACContext *context;
@property (nonatomic, strong) NSString *payloadFormat;
@property (nonatomic, assign) NSUInteger payloadSize;
@property (nonatomic, strong, readonly) NSData *payload;
@property (nonatomic, strong, readonly) NSData *streamPayload;

/**
 * 设置流式负载，主要用于较大二进制数据传输，如上传文件等。
 * @param payload   负载内容
 * @param size      负载大小
 */
- (void)setStreamPayload:(NSData *)streamPayload size:(NSInteger)size;

/**
 * 设置错误信息。在服务端处理错误时，需要显示的调用该结果设置错误信息
 * @param errCode   错误码
 * @param errMsg    错误信息
 */
- (void)setErr:(NSInteger)errCode errMsg:(NSString *)errMsg;

/**
 * 判断服务端响应的处理结果是否有错
 * @return  YES-处理有错，NO-处理成功
 */
- (BOOL)isErr;
- (NSInteger)getErrCode;
- (NSString *)getErrMsg;
- (void)setAck;

extern NSString *const ACMsgObjectPayload;
extern NSString *const ACMsgJsonPayload;
extern NSString *const ACMsgStreamPayload;
extern NSString *const ACMsgMsgNameHeader;
extern NSString *const ACMsgAckMSG;
extern NSString *const ACMsgErrMSG;

@end
```
####ACContext
交互消息中的context主要用于包含重要的上下文信息，其定义如下：
```c

@interface ACContext : NSObject

@property (nonatomic, strong) NSString *os; // 操作系统
@property (nonatomic, strong) NSString *version; // 系统版本
@property (nonatomic, strong) NSString *majorDomain; // 服务所属主域名
@property (nonatomic, strong) NSString *subDomain; // 服务所属子域名
@property (nonatomic, strong) NSNumber *userId; // 用户id
@property (nonatomic, strong) NSString *traceId; // 请求唯一标识，可用于问题追踪
@property (nonatomic, strong) NSString *traceStartTime; // 请求起始时间
@property (nonatomic, strong) NSString *nonce; // 用于签名的随机字符串
@property (nonatomic, strong) NSString *timeout; // 为防止签名被截获，设置签名的有效超时时间，单位秒
@property (nonatomic, strong) NSString *timestamp; // 请求发起的时间戳，单位秒
@property (nonatomic, strong) NSString *signature; // 请求的合法性签名

/**
 * 生成context主要用于包含重要的上下文信息
 * @param subDomain   服务所属子域名
 */
+ (ACContext *)generateContextWithSubDomain:(NSString *)subDomain;

@end

```

##ACDeviceMsg
####ACDeviceMsg
该消息用于处理服务和设备之间的交互，框架会将ACDeviceMsg中的code部分解析出来，开发者可根据[code](firmware/wifi_interface_guide/#13 "消息码说明")来区分设备消息类型。并根据code的不同值做出不同的处理响应。
>+ **二进制/json**
>在使用二进制或json格式通讯协议的情况下,ACDeviceMsg的content部分由开发者解释，框架透传，因此开发者需要自己编写设备消息序列化/反序列化器。
>+ **KLV**
>KLV是由AbleCloud规定的一种数据格式，即可以理解为content部分的一种特殊解释，具体开发需要到AbleCloud平台填写数据点和数据包。因此开发者不需要自己编写消息序列化/反序列化器。

KLV协议介绍请参考：[功能介绍-KLV协议介绍](../features/functions.md#klv)。

ACDeviceMsg定义如下：
```c
@property (nonatomic, assign) NSInteger msgId;
@property (nonatomic, assign) NSInteger msgCode;
@property (nonatomic, strong) NSData *payload;
@property (nonatomic, strong) NSArray *optArray;
//反序列化
+ (instancetype)unmarshalWithData:(NSData *)data;
+ //反序列化WithAESKey
+ (instancetype)unmarshalWithData:(NSData *)data AESKey:(NSData *)AESKey;
//序列化
- (NSData *)marshal;
//序列化withAES Key
- (NSData *)marshalWithAESKey:(NSData *)AESKey;
```

<font color=red>注意</font>：从上面的定义可以看到，设备消息的具体内容为Object类型，若使用二进制或json数据格式，则开发者需要根据实际情况实现序列化器用来解释content的内容，在作具体的序列化/反序列化时，可根据code的不同值做出不同的序列化行为。



####ACKLVObject
<font color="red">注</font>：ACKLVObject与ACObject数据格式用法相似，不同的是ACKLVObject里key值的类型为Integer，这里就不具体介绍了。


#SDK接口列表

##基本对象结构
这里说的基本数据结构，是指设备管理、帐号管理等要用到的各个对象定义，比如帐号、设备等。

####ACUserInfo
用来表示AbleCloud的一个注册帐号信息，定义如下：
```c
// 用户ID
@property(nonatomic,assign) NSInteger userId;
// 用户昵称
@property(nonatomic,copy) NSString *nickName;
// 手机号码
@property(nonatomic,copy) NSString *phone;
// 电子邮件地址
@property(nonatomic,copy) NSString *email;
```


####ACUserDevice
设备管理模式下，用来表示一个设备，定义如下：
```c
//设备逻辑ID
@property(nonatomic,assign) NSInteger deviceId;
//设备管理员ID
@property(nonatomic,assign) NSInteger ownerId;
//设备名称
@property(nonatomic,copy) NSString *deviceName;
//子域ID
@property(nonatomic,assign) NSInteger subDomainId;
//局域网访问key
@property(nonatomic,copy) NSString *AESkey;
//设备物理ID
@property(nonatomic,copy) NSString *physicalDeviceId;
//设备网关ID
@property(nonatomic,assign) NSInteger gatewayDeviceId;
//设备根分组ID
@property(nonatomic,assign) NSInteger rootId;
//设备状态
@property(nonatomic,assign) NSInteger status;
```
####ACBindUser
设备管理模式下，用来表示一个设备下的所有用户信息，定义如下：
```c
//用户ID
@property(nonatomic,assign) NSInteger userId;
//设备的逻辑ID
@property(nonatomic,assign) NSInteger deviceId;
// 用户类型
@property(nonatomic,assign) BindUserType userType;
//  用户昵称
@property(nonatomic,copy) NSString *nickName;
// 手机号码
@property(nonatomic,copy) NSString *phone;
// 电子邮件地址
@property(nonatomic,copy) NSString *email;
// Open ID
@property(nonatomic,copy) NSString *openId;
// Open ID类型
@property(nonatomic,assign) NSInteger openIdType;
```

####ACHome
说明：家庭模型，用来表示一个家庭的信息，定义如下：
```objc
//房间的Id
@property (nonatomic, assign) NSInteger homeId;
//home管理员的Id
@property (nonatomic, assign) NSInteger owner;
//home名字
@property (nonatomic, copy) NSString *name;
```

####ACRoom
说明：房间模型，用来表示一个家庭下不同的房间信息，定义如下：
```objc
//房间所属的家庭Id
@property (nonatomic, assign) NSInteger homeId;
//房间的名字
@property (nonatomic, copy) NSString *name;
//房间的管理员Id
@property (nonatomic, assign) NSInteger owner;
//房间的Id
@property (nonatomic, assign) NSInteger roomId;
```

####ACTimerTask
说明：列举定时任务列表时用来表示定时任务信息，定义如下：
```c
@property (assign, nonatomic) NSInteger taskId;
//任务的类型（onceTask）
@property (strong, nonatomic) NSString *taskType;
//创建该用户的逻辑ID
@property (assign, nonatomic) NSInteger userId;
//创建该用户的昵称
@property (strong, nonatomic) NSString *nickName;
//任务名称
@property (strong, nonatomic) NSString *name;
//任务描述
@property (strong, nonatomic) NSString *desp;
//任务时区
@property (strong, nonatomic) NSString *timeZone;
//任务时间点
@property (strong, nonatomic) NSString *timePoint;
//任务时间周期
@property (strong, nonatomic) NSString *timeCycle;
//创建任务时间
@property (strong, nonatomic) NSString *createTime;
//修改任务时间
@property (strong, nonatomic) NSString *modifyTime;
//任务执行状态 0停止 1执行
@property (assign, nonatomic) NSInteger status;
```



####ACFileInfo
说明：文件管理中获取下载url或上传文件时用来表示用户信息，定义如下：
```c
//上传文件名字
@property (copy,nonatomic) NSString * name;

//上传文件路径，支持断点续传
@property (copy,nonatomic) NSString * filePath;
//上传文件二进制流数据，用于小文件上传，如拍照后头像直接上传
@property (retain,nonatomic) NSData * data;
//文件访问权限管理 如果不设置，则默认所有人可读，自己可写
@property (retain,nonatomic) ACACL  * acl;
//文件存储的空间；自定义文件目录，如ota
@property (copy,nonatomic) NSString * bucket;
//crc校验使用
@property (nonatomic,unsafe_unretained) NSInteger checksum;

-(id)initWithName:(NSString *)name bucket:(NSString *)bucket  ;

-(id)initWithName:(NSString *)name bucket:(NSString *)bucket  ;
+ (instancetype)fileInfoWithName:(NSString *)name bucket:(NSString *)bucket ;

```

####ACFindDevicesManager
说明：用来获取局域网本地设备，定义如下：
```c
@protocol ACFindDevicesDelegate <NSObject>

@optional
- (void)findDevice:(ACLocalDevice *)device;

@end

@interface ACFindDevicesManager : NSObject
//局域网通信,本地设备发现，通过广播方式和本局域网内的智能设备交互，并获取设备的相关信息返回。
@property (nonatomic, weak) id<ACFindDevicesDelegate> delegate;
@property (nonatomic, strong, readonly) NSArray *devices;

- (void)findDevicesWithSubDomainId:(NSInteger)subDomainId timeout:(NSTimeInterval)timeout;


```
>注：只有在发现本地局域网设备在线的情况下才能进行直连控制，sdk内部自动进行判断

>如果出现丢包导致局域网状态不准确情况下，需要手动刷新局域网状态并进行控制，则需要调用findDevice(具体方法在ACLoud.h文件中有声明)重新获取ACLocalDevice的列表（不需要做任何处理，sdk自动会记住局域网在线设备列表），这时只需要更新页面上显示的局域网在线状态即可（当前设备列表只需要匹配到physicalDeviceId相等即说明该设备本地局域网在线，或者重新listDeviceWithStatus获取设备列表）

####ACOTAUpgradeInfo
说明：用来获取OTA升级状态信息，定义如下：
```c
// 原版本
@property(nonatomic,copy) NSString *oldVersion;
// 新版本
@property(nonatomic,copy) NSString *upgradeVersion;
// 升级描述
@property(nonatomic,copy) NSString *upgradeLog;

```




##ACloudLib

ACloudLib主要负责设置相关参数，如服务器地址（测试环境为test.ablecloud.cn：5000，线上环境为production.ablecloud.cn:5000）、主域名称、指定服务桩等。
```c
@interface ACloudLib : NSObject

/**
 * 设置云端服务的接入地址，测试环境为test.ablecloud.cn:5000, 线上环境为production.ablecloud.cn:5000
 */
+ (void)setHost:(NSString *)host;
+ (NSString *)getHost;

/**
 * 设置访问云端服务的超时时间，根据开发者服务的性能合理定义，单位是秒
 */
+ (void)setHttpRequestTimeout:(NSString *)timeout;
+ (NSString *)getHttpRequestTimeout;

/**
 * 设置APP所属开发者帐号的主域信息，通过控制台进行查看帐号的主域等私密信息
 */
+ (void)setMajorDomain:(NSString *)majorDomain;
+ (NSString *)getMajorDomain;


/**
 * 获取帐号管理器。
 * 可以调用前面介绍的帐号管理ACAccountManager提供的各个通用接口
 * @return	帐号管理器
 */
@interface ACAccountManager : NSObject

/**
 * 获取设备激活器ACWifiLinkManager，用于激活设备，如获取SSID、使用smartconfig技术让设备连上wifi等
 * @param wifiLinkerName 设备wifi模块类型
 * @return	设备激活器
 */
ACWifiLinkManager * wifiManager = [[ACWifiLinkManager alloc] initWithLinkerName:@"wifi模块"];

/**
 * 获取简单无组的设备管理器
 * 可以调用前面介绍的设备管理ACBindManager提供的各个通用接口
 *
 * @return  绑定管理器
 */
@interface ACBindManager : NSObject

/**
 * 获取消息推送管理器（集成了友盟推送的一部分接口）
 * 可以调用前面介绍的推送管理ACNotificationManager提供的各个通用接口
 *
 * @return 推送通知管理器
 */
@interface ACNotificationManager : NSObject

/**
 * 获取定时管理器
 * 可以调用前面介绍的定时管理ACTimerManager提供的各个通用接口
 * 获取定时管理器
 * @param timeZone 自定义时区
 */
ACTimerManager * timerManager = [[ACTimerManager alloc] initWithTimeZone：@"自定义时区"];

/**
 * 获取OTA管理器
 * 可以调用前面介绍的OTA管理ACOTAManager提供的各个通用接口 
 *
 */
@interface ACOTAManager : NSObject

/**
 * 获取文件上传下载管理器
 * 可以调用前面介绍的文件管理ACFileManager提供的各个通用接口
 */
ACFileManager * filemanager = [[ACFileManager alloc] init];

/**
 * 为便于测试，开发者可实现一个服务的桩，并添加到AC框架中
 * 在测试模式下，服务桩可以模拟真实服务对APP的请求做出响应
 *
 * @param serviceName	服务名
 */
+ (void)setServiceStub:(NSString *)serviceName delegate:(id<ACServiceStubDelegate>)delegate;
```


##用户帐号管理

一台设备最终是需要通过用户来控制的，需要发送验证码、注册、登陆、管理密码等常规功能，ablecloud提供了云端帐号管理系统来协助开发人员快速的完成，在SDK端也提供了相应的接口，定义如下：

####引入头文件
```c
import "ACAccountManager.h"
```
####接口说明
```c
@interface ACAccountManager : NSObject

/**
 *  发送手机验证码 (有关规定每天向同一个手机号发送的短信数量有严格限制)
 * @param template 短信内容模板
 * @param callback 返回结果的监听回调
 */
+ (void)sendVerifyCodeWithAccount:(NSString *)account 
                         template:(NSString *)template
                         callback:(void (^)(NSError *error))callback;
/**
 * 校验手机验证码
 * @param account 手机号码
 * @param verifyCode 验证码
 */
+ (void)checkVerifyCodeWithAccount:(NSString *)account
                        verifyCode:(NSString *)verifyCode
                          callback:(void (^)(BOOL valid,NSError *error))callback;

/**
 * 注册帐号
 * @param phone 手机号码（与邮箱地址二选一或者都填）
 * @param email 邮箱地址（与手机号码二选一或者都填）
 * @param password 帐号密码
 * @param verifyCode 验证码
 */
+ (void)registerWithPhone:(NSString *)phone
                    email:(NSString *)email
                 password:(NSString *)password
               verifyCode:(NSString *)verifyCode
                 callback:(void (^)(NSString *uid, NSError *error))callback;
/**
 * 登陆帐号
 * @param account 手机号码或者邮箱地址（与邮箱地址二选一或者都填）
 * @param password 帐号密码
 */
+ (void)loginWithAccount:(NSString *)account
                password:(NSString *)password
                callback:(void (^)(NSString *uid, NSError *error))callback;

/**
 *  判断用户是否已经存在
 */
+ (void)checkExist:(NSString *)account
          callback:(void(^)(BOOL exist,NSError *error))callback;

/**
 *  更换手机号
 */
+ (void)changePhone:(NSString *)phone
           password:(NSString *)password
         verifyCode:(NSString *)verifyCode
           callback:(void(^)(NSError *error)) callback;

/**
 * 修改昵称
 */
+ (void) changeNickName:(NSString *)nickName
               callback:(void (^) (NSError *error))callback;

/**
 *  修改密码
 */
+ (void)changePasswordWithOld:(NSString *)old
                          new:(NSString *)newPassword
                     callback:(void (^)(NSString *uid, NSError *error))callback;

/**
 *  重置密码
 */
+ (void)resetPasswordWithAccount:(NSString *)account
                      verifyCode:(NSString *)verifyCode
                        password:(NSString *)password
                        callback:(void (^)(NSString *uid, NSError *error))callback;

/**
 *  判断用户是否已经在本机上过登陆
 */
+ (BOOL)isLogin;

/**
 *  注销当前用户
 */
+ (void)logout;

/**
* 绑定第三方账号
*
* @param provider 第三方类型（如QQ、微信、微博）
* @param openId        通过第三方登录获取的openId
* @param accessToken   通过第三方登录获取的accessToken
* @param callback      返回结果的监听回调
*/
+ (void)registerWithOpenId:(NSString *)openId
                  provider:(NSString *)provider
               accessToken:(NSString *)accessToken
                  callback:(void (^)(ACUserInfo *user, NSError *error))callback;

/**
* 第三方账号登录
*
* @param provider 第三方类型（如QQ、微信、微博）
* @param openId        通过第三方登录获取的openId
* @param accessToken   通过第三方登录获取的accessToken
* @param callback      返回结果的监听回调
*/
+ (void)loginWithOpenId:(NSString *)openId
               provider:(NSString *)provider
            accessToken:(NSString *)accessToken
               callback:(void (^)(ACUserInfo *user, NSError *error))callback;

/**
 * 修改帐号扩展属性
 */
+ (void) setUserProfile:(ACObject *)profile
               callback:(void (^) (NSError *error))callback;

/**
 * 获取帐号扩展属性
 */
+ (void) getUserProfile:(void (^) (ACObject*profile, NSError *error))callback;
```

##设备激活

当一款智能设备上市，交付到终端用户时，虽然是智能设备，但是目前大多数智能设备并没有键盘、屏幕等UI（用户界面），那么如何让一台新设备连上网络呢，这里就要用到设备激活功能。新设备激活的大致流程如下：

>1. 调用激活器的以下接口，将wifi的ssid，密码广播给设备；

>+ 通过扫码方式获取设备物理Id(每一台设备厂商都会给它分配一个设备号，AbleCloud称为设备的物理id)，通过此物理ID激活并绑定指定的设备

>+ 批量激活并绑定多个设备

>2. 设备收到app端发过来的信息，完成激活并连上wifi；

>3. 设备连接成功后，调用设备管理器中的绑定接口完成设备的绑定。至此，一台新设备就联网、连云完成，可由相关的成员控制了。

ablecloud提供了激活器供你使用，定义如下：
```c
@interface ACWifiLinkManager : NSObject

- (id)initWithLinkerName:(NSString *)linkerName;

+ (NSString *)getCurrentSSID;
//激活设备方式1
- (void)sendWifiInfo:(NSString *)ssid
            password:(NSString *)password
    physicalDeviceId:(NSString *)physicalDeviceId
             timeout:(NSTimeInterval)timeout
            callback:(void (^)(NSString *deviceId, NSString *bindCode, NSError *error))callback;
//激活设备方式2-－常用
- (void)sendWifiInfo:(NSString *)ssid
            password:(NSString *)password
             timeout:(NSTimeInterval)timeout
            callback:(void (^)(NSArray *localDevices, NSError *error))callback;

```

>通过以上`ACWifiLinkManager`提供的接口，使一台设备连上wifi，我们认为已经将设备激活了。但是只是激活设备还不够，用户控制设备前需要对设备进行绑定



##设备管理( 独立和网关型）

将用户和设备绑定后，用户才能使用设备。AbleCloud提供了设备绑定、解绑、分享、网关添加子设备、删除子设备等接口。

```c
/**
 *  获取设备列表,不包含设备状态信息
 *  
 *  @param callback     数组：devices保存的对象是ACUserDevice的对象
 */
+ (void)listDevicesWithCallback:(void(^)(NSArray *devices,NSError *error))callback;

/**
 *  获取设备列表,包含设备在线状态信息
 *
 *  @param callback     数组：devices保存的对象是ACUserDevice的对象
 */
+ (void)listDevicesWithStatusCallback:(void(^)(NSArray *devices,NSError *error))callback;
/**
 *  获取用户列表
 *
 *  @param deviceId 设备唯一标识
 *  @param callback 数组：users保存的对象是ACBindUser的对象
 */
+ (void)listUsersWithSubDomain:(NSString *)subDomain
                      deviceId:(NSInteger)deviceId
                     calllback:(void(^)(NSArray *users,NSError *error))callback;

/**
 *  绑定设备
 *
 *  @param physicalDeviceId 设备物理ID
 *  @param name             设备名称
 *  @param callback         回调 deviceId 设备的逻辑Id
 */
+ (void)bindDeviceWithSubDomain:(NSString *)subDomain
               physicalDeviceId:(NSString *)physicalDeviceId
                           name:(NSString *)name
                       callback:(void(^)(ACUserDevice *userDevice,NSError *error))callback;

/**
 *  根据分享码 绑定设备
 *
 *  @param shareCode        分享码
 *  @param subDomain        主域名
 *  @param deviceId         逻辑  ID
 *  @param callback         回调 ACUserDevice 设备的对象
 */
+ (void)bindDeviceWithShareCode:(NSString *)shareCode
                      subDomain:(NSString *)subDomain
                       deviceId:(NSInteger )deviceId
                      callback:(void(^)(ACUserDevice *userDevice,NSError *error))callback;

/**
 * 分享设备
 *
 * @param subDomain 子域名，如djj（豆浆机）
 * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param account   手机号
 * @param callback  返回结果的监听回调
 */
public void bindDeviceWithUser(String subDomain, long deviceId, String account, VoidCallback callback);

/**
 *  解绑设备
 *
 *  @param subDomain    子域名称
 *  @param deviceId     设备唯一标识
 */
+ (void)unbindDeviceWithSubDomain:(NSString *)subDomain
                         deviceId:(NSInteger)deviceId
                         callback:(void(^)(NSError *error))callback;

/**
 *  管理员取消 某个用户的绑定  （管理员接口）
 *
 *  @param subDomain 子域
 *  @param userId    用户ID
 *  @param deviceId  设备逻辑ID
 *  @param callback  回调
 */
+ (void)unbindDeviceWithUserSubDomain:(NSString *)subDomain
                               userId:(NSInteger)userId
                             deviceId:(NSInteger)deviceId
                             callback:(void(^)(NSError *error))callback;

/**
 * 获取分享码（只有管理员可以获取 ，默认一小时内生效）
 *
 * @param subDomain 子域名，如djj（豆浆机）
 * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param callback  返回结果的监听回调
 */
public void getShareCode(String subDomain, long deviceId, PayloadCallback<String> callback);

/**
 *  获取分享码  （管理员接口）
 *
 *  @param subDomain 子域名称
 *  @param deviceId  设备唯一标识
 *  @param timeout   超时时间（秒）
 *  @callback        shareCode 分享码
 */
+ (void)getShareCodeWithSubDomain:(NSString *)subDomain
                         deviceId:(NSInteger)deviceId
                          timeout:(NSTimeInterval)timeout
                         callback:(void(^)(NSString *shareCode,NSError *error))callback;

/**
 *  设备管理员权限转让 （管理员接口）
 *
 *  @param subDomain    子域名称
 *  @param deviceId     设备逻辑ID
 *  @param userId       新的管理员ID
 */
+ (void)changeOwnerWithSubDomain:(NSString *)subDomain
                         deviceId:(NSInteger)deviceId
                           userId:(NSInteger)userId
                         callback:(void(^)(NSError *error))callback;

/**
 *  更换物理设备 （管理员接口）
 *
 *  @param subDomain        子域名称
 *  @param physicalDeviceId 设备物理ID
 *  @param deviceId         设备逻辑ID
 *  @param bindCode         绑定码(可选)
 */
+ (void)changeDeviceWithSubDomain:(NSString *)subDomain
                 physicalDeviceId:(NSString *)physicalDeviceId
                         deviceId:(NSInteger)deviceId
                         callback:(void(^)(NSError *error))callback;

/**
 *  修改设备名称 （管理员接口）
 *
 *  @param subDomain    子域名称
 *  @param deviceId     设备逻辑ID
 *  @param name         设备的新名称
 */
+ (void)changNameWithSubDomain:(NSString *)subDomain
                      deviceId:(NSInteger)deviceId
                          name:(NSString *)name
                      callback:(void(^)(NSError *error))callback;

/**
 *  查询设备在线状态
 *
 *  @param subDomain        子域名称
 *  @param deviceId         设备逻辑ID
 *  @param subDomain        子域名称
 *  @param callback         online  是否在线
 */
+ (void)isDeviceOnlineWithSubDomain:(NSString *)subDomain
                           deviceId:(NSInteger)deviceId
                   physicalDeviceId:(NSString *)physicalDeviceId
                           callback:(void(^)(Boolean online,NSError *error))callback;

/**
 * 绑定网关
 *
 * @param subDomain        子域名，如djj（豆浆机）
 * @param physicalDeviceId 设备id（制造商提供的）
 * @param name             设备名字
 * @param callback         返回结果的监听回调
 */
+ (void)bindGatewayWithSubDomain:(NSString *)subDomain
                physicalDeviceId:(NSString *)physicalDeviceId
                            name:(NSString *)name
                        callback:(void (^)(ACUserDevice *device, NSError *error))callback;

/**
 * 解绑网关
 *
 * @param subDomain 子域名，如djj（豆浆机）
 * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param callback  返回结果的监听回调
 */
+ (void)unbindGatewayWithSubDomain:(NSString *)subDomain
                          deviceId:(NSInteger)deviceId
                          callback:(void (^)(NSError *error))callback;

/**
 * 添加子设备
 *
 * @param subDomain        子域名，如djj（豆浆机）
 * @param gatewayDeviceId  网关逻辑id
 * @param physicalDeviceId 设备id（制造商提供的）
 * @param name             子设备名称
 * @param callback         返回结果的监听回调
 */
+ (void)addSubDeviceWithSubDomain:(NSString *)subDomain
                  gatewayDeviceId:(NSInteger)gatewayDeviceId
                 physicalDeviceId:(NSString *)physicalDeviceId
                             name:(NSString *)name
                         callback:(void (^)(ACUserDevice *device, NSError *error))callback;

/**
 * 删除子设备
 *
 * @param subDomain 子域名，如djj（豆浆机）
 * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param callback  返回结果的监听回调
 */
+ (void)deleteSubDeviceWithSubDomain:(NSString *)subDomain
                            deviceId:(NSInteger)deviceId
                            callback:(void (^)(NSError *error))callback;

/**
 * 获取用户网关列表
 *
 * @param subDomain 子域名，如djj（豆浆机）
 * @param callback  返回结果的监听回调
 */
+ (void)listGatewaysWithSubDomain:(NSString *)subDomain
                        callback:(void (^)(NSArray *devices, NSError *error))callback;

/**
 * 获取用户子设备列表
 *
 * @param subDomain       子域名，如djj（豆浆机）
 * @param gatewayDeviceId 网关逻辑id
 * @param callback        返回结果的监听回调
 */
+ (void)listSubDevicesWithSubDomain:(NSString *)subDomain
                    gatewayDeviceId:(NSInteger)gatewayDeviceId
                           callback:(void (^)(NSArray *devices, NSError *error))callback;

/**
 * 获取网关新设备列表
 *
 * @param subDomain       子域名，如djj（豆浆机）
 * @param gatewayDeviceId 网关逻辑id
 * @param callback        返回结果的监听回调
 */
+ (void)listNewDevicesWithSubDomain:(NSString *)subDomain
                    gatewayDeviceId:(NSInteger)gatewayDeviceId
                           callback:(void (^)(NSArray *devices, NSError *error))callback;

/**
 * 开启网关接入
 *
 * @param subDomain       子域名，如djj（豆浆机）
 * @param gatewayDeviceId 网关逻辑id
 * @param time            开启时间
 * @param callback        返回结果的监听回调
 */
+ (void)openGatewayMatchWithSubDomain:(NSString *)subDomain
                      gatewayDeviceId:(NSInteger)gatewayDeviceId
                                 time:(NSInteger)time
                             callback:(void (^)(NSError *error))callback;

/**
 * 关闭网关接入
 *
 * @param subDomain       子域名，如djj（豆浆机）
 * @param gatewayDeviceId 网关逻辑id
 * @param callback        返回结果的监听回调
 */
+ (void)closeGatewayMathWithSubDomain:(NSString *)subDomain
                      gatewayDeviceId:(NSInteger)gatewayDeviceId
                             callback:(void (^)(NSError *error))callback;

/**
 * 剔除子设备
 *
 * @param subDomain       子域名，如djj（豆浆机）
 * @param gatewayDeviceId 网关逻辑id
 * @param physicalDeviceId 设备id（制造商提供的）
 * @param callback        返回结果的监听回调
 */
+ (void)evictSubDeviceWithSubDomain:(NSString *)subDomain
                    gatewayDeviceId:(NSInteger)gatewayDeviceId
                   physicalDeviceId:(NSString *)physicalDeviceId
                           callback:(void (^)(NSError *error))callback;

/**
 * 修改帐号扩展属性
 */
+ (void) setUserProfile:(ACObject *)profile
               callback:(void (^) (NSError *error))callback;

/**
 * 获取帐号扩展属性
 */
+ (void) getUserProfile:(void (^) (ACObject*profile, NSError *error))callback;

//反序列化
+ (instancetype)unmarshalWithData:(NSData *)data;
+ (instancetype)unmarshalWithData:(NSData *)data AESKey:(NSData *)AESKey;
//序列化
- (NSData *)marshal;
//序列化withAES Key
- (NSData *)marshalWithAESKey:(NSData *)AESKey;

/**
 * 为便于测试，开发者可实现一个设备的桩
 *
 * @param stub
 */
@interface ACDeviceStub : NSObject

+ (instancetype)sharedInstance;

+ (void)setDeviceStub:(NSString *)subDomain delegate:(id<ACDeviceStubDelegate>)delegate;
+ (id<ACDeviceStubDelegate>)getDeviceStubDelegate:(NSString *)subDomain;
+ (void)removeDeviceStub:(NSString *)subDomain;
+ (BOOL)isDeviceStub:(NSString *)subDomain;

/**
 *  向设备发送消息
 *
 *  @param subDomain 子域名
 *  @param deviceId  设备逻辑ID
 *  @param msg       发送的消息
 */
+ (void)sendToDevice:(NSString *)subDomain
             deviceId:(NSInteger)deviceId
                  msg:(ACDeviceMsg *)msg
             callback:(void (^)(ACDeviceMsg *responseMsg, NSError *error))callback;

```

##Home模型
除了绑定控制设备之外，你可能需要对设备进行合理的分组管理，AbleCloud提供的Home模型可以满足大部分复杂的模型场景。

```objc
/**
 * 创建家庭，任何人可创建
 *
 * @param name     家庭名字
 * @param callback 返回结果的监听回调
 */
+ (void)createHomeWithName:(NSString *)name callback:(void (^)(ACHome *home, NSError *error))callback;

/**
 * 删除家庭，只有组的管理员可删除。删除家庭，家庭内所有的设备和设备的绑定关系删除。普通用户调用该接口相当于退出家庭
 *
 * @param homeId   家庭id
 * @param callback 返回结果的监听回调
 */
+ (void)deleteHomeWithHomeId:(NSInteger)homeId callback:(void(^)(BOOL isSuccess, NSError *error))callback;

/**
 * 创建房间，只有home的管理员可以创建。room从属于home。
 *
 * @param homeId   家庭id
 * @param name     房间名字
 * @param callback 返回结果的监听回调
 */
+ (void)createRoomWithHomeId:(NSInteger)homeId name:(NSString *)name callback:(void(^)(ACRoom *room, NSError *error))callback;

/**
 * 只有home的管理员可以删除。Room删除后，原来在room下面的设备自动划转到home下
 *
 * @param homeId   家庭id
 * @param roomId   房间id
 * @param callback 返回结果的监听回调
 */
+ (void)deleteRoomWithHomeId:(NSInteger)homeId roomId:(NSInteger)roomId callback:(void(^)(BOOL isSuccess, NSError *error))callback;

/**
 * 设备是新设备
 * 将设备添加到家庭。返回设备对象。所有对家庭有控制权的用户都对该设备有使用权
 * 当添加的设备为网关时，网关下面的子设备全部添加到家庭
 * 给网关添加子设备仍然调用addSubDevice接口，添加到网关的子设备需要再次调用此接口添加到home
 *
 * @param subDomain        子域名，如djj（豆浆机）
 * @param physicalDeviceId 设备id（制造商提供的）
 * @param homeId           家庭id
 * @param name             设备名字
 * @param callback         返回结果的监听回调
 */
+ (void)addDeviceToHomeWithSubDomain:(NSString *)subDomian physicalDeviceId:(NSString *)physicalDeviceId homeId:(NSInteger)homeId name:(NSString *)name callback:(void(^)(BOOL isSuccess, NSError *error))callback;

/**
 * 设备不是新设备
 * 将设备添加到家庭。返回设备对象。所有对家庭有控制权的用户都对该设备有使用权
 * 当添加的设备为网关时，网关下面的子设备全部添加到家庭。
 * 给网关添加子设备仍然调用addSubDevice接口，添加到网关的子设备需要再次调用此接口添加到home。
 *
 * @param subDomain 子域名，如djj（豆浆机）
 * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param homeId    家庭id
 * @param name      设备名字
 * @param callback  返回结果的监听回调
 */
 + (void)addDeviceToHomeWithSubDomain:(NSString *)subDomian deviceId:(NSInteger)deviceId homeId:(NSInteger)homeId name:(NSString *)name callback:(void(^)(BOOL isSuccess, NSError *error))callback;

/**
 * 从家庭里删除设备，设备变为新的设备，所有绑定权限失效。删除网关时，网关和下面所有子设备一起删除。删除子设备时，子设备和网关的绑定关系同时解除
 *
 * @param deviceId 设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param homeId   家庭id
 * @param callback 返回结果的监听回调
 */
+ (void)deleteDeviceFromHomeWithDeviceId:(NSInteger)deviceId homeId:(NSInteger)homeId callback:(void(^)(BOOL isSuccess, NSError *error))callback ;

/**
 * 将设备移动到房间中，要求设备和room在同一个home下才可以。当设备为网关时，网关下面的子设备原位置不变
 *
 * @param deviceId 设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param homeId   家庭id
 * @param roomId   房间id
 * @param callback 返回结果的监听回调
 */
+ (void)moveDeviceToRoomWithDeviceId:(NSInteger)deviceId homeId:(NSInteger)homeId roomId:(NSInteger)roomId callback:(void(^)(BOOL isSuccess, NSError *error))callback;

/**
 * 将设备从房间中移除。从房间中移除的设备移动到家庭下
 *
 * @param deviceId 设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param homeId   家庭id
 * @param roomId   房间id
 * @param callback 返回结果的监听回调
 */
+ (void)removeDeviceFromRoomWithDeviceId:(NSInteger)deviceId homeId:(NSInteger)homeId roomId:(NSInteger)roomId callback:(void(^)(BOOL isSuccess, NSError *error))callback;

/**
 * 获取家庭的分享码（只有管理员可以获取 ）
 *
 * @param homeId   家庭id
 * @param callback 返回结果的监听回调
 */
+ (void)getHomeShareCodeWithHomeId:(NSInteger)homeId callback:(void(^)(NSString *shareCode, NSError *error))callback;

/**
 * 普通用户通过管理员分享的二维码加入家庭
 *
 * @param shareCode 分享码
 * @param callback 返回结果的监听回调
 */
+ (void)joinHomeWithShareCode:(NSString *)shareCode callback:(void(^)(BOOL isSuccess, NSError *error))callback;

/**
 * 管理员直接将某人加入到家庭
 *
 * @param homeId   家庭id
 * @param account  手机号或者email
 * @param callback 返回结果的监听回调
 */
+ (void)addUserToHomeWithHomeId:(NSInteger)homeId account:(NSString *)account callback:(void(^)(BOOL isSuccess, NSError *error))callback;

/**
 * 管理员直接将某人从家中移除
 *
 * @param homeId   家庭id
 * @param userId   被移除用户的userId
 * @param callback 返回结果的监听回调
 */
+ (void)removeUserFromHomeWithHomeId:(NSInteger)homeId userId:(NSInteger)userId callback:(void(^)(BOOL isSuccess, NSError *error))callback;

/**
 * 列出某个用户有使用权的所有家庭
 *
 * @param callback 返回结果的监听回调
 */
+ (void)listHomes:(void(^)(NSArray *homeList, NSError *error))callback;

/**
 * 获取某个home下面的所有room
 *
 * @param homeId   家庭id
 * @param callback 返回结果的监听回调
 */
+ (void)listRoomsWithHomeId:(NSInteger)homeId callback:(void(^)(NSArray *roomList, NSError *error))callback;

/**
 * 列出家庭下的所有设备
 *
 * @param homeId   家庭id
 * @param callback 返回结果的监听回调
 */
+ (void)listHomeDevicesWithHomeId:(NSInteger)homeId callback:(void(^)(NSArray *devices,NSError *error))callback;

/**
 * 列出房间里的所有设备
 *
 * @param homeId   家庭id
 * @param roomId   房间id
 * @param callback 返回结果的监听回调
 */
+ (void)listRoomDevicesWithHomeId:(NSInteger)homeId roomId:(NSInteger)roomId callback:(void(^)(NSArray *devices,NSError *error))callback;

/**
 * 列出家庭成员
 *
 * @param homeId   家庭id
 * @param callback 返回结果的监听回调
 */
+ (void)listHomeUsersWithHomeId:(NSInteger)homeId callback:(void(^)(NSArray *users, NSError *error))callback;

/**
 * 更改家庭名称，普通用户和管理员均有权限更改。App端可以自己设定普通用户是否有权限更改。
 *
 * @param homeId   家庭id
 * @param name     家庭名字
 * @param callback 返回结果的监听回调
 */
+ (void)changeHomeNameWithHomeId:(NSInteger)homeId name:(NSString *)name callback:(void(^)(BOOL isSuccess, NSError *error))callback;
/**
 * 更改room名称，普通用户和管理员均有权限更改。App端可以自己设定普通用户是否有权限更改。
 *
 * @param homeId   家庭id
 * @param roomId   房间id
 * @param name     房间名字
 * @param callback 返回结果的监听回调
 */
+ (void)changeRoomNameWithHomeId:(NSInteger)homeId roomId:(NSInteger)roomId name:(NSString *)name callback:(void(^)(BOOL isSuccess, NSError *error))callback;

```


##OTA
除了以上对设备的绑定控制以及管理之外，你可能还需要对设备OTA进行升级，接口定义如下：


```c
//检查设备是否有新的OTA版本，同时获取升级日志。
+ (void)checkUpdateWithSubDomain:(NSString *)subDomain
                        deviceId:(NSInteger)deviceId
                        callback:(void (^)(ACOTAUpgradeInfo *upgradeInfo, NSError *error))callback;
//确认升级
+ (void)confirmUpdateWithSubDomain:(NSString *)subDomain
                          deviceId:(NSInteger)deviceId
                        newVersion:(NSString *)newVersion
                          callback:(void (^)(NSError *error))callback;
//查询蓝牙设备OTA发布版本
+ (void)bluetoothVersionWithSubDomain:(NSString *)subDomain
                             callback:(void (^)(ACOTAUpgradeInfo *upgradeInfo, NSError *error))callback;
// 获取蓝牙设备OTA文件meta信息列表
+ (void)listFilesWithSubDomain:(NSString *)subDomain
                       version:(NSString *)version
                      callback:(void (^)(NSArray *fileMetaArray, NSError *error))callback;
//获取蓝牙设备OTA文件
+ (void)bluetoothFileWithSubDomain:(NSString *)subDomain
                              type:(NSInteger)type
                          checksum:(NSInteger)checksum
                           version:(NSString *)version
                          callback:(void (^)(NSData *fileData, NSError *error))callback;
```
>**<font color="red">注</font>：具体使用步骤见开发指导-->OTA**


##设备定时任务

>**<font color="red">注意</font>：**

>**1、若与设备之间的通讯为二进制或json格式，则需要先设置序列化器（与发送到设备相同），若为klv格式则不需要设置，具体参考与云端通讯中的发送到设备**

>**2、timePoint的格式为`"yyyy-MM-dd HH:mm:ss"`，否则会失败**

>**3、timeCycle需要在timePoint时间点的基础上,选择循环方式**

>+ **"once":**单次循环

>+ **"hour":**在每小时的**`mm:ss`**时间点循环执行

>+ **"day":**在每天的**`HH:mm:ss`**时间点循环执行

>+ **"month":**在每月的**`dd HH:mm:ss`**时间点循环执行

>+ **"year":**在每年的**`MM-dd HH:mm:ss`**时间点循环执行

>+ **"week[0,1,2,3,4,5,6]":**在每星期的**`HH:mm:ss`**时间点循环执行(如周日，周五重复，则表示为"week[0,5]")

接口定义如下：
```c
- (id)initWithTimeZone:(NSTimeZone *)timeZone;

/**
 * 创建定时任务(使用二进制模型)
 * 
 * @param deviceId    设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param timePoint   任务时间点，时间格式为："yyyy-MM-dd HH:mm:ss",比如2015-08-08 16:39:03
 * @param timeCycle   单次定时任务：once
 *                    按小时重复：hour
 *                    按天重复：day
 *                    按月重复：month
 *                    按年复复：year
 *                    星期循环任务：week[0，1，2，3，4，5，6]如周一，周五重复，则表示为week[1，5]
 * @param description 自定义的任务描述
 * @param msg         具体的消息内容
 * @param callback    返回结果的监听回调
 */
- (void)addTaskWithDeviceId:(NSInteger)deviceId
                       name:(NSString *)name
                  timePoint:(NSString *)timePoint
                  timeCycle:(NSString *)timeCycle
                description:(NSString *)description
                  deviceMsg:(ACDeviceMsg *)deviceMsg
                   callback:(void (^)(NSError *error))callback;

/**
 * 创建定时任务(使用KLV模型)
 *
 * @param deviceId    设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param timePoint   任务时间点，时间格式为："yyyy-MM-dd HH:mm:ss",比如2015-08-08 16:39:03
 * @param timeCycle   单次定时任务：once
 *                    按小时重复：hour
 *                    按天重复：day
 *                    按月重复：month
 *                    按年复复：year
 *                    星期循环任务：week[0，1，2，3，4，5，6]如周一，周五重复，则表示为week[1，5]
 * @param description 自定义的任务描述
 * @param msg         具体的消息内容(使用KLV格式，具体代表含义需到官网上定义)
 * @param callback    返回结果的监听回调
 */
- (void)addTaskWithDeviceId:(NSInteger)deviceId
                       name:(NSString *)name
                  timePoint:(NSString *)timePoint
                  timeCycle:(NSString *)timeCycle
                description:(NSString *)description
               KLVDeviceMsg:(ACKLVDeviceMsg *)KLVDeviceMsg
                   callback:(void (^)(NSError *error))callback;

/**
 * 修改定时任务(使用二进制模型)
 *
 * @param deviceId    设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param taskId      任务id
 * @param timePoint   任务时间点，时间格式为："yyyy-MM-dd HH:mm:ss",比如2015-08-08 16:39:03
 * @param timeCycle   单次定时任务：once
 *                    按小时重复：hour
 *                    按天重复：day
 *                    按月重复：month
 *                    按年复复：year
 *                    星期循环任务：week[0，1，2，3，4，5，6]如周一，周五重复，则表示为week[1，5]
 * @param description 自定义的任务描述
 * @param msg         具体的消息内容
 * @param callback    返回结果的监听回调
 */
- (void)modifyTaskWithDeviceId:(NSInteger)deviceId
                        taskId:(NSInteger)taskId
                          name:(NSString *)name
                     timePoint:(NSString *)timePoint
                     timeCycle:(NSString *)timeCycle
                   description:(NSString *)description
                     deviceMsg:(ACDeviceMsg *)deviceMsg
                      callback:(void (^)(NSError *error))callback;

/**
 * 修改定时任务(使用KLV模型)
 *
 * @param deviceId    设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param taskId      任务id
 * @param timePoint   任务时间点，时间格式为："yyyy-MM-dd HH:mm:ss",比如2015-08-08 16:39:03
 * @param timeCycle   单次定时任务：once
 *                    按小时重复：hour
 *                    按天重复：day
 *                    按月重复：month
 *                    按年复复：year
 *                    星期循环任务：week[0，1，2，3，4，5，6]如周一，周五重复，则表示为week[1，5]
 * @param description 自定义的任务描述
 * @param msg         具体的消息内容(使用KLV格式，具体代表含义需到官网上定义)
 * @param callback    返回结果的监听回调
 */
- (void)modifyTaskWithDeviceId:(NSInteger)deviceId
                        taskId:(NSInteger)taskId
                          name:(NSString *)name
                     timePoint:(NSString *)timePoint
                     timeCycle:(NSString *)timeCycle
                   description:(NSString *)description
                  KLVDeviceMsg:(ACKLVDeviceMsg *)KLVDeviceMsg
                      callback:(void (^)(NSError *error))callback;

/**
 * 开启定时任务
 *
 * @param deviceId 设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param taskId   任务id
 * @param callback 返回结果的监听回调
 */
- (void)openTaskWithDeviceId:(NSInteger)deviceId
                      taskId:(NSInteger)taskId
                    callback:(void (^)(NSError *error))callback;

/**
 * 关闭定时任务
 *
 * @param deviceId 设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param taskId   任务id
 * @param callback 返回结果的监听回调
 */
- (void)closeTaskWithDeviceId:(NSInteger)deviceId
                       taskId:(NSInteger)taskId
                     callback:(void (^)(NSError *error))callback;

/**
 * 删除定时任务
 *
 * @param deviceId 设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param taskId   任务id
 * @param callback 返回结果的监听回调
 */
- (void)deleteTaskWithDeviceId:(NSInteger)deviceId
                        taskId:(NSInteger)taskId
                      callback:(void (^)(NSError *error))callback;

/**
 * 获取定时任务列表
 *
 * @param deviceId 设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
 * @param callback 返回结果的监听回调
 */
- (void)listTasksWithDeviceId:(NSInteger)deviceId
                     callback:(void (^)(NSArray *timerTaskArray, NSError *error))callback;
```


##消息推送

如果想使用推送服务，在SDK端提供了相应的接口（封装了友盟2.4.1的部分接口），定义如下：
```c
/** 绑定App的appKey和启动参数，启动消息参数用于处理用户通过消息打开应用相关信息
 *@param appKey      主站生成appKey
 *@param launchOptions 启动参数
 */
+ (void)startWithAppkey:(NSString *)appKey launchOptions:(NSDictionary *)launchOptions;
/**
 * 添加推送别名
 *
 * @param userId   用户ID
 * @param callback 返回结果的监听回调
 */
+ (void)addAliasWithUserId:(NSInteger)userId callback:(void (^)(NSError *error))callback;

/**
 * 若要使用新的别名，请先调用removeAlias接口移除掉旧的别名
 *
 * @param userId   用户ID
 * @param callback 返回结果的监听回调
 */
+ (void)removeAliasWithUserId:(NSInteger)userId callback:(void (^)(NSError *error))callback;
```


**<font color="red">注</font>：具体使用步骤见开发指导-->与云端通信**
##局域网通信

```c
/**
*  局域网发现设备
*
*  @param timeout     超时时间
*  @param subDomainId 子域id
*  @param callback    返回结果的回调
*/
-(void)findDeviceTimeout:(NSInteger )timeout SudDomainId:(NSInteger)subDomainId callback:(void(^)(NSArray * deviceList,NSError * error))callback;

```
**<font color="red">注</font>：具体使用步骤见开发指导-->局域网通信**
##文件存储
如果需要使用文件上传下载管理服务，在SDK端提供了相应的接口，首先需要获取定时管理器AC.fileMgr(),具体接口定义如下：
```c
/**
 * //获取下载URL
 * @param file      文件信息对象
 * @param expireTime URL有效期，单位秒，若小于等于0则默认为int32的最大值≈80年
 * @param payloadCallback    返回结果的监听回调
 */
+(void)getDownloadUrlWithfile:(ACFileInfo *)fileInfo  ExpireTime:(long)expireTime payloadCallback:( void (^)(NSString * urlString,NSError * error))callback ;

/**
 * //session下载
 * @param urlString   获得的downURLString
 * @param callback    返回error信息的回调
 * @param CompleteCallback   返回完成的信息的回调
 */
-(void)downFileWithsession:(NSString * )urlString callBack:(void(^)(float progress ,NSError * error))callback CompleteCallback:(void (^)(NSString * filePath))completeCallback;
//取消下载
-(void)cancel;

/**
 * 上传文件
 * @param fileInfo      文件信息
 * @param payloadCallback    返回进度的监听回调
 * @param voidCallback    返回结果的监听回调
 */
-(void)uploadFileWithfileInfo:(ACFileInfo *)fileInfo progressCallback:(void(^)(float progress))progressCallback  voidCallback:(void(^)(ACMsg *responseObject,NSError * error))voidCallback;

/**
 * //取消上传
 * @param subDomain     用户subDmomain
 * @param fileInfo      文件信息
 */
-(void)cancleUploadWithfileInfo:(ACFileInfo *)fileInfo;
```
><font color="red">**规则**：</font>优先判断黑名单，黑名单命中后其他设置无效，其次判断白名单，最后判断全局设置属性。例如同时设置userId为1的用户为黑名单和白名单，则设置的白名单无效。


##桩模块
为了便于作单元、模块测试，我们通常不需要等待真正的设备制造好，真正的后端服务开发好。所以ablecloud提供了桩模块，让开发者能方便的模拟设备、服务。
####设备桩
设备桩的定义非常简单，其目的是为了模拟设备，对服务发来的请求做出响应，因此只有一个处理请求并做出响应的接口，定义如下：
```c
@protocol ACDeviceStubDelegate <NSObject>

- (void)handleDeviceMsg:(ACDeviceMsg *)req callback:(void (^)(ACDeviceMsg *responseObject, NSError *error))callback;

@end

@interface ACDeviceStub : NSObject

+ (instancetype)sharedInstance;

+ (void)setDeviceStub:(NSString *)subDomain delegate:(id<ACDeviceStubDelegate>)delegate;
+ (id<ACDeviceStubDelegate>)getDeviceStubDelegate:(NSString *)subDomain;
+ (void)removeDeviceStub:(NSString *)subDomain;
+ (BOOL)isDeviceStub:(NSString *)subDomain;

```

####服务桩
服务桩用于模拟一个服务的处理，对于后端服务，ablecloud提供了基础类ACService，服务桩只需要继承该类，编写具体的处理handlMsg即可，IOS端通过代理实现，其定义如下：
```c
@protocol ACServiceStubDelegate <NSObject>

- (void)handleServiceMsg:(ACMsg *)req callback:(void (^)(ACMsg *responseObject, NSError *error))callback;

@end

@interface ACServiceStub : NSObject

+ (instancetype)sharedInstance;
+ (void)setServiceStub:(NSString *)serviceName delegate:(id<ACServiceStubDelegate>)delegate;
+ (id<ACServiceStubDelegate>)getServiceStubDelegate:(NSString *)serviceName;
+ (void)removeServiceStub:(NSString *)serviceName;
+ (BOOL)isServiceStub:(NSString *)serviceName;

```



#适用蓝牙的接口

由于蓝牙设备和APP之间的通信协议比较简单，因此对于蓝牙设备和APP之间的通信协议，AbleCloud并未做任何处理。
AbleCloud提供了适用于蓝牙设备的APP和云端的交互接口。接口功能包括：帐号登录注册、用户属性添加、设备绑定、设备扩展属性设置、推送、蓝牙设备OTA、文件存储等。

对于蓝牙设备数据的存取，都是通过和云端通信的访问云端服务实现。目前所有的数据库的操作都需要经过云端服务进行，客户端的SDK中不能直接进行数据库访问。云端服务的开发参考[开发指导-云端服务](../develop_guide/cloud.md)


适用于蓝牙方案的接口见下表：


##1、帐号管理
用户帐号管理
一台设备最终是需要通过用户来控制的，需要发送验证码、注册、登陆、管理密码等常规功能，ablecloud提供了云端帐号管理系统来协助开发人员快速的完成，在SDK端也提供了相应的接口，定义如下：


####引入头文件
```c
import "ACAccountManager.h"
```
####接口说明
```c
@interface ACAccountManager : NSObject

/**
 * 发送手机验证码 (有关规定每天向同一个手机号发送的短信数量有严格限制)
 * @param account 手机号码或者邮箱地址，目前只支持手机号码
 */
+ (void)sendVerifyCodeWithAccount:(NSString *)account
                         callback:(void (^)(NSError *error))callback;

/**
 * 校验手机验证码
 * @param account 手机号码
 * @param verifyCode 验证码
 */
+ (void)checkVerifyCodeWithAccount:(NSString *)account
                        verifyCode:(NSString *)verifyCode
                          callback:(void (^)(BOOL valid,NSError *error))callback;

/**
 * 注册帐号
 * @param phone 手机号码（与邮箱地址二选一或者都填）
 * @param email 邮箱地址（与手机号码二选一或者都填）
 * @param password 帐号密码
 * @param verifyCode 验证码
 */
+ (void)registerWithPhone:(NSString *)phone
                    email:(NSString *)email
                 password:(NSString *)password
               verifyCode:(NSString *)verifyCode
                 callback:(void (^)(NSString *uid, NSError *error))callback;

/**
 * 登陆帐号
 * @param account 手机号码或者邮箱地址（与邮箱地址二选一或者都填）
 * @param password 帐号密码
 */
+ (void)loginWithAccount:(NSString *)account
                password:(NSString *)password
                callback:(void (^)(NSString *uid, NSError *error))callback;

/**
 *  判断用户是否已经存在
 */
+ (void)checkExist:(NSString *)account
          callback:(void(^)(BOOL exist,NSError *error))callback;

/**
 *  更换手机号
 */
+ (void)changePhone:(NSString *)phone
           password:(NSString *)password
          verifyCode:(NSString *)verifyCode
           callback:(void(^)(NSError *error)) callback;

/**
 * 修改昵称
 */
+ (void) changeNickName:(NSString *)nickName
               callback:(void (^) (NSError *error))callback;

/**
 *  修改密码
 */
+ (void)changePasswordWithOld:(NSString *)old
                          new:(NSString *)newPassword
                     callback:(void (^)(NSString *uid, NSError *error))callback;

/**
 *  重置密码
 */
+ (void)resetPasswordWithAccount:(NSString *)account
                      verifyCode:(NSString *)verifyCode
                        password:(NSString *)password
                        callback:(void (^)(NSString *uid, NSError *error))callback;

/**
 *  判断用户是否已经在本机上过登陆
 */
+ (BOOL)isLogin;

/**
 *  注销当前用户
 */
+ (void)logout;

/**
* 绑定第三方账号
*
* @param provider 第三方类型（如QQ、微信、微博）
* @param openId        通过第三方登录获取的openId
* @param accessToken   通过第三方登录获取的accessToken
* @param callback      返回结果的监听回调
*/
+ (void)registerWithOpenId:(NSString *)openId
                  provider:(NSString *)provider
               accessToken:(NSString *)accessToken
                  callback:(void (^)(ACUserInfo *user, NSError *error))callback;

/**
* 第三方账号登录
*
* @param provider 第三方类型（如QQ、微信、微博）
* @param openId        通过第三方登录获取的openId
* @param accessToken   通过第三方登录获取的accessToken
* @param callback      返回结果的监听回调
*/
+ (void)loginWithOpenId:(NSString *)openId
               provider:(NSString *)provider
            accessToken:(NSString *)accessToken
               callback:(void (^)(ACUserInfo *user, NSError *error))callback;

/**
 * 修改帐号扩展属性
 */
+ (void) setUserProfile:(ACObject *)profile
               callback:(void (^) (NSError *error))callback;

/**
 * 获取帐号扩展属性
 */
+ (void) getUserProfile:(void (^) (ACObject*profile, NSError *error))callback;
```
##2、设备激活

```objectc
@interface ACDeviceManager : NSObject

/**
* 设备激活,如蓝牙设备每次连接到app时需要调用此接口
*
* @param subDomain    子域名，如djj（豆浆机）
* @param deviceActive 激活设备信息
* @param callback     返回结果的监听回调
*/
+ (void)activateDeviceWithSubDomain:(NSString *)subDomain  DeviceActive:(ACDeviceActive *)deviceActive Callback:(void(^)(ACMsg *responseMsg , NSError *error))callback;
}
```

##3、设备管理

```c
/**
 *  获取设备列表,不包含设备状态信息
 *  
 *  @param callback     数组：devices保存的对象是ACUserDevice的对象
 */
+ (void)listDevicesWithCallback:(void(^)(NSArray *devices,NSError *error))callback;

/**
 *  获取设备列表,包含设备在线状态信息
 *
 *  @param callback     数组：devices保存的对象是ACUserDevice的对象
 */
 + (void)listDevicesWithStatusCallback:(void(^)(NSArray *devices,NSError *error))callback;

/**
 *  获取用户列表
 *
 *  @param deviceId 设备唯一标识
 *  @param callback 数组：users保存的对象是ACBindUser的对象
 */
+ (void)listUsersWithSubDomain:(NSString *)subDomain
                      deviceId:(NSInteger)deviceId
                     calllback:(void(^)(NSArray *users,NSError *error))callback;

/**
 *  绑定设备
 *
 *  @param physicalDeviceId 设备物理ID
 *  @param name             设备名称
 *  @param callback         回调 deviceId 设备的逻辑Id
 */
+ (void)bindDeviceWithSubDomain:(NSString *)subDomain
               physicalDeviceId:(NSString *)physicalDeviceId
                           name:(NSString *)name
                       callback:(void(^)(ACUserDevice *userDevice,NSError *error))callback;

/**
 *  根据分享码 绑定设备
 *
 *  @param shareCode        分享码
 *  @param subDomain        主域名
 *  @param deviceId         逻辑  ID
 *  @param callback         回调 ACUserDevice 设备的对象
 */
+ (void)bindDeviceWithShareCode:(NSString *)shareCode
                      subDomain:(NSString *)subDomain
                       deviceId:(NSInteger )deviceId
                       callback:(void(^)(ACUserDevice *userDevice,NSError *error))callback;

/**
 *  根据账户绑定设备
 *
 *  @param subDomain 子域
 *  @param deviceId  设备ID
 *  @param phone     电话号码
 */
+ (void)bindDeviceWithUserSubdomain:(NSString *)subDomain
                           deviceId:(NSInteger)deviceId
                            account:(NSString *)account
                           callback:(void(^)(NSError *error))callback;

/**
 *  解绑设备
 *
 *  @param subDomain    子域名称
 *  @param deviceId     设备唯一标识
 */
+ (void)unbindDeviceWithSubDomain:(NSString *)subDomain
                         deviceId:(NSInteger)deviceId
                          callback:(void(^)(NSError *error))callback;

/**
 *  管理员取消 某个用户的绑定  （管理员接口）
 *
 *  @param subDomain 子域
 *  @param userId    用户ID
 *  @param deviceId  设备逻辑ID
 *  @param callback  回调
 */
+ (void)unbindDeviceWithUserSubDomain:(NSString *)subDomain
                               userId:(NSInteger)userId
                             deviceId:(NSInteger)deviceId
                             callback:(void(^)(NSError *error))callback;

/**
 *  获取分享码  （管理员接口）
 *
 *  @param subDomain 子域名称
 *  @param deviceId  设备唯一标识
 *  @param timeout   超时时间（秒）
 *  @callback        shareCode 分享码
 */
+ (void)getShareCodeWithSubDomain:(NSString *)subDomain
                         deviceId:(NSInteger)deviceId
                          timeout:(NSTimeInterval)timeout
                         callback:(void(^)(NSString *shareCode,NSError *error))callback;

/**
 *  设备管理员权限转让 （管理员接口）
 *
 *  @param subDomain    子域名称
 *  @param deviceId     设备逻辑ID
 *  @param userId       新的管理员ID
 */
+ (void)changeOwnerWithSubDomain:(NSString *)subDomain
                        deviceId:(NSInteger)deviceId
                          userId:(NSInteger)userId
                        callback:(void(^)(NSError *error))callback;

/**
 *  更换物理设备 （管理员接口）
 *
 *  @param subDomain        子域名称
 *  @param physicalDeviceId 设备物理ID
 *  @param deviceId         设备逻辑ID
 *  @param bindCode         绑定码(可选)
 */
+ (void)changeDeviceWithSubDomain:(NSString *)subDomain
                 physicalDeviceId:(NSString *)physicalDeviceId
                         deviceId:(NSInteger)deviceId
                         callback:(void(^)(NSError *error))callback;

/** 
 *  修改设备名称 （管理员接口）
 *
 *   @param subDomain    子域名称
 *  @param deviceId     设备逻辑ID
 *  @param name         设备的新名称
 */
+ (void)changNameWithSubDomain:(NSString *)subDomain
                      deviceId:(NSInteger)deviceId
                          name:(NSString *)name
                      callback:(void(^)(NSError *error))callback;

/**
 * 修改设备扩展属性
 */
+ (void) setDeviceProfileWithSubDomain:(NSString *)subDomain
                              deviceId:(NSInteger)deviceId
                               profile:(ACObject *)profile
                              callback:(void (^) (NSError *error))callback;

/**
 * 获取设备扩展属性
 */
+ (void) getDeviceProfileWithSubDomain:(NSString*)subDomain
                              deviceId:(NSInteger)deviceId
                              callback:(void (^) (ACObject*profile, NSError *error))callback;
```  

##4、OTA


```c
//检查设备是否有新的OTA版本，同时获取升级日志。
+ (void)checkUpdateWithSubDomain:(NSString *)subDomain
                        deviceId:(NSInteger)deviceId
                         callback:(void (^)(ACOTAUpgradeInfo *upgradeInfo, NSError *error))callback;
//确认升级
+ (void)confirmUpdateWithSubDomain:(NSString *)subDomain
                          deviceId:(NSInteger)deviceId
                         newVersion:(NSString *)newVersion
                           callback:(void (^)(NSError *error))callback;
//查询蓝牙设备OTA发布版本
+ (void)bluetoothVersionWithSubDomain:(NSString *)subDomain
                             callback:(void (^)(ACOTAUpgradeInfo *upgradeInfo, NSError *error))callback;
// 获取蓝牙设备OTA文件meta信息列表
+ (void)listFilesWithSubDomain:(NSString *)subDomain
                       version:(NSString *)version
                      callback:(void (^)(NSArray *fileMetaArray, NSError *error))callback;
//获取蓝牙设备OTA文件
+ (void)bluetoothFileWithSubDomain:(NSString *)subDomain
                              type:(NSInteger)type
                          checksum:(NSInteger)checksum
                           version:(NSString *)version
                          callback:(void (^)(NSData *fileData, NSError *error))callback;
```

##5、消息推送

参考[开发指导-IOS-推送](../develop_guide/ios/#_34)

##6、和云端通信
ACServiceClient通信器

```c
/*
 * @param host        访问子域
 * @param service      服务名
 * @param version   服务版本
 */
- (id)initWithHost:(NSString *)host service:(NSString *)service version:(NSInteger)version;

+ (instancetype)serviceClientWithHost:(NSString *)host service:(NSString *)service version:(NSInteger)version;
/**
 * 往某一服务发送命令/消息
 * @param req       具体的消息内容
 * @param callback  返回结果的监听回调，返回服务端的响应消息
 * @throws Exception
 */
- (void)sendToService:(ACMsg *)req callback:(void (^)(ACMsg *responseObject, NSError *error))callback;
/**
* 往某一服务发送命令/消息(匿名)
*
* @param subDomain      子域
* @param serviceName    服务名
* @param ServiceVersion 服务版本
* @param req            具体的消息内容
* @callback             服务端相应的消息
*/
+ (void)sendToServiceWithoutSignWithSubDomain:(NSString *)subDomain ServiceName:(NSString *)serviceName ServiceVersion:(NSInteger)serviceVersion  Req:(ACMsg *)req Callback:(void(^)(ACMsg * responseMsg,NSError *error))callback ;

```

##6、文件存储
文件存储
如果需要使用文件上传下载管理服务，在SDK端提供了相应的接口，首先需要获取定时管理器ACFileManager,具体接口定义如下：


##一、获取文件管理器
``` c
ACFileManager * fileManager =[[ACFileManager alloc] init];
```
##二、下载文件
###1、获取下载url
```
/**
 * //获取下载URL
 * @param file      文件信息对象
 * @param expireTime URL有效期，单位秒，若小于等于0则默认为int32的最大值≈80年
 * @param payloadCallback    返回结果的监听回调
 */
+(void)getDownloadUrlWithfile:(ACFileInfo *)fileInfo  ExpireTime:(long)expireTime payloadCallback:( void (^)(NSString * urlString,NSError * error))callback ;
```
###2、根据url下载文件
```c
/**
 * //session下载
 * @param urlString   获得的downURLString
 * @param callback    返回error信息的回调
 * @param CompleteCallback   返回完成的信息的回调
 */
-(void)downFileWithsession:(NSString * )urlString callBack:(void(^)(float progress ,NSError * error))callback CompleteCallback:(void (^)(NSString * filePath))completeCallback;
```

##三、上传文件

###1、设置上传文件的权限管理类－－ACACL
```c
@interface ACACL : NSObject
```
<font color="red">**规则**：</font>优先判断黑名单，黑名单命中后其他设置无效，其次判断白名单，最后判断全局设置属性。例如同时设置userId为1的用户为黑名单和白名单，则设置的白名单无效。

###2、上传文件
####1)、设置上传文件信息－－ACFileInfo类
```c
@interface ACFileInfo : NSObject
//上传文件名字
@property (copy,nonatomic) NSString * name;

//上传文件路径，支持断点续传
@property (copy,nonatomic) NSString * filePath;

//文件访问权限 如果不设置 则默认
@property (retain,nonatomic) ACACL  * acl;

//文件存储的空间   用户自定义   如名字为Image或者text的文件夹下
@property (copy,nonatomic) NSString * bucket;

-(id)initWithName:(NSString *)name bucket:(NSString *)bucket  ;
+ (instancetype)fileInfoWithName:(NSString *)name bucket:(NSString *)bucket ;
```
####2)、设置文件权限
```c
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
####3)、上传文件
```c
/**
 * 上传文件
 * @param fileInfo      文件信息
 * @param payloadCallback    返回进度的监听回调
 * @param voidCallback    返回结果的监听回调
 */
-(void)uploadFileWithfileInfo:(ACFileInfo *)fileInfo progressCallback:(void(^)(NSString * key,float progress))progressCallback  voidCallback:(void(^)(ACMsg *responseObject,NSError * error))voidCallback;


/**
 * //取消上传
 * @param subDomain     用户subDmomain
 * @param fileInfo      文件信息
 */
-(void)cancleUploadWithfileInfo:(ACFileInfo *)fileInfo;
```

#Error Code
参考[reference-Error Code](../reference/error_code.md)

>+ **建议在调用AbleCloud云服务接口之前先判断网络处于可访问状态之后再调用相关接口，可以省去对error回调里网络错误的处理。**
>+ **调试阶段，可通过返回的ACMsg 调用- (NSInteger)getErrCode;
和- (NSString *)getErrMsg;获取错误信息。**