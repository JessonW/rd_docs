#iOS客户端开发参考


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
参考[reference-Error Code](../reference/error_code.md)