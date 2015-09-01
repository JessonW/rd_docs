#安卓客户端开发参考
#简介

SDK即Software Develop Kit，开发者将基于此，快速的开发出APP。本文详细介绍android平台的SDK。ablecloud为开发者提供了一些通用的云端服务。
><font color="red">注意:</font>SDK里所有与云端交互的接口均采用异步回调方式，避免阻塞主线程的执行。

#开发环境配置
##SDK发布库
ablcloud发布的android端SDK为[`ac-service-android.jar`](https://www.ablecloud.cn/download/SDK&Demo/ac-service-android-SDK-1.0.1.zip)


><font color="red">注意:</font>

>1、若您设备的wifi模块为MTK，则需要添加MTK文件夹下的文件到libs目录下

>2、若需要使用友盟的推送服务，则需要添加Umeng文件夹下的文件到libs目录下

##开发环境设置
以下为 AbleCloud Android SDK 需要的所有的权限，请在你的AndroidManifest.xml文件里的`<manifest>`标签里添加
```java
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE"/>
```
##应用程序初始化
在你的应用使用AbleCloud服务之前，你需要在代码中对AbleCloud SDK进行初始化。
继承`Application`类，并且在`onCreate()`方法中调用此方法来进行初始化

开发阶段，请初始化测试环境
```java
AC.init(this, MajorDomain, MajorDomainId, AC.TEST_MODE);
```
在完成测试阶段之后，需要迁移到正式环境下
```java
AC.init(this, MajorDomain, MajorDomainId);
```


#推送开发准备

下面以友盟推送为例，介绍开发推送功能前需要做的准备工作。

首先，需要创建友盟推送账号，并创建应用（安卓和iOS版本需要单独创建），如下图所示

![push1](../pic/develop_guide/push1.png) 

记录“应用信息”中的AppKey和App Master Secret，将其填写到test.ablecloud.cn中。AbleCloud和友盟已经达成合作协议，服务器IP地址一项不需要填写。

![push2](../pic/develop_guide/push2.png) 

友盟平台配置完成后，到AbleCloud的管理后台的推送管理页面填写对应信息即可使用AbleCloud提供的推送服务。


#交互协议-基础数据结构


首先，我们从基础的数据结构开始。我们知道，APP会与后端服务和设备交互，因此AbleCloud定义了三种格式的消息：

+ **ACMsg：**APP与service之间的交互消息。
+ **ACDeviceMsg：**APP与device之间的交互消息，使用二进制或json通讯协议。
+ **ACKLVDeviceMsg：**APP与device之间的交互消息，使用KLV通讯协议。

##基础数据结构
###ACObject
ACObject用于承载交互的具体数据，我们称之为payload（负载）。上文提到通过put存入ACObject的数据内部以json方式处理，因此ACObject中的某一value也可以是嵌套的ACObject，能满足大部分需求场景。
```java
public class ACObject {
    private HashMap<String, Object> data = new HashMap<String, Object>();

	/**
     * 设置一个参数
     * @param key	参数名
     * @param <T>	参数值
     * @return
     */
    public <T> ACObject put(String key, T value) {}

    /**
     * 添加一个参数，该参数添加到一个List中
     * @param key	参数所在List的名字
     * @param value	参数值
     */
    public ACObject add(String key, Object value) {}

    /**
     * 获取一个参数值
     * @param key	参数名
     * @return		参数值
     */
    public <T> T get(String key) {}

    /**
     * 检查某一key是否存在
     * @param key	参数名
     * @return		存在返回true，否则返回false
     */
    public boolean contains(String key) {}

    /**
     * 获取所有的key值
     */
    public Set<String> getKeys() {}
}
```
><font color="brown">**注：**最常用的三个接口是put/add/get，通过**add**接口保存在ACObject中的数据实际为List，相应的，get出来也是一个List。</font>

###ACMsg
ACMsg继承自ACObject，扩展了一些功能，比如设置了交互的方法名name以及**其它形式**的负载payload信息。通常采用ACMsg进行数据交互，较多的使用默认的**OBJECT_PAYLOAD**格式，该格式只需要使用ACObject提供的put、add、get接口进行数据操作即可。因为在使用OBJECT_PAYLOAD格式时，框架会对数据进行序列化/反序列化。ACMsg也提供另外的数据交互格式，如json、stream等。如果用json格式，则通过setPayload/getPayload设置/获取序列化后的json数据并设置对应的payloadFormat，开发者后续可自行对payload进行解析。
```java
public class ACMsg extends ACObject {
    private String name;
    private String payloadFormat;
    private byte[] payload;
    private int payloadSize;
    private InputStream streamPayload;

    public ACMsg() {}

    /**
     * 设置请求方法名，服务端将根据该方法名进行处理
     * @param name  方法名
     */
    public void setName(String name) {}

    /**
     * 获取方法名
     * @return
     */
    public String getName() {}

    /**
     * 获取负载格式
     * @return
     */
    public String getPayloadFormat() {}

    /**
     * 获取二进制负载
     * @return
     */
    public byte[] getPayload() {}

    /**
     * 获取负载大小
     * @return
     */
    public int getPayloadSize() {}

    /**
     * 设置二进制负载
     * 通过put/add方式设置的负载要么框架将其序列化为json，
     * 要么解析后作为url的参数传输。
     * 通过该函数可以设置额外的负载数据，比如传统的序列化后的json值。
     * @param payload
     * @param format
     */
    public void setPayload(byte[] payload, String format) {}

    /**
     * 设置流式负载，主要用于较大的数据传输，如上传文件等。
     * @param payload   负载内容
     * @param size      负载大小
     */
    public void setStreamPayload(InputStream payload, int size) {}

    /**
     * 获取流式负载
     * @return
     */
    public InputStream getStreamPayload() {}

    /**
     * 关闭流式负载。
     * 通过getStreamPayload拿到流式负载后，需要显示的关闭。
     * @throws IOException
     */
    public void closeStreamPayload() throws IOException {}

    /**
     * 判断服务端响应的处理结果是否有错
     * @return  true-处理有错，false-处理成功
     */
    public boolean isErr() {}

    /**
     * 获取错误码
     * @return
     */
    public Integer getErrCode() {}

    /**
     * 获取错误信息
     * @return
     */
    public String getErrMsg() {}
}
```

####使用示例
client端向UDS service发起请求（伪代码，完整代码请参看各部分demo）：
```java
ACMsg req = new ACMsg();								// 创建一个空请求消息
req.setName("controlLight");							// 设置请求消息名
req.put("deviceId", light.getId());						// 设置一个请求属性“设备id”
req.put("action", "on");								// 设置另一属性"动作“，开灯
AC.sendToService(subDomain, serviceName, serviceVersion, req, new PayloadCallback<ACMsg>() {
    @Override
    public void finish(ACMsg resp) {
        //发送成功并接收服务的响应消息
    }

    @Override
    public void error(Exception e) {
        //e.getErrorCode为错误码，e.getMessage为错误信息
    }
});							                            // 发送请求并返回服务端响应
```
服务端处理请求（伪代码，完整代码请参看各部分demo）：
```java
private void handleControlLight(ACMsg req, ACMsg resp) throws Exception {
    Long lightId = req.get("deviceId");		// 从请求中获取“设备id”
    String action = req.get("action");		// 从请求中获取“动作”
    // do something
}
```

###ACDeviceMsg
在使用**二进制**或**json**格式通讯协议的情况下,该消息用于处理服务和设备之间的交互，框架会将ACDeviceMsg中的code部分解析出来，开发者可根据[code](firmware/wifi_interface_guide/#13 "消息码说明")来区分设备消息类型。但是ACDeviceMsg的content部分由开发者解释，框架透传，因此开发者需要自己编写设备消息序列化/反序列化器。ACDeviceMsg定义如下：
```java
public class ACDeviceMsg {
    private int code;			// 消息码，用于区分消息类型
    private Object content;		// 设备消息的具体内容

    public ACDeviceMsg() {}
    public ACDeviceMsg(int code, Object content) {}
    public int getCode() {}
    public void setCode(int code) {}
    public Object getContent() {}
    public void setContent(Object content) {}
}
```

从上面的定义可以看到，设备消息的具体内容为Object类型，开发者根据实际情况实现序列化器用来解释content的内容，在作具体的序列化/反序列化时，可根据code的不同值做出不同的序列化行为。

###ACDeviceMsgMarshaller
设备消息的序列化/反序列化器，用于解释ACDeviceMsg的内容，其定义如下：
```java
public interface ACDeviceMsgMarshaller {
    /**
     * 因为与设备的通讯以二进制流的形式进行，所以需要全局设置一个序列化与反序列化器
     * 序列化器
     *
     * @param deviceMsg 对应sendToDeviceWithOption里的deviceMsg参数，
     * @return 调用sendToDeviceWithOption时消息需要先经过这里序列化成byte数组
     */
    public byte[] marshal(ACDeviceMsg deviceMsg) throws Exception;

    /**
     * 反序列化器
     *
     * @param msgCode 开发商基于AbleCloud框架自定义的协议，此处为与设备通讯的msgCode
     * @param payload 此处为接收到设备响应的原始byte数组，设备返回数据后先经过这里进行反序列化
     * @return 反序列化后返回ACDeviceMsg对象，此处对应sendToDeviceWithOption里callback的success回调
     */
    public ACDeviceMsg unmarshal(int msgCode, byte[] payload) throws Exception;
}
```

###ACKLVDeviceMsg
在使用**KLV**通讯协议的情况下,该消息用于处理服务和设备之间的交互，框架会将ACKLVDeviceMsg中的code部分解析出来，开发者可根据code来区分设备消息类型。ACKLVDeviceMsg的ACKLVObject即消息体部分需要开发者到官网平台上填写申请不同key值代表的不同含义，在这里再把该key值对应的value put进去即可。定义如下：
```java
public class ACKLVDeviceMsg {
    private int code;               // 消息码，用于区分消息类型
    private ACKLVObject object;     // 设备消息的具体内容

    public ACKLVDeviceMsg() {}
    public ACKLVDeviceMsg(int code, ACKLVObject object) {}
    public int getCode() {}
    public void setCode(int code) {}
    public ACKLVObject getKLVObject() {}
    public void setKLVObject(ACKLVObject object) {}
}
```
><font color="brown">注：ACKLVObject与ACObject数据格式用法相似，不同的是ACKLVObject里key值的类型为Integer</font>






#SDK接口列表


##基本对象结构
这里说的基本数据结构，是指设备管理、帐号管理等要用到的各个对象定义，比如帐号、设备等。


###ACAccount
用来表示AbleCloud的一个注册帐号信息，定义如下：
```java
public class ACUserInfo {
    private long userId;  //用户id
    private String name;  //用户名

    public ACUserInfo(long uid, String token) {}

	// getter
}
```

###ACOpenIdInfo
用来表示AbleCloud的一个第三方登录信息，定义如下：
```java
public class ACOpenIdInfo {
    //第三方登录类型，通过ACThirdPlatform.QQ|SINA|WEIXIN|JINDONG|OTHER区分
    private ACThirdPlatform thirdPlatform; 
    //从第三方登录后获取的openId，微博为id
    private String openId;   

    public ACOpenIdInfo(ACThirdPlatform thirdPlatform, String openId) {}

	// getter
}
```

###ACUserDevice
设备管理模式下，用来表示一个设备，定义如下：
```java
public class ACUserDevice {
    //设备逻辑ID
    public long deviceId;
    //设备管理员ID
    public long owner;
    //设备名称
    public String name;
    //子域ID
    public long subDomainId;
    //token
    public String aesKey;
    //设备物理ID
    public String physicalDeviceId;
    //设备网关ID
    public long gatewayDeviceId;
    //设备所在根组，即homeId（只有分组模型需要用到该属性）
    public long rootId;
    /**
     * 设备在线状态(listDeviceWithStatus时返回，listDevice不返回该值)
     * 0不在线 1云端在线 2局域网在线 3云端和局域网同时在线
     */
    public int status = 0;
    public ACUserDevice(long deviceId, long owner, String name, long subDomainId, String aesKey, String physicalDeviceId, long gatewayDeviceId, long rootId) {}

    // getter
}
```

###ACDeviceUser
设备管理模式下，用来表示一个设备下的所有用户信息，定义如下：
```java
public class ACDeviceUser {
    //用户ID
    private long userId;
    //设备逻辑ID
    private long deviceId;
    //用户类型 0普通成员 1管理员
    private long userType;
    //手机号码
    private String phone;
    //电子邮件地址
    private String email;
    //名字
    private String name;

    public ACDeviceUser(long userId, long deviceId, long userType, String phone, String email, String name) {}

    // getter
}
```

###ACHome
说明：分组模型下，Home模型定义如下：
```java
public class ACHome {
    private long homeId;
    //home管理员的userId
    private long owner;
    //home名字
    private String name;

    public ACHome(long homeId, long owner, String name) {}
}
```

###ACRoom
说明：分组模型下，Room模型定义如下：
```java
public class ACRoom {
    private long homeId;
    private long roomId;
    //room管理员的userId
    private long owner;
    //room名字
    private String name;

    public ACRoom(long homeId, long roomId, long owner, String name) {}
}
```

###ACTimerTask
说明：列举定时任务列表时用来表示定时任务信息，定义如下：
```java
public class ACTimerTask {
    //创建任务ID
    private long taskId;
    //任务的类型（onceTask）
    private String taskType;
    //创建该用户的逻辑ID
    private long userId;
    //创建该用户的昵称
    private String nickName;
    //任务描述
    private String description;
    //任务时区
    private String TimeZone;
    //任务时间点
    private String timePoint;
    //任务时间周期
    private String timeCycle;
    //创建任务时间
    private String createTime;
    //修改任务时间
    private String modifyTime;
    //任务执行状态 0停止 1执行中
    private int status;

    public ACTimerTask() {}
    
    //getter
}
```

###ACPushTable
说明：用来表示订阅的数据集实时消息内容，定义如下：
```java
public class ACPushTable {
    public static final int OPTYPE_CREATE = 1;
    public static final int OPTYPE_REPLACE = 2;
    public static final int OPTYPE_UPDATE = 3;
    public static final int OPTYPE_DELETE = 4;

    //订阅的表名
    private String className;
    //订阅的项
    private String[] columes;
    //订阅的监控主键
    private ACObject primaryKey;
    //订阅的类型
    private int opType;

    public ACPushTable(String className, ACObject primaryKey) {}

    public ACPushTable(String className, String[] columes, ACObject primaryKey, int opType) {}
}
```

###ACFileInfo
说明：文件管理中获取下载url或上传文件时用来表示用户信息，定义如下：
```java
public class ACFileInfo {
    //自定义文件目录，如ota
    private String bucket;
    /**
     * 目录类型（若为私有目录，则会对下载链接进行加密且下载链接具有有效期）
     * 
     * 只能填"public"或"private"
     */
    private String bucketType;
    //文件名
    private String filename;
    //上传文件数据
    private byte[] data;
    //上传文件的File对象
    private File file;
    //权限管理
    private ACACL acl;

    public ACFileInfo(String bucket, String bucketType, String filename) {
    }
}
```

###ACDeviceFind
说明：用来获取局域网本地设备，定义如下：
```java
public class ACDeviceFind {
    private String ip;
    private String physicalDeviceId;

    public ACDeviceFind(String ip, String physicalDeviceId) {}

    //getter
}
```
>注：只有在发现本地局域网设备在线的情况下才能进行直连控制，sdk内部自动进行判断
>如果出现丢包导致局域网状态不准确情况下，需要手动刷新局域网状态并进行控制，则需要调用findLocalDevice重新获取ACDeviceFind的列表（不需要做任何处理，sdk自动会记住局域网在线设备列表），这时只需要更新页面上显示的局域网在线状态即可（当前设备列表只需要匹配到physicalDeviceId相等即说明该设备本地局域网在线，或者重新listDeviceWithStatus获取设备列表）

###ACOTAUpgradeInfo
说明：用来获取OTA升级状态信息，定义如下：
```java
public class ACOTAUpgradeInfo {
    //当前版本号
    private String oldVersion;
    //升级版本号
    private String newVersion;
    //升级日志
    private String upgradeLog;

    //蓝牙OTA升级
    public ACOTAUpgradeInfo(String newVersion, String upgradeLog) {
        this.newVersion = newVersion;
        this.upgradeLog = upgradeLog;
        this.oldVersion = "you should get it from bluetooth";
    }

    //WiFi OTA升级
    public ACOTAUpgradeInfo(String oldVersion, String newVersion, String upgradeLog) {
        this.oldVersion = oldVersion;
        this.newVersion = newVersion;
        this.upgradeLog = upgradeLog;
    }

    //getter
}
```

###ACException
说明：用来表示所有错误信息，定义如下：
```java
public class ACException extends Exception {
    private int errorCode;

    //sdk内部错误码（不包括云端返回）
    public static int NO_WIFI_CONNECTED = 1986;
    public static int NO_NETWORK_AVAILABLE = 1987;
    public static int LOCAL_DEVICE_OFFLINE = 1988;
    public static int INVALID_PAYLOAD = 1989;
    public static int ENTRY_EMPTY = 1990;
    public static int INVALID_PARAMETERS = 1991;
    public static int NO_LOGIN = 1992;
    public static int TIMEOUT = 1993;
    public static int MARSHALLER_EMPTY = 1994;
    public static int MARSHAL_ERROR = 1995;
    public static int UNMARSHAL_ERROR = 1996;
    public static int WRONG_PAYLOAD_FORMAT = 1997;
    public static int INTERNET_ERROR = 1998;
    public static int INTERNAL_ERROR = 1999;
    public int getErrorCode() {
        return errorCode;
    }
}
```

##用户帐号管理

一台设备最终是需要通过用户来控制的，需要发送验证码、注册、登陆、管理密码等常规功能，ablecloud提供了云端帐号管理系统来协助开发人员快速的完成，在SDK端也提供了相应的接口，定义如下：

```java
public interface ACAccountMgr {

    /**
     * 发送短信验证码
     *
     * @param account  手机号码 (有关规定每天向同一个手机号发送的短信数量有严格限制)
     * @param template 短信内容模板
     * @param callback 返回结果的监听回调
     */
    public void sendVerifyCode(String account, int template, VoidCallback callback);

    /**
     * 验证验证码是否有效
     *
     * @param account    手机号码
     * @param verifyCode 验证码
     * @param callback   返回结果的监听回调
     */
    public void checkVerifyCode(String account, String verifyCode, PayloadCallback<Boolean> callback);

    /**
     * 注册一个新用户
     *
     * @param email      用户邮箱，与phone任选其一，或都提供
     * @param phone      手机号码，或email任选其一，或都提供
     * @param password   用户密码
     * @param name       用户昵称，不唯一，不同用户的昵称可重复
     * @param verifyCode 验证码
     * @param callback   返回结果的监听回调
     */
    public void register(String email, String phone, String password, String name, String verifyCode, PayloadCallback<ACUserInfo> callback);

    /**
     * 用户登录
     *
     * @param account  帐号名，注册时候email或phone任选其一
     * @param password 用户密码
     * @param callback 返回结果的监听回调
     */
    public void login(String account, String password, PayloadCallback<ACUserInfo> callback);


    /**
     * 检查账号是否存在
     *
     * @param account  帐号名，email或phone任选其一
     * @param callback 返回结果的监听回调
     */
    public void checkExist(String account, PayloadCallback<Boolean> callback);

    /**
     * 修改手机号
     *
     * @param phone      新手机号
     * @param password   旧密码
     * @param verifyCode 验证码
     * @param callback   返回结果的监听回调
     */
    public void changePhone(String phone, String password, String verifyCode, VoidCallback callback);

    /**
     * 修改名字
     *
     * @param nickName 用户名
     * @param callback 返回结果的监听回调
     */
    public void changeNickName(String nickName, VoidCallback callback);

    /**
     * 修改密码
     *
     * @param oldPswd  旧密码
     * @param newPswd  新密码
     * @param callback 返回结果的监听回调
     */
    public void changePassword(String oldPswd, String newPswd, VoidCallback callback);

    /**
     * 重置密码
     *
     * @param account  帐号名，注册时候email或phone任选其一
     * @param pswd     新密码
     * @param callback 返回结果的监听回调
     */
    public void resetPassword(String account, String pswd, String verifyCode, PayloadCallback<ACUserInfo> callback);

    /**
     * 是否登录
     */
    public boolean isLogin();

    /**
     * 注销
     */
    public void logout();

    /**
     * 第三方账号登录
     *
     * @param thirdPlatform 第三方类型（如QQ、微信、微博）
     * @param openId        通过第三方登录获取的openId
     * @param accessToken   通过第三方登录获取的accessToken
     * @param callback      返回结果的监听回调
     */
    public void loginWithOpenId(ACThirdPlatform thirdPlatform, String openId, String accessToken, PayloadCallback<ACUserInfo> callback);

    /**
     * 绑定第三方账号
     *
     * @param thirdPlatform 第三方类型（如QQ、微信、微博）
     * @param openId        通过第三方登录获取的openId
     * @param accessToken   通过第三方登录获取的accessToken
     * @param callback      返回结果的监听回调
     */
    public void bindWithOpenId(ACThirdPlatform thirdPlatform, String openId, String accessToken, VoidCallback callback);

    /**
     * 第三方账号登录状态下绑定用户信息
     *
     * @param email      用户邮箱，与phone任选其一，或都提供
     * @param phone      用户手机号码，或email任选其一，或都提供
     * @param password   用户密码
     * @param nickName   名字
     * @param verifyCode 验证码
     * @param callback   返回结果的监听回调
     */
    public void bindWithAccount(String email, String phone, String password, String nickName, String verifyCode, VoidCallback callback);

    /**
     * 列举所有的第三方登录信息
     *
     * @param callback   返回结果的监听回调
     */
    public void listAllOpenIds(PayloadCallback<List<ACOpenIdInfo>> callback);
    
    /**
     * 设置用户自定义扩展属性
     *
     * @param userProfile 用户自定义扩展属性
     * @param callback    返回结果的监听回调
     */
    public void setUserProfile(ACObject userProfile, VoidCallback callback);

    /**
     * 获取用户自定义扩展属性
     */
    public void getUserProfile(PayloadCallback<ACObject> callback);
}
```

##设备激活

当一款智能设备上市，交付到终端用户时，虽然是智能设备，但是目前大多数智能设备并没有键盘、屏幕等UI（用户界面），那么如何让一台新设备连上网络呢，这里就要用到设备激活功能。新设备激活的大致流程如下：
 
>1. 调用激活器的以下接口，将wifi的ssid，密码广播给设备；

>+ 通过扫码方式获取设备物理Id(每一台设备厂商都会给它分配一个设备号，AbleCloud称为设备的物理id)绑定指定的设备

>+ 批量激活并绑定设备

>2. 设备收到app端发过来的信息，完成激活并连上wifi；

>3. 设备连接成功后，调用设备管理器中的绑定接口完成设备的绑定。至此，一台新设备就联网、连云完成，可由相关的成员控制了。

ablecloud提供了激活器供你使用，定义如下：
```java
public class ACDeviceActivator {
	/**
     * 获取APP端当前连接wifi的SSID
     *
     * @return	wifi的SSID
     */
	public String getSSID() {}

    /**
     * 通过smartconfig技术，使设备连上wifi，每次只绑定一台设备
     * 只支持配置手机当前连接的wifi
     *
     * @param SSID             wifi的SSID
     * @param password         SSID对应的wifi密码
     * @param physicalDeviceId 设备的物理id
     * @param timeout          连接超时时间，单位毫秒
     * @return 通过回调callback，返回一个带physicalDeviceId和subDomainId（用来区分设备类型）的对象
     */
    public void startAbleLink(String SSID, String password, String physicalId, int timeout, PaylodCallback<ACDeviceBind> callback) {}

    /**
     * 通过smartconfig技术，使设备连上wifi，可以同时绑定多台设备
     * 只支持配置手机当前连接的wifi
     *
     * @param SSID     wifi的SSID
     * @param password 参数SSID对应wifi的密码
     * @param timeout  连接超时时间，单位毫秒
     * @return 通过回调callback，返回一个带physicalDeviceId和subDomainId（用来区分设备类型）的对象集合列表
     */
    public void startAbleLink(String SSID, String password, int timeout, PayloadCallback<List<ACDeviceBind>> callback) {

	/**
     * 停止连接,使用场景：配置过程中用户主动取消配置
     */
	public void stopAbleLink() {}
}
```
设备激活成功之后返回的信息，定义如下：
```java
public class ACDeviceBind {
    //subDomainId可以用来区分不同产品类型
    private long subDomainId;
    //设备物理ID
    private String physicalDeviceId;

    public ACDeviceBind(long subDomainId, String physicalDeviceId) {
        this.subDomainId = subDomainId;
        this.physicalDeviceId = physicalDeviceId;
    }

   //getter
}
```
>通过以上ACDeviceActivator提供的接口，使一台设备连上wifi，我们认为已经将设备激活了。但是只是激活设备还不够，用户控制设备前需要对设备进行绑定



##设备管理( 独立和网关型）

将用户和设备绑定后，用户才能使用设备。AbleCloud提供了设备绑定、解绑、分享、网关添加子设备、删除子设备等接口。

```java
public interface ACBindMgr {

    /**
     * 从云端获取所有设备列表并保存到本地缓存中
     *
     * @param callback 返回结果的监听回调
     */
    public void listDevices(PayloadCallback<List<ACUserDevice>> callback);

    /**
     * 从云端获取所有设备列表和设备状态并保存到本地缓存中（如果只是简单的设备管理请使用上面更轻便的接口）
     * 如果从云端获取失败会直接从本地缓存中获取设备列表和本地局域网状态
     *
     * @param callback 返回结果的监听回调，只会回调success
     */
    public void listDevicesWithStatus(PayloadCallback<List<ACUserDevice>> callback);

    /**
     * 获取接入设备的所有用户列表
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param callback  返回结果的监听回调
     */
    public void listUsers(String subDomain, long deviceId, PayloadCallback<List<ACDeviceUser>> callback);

    /**
     * 绑定一个设备
     *
     * @param subDomain        子域名，如djj（豆浆机）
     * @param physicalDeviceId 设备id（制造商提供的）
     * @param name             设备名
     * @param callback         返回结果的监听回调
     */
    public void bindDevice(String subDomain, String physicalDeviceId, String name, PayloadCallback<ACUserDevice> callback);

    /**
     * 分享设备
     *
     * @param shareCode 分享码，由管理员调用getShareDevice获取
     * @param callback  返回结果的监听回调
     */
    public void bindDeviceWithShareCode(String shareCode, PayloadCallback<ACUserDevice> callback);

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
     * 解绑设备
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param callback  返回结果的监听回调
     */
    public void unbindDevice(String subDomain, long deviceId, VoidCallback callback);

    /**
     * 解绑某个用户的设备
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param userId    被解绑用户的ID
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param callback  返回结果的监听回调
     */
    public void unbindDeviceWithUser(String subDomain, long userId, long deviceId, VoidCallback callback);

    /**
     * 获取分享码（只有管理员可以获取 ，默认一小时内生效）
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param callback  返回结果的监听回调
     */
    public void getShareCode(String subDomain, long deviceId, PayloadCallback<String> callback);

    /**
     * 获取分享码（只有管理员可以获取 ）
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param timeout   二维码超时时间(以秒为单位)
     * @param callback  返回结果的监听回调
     */
    public void getShareCode(String subDomain, long deviceId, int timeout, PayloadCallback<String> callback);

    /**
     * 设备管理员权限转让
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param userId    新的管理员Id（要求该用户也已经绑定过该设备）
     * @param callback  返回结果的监听回调
     */
    public void changeOwner(String subDomain, long deviceId, long userId, VoidCallback callback);

    /**
     * 更换设备
     *
     * @param subDomain        子域名，如djj（豆浆机）
     * @param physicalDeviceId 设备id（制造商提供的）
     * @param deviceId         设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param callback         返回结果的监听回调
     */
    public void changeDevice(String subDomain, String physicalDeviceId, long deviceId, VoidCallback callback);

    /**
     * 修改设备名
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param name      新的设备名
     * @param callback  返回结果的监听回调
     */
    public void changeName(String subDomain, long deviceId, String name, VoidCallback callback);

    /**
     * 查询设备是否在线（deviceId与physicalDeviceId两个参数至少提供其一，两者都提供以physicalDeviceId为准）
     *
     * @param subDomain        子域名，如djj（豆浆机）
     * @param deviceId         设备id（这里的id，是调用list接口返回的id，不是制造商提供的id），不提供时传0
     * @param physicalDeviceId 设备id（制造商提供的），不提供时传“”
     * @param callback         返回结果的监听回调
     */
    public void isDeviceOnline(String subDomain, long deviceId, String physicalDeviceId, PayloadCallback<Boolean> callback);

    /**
     * 绑定网关
     *
     * @param subDomain        子域名，如djj（豆浆机）
     * @param physicalDeviceId 设备id（制造商提供的）
     * @param name             设备名字
     * @param callback         返回结果的监听回调
     */
    public void bindGateway(String subDomain, String physicalDeviceId, String name, PayloadCallback<ACUserDevice> callback);

    /**
     * 解绑网关
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param callback  返回结果的监听回调
     */
    public void unbindGateway(String subDomain, long deviceId, VoidCallback callback);

    /**
     * 添加子设备
     *
     * @param subDomain        子域名，如djj（豆浆机）
     * @param gatewayDeviceId  网关逻辑id
     * @param physicalDeviceId 设备id（制造商提供的）
     * @param name             子设备名称
     * @param callback         返回结果的监听回调
     */
    public void addSubDevice(String subDomain, long gatewayDeviceId, String physicalDeviceId, String name, PayloadCallback<ACUserDevice> callback);

    /**
     * 删除子设备
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param callback  返回结果的监听回调
     */
    public void deleteSubDevice(String subDomain, long deviceId, VoidCallback callback);

    /**
     * 获取用户网关列表
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param callback  返回结果的监听回调
     */
    public void listGateways(String subDomain, PayloadCallback<List<ACUserDevice>> callback);

    /**
     * 获取用户子设备列表
     *
     * @param subDomain       子域名，如djj（豆浆机）
     * @param gatewayDeviceId 网关逻辑id
     * @param callback        返回结果的监听回调
     */
    public void listSubDevices(String subDomain, long gatewayDeviceId, PayloadCallback<List<ACUserDevice>> callback);

    /**
     * 获取网关新设备列表
     *
     * @param subDomain       子域名，如djj（豆浆机）
     * @param gatewayDeviceId 网关逻辑id
     * @param callback        返回结果的监听回调
     */
    public void listNewDevices(String subDomain, long gatewayDeviceId, PayloadCallback<List<ACDeviceBind>> callback);

    /**
     * 开启网关接入
     *
     * @param subDomain       子域名，如djj（豆浆机）
     * @param gatewayDeviceId 网关逻辑id
     * @param time            开启时间
     * @param callback        返回结果的监听回调
     */
    public void openGatewayMatch(String subDomain, long gatewayDeviceId, int time, VoidCallback callback);

    /**
     * 关闭网关接入
     *
     * @param subDomain       子域名，如djj（豆浆机）
     * @param gatewayDeviceId 网关逻辑id
     * @param callback        返回结果的监听回调
     */
    public void closeGatewayMatch(String subDomain, long gatewayDeviceId, VoidCallback callback);

    /**
     * 剔除子设备
     *
     * @param subDomain        子域名，如djj（豆浆机）
     * @param gatewayDeviceId  网关逻辑id
     * @param physicalDeviceId 设备id（制造商提供的）
     * @param callback         返回结果的监听回调
     */
    public void evictSubDevice(String subDomain, long gatewayDeviceId, String physicalDeviceId, VoidCallback callback);

    /**
     * 设置设备自定义扩展属性
     *
     * @param deviceId      设备逻辑id
     * @param deviceProfile 用户自定义扩展属性
     * @param callback      返回结果的监听回调
     */
    public void setDeviceProfile(String subDomain, long deviceId, ACObject deviceProfile, VoidCallback callback);

    /**
     * 获取设备自定义扩展属性
     *
     * @param deviceId 设备逻辑id
     * @param callback 返回结果的监听回调
     */
    public void getDeviceProfile(String subDomain, long deviceId, PayloadCallback<ACObject> callback);

    /**
     * 设置设备消息序列化/反序列化器
     *
     * @param marshaller 开发者自定义的ACDeviceMarshaller
     */
    public void setDeviceMsgMarshaller(ACDeviceMsgMarshaller marshaller);

    /**
     * 获取设备消息序列化/反序列化器
     */
    public ACDeviceMsgMarshaller getDeviceMsgMarshaller();

    /**
     * 为便于测试，开发者可实现一个设备的桩
     *
     * @param stub
     */
    public void addDeviceStub(String subDomain, ACDeviceStub stub);


    /**
     * 给设备发消息（binary or json）
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备逻辑id
     * @param deviceMsg 具体的消息内容
     * @param option    AC.ONLY_LOCAL  只通过局域网直连方式给设备发消息
     *                  AC.ONLY_CLOUD  只通过云端给设备发消息
     *                  AC.LOCAL_FIRST 优先通过局域网直连方式给设备发消息
     *                  AC.CLOUD_FIRST 优先通过云端给设备发消息
     * @param callback  返回结果的监听回调
     */
    public void sendToDeviceWithOption(String subDomain, long deviceId, ACDeviceMsg deviceMsg, int option, PayloadCallback<ACDeviceMsg> callback);

    /**
     * 给设备发消息（klv）
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备逻辑id
     * @param deviceMsg 具体的消息内容(使用KLV格式，具体代表含义需到官网上定义)
     * @param option    AC.ONLY_LOCAL  只通过局域网直连方式给设备发消息
     *                  AC.ONLY_CLOUD  只通过云端给设备发消息
     *                  AC.LOCAL_FIRST 优先通过局域网直连方式给设备发消息
     *                  AC.CLOUD_FIRST 优先通过云端给设备发消息
     * @param callback  返回结果的监听回调
     */
    public void sendToDeviceWithOption(String subDomain, long deviceId, ACKLVDeviceMsg deviceMsg, int option, PayloadCallback<ACKLVDeviceMsg> callback);
}
```


##Home模型


```java
public interface ACGroupMgr {

    /**
     * 创建家庭，任何人可创建
     *
     * @param name     家庭名字
     * @param callback 返回结果的监听回调
     */
    public void createHome(String name, PayloadCallback<ACHome> callback);

    /**
     * 删除家庭，只有组的管理员可删除。删除家庭，家庭内所有的设备和设备的绑定关系删除。普通用户调用该接口相当于退出家庭
     *
     * @param homeId   家庭id
     * @param callback 返回结果的监听回调
     */
    public void deleteHome(long homeId, VoidCallback callback);

    /**
     * 创建房间，只有home的管理员可以创建。room从属于home。
     *
     * @param homeId   家庭id
     * @param name     房间名字
     * @param callback 返回结果的监听回调
     */
    public void createRoom(long homeId, String name, PayloadCallback<ACRoom> callback);

    /**
     * 只有home的管理员可以删除。Room删除后，原来在room下面的设备自动划转到home下
     *
     * @param homeId   家庭id
     * @param roomId   房间id
     * @param callback 返回结果的监听回调
     */
    public void deleteRoom(long homeId, long roomId, VoidCallback callback);

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
    public void addDeviceToHome(String subDomain, String physicalDeviceId, long homeId, String name, PayloadCallback<ACUserDevice> callback);

    /**
     * 设备不是新设备
     * 将设备添加到家庭。返回设备对象。所有对家庭有控制权的用户都对该设备有使用权
     * 当添加的设备为网关时，网关下面的子设备全部添加到家庭。
     * 给网关添加子设备仍然调用addSubDevice接口，添加到网关的子设备需要再次调用此接口添加到home。
     *
     * @param deviceId 设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param homeId   家庭id
     * @param name     设备名字
     * @param callback 返回结果的监听回调
     */
    public void addDeviceToHome(long deviceId, long homeId, String name, PayloadCallback<ACUserDevice> callback);

    /**
     * 从家庭里删除设备，设备变为新的设备，所有绑定权限失效。删除网关时，网关和下面所有子设备一起删除。删除子设备时，子设备和网关的绑定关系同时解除
     *
     * @param deviceId 设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param homeId   家庭id
     * @param callback 返回结果的监听回调
     */
    public void deleteDeviceFromHome(long deviceId, long homeId, VoidCallback callback);

    /**
     * 将设备移动到房间中，要求设备和room在同一个home下才可以。当设备为网关时，网关下面的子设备原位置不变
     *
     * @param deviceId 设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param homeId   家庭id
     * @param roomId   房间id
     * @param callback 返回结果的监听回调
     */
    public void moveDeviceToRoom(long deviceId, long homeId, long roomId, VoidCallback callback);

    /**
     * 将设备从房间中移除。从房间中移除的设备移动到家庭下
     *
     * @param deviceId 设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param homeId   家庭id
     * @param roomId   房间id
     * @param callback 返回结果的监听回调
     */
    public void removeDeviceFromRoom(long deviceId, long homeId, long roomId, VoidCallback callback);

    /**
     * 获取家庭的分享码（只有管理员可以获取 ）
     *
     * @param homeId   家庭id
     * @param callback 返回结果的监听回调
     */
    public void getHomeShareCode(long homeId, PayloadCallback<String> callback);

    /**
     * 获取家庭的分享码（只有管理员可以获取 ,默认超时时间为1小时）
     *
     * @param homeId   家庭id
     * @param timeout  二维码超时时间(以秒为单位)
     * @param callback 返回结果的监听回调
     */
    public void getHomeShareCode(long homeId, int timeout, PayloadCallback<String> callback);

    /**
     * 普通用户通过管理员分享的二维码加入家庭
     *
     * @param shareCode 分享码
     * @param callback 返回结果的监听回调
     */
    public void joinHomeWithShareCode(String shareCode, PayloadCallback<ACHome> callback);

    /**
     * 普通用户通过管理员分享的二维码加入家庭
     *
     * @param homeId   家庭id
     * @param account  手机号或者email
     * @param callback 返回结果的监听回调
     */
    public void addUserToHome(long homeId, String account, VoidCallback callback);

    /**
     * 管理员直接将某人从家中移除
     *
     * @param homeId   家庭id
     * @param userId   被移除用户的userId
     * @param callback 返回结果的监听回调
     */
    public void removeUserFromHome(long homeId, long userId, VoidCallback callback);

    /**
     * 列出某个用户有使用权的所有家庭
     *
     * @param callback 返回结果的监听回调
     */
    public void listHomes(PayloadCallback<List<ACHome>> callback);

    /**
     * 获取某个home下面的所有room
     *
     * @param homeId   家庭id
     * @param callback 返回结果的监听回调
     */
    public void listRooms(long homeId, PayloadCallback<List<ACRoom>> callback);

    /**
     * 列出家庭下的所有设备
     *
     * @param homeId   家庭id
     * @param callback 返回结果的监听回调
     */
    public void listHomeDevices(long homeId, PayloadCallback<List<ACUserDevice>> callback);

    /**
     * 列出房间里的所有设备
     *
     * @param homeId   家庭id
     * @param roomId   房间id
     * @param callback 返回结果的监听回调
     */
    public void listRoomDevices(long homeId, long roomId, PayloadCallback<List<ACUserDevice>> callback);

    /**
     * 列出家庭成员
     *
     * @param homeId   家庭id
     * @param callback 返回结果的监听回调
     */
    public void listHomeUsers(long homeId, PayloadCallback<List<ACHomeUser>> callback);

    /**
     * 更改家庭名称，普通用户和管理员均有权限更改。App端可以自己设定普通用户是否有权限更改。
     *
     * @param homeId   家庭id
     * @param name     家庭名字
     * @param callback 返回结果的监听回调
     */
    public void changeHomeName(long homeId, String name, VoidCallback callback);

    /**
     * 更改组名称，普通用户和管理员均有权限更改。App端可以自己设定普通用户是否有权限更改。
     *
     * @param homeId   家庭id
     * @param roomId   房间id
     * @param name     房间名字
     * @param callback 返回结果的监听回调
     */
    public void changeRoomName(long homeId, long roomId, String name, VoidCallback callback);
}
```


##OTA
**<font color="red">注</font>：具体使用步骤见开发指导-->OTA**
接口定义如下：
```java
public interface ACOTAMgr {

    /**
     * 检查设备版本及更新日志
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param callback  返回结果的监听回调
     */
    public void checkUpdate(String subDomain, long deviceId, PayloadCallback<ACOTAUpgradeInfo> callback);

    /**
     * 确认OTA升级
     *
     * @param subDomain  子域名，如djj（豆浆机）
     * @param newVersion 升级文件版本号
     * @param callback   返回结果的监听回调
     */
    public void confirmUpdate(String subDomain, long deviceId, String newVersion, VoidCallback callback);

    /**
     * 查询蓝牙设备OTA发布版本
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param callback  返回结果的监听回调
     */
    public void bluetoothVersion(String subDomain, PayloadCallback<ACOTAUpgradeInfo> callback);

    /**
     * 获取蓝牙设备OTA文件meta信息列表
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param version   蓝牙设备OTA版本
     * @param callback  返回结果的监听回调
     */
    public void listFiles(String subDomain, String version, PayloadCallback<List<ACOTAFileMeta>> callback);

    /**
     * 获取蓝牙设备OTA文件
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param type      升级文件类型
     * @param checksum  升级文件校验和
     * @param version   升级文件版本号
     * @param callback  返回结果的监听回调
     */
    public void bluetoothFile(String subDomain, int type, int checksum, String version, PayloadCallback<byte[]> callback);
}
```




##设备定时任务

>**<font color="red">注意</font>：**

>**1、若与设备之间的通讯为二进制或json格式，则需要先设置序列化器（与发送到设备相同），若为klv格式则不需要设置，具体参考与云端通讯中的发送到设备**

>**2、timePoint的格式为`"yyyy-MM-dd HH:mm:ss"`，否则会失败**

>**3、timeCycle需要在timePoint时间点的基础上,选择循环方式**

>+ **"once":**单次循环

>+ **"min":**在每分钟的**`ss`**时间点循环执行

>+ **"hour":**在每小时的**`mm:ss`**时间点循环执行

>+ **"day":**在每天的**`HH:mm:ss`**时间点循环执行

>+ **"month":**在每月的**`dd HH:mm:ss`**时间点循环执行

>+ **"year":**在每年的**`MM-dd HH:mm:ss`**时间点循环执行

>+ **"week[0,1,2,3,4,5,6]":**在每星期的**`HH:mm:ss`**时间点循环执行(如周一，周五重复，则表示为"week[1,5]")

接口定义如下：
```java
public interface ACTimerMgr {

    /**
     * 创建定时任务(使用二进制模型)
     *
     * @param deviceId    设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param timePoint   任务时间点，时间格式为："yyyy-MM-dd HH:mm:ss",比如2015-08-08 16:39:03
     * @param timeCycle   单次定时任务：once
     *                    循环定时任务：按分重复：min
     *                    按小时重复：hour
     *                    按天重复：day
     *                    按月重复：month
     *                    按年复复：year
     *                    星期循环任务：week[0，1，2，3，4，5，6]如周一，周五重复，则表示为week[1，5]
     * @param description 自定义的任务描述
     * @param msg         具体的消息内容
     * @param callback    返回结果的监听回调
     */
    public void addTask(long deviceId, String timePoint, String timeCycle, String description, ACDeviceMsg msg, VoidCallback callback);

    /**
     * 创建定时任务(使用KLV模型)
     *
     * @param deviceId    设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param timePoint   任务时间点，时间格式为："yyyy-MM-dd HH:mm:ss",比如2015-08-08 16:39:03
     * @param timeCycle   单次定时任务：once
     *                    循环定时任务：按分重复：min
     *                    按小时重复：hour
     *                    按天重复：day
     *                    按月重复：month
     *                    按年复复：year
     *                    星期循环任务：week[0，1，2，3，4，5，6]如周一，周五重复，则表示为week[1，5]
     * @param description 自定义的任务描述
     * @param msg         具体的消息内容(使用KLV格式，具体代表含义需到官网上定义)
     * @param callback    返回结果的监听回调
     */
    public void addTask(long deviceId, String timePoint, String timeCycle, String description, ACKLVDeviceMsg msg, VoidCallback callback);

    /**
     * 修改定时任务(使用二进制模型)
     *
     * @param deviceId    设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param taskId      任务id
     * @param timePoint   任务时间点，时间格式为："yyyy-MM-dd HH:mm:ss",比如2015-08-08 16:39:03
     * @param timeCycle   单次定时任务：once
     *                    循环定时任务：按分重复：min
     *                    按小时重复：hour
     *                    按天重复：day
     *                    按月重复：month
     *                    按年复复：year
     *                    星期循环任务：week[0，1，2，3，4，5，6]如周一，周五重复，则表示为week[1，5]
     * @param description 自定义的任务描述
     * @param msg         具体的消息内容
     * @param callback    返回结果的监听回调
     */
    public void modifyTask(long deviceId, long taskId, String timePoint, String timeCycle, String description, ACDeviceMsg msg, VoidCallback callback);

    /**
     * 修改定时任务(使用KLV模型)
     *
     * @param deviceId    设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param taskId      任务id
     * @param timePoint   任务时间点，时间格式为："yyyy-MM-dd HH:mm:ss",比如2015-08-08 16:39:03
     * @param timeCycle   单次定时任务：once
     *                    循环定时任务：按分重复：min
     *                    按小时重复：hour
     *                    按天重复：day
     *                    按月重复：month
     *                    按年复复：year
     *                    星期循环任务：week[0，1，2，3，4，5，6]如周一，周五重复，则表示为week[1，5]
     * @param description 自定义的任务描述
     * @param msg         具体的消息内容(使用KLV格式，具体代表含义需到官网上定义)
     * @param callback    返回结果的监听回调
     */
    public void modifyTask(long deviceId, long taskId, String timePoint, String timeCycle, String description, ACKLVDeviceMsg msg, VoidCallback callback);
    
    /**
     * 开启定时任务
     *
     * @param deviceId 设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param taskId   任务id
     * @param callback 返回结果的监听回调
     */
    public void openTask(long deviceId, long taskId, VoidCallback callback);

    /**
     * 关闭定时任务
     *
     * @param deviceId 设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param taskId   任务id
     * @param callback 返回结果的监听回调
     */
    public void closeTask(long deviceId, long taskId, VoidCallback callback);

    /**
     * 删除定时任务
     *
     * @param deviceId 设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param taskId   任务id
     * @param callback 返回结果的监听回调
     */
    public void deleteTask(long deviceId, long taskId, VoidCallback callback);

    /**
     * 获取定时任务列表
     *
     * @param deviceId 设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param callback 返回结果的监听回调
     */
    public void listTasks(long deviceId, PayloadCallback<List<ACTimerTask>> callback);
}
```


##消息推送

如果想使用推送服务，在SDK端提供了相应的接口（封装了友盟的部分接口），定义如下：
```java
public interface ACNotificationMgr {

    /**
     * 请在应用的主Activity onCreate() 函数中开启推送服务
     */
    public void init();

    /**
     * 添加推送别名
     *
     * @param userId   用户ID
     * @param callback 返回结果的监听回调
     */
    public void addAlias(Long userId, VoidCallback callback);

    /**
     * 若要使用新的别名，请先调用removeAlias接口移除掉旧的别名
     *
     * @param userId   用户ID
     * @param callback 返回结果的监听回调
     */
    public void removeAlias(Long userId, VoidCallback callback);

    /**
     * 推送消息处理
     *
     * @param handler 友盟的消息处理接口
     */
    public void setMessageHandler(UHandler handler);

    /**
     * 自定义通知打开动作
     * 该Handler是在BroadcastReceiver中被调用，故如果需启动Activity，需添加Intent.FLAG_ACTIVITY_NEW_TASK
     *
     * @param handler 友盟负责处理消息的点击事件
     */
    public void setNotificationClickHandler(UmengNotificationClickHandler handler);
    
    /**
     * 获取设备Token
     */
    public String getDeviceToken();

    /**
     * 关闭客户端的通知服务
     */
    public void disableNotification();
}
```
另外，还需要在`<manifest>`标签下添加权限：
```java
<!-- 必选 -->
<uses-permission android:name="android.permission.READ_PHONE_STATE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WAKE_LOCK"/>
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.WRITE_SETTINGS"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<!-- 用以设置前台是否显示通知-->
<uses-permission android:name="android.permission.GET_TASKS"/>
<!-- 可选  -->
<uses-permission android:name="android.permission.BROADCAST_PACKAGE_ADDED"/>
<uses-permission android:name="android.permission.BROADCAST_PACKAGE_CHANGED"/>
<uses-permission android:name="android.permission.BROADCAST_PACKAGE_INSTALL"/>
<uses-permission android:name="android.permission.BROADCAST_PACKAGE_REPLACED"/>
<uses-permission android:name="android.permission.RESTART_PACKAGES"/>
<uses-permission android:name="android.permission.GET_ACCOUNTS"/>;
```
在`<application>`标签下添加组件：

<font color="red">注意</font>：添加组件时需要将【应用包名】替换为你自己应用的包名。
```java
<!-- 监听通知点击或者忽略处理的广播 -->
<receiver
    android:name="com.umeng.message.NotificationProxyBroadcastReceiver"
    android:exported="false" >
</receiver>

<!-- 监听开机运行、网络连接变化、卸载的广播 -->
<receiver
    android:name="com.umeng.message.SystemReceiver"
    android:process=":push" >
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
    </intent-filter>
    <intent-filter>
        <action android:name="android.net.conn.CONNECTIVITY_CHANGE" />
    </intent-filter>
    <intent-filter>
        <action android:name="android.intent.action.PACKAGE_REMOVED" />
        <data android:scheme="package" />
    </intent-filter>
</receiver>

<!-- 监听消息到达的广播 -->
<receiver
    android:name="com.umeng.message.MessageReceiver"
    android:process=":push" >
    <intent-filter>
        <action android:name="org.agoo.android.intent.action.RECEIVE" />
    </intent-filter>
</receiver>

<!-- 监听宿主选举的广播 -->
<receiver
    android:name="com.umeng.message.ElectionReceiver"
    android:process=":push" >
    <intent-filter>
        <action android:name="org.agoo.android.intent.action.ELECTION_RESULT_V4" />
        <category android:name="umeng" />
    </intent-filter>
</receiver>

<!-- 监听注册的广播 -->
<!-- 【应用包名】字符串需要替换成本应用的应用包名 -->
<receiver
    android:name="com.umeng.message.RegistrationReceiver"
    android:exported="false" >
    <intent-filter>
        <action android:name="【应用包名】.intent.action.COMMAND" />
    </intent-filter>
</receiver>
<receiver android:name="com.umeng.message.UmengMessageBootReceiver" >
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
    </intent-filter>
</receiver>
```
可以根据需要自行设置 android:label 中的服务名 ：
```java
<!-- Umeng的长连服务，用来建立推送的长连接的 -->
<!-- 【应用包名】字符串需要替换成本应用的应用包名 -->
<service
    android:name="com.umeng.message.UmengService"
    android:label="PushService"
    android:exported="true"
    android:process=":push" >
    <intent-filter>
        <action android:name="【应用包名】.intent.action.START" />
    </intent-filter>
    <intent-filter>
        <action android:name="【应用包名】.intent.action.COCKROACH" />
    </intent-filter>
    <intent-filter>
        <action android:name="org.agoo.android.intent.action.PING_V4" />
    <category android:name="umeng" />
    </intent-filter>
</service>

<!-- Umeng的消息接收服务 -->
<service android:name="com.umeng.message.UmengIntentService" 
    android:process=":push" />

<!-- Umeng的消息路由服务 -->
<service 
    android:name="com.umeng.message.UmengMessageIntentReceiverService"
    android:process=":push" 
    android:exported="true" >
    <intent-filter>
        <action android:name="org.android.agoo.client.MessageReceiverService" />
    </intent-filter>
    <intent-filter>
        <action android:name="org.android.agoo.client.ElectionReceiverService" />
    </intent-filter>
</service>

<!-- v2.4.1添加的Service，Umeng的消息接收后的处理服务 -->
<service android:name="com.umeng.message.UmengMessageCallbackHandlerService" 
    android:exported="false">
    <intent-filter>
        <action android:name="com.umeng.messge.registercallback.action" />
    </intent-filter>
    <intent-filter>
        <action android:name="com.umeng.message.unregistercallback.action"/>
    </intent-filter>
    <intent-filter>
        <action android:name="com.umeng.message.message.handler.action"/>
    </intent-filter>
    <intent-filter>
        <action android:name="com.umeng.message.autoupdate.handler.action"/>
    </intent-filter>
</service>
```
最后，添加 **AppKey** 和 **Umeng Message Secret**
```java
<!-- V1.3.0添加的service，负责下载通知的资源 -->
<service android:name="com.umeng.message.UmengDownloadResourceService" />

<!-- 添加 AppKey 和 Umeng Message Secret -->
<meta-data
    android:name="UMENG_APPKEY"
    android:value="xxxxxxxxxxxxxxxxxxxxxxxxxxxx" >
</meta-data>
<meta-data
    android:name="UMENG_MESSAGE_SECRET"
    android:value="xxxxxxxxxxxxxxxxxxxxxxxxxxxx" >
</meta-data>
<!-- 用Channel ID来标识APP的推广渠道，作为推送消息时给用户分组的一个维度，若不设置，则使用Unknown作为Channel ID -->
<meta-data
    android:name="UMENG_CHANNEL"
    android:value="Channel ID" >
</meta-data>
```
如果APP进行了混淆，请添加:
```java
-keep class com.umeng.message.* {
        public <fields>;
        public <methods>;
}

-keep class com.umeng.message.protobuffer. * {
        public <fields>;
        public <methods>;
}

-keep class com.squareup.wire.* {
        public <fields>;
        public <methods>;
}

-keep class org.android.agoo.impl.*{
        public <fields>;
        public <methods>;
}

-keep class org.android.agoo.service.* {*;}

-keep class org.android.spdy.**{*;}

-keep public class [应用包名].R$*{
    public static final int *;
}
```







##和云端通信

```

public class AC {
	/**
	 * 往某一服务发送命令/消息
	 *
 	 * @param subDomain	服务所属子域名
	 * @param name    	服务名
	 * @param version 	服务版本
	 * @param req     	具体的消息内容
	 * @param callback 	返回结果的监听回调，返回服务端的响应消息
 	 * @throws Exception
	 */
	public static void sendToService(String subDomain, String name, int version,
								 ACMsg req, PaylodCallback<ACMsg> callback) {}


	 /**
     * 通过云端给设备发消息
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id），不提供时传0
     * @param msg       具体的消息内容
     * @param callback  返回结果的监听回调
     */
    public void sendToDevice(String subDomain, Long deviceId, ACDeviceMsg msg, PayloadCallback<ACDeviceMsg> callback){} 
}


```

##实时消息同步
**<font color="red">注</font>：具体使用步骤见开发指导-->与云端通信**
AbleCloud提供了实时消息能够让你实时接收并且查看设备上的数据，在SDK端提供相应的接口定义如下：
```java
public interface ACPushMgr {

    /**
     * 创建与服务器的连接
     */
    public void connect(VoidCallback callback);

    /**
     * 订阅实时数据
     * @param table 订阅的数据集信息
     */
    public void watch(ACPushTable table, VoidCallback callback);

    /**
     * 取消订阅
     * @param table 取消订阅的数据集信息
     */
    public void unwatch(ACPushTable table, VoidCallback callback);

    /**
     * 接收已订阅的实时数据
     */
    public void onReceive(PayloadCallback<ACPushReceive> callback);
}
```




##局域网通信
**<font color="red">注</font>：具体使用步骤见开发指导-->局域网通信**

```java
/**
 * 本地设备发现，通过广播方式和本局域网内的智能设备交互，并获取设备的相关信息返回。
 *
 * @param timeout	发现本地设备的超时时间，单位毫秒
 * @param callback	返回结果的监听回调，返回设备列表
 */
public static void findLocalDevice(int timeout, PaylodCallback<List<ACDevice>> callback) {}
```


###文件存储
如果需要使用文件上传下载管理服务，在SDK端提供了相应的接口，首先需要获取定时管理器AC.fileMgr(),具体接口定义如下：
```java
public interface ACFileMgr {

    /**
     * 获取下载url
     *
     * @param fileInfo  文件下载信息
     */
    public void getDownloadUrl(ACFileInfo fileInfo, PayloadCallback<String> callback);

    /**
     * 下载文件到内存里,适合小文件下载
     *
     * @param url              文件下载的url
     * @param progressCallback 下载进度回调，百分比，不需要时传null
     * @param callback         下载结果回调
     */
    public void downloadFile(String url, ProgressCallback progressCallback, PayloadCallback<byte[]> callback);

    /**
     * 下载文件到本地sdcard，适合大文件下载,支持断点续传
     *
     * @param file             文件下载的路径File对象
     * @param url              文件下载的url
     * @param progressCallback 下载进度回调，百分比，不需要时传null
     * @param callback         下载结果回调
     */
    public void downloadFile(File file, String url, ProgressCallback progressCallback, VoidCallback callback);

    /**
     * 取消下载
     *
     * @param url 文件下载的url
     */
    public void cancelDownload(String url);

    /**
     * 上传文件,支持断点续传
     *
     * @param file             文件信息,通过file设置上传内容,可选择 File对象或文件路径或字节数组
     * @param progressCallback 上传进度回调,百分比，不需要时传null
     * @param callback         上传结果回调
     */
    public void uploadFile(ACFileInfo file, ProgressCallback progressCallback, VoidCallback callback);

    /**
     * 取消上传
     *
     * @param fileInfo  文件信息
     */
    public void cancelUpload(ACFileInfo fileInfo);
}
```
另外，如果文件存储需要增加权限管理，则需要用到ACACL中的接口，具体接口定义如下：
```java
public class ACACL {
   /**
     * 设置全局可读访问权限，不设置则默认为所有人可读
     *
     * @param allow 是否全局可读
     */
    public void setPublicReadAccess(boolean allow);

    /**
     * 设置全局可写访问权限，不设置则默认为除自己外的所有人不可写
     *
     * @param allow 是否全局可写
     */
    public void setPublicWriteAccess(boolean allow);

    /**
     * 设置用户可访问权限（白名单）
     *
     * @param opType 权限类型，OpType.READ为可读权限，OpType.WRITE为可写权限
     * @param userId 被设置用户Id
     */
    public void setUserAccess(OpType opType, long userId);

    /**
     * 取消设置用户可访问权限（白名单），恢复默认权限
     *
     * @param opType 权限类型，OpType.READ为可读权限，OpType.WRITE为可写权限
     * @param userId 被设置用户Id
     */
    public void unsetUserAccess(OpType opType, long userId);

    /**
     * 设置用户访问权限（黑名单）
     *
     * @param opType 权限类型，OpType.READ为可读权限，OpType.WRITE为可写权限
     * @param userId 被设置用户Id
     */
    public void setUserDeny(OpType opType, long userId);

    /**
     * 取消设置用户访问权限（黑名单），恢复默认权限
     *
     * @param opType 权限类型，OpType.READ为可读权限，OpType.WRITE为可写权限
     * @param userId 被设置用户Id
     */
    public void unsetUserDeny(OpType opType, long userId);
}
```



##桩模块
为了便于作单元、模块测试，我们通常不需要等待真正的设备制造好，真正的后端服务开发好。所以ablecloud提供了桩模块，让开发者能方便的模拟设备、服务。
####设备桩
设备桩的定义非常简单，其目的是为了模拟设备，对服务发来的请求做出响应，因此只有一个处理请求并做出响应的接口，定义如下：
```java
public abstract  class ACDeviceStub {
    public abstract void handleControlMsg(String majorDomain, String subDomain,
                                          ACDeviceMsg req, ACDeviceMsg resp);
}
```

####服务桩
服务桩用于模拟一个服务的处理，对于后端服务，ablecloud提供了基础类ACService，服务桩只需要继承该类，编写具体的处理handlMsg即可，其定义如下：
```java
public abstract class ACService {
    /**
     * 处理APP-->Service之间的交互消息
     * @param req   请求消息体
     * @param resp  响应消息体
     * @throws Exception
     */
    public abstract void handleMsg(ACMsg req, ACMsg resp);
```

##AC
前面，我们分别介绍了ablecloud SDK提供的各种功能，这些功能包括设备激活、云端服务、测试桩等。SDK均可通过AC来获取，简而言之，AC可以认为是SDK的框架，通过AC，开发者可以根据需要获取一系列服务、功能的接口。AC的定义如下：
```java
public class AC {
    public static Context context;
    public static String majorDomain;
    public static long majorDomainId;

	/**
     * 调试模式
     */
    public static final int TEST_MODE = 0;
    public static final int PRODUCTION_MODE = 1;

	/**
     * 设备方案
     */
    public static final int DEVICE_MTK = 0;
    public static final int DEVICE_HF = 1;
    public static final int DEVICE_MX = 2;
    public static final int DEVICE_MARVELL = 3;
    public static final int DEVICE_QCA4004 = 4;
    public static final int DEVICE_MURATA = 5;
    public static final int DEVICE_WM = 6;
    public static final int DEVICE_RAK = 7;

	/**
     * Timeout的默认时间
     */
    public static final int DEVICE_ACTIVATOR_DEFAULT_TIMEOUT = 5 * 60 * 1000;
    public static final int FIND_DEVICE_DEFAULT_TIMEOUT = 1 * 60 * 1000;
    public static final int SEND_TO_LOCAL_DEVICE_DEFAULT_TIMEOUT = 10 * 1000;

	/**
     * app与设备通讯方式
     */
    public static final int ONLY_LOCAL = 1;
    public static final int ONLY_CLOUD = 2;
    public static final int LOCAL_FIRST = 3;
    public static final int CLOUD_FIRST = 4;
    
    private static HashMap<String, ACService> serviceStubs;

	/**
     * 初始化设备的主域信息，默认线上环境
     */
    public static void init(Application App, String MajorDomain, String MajorDomainId) {}
    
    /**
     * 初始化设备的主域信息，可选模式为测试环境
     */
    public static void init(Application App, String MajorDomain, long MajorDomainId, int mode) {}

    /**
     * 往某一服务发送命令/消息
     *
     * @param subDomain	服务所属子域名
     * @param name    	服务名
     * @param version 	服务版本
     * @param req     	具体的消息内容
     *
     * @return 返回结果的监听回调，返回服务端的响应消息
     */
    public static void sendToService(String subDomain, String name, int version,
    								 ACMsg req, final PaylodCallback<ACMsg> callback) {}

    /**
 	 * 本地设备发现，通过广播方式和本局域网内的智能设备交互，并获取设备的相关信息返回。
 	 *
 	 * @param timeout	发现本地设备的超时时间，单位毫秒
 	 * @param callback	返回结果的监听回调，返回设备列表
 	 */
	public static void findLocalDevice(int timeout, PaylodCallback<List<ACDevice>> callback) {}
    
    /**
     * 获取帐号管理器。
     * 可以调用前面介绍的帐号管理ACAccountMgr提供的各个通用接口
     *
     * @return	帐号管理器
     */
    public static ACAccountMgr accountMgr() {}
    
	/**
     * 获取设备激活器，用于激活设备，如获取SSID、使用smartconfig技术让设备连上wifi等
     * @param deviceType 设备wifi模块类型
     *
     * @return	设备激活器
     */
    public static ACDeviceActivator deviceActivator(int deviceType) {}

	 /**
     * 获取简单无组的设备管理器
     * 可以调用前面介绍的设备管理ACBindMgr提供的各个通用接口
     *
     * @return  绑定管理器
     */
    public static ACBindMgr bindMgr() {}

    /**
     * 获取分组管理器
     * 可以调用前面介绍的分组管理ACGroupMgr提供的各个通用接口
     *
     * @return 分组管理器
     */
    public static ACGroupMgr groupMgr() {}

    /**
     * 获取消息推送管理器（集成了友盟推送的一部分接口）
     * 可以调用前面介绍的推送管理ACNotificationMgr提供的各个通用接口
     *
     * @return 推送通知管理器
     */
    public static ACNotificationMgr notificationMgr() {}

    /**
     * 获取实时消息管理器
     * 可以调用前面介绍的实时消息管理ACPushMgr提供的各个通用接口
     *
     * @return 实时消息管理器
     */
    public static ACPushMgr pushMgr() {}

    /**
     * 获取定时管理器
     * 可以调用前面介绍的定时管理ACTimerMgr提供的各个通用接口
     *
     * @return 定时管理器
     */
    public static ACTimerMgr timerMgr() {}
   
    /**
     * 获取定时管理器
     * @param timeZone 自定义时区
     *
     * @return 定时管理器
     */
    public static ACTimerMgr timerMgr(TimeZone timeZone) {}
    
    /**
     * 获取OTA管理器
     * 可以调用前面介绍的OTA管理ACOTAMgr提供的各个通用接口
     *
     * @return OTA管理器
     */
    public static ACOTAMgr otaMgr() {}
    
    /**
     * 获取文件上传下载管理器
     * 可以调用前面介绍的文件管理ACFileMgr提供的各个通用接口
     *
     * @return 文件管理器
     */
    public static ACFileMgr fileMgr() {}

    /**
     * 为便于测试，开发者可实现一个服务的桩，并添加到AC框架中
     * 在测试模式下，服务桩可以模拟真实服务对APP的请求做出响应
     *
     * @param name	服务名
     * @param stub	服务桩，需要开发者自己实现具体的stub
     */
    public static void addServiceStub(String name, ACService stub) {}
```


#适用蓝牙的接口

由于蓝牙设备和APP之间的通信协议比较简单，因此对于蓝牙设备和APP之间的通信协议，AbleCloud并未做任何处理。
AbleCloud提供了适用于蓝牙设备的APP和云端的交互接口。接口功能包括：帐号登录注册、用户属性添加、设备绑定、设备扩展属性设置、推送、蓝牙设备OTA、文件存储等。

对于蓝牙设备数据的存取，都是通过和云端通信的访问云端服务实现。目前所有的数据库的操作都需要经过云端服务进行，客户端的SDK中不能直接进行数据库访问。云端服务的开发参考[开发指导-云端服务](../develop_guide/cloud.md)


适用于蓝牙方案的接口见下表：


##1、帐号管理
用户帐号管理
一台设备最终是需要通过用户来控制的，需要发送验证码、注册、登陆、管理密码等常规功能，ablecloud提供了云端帐号管理系统来协助开发人员快速的完成，在SDK端也提供了相应的接口，定义如下：

```java
public interface ACAccountMgr {

    /**
     * 发送短信验证码
     *
     * @param account  手机号码 (有关规定每天向同一个手机号发送的短信数量有严格限制)
     * @param template 短信内容模板
     * @param callback 返回结果的监听回调
     */
    public void sendVerifyCode(String account, int template, VoidCallback callback);

    /**
     * 验证验证码是否有效
     *
     * @param account    手机号码
     * @param verifyCode 验证码
     * @param callback   返回结果的监听回调
     */
    public void checkVerifyCode(String account, String verifyCode, PayloadCallback<Boolean> callback);

    /**
     * 注册一个新用户
     *
     * @param email      用户邮箱，与phone任选其一，或都提供
     * @param phone      手机号码，或email任选其一，或都提供
     * @param password   用户密码
     * @param name       用户昵称，不唯一，不同用户的昵称可重复
     * @param verifyCode 验证码
     * @param callback   返回结果的监听回调
     */
    public void register(String email, String phone, String password, String name, String verifyCode, PayloadCallback<ACUserInfo> callback);

    /**
     * 用户登录
     *
     * @param account  帐号名，注册时候email或phone任选其一
     * @param password 用户密码
     * @param callback 返回结果的监听回调
     */
    public void login(String account, String password, PayloadCallback<ACUserInfo> callback);


    /**
     * 检查账号是否存在
     *
     * @param account  帐号名，email或phone任选其一
     * @param callback 返回结果的监听回调
     */
    public void checkExist(String account, PayloadCallback<Boolean> callback);

    /**
     * 修改手机号
     *
     * @param phone      新手机号
     * @param password   旧密码
     * @param verifyCode 验证码
     * @param callback   返回结果的监听回调
     */
    public void changePhone(String phone, String password, String verifyCode, VoidCallback callback);

    /**
     * 修改名字
     *
     * @param nickName 用户名
     * @param callback 返回结果的监听回调
     */
    public void changeNickName(String nickName, VoidCallback callback);

    /**
     * 修改密码
     *
     * @param oldPswd  旧密码
     * @param newPswd  新密码
     * @param callback 返回结果的监听回调
     */
    public void changePassword(String oldPswd, String newPswd, VoidCallback callback);

    /**
     * 重置密码
     *
     * @param account  帐号名，注册时候email或phone任选其一
     * @param pswd     新密码
     * @param callback 返回结果的监听回调
     */
    public void resetPassword(String account, String pswd, String verifyCode, PayloadCallback<ACUserInfo> callback);

    /**
     * 是否登录
     */
    public boolean isLogin();

    /**
     * 注销
     */
    public void logout();

    /**
     * 第三方账号登录
     *
     * @param thirdPlatform 第三方类型（如QQ、微信、微博）
     * @param openId        通过第三方登录获取的openId
     * @param accessToken   通过第三方登录获取的accessToken
     * @param callback      返回结果的监听回调
     */
    public void loginWithOpenId(ACThirdPlatform thirdPlatform, String openId, String accessToken, PayloadCallback<ACUserInfo> callback);

    /**
     * 绑定第三方账号
     *
     * @param thirdPlatform 第三方类型（如QQ、微信、微博）
     * @param openId        通过第三方登录获取的openId
     * @param accessToken   通过第三方登录获取的accessToken
     * @param callback      返回结果的监听回调
     */
    public void bindWithOpenId(ACThirdPlatform thirdPlatform, String openId, String accessToken, VoidCallback callback);

    /**
     * 第三方账号登录状态下绑定用户信息
     *
     * @param email      用户邮箱，与phone任选其一，或都提供
     * @param phone      用户手机号码，或email任选其一，或都提供
     * @param password   用户密码
     * @param nickName   名字
     * @param verifyCode 验证码
     * @param callback   返回结果的监听回调
     */
    public void bindWithAccount(String email, String phone, String password, String nickName, String verifyCode, VoidCallback callback);

    /**
     * 列举所有的第三方登录信息
     *
     * @param callback   返回结果的监听回调
     */
    public void listAllOpenIds(PayloadCallback<List<ACOpenIdInfo>> callback);

    /**
     * 设置用户自定义扩展属性
     *
     * @param userProfile 用户自定义扩展属性
     * @param callback    返回结果的监听回调
     */
    public void setUserProfile(ACObject userProfile, VoidCallback callback);

    /**
     * 获取用户自定义扩展属性
     */
    public void getUserProfile(PayloadCallback<ACObject> callback);
}
```

##2、设备管理

```
public interface ACBindMgr {

    /**
     * 从云端获取所有设备列表并保存到本地缓存中
     *
     * @param callback 返回结果的监听回调
     */
    public void listDevices(PayloadCallback<List<ACUserDevice>> callback);

     /**
     * 获取接入设备的所有用户列表
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param callback  返回结果的监听回调
     */
    public void listUsers(String subDomain, long deviceId, PayloadCallback<List<ACDeviceUser>> callback);

    /**
     * 绑定一个设备
     *
     * @param subDomain        子域名，如djj（豆浆机）
     * @param physicalDeviceId 设备id（制造商提供的）
     * @param name             设备名
     * @param callback         返回结果的监听回调
     */
    public void bindDevice(String subDomain, String physicalDeviceId, String name, PayloadCallback<ACUserDevice> callback);

    /**
     * 分享设备
     *
     * @param shareCode 分享码，由管理员调用getShareDevice获取
     * @param callback  返回结果的监听回调
     */
    public void bindDeviceWithShareCode(String shareCode, PayloadCallback<ACUserDevice> callback);

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
     * 解绑设备
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param callback  返回结果的监听回调
     */
    public void unbindDevice(String subDomain, long deviceId, VoidCallback callback);

    /**
     * 解绑某个用户的设备
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param userId    被解绑用户的ID
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param callback  返回结果的监听回调
     */
    public void unbindDeviceWithUser(String subDomain, long userId, long deviceId, VoidCallback callback);

    /**
     * 获取分享码（只有管理员可以获取 ，默认一小时内生效）
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param callback  返回结果的监听回调
     */
    public void getShareCode(String subDomain, long deviceId, PayloadCallback<String> callback);

    /**
     * 获取分享码（只有管理员可以获取 ）
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param timeout   二维码超时时间(以秒为单位)
     * @param callback  返回结果的监听回调
     */
    public void getShareCode(String subDomain, long deviceId, int timeout, PayloadCallback<String> callback);

    /**
     * 设备管理员权限转让
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param userId    新的管理员Id（要求该用户也已经绑定过该设备）
     * @param callback  返回结果的监听回调
     */
    public void changeOwner(String subDomain, long deviceId, long userId, VoidCallback callback);

    /**
     * 更换设备
     *
     * @param subDomain        子域名，如djj（豆浆机）
     * @param physicalDeviceId 设备id（制造商提供的）
     * @param deviceId         设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param callback         返回结果的监听回调
     */
    public void changeDevice(String subDomain, String physicalDeviceId, long deviceId, VoidCallback callback);

    /**
     * 修改设备名
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param name      新的设备名
     * @param callback  返回结果的监听回调
     */
public void changeName(String subDomain, long deviceId, String name, VoidCallback callback);

/**
     * 设置设备自定义扩展属性
     *
     * @param deviceId      设备逻辑id
     * @param deviceProfile 用户自定义扩展属性
     * @param callback      返回结果的监听回调
     */
    public void setDeviceProfile(String subDomain, long deviceId, ACObject deviceProfile, VoidCallback callback);

    /**
     * 获取设备自定义扩展属性
     *
     * @param deviceId 设备逻辑id
     * @param callback 返回结果的监听回调
     */
    public void getDeviceProfile(String subDomain, long deviceId, PayloadCallback<ACObject> callback);

}
```  
   
##3、OTA


```java
public interface ACOTAMgr {

    /**
     * 查询蓝牙设备OTA发布版本
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param callback  返回结果的监听回调
     */
    public void bluetoothVersion(String subDomain, PayloadCallback<ACOTAUpgradeInfo> callback);

    /**
     * 获取蓝牙设备OTA文件meta信息列表
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param version   蓝牙设备OTA版本
     * @param callback  返回结果的监听回调
     */
    public void listFiles(String subDomain, String version, PayloadCallback<List<ACOTAFileMeta>> callback);

    /**
     * 获取蓝牙设备OTA文件
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param type      升级文件类型
     * @param checksum  升级文件校验和
     * @param version   升级文件版本号
     * @param callback  返回结果的监听回调
     */
    public void bluetoothFile(String subDomain, int type, int checksum, String version, PayloadCallback<byte[]> callback);
}
```

##4、消息推送

参考[开发指导-安卓-推送](../develop_guide/android/#_34)

##5、和云端通信

```
public class AC {
    /**
     * 往某一服务发送命令/消息
     *
     * @param subDomain 服务所属子域名
     * @param name      服务名
     * @param version   服务版本
     * @param req       具体的消息内容
     * @param callback  返回结果的监听回调，返回服务端的响应消息
     * @throws Exception
     */
    public static void sendToService(String subDomain, String name, int version,
                                 ACMsg req, PaylodCallback<ACMsg> callback) {}
}
```

##6、文件存储
文件存储
如果需要使用文件上传下载管理服务，在SDK端提供了相应的接口，首先需要获取定时管理器AC.fileMgr(),具体接口定义如下：

```java
public interface ACFileMgr {

    /**
     * 获取下载url
     *
     * @param fileInfo  文件下载信息
     */
    public void getDownloadUrl(ACFileInfo fileInfo, PayloadCallback<String> callback);

    /**
     * 下载文件到内存里,适合小文件下载
     *
     * @param url              文件下载的url
     * @param progressCallback 下载进度回调，百分比，不需要时传null
     * @param callback         下载结果回调
     */
    public void downloadFile(String url, ProgressCallback progressCallback, PayloadCallback<byte[]> callback);

    /**
     * 下载文件到本地sdcard，适合大文件下载,支持断点续传
     *
     * @param file             文件下载的路径File对象
     * @param url              文件下载的url
     * @param progressCallback 下载进度回调，百分比，不需要时传null
     * @param callback         下载结果回调
     */
    public void downloadFile(File file, String url, ProgressCallback progressCallback, VoidCallback callback);

    /**
     * 取消下载
     *
     * @param url 文件下载的url
     */
    public void cancelDownload(String url);

    /**
     * 上传文件,支持断点续传
     *
     * @param file             文件信息,通过file设置上传内容,可选择 File对象或文件路径或字节数组
     * @param progressCallback 上传进度回调,百分比，不需要时传null
     * @param callback         上传结果回调
     */
    public void uploadFile(ACFileInfo file, ProgressCallback progressCallback, VoidCallback callback);

    /**
     * 取消上传
     *
     * @param fileInfo  文件信息
     */
    public void cancelUpload(ACFileInfo fileInfo);
}
另外，如果文件存储需要增加权限管理，则需要用到ACACL中的接口，具体接口定义如下：
public class ACACL {
   /**
     * 设置全局可读访问权限，不设置则默认为所有人可读
     *
     * @param allow 是否全局可读
     */
    public void setPublicReadAccess(boolean allow);

    /**
     * 设置全局可写访问权限，不设置则默认为除自己外的所有人不可写
     *
     * @param allow 是否全局可写
     */
    public void setPublicWriteAccess(boolean allow);

    /**
     * 设置用户可访问权限（白名单）
     *
     * @param opType 权限类型，OpType.READ为可读权限，OpType.WRITE为可写权限
     * @param userId 被设置用户Id
     */
    public void setUserAccess(OpType opType, long userId);

    /**
     * 取消设置用户可访问权限（白名单），恢复默认权限
     *
     * @param opType 权限类型，OpType.READ为可读权限，OpType.WRITE为可写权限
     * @param userId 被设置用户Id
     */
    public void unsetUserAccess(OpType opType, long userId);

    /**
     * 设置用户访问权限（黑名单）
     *
     * @param opType 权限类型，OpType.READ为可读权限，OpType.WRITE为可写权限
     * @param userId 被设置用户Id
     */
    public void setUserDeny(OpType opType, long userId);

    /**
     * 取消设置用户访问权限（黑名单），恢复默认权限
     *
     * @param opType 权限类型，OpType.READ为可读权限，OpType.WRITE为可写权限
     * @param userId 被设置用户Id
     */
    public void unsetUserDeny(OpType opType, long userId);
}
```
