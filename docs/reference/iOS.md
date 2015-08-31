#iOS客户端开发参考
#开发环境设置
##系统准备

在进行开发前，需要对系统以及环境进行设置。目前框架支持Objective-C、C语言，因此系统准备基本都是和iOS开发相关，如Mac OS X、Xcode等。 + OS X 系统建议采用Mac OS X 10.8以上的版本 + Xcode 安装Xcode，建议采用6.0以上版本 + ablecloud 下载ablecloud开发框架并解压

Xcode

新建工程 选择新建iOS Application，根据需要选择，建议选择Single View Application。 点击Next进入下一个页面，根据情况填写Product Name/Organization Name/Organization Identifier等信息。 填好后点击Next，进入下一步，填写好存放路径。 至此，新建工程完成。
导入AbleCloudLib 按照步骤1完成了工程的新建，接下来需要将AbleCloudLib导入到工程中。 右键点击工程中想要导入的Group选择 Add Files to "your project name"... 选择AbleCloudLib的路径，勾选Copy items if needed，点击Add添加。 完成上述步骤后，我们将在工程视图里面看到该目录。 至此，开发者开发服务所以来的ablecloud开发框架库添加成功。
本地运行 Xcode下直接Command + R运行。
注：如果是模拟器运行请导入模拟器的静态库，如果是真机运行则导入真机静态库，否则在编译的过程中会失败。

##配置开发参数

```
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

@end
```

##配置推送

#交互协议-基础数结构
整个服务框架采用两种消息进行交互，ACMsg、ACDeviceMsg，其中框架提供了对ACMsg的解析，而ACDeviceMsg则由厂商自定义，框架透传其内容。
##ACObject
ACObject用于承载交互的具体数据，我们称之为payload（负载）。上文提到通过put存入ACObject的数据内部以json方式处理，因此ACObject中的某一value也可以是嵌套的ACObject，能满足大部分需求场景。
```
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

##ACMsg
ACMsg继承自ACObject，扩展了一些功能，比如设置了交互的方法名name、交互的上下文context以及其它形式的负载payload信息。通常采用ACMsg进行数据交互，较多的使用OBJECT_PAYLOAD格式，该格式只需要使用ACObject提供的put、get接口获取数据即可。因为在使用OBJECT_PAYLOAD格式时，框架会对数据进行序列化/反序列化。ACMsg也提供另外的数据交互格式，如json、stream等。如果用json格式，则通过setPayload/getPayload设置/获取序列化后的json数据并设置对应的payloadFormat，开发者后续可自行解析。
```
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
##ACContext
交互消息中的context主要用于包含重要的上下文信息，其定义如下：
```
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
><font color="brown">**注：**
客户端往后端服务发送消息，服务向另一服务发送消息的时候，均需要对所发请求进行签名，具体的签名算法见附录。</font>

#SDK接口列表
##基本对象结构




##ACloudLib
ACloudLib主要负责设置相关参数，如服务器地址（测试环境为test.ablecloud.cn：5000，线上环境为production.ablecloud.cn:5000）、主域名称、指定服务桩等。
```
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
 * 设置SDK依赖的云端服务的桩，用于对APP端的单元测试
 */
+ (void)setStubService:(NSString *)serviceName delegate:(id<ACStubDelegate>)delegate;
+ (id<ACStubDelegate>)getStubServiceDelegate:(NSString *)serviceName;
+ (void)removeStubService:(NSString *)serviceName;
+ (BOOL)isStubService:(NSString *)serviceName;


@end
```

##ACStubDelegate
ablecloud定义了代理ACStubDelegate，开发者只需要实现该代理即可模拟设备或者云端服务进行单元测试。定义如下:
```
@protocol ACStubDelegate <NSObject>
@optional
- (void)handleControlMsg:(ACMsg *)req callback:(void (^)(ACMsg *responseObject, NSError *error))callback;
@end
```

##账号管理
该服务用于管理和某一智能设备相关的用户，比如查看用户的基本信息/状态等。发现异常用户时，服务程序能及时做出相应操作。
###引入头文件
```
#import "ACAccountManager.h"
```
###接口说明
```
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
 * 重置密码
 * @param account 手机号码或者邮箱地址，目前只支持手机号码
 * @param verifyCode 验证码
 * @param password 帐号的新密码
 */
+ (void)resetPasswordWithAccount:(NSString *)account
                      verifyCode:(NSString *)verifyCode
                        password:(NSString *)password
                        callback:(void (^)(NSString *uid, NSError *error))callback;
/**
 * 修改密码
 * @param oldPassword 帐号旧密码
 * @param newPassword 帐号新密码
 */
+ (void)changePasswordWithOld:(NSString *)oldPassword
                          new:(NSString *)newPassword
                     callback:(void (^)(NSString *uid, NSError *error))callback;

@end

```

##设备激活




##设备管理( 独立设备和网关型设备）
该服务用于基于某一单个设备的绑定授权管理，比如查看所有绑定的设备列表等，绑定、解绑、分享设备等操作。第一个绑定设备的人是设备的Owner管理员,管理员Owner具有超级权限，可以分享授权，可以通过删除或解绑，解除设备所有的已绑定关系，也可以转让Owner身份给已绑定设备的普通用户。

###引入头文件
```
#import "ACBindManager.h"
```
###接口说明
```
@interface ACBindManager : NSObject

/**
 *  获取设备列表
 *  
 *  @param callback     数组：devices保存的对象是ACUserDevice的对象
 */
+ (void)listDevicesWithCallback:(void(^)(NSArray *devices,NSError *error))callback;

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
@end
```


##设备定时任务



##消息推送管理



##和云端通信


##本地局域网通信


#Error Code
[3000-5000]为AbleCloud内置的帐号管理，设备管理，存储服务等返回的错误码

[5001,6000]为AbleCloud平台返回的错误码

[6001-10000]为AbleCloud内部服务返回的错误码，因此建议用户自定义服务错误码区间为(1000-2000）或者10000以上。


如果您使用AbleCloud提供的SDK进行APP或者云端Service开发，需关注[3000-5000]的错误码，具体说明如下：

###请求相关常用错误码 (3000 - 3500)

|错误码|简要说明|
|---|---|
|3000|系统内部错误|
|3001|请求HEADER错误|
|3002|请求参数不合法|
|3003|不支持的请求|
|3004|不允许的请求|
|3005|请求没有权限|
|3006|请求URI错误|
|3007|请求主域不存在|
|3008|请求子域不存在|
|3009|请求服务不存在|
|3010|请求方法不存在|
|3011|服务暂不可用|
|3012|请求超时|
|3013|网络异常|
|3014|签名已失效|
|3015|签名错误|
|	|		|


###帐号管理相关错误码 (3501 - 3600)

|错误码|简要说明|
|---|---|
|3501|帐号不存在|
|3502|帐号已存在|
|3503|帐号不合法|
|3504|密码错误|
|3505|验证码错误|
|3506|验证码已失效|
|3507|邮箱不合法|
|3508|手机不合法|
|3509|帐号状态异常|
|3510|账号已经绑定|
|3511|安全认证失败|
|	|			|


###设备分组管理相关错误码 (3601 - 3900)

|错误码|简要说明|
|---|---|
|3601|分组不存在|
|3602|分组已存在|
|3603|分组状态异常|
|3604|成员不存在|
|3605|成员已存在|
|3606|成员状态异常|
|3801|设备消息码非法|
|3802|设备不存在|
|3803|设备已存在|
|3804|消息不合法|
|3805|绑定码已失效|
|3806|绑定码错误|
|3807|设备不在线|
|3808|主设备不存在|
|3809|设备为主机|
|3810|消息为备机|
|3811|设备已绑定|
|3812|设备未绑定|
|3813|设备状态异常|
|3814|设备响应超时|
|3815|分享码不存在|
|3816|分享码不合法|
|3817|分享码已过期|
|3818|绑定设备超时|
|3819|不存在的管理员|
|3820|网关不匹配|
|3821|管理员不匹配|
|3822|设备未激活|
|	|			|

###存储服务相关错误码 (3901 - 4000)

|错误码|简要说明|
|---|---|
|3901|文件不存在|
|3902|文件已存在|
|3903|文件状态异常|
|3904|文件校验失败|
|3905|文件内容异常|
|3920|数据集不存在|
|3921|数据集已存在|
|3922|数据存在错误|
|3923|数据已存在|
|3924|数据不存在|
|3925|数据集不匹配|
|3926|数据索引超出索引范围|
|	|					|