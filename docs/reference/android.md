#开发环境配置
##SDK发布库
ablcloud发布的android端SDK为[`ac-service-android.jar`](https://www.ablecloud.cn/download/SDK&Demo/ac-service-android-SDK-1.0.1.zip)


##配置开发参数????





##应用程序初始化
以下为 AbleCloud Android SDK 需要的所有的权限，请检查你的 AndroidManifest.xml。

```java
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE"/>
```


在你的应用访问AbleCloud之前，你需要在代码中对AbleCloud SDK进行初始化。你需要继承Application类，并且在onCreate()方法中调用AbleCloud.init(this, MajorDomain, MajorDomainId)来进行初始化，如果你需要使用测试环境，请AbleCloud.init(this, MajorDomain, MajorDomainId, AC.TEST_MODE)来进行初始化。



##配置推送

1、在<application>标签下添加权限：
```java
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WRITE_SETTINGS" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.GET_TASKS" />
```

2、在<application>标签下添加组件：
```java
<receiver
    android:name="com.umeng.message.NotificationProxyBroadcastReceiver"
    android:process=":push"
    android:exported="false" >
</receiver>
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
<receiver
    android:name="com.umeng.message.MessageReceiver"
    android:process=":push" >
    <intent-filter>
        <action android:name="org.agoo.android.intent.action.RECEIVE" />
    </intent-filter>
</receiver>
<receiver
    android:name="com.umeng.message.ElectionReceiver"
    android:process=":push" >
    <intent-filter>
        <action android:name="org.agoo.android.intent.action.ELECTION_RESULT_V4" />
        <category android:name="umeng" />
    </intent-filter>
</receiver>
<receiver
    android:name="com.umeng.message.RegistrationReceiver"
    android:exported="false" >
    <intent-filter>
        <action android:name="【应用包名】.intent.action.COMMAND" />
    </intent-filter>
</receiver>
<receiver android:name="com.umeng.message.BootBroadcastReceiver" >
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
    </intent-filter>
</receiver>

<!-- 可以根据需要自行设置 android:label 中的服务名 ： -->
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
<service android:name="com.umeng.message.UmengIntentService" 
    android:process=":push" />
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

#交互协议-基础数据结构
整个服务框架采用两种消息进行交互，ACMsg、ACDeviceMsg，其中框架提供了对ACMsg的解析，而ACDeviceMsg则由厂商自定义，框架透传其内容。
##ACObject
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
}
```

><font color="brown">**注：**最常用的三个接口是put/add/get，通过**add**接口保存在ACObject中的数据实际为List，相应的，get出来也是一个List。</font>

##ACMsg
ACMsg继承自ACObject，扩展了一些功能，比如设置了交互的方法名name以及**其它形式**的负载payload信息。通常采用ACMsg进行数据交互，较多的使用默认的**OBJECT_PAYLOAD**格式，该格式只需要使用ACObject提供的put、add、get接口进行数据操作即可。因为在使用OBJECT_PAYLOAD格式时，框架会对数据进行序列化/反序列化。ACMsg也提供另外的数据交互格式，如json、stream等。如果用json格式，则通过setPayload/getPayload设置/获取序列化后的json数据并设置对应的payloadFormat，开发者后续可自行对payload进解析。

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

###使用示例
client端发起请求（伪代码，完整代码请参看各部分demo）：

```java
ACMsg req = new ACMsg();								// 创建一个空请求消息
req.setName("controlLight");							// 设置请求消息名
req.put("deviceId", light.getId());						// 设置一个请求属性“设备id”
req.put("action", "on");								// 设置另一属性"动作“，开灯
new AC().sendToService(subDomain, serviceName,serviceVersion,req,new PayloadCallback<ACMsg> listener(){
    @Override
    public void finish(ACMsg resp) {
        listener.success(resp);
    }

    @Override
    public void error(Exception e) {
        listener.error(e);
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

##ACDeviceMsg
该消息用于处理服务和设备之间的交互，框架会将ACDeviceMsg中的code部分解析出来，开发者可根据[code](firmware/wifi_interface_guide/#13 "消息码说明")来区分设备消息类型。但是ACDeviceMsg的content部分由开发者解释，框架透传，因此开发者需要自己编写设备消息序列化/反序列化器。ACDeviceMsg定义如下：
```
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

##ACDeviceMsgMarshaller
设备消息的序列化/反序列化器，用于解释ACDeviceMsg的内容，其定义如下：
```
public interface ACDeviceMsgMarshaller {
    public byte[] marshal(ACDeviceMsg msg) throws Exception;
    public ACDeviceMsg unmarshal(int msgCode, byte[] payload) throws Exception;
}
```

#SDK接口列表
##基本对象结构
这里说的基本数据结构，是指设备管理、帐号管理等要用到的各个对象定义，比如帐号、设备等。
###ACAccount
用来表示ablecloud的一个注册帐号信息，定义如下：
```
public class ACUserInfo {
    private long userId;  //用户id
    private String name;  //用户名

    public ACUserInfo(long uid, String token) {}

	// getter
}
```

###ACOpenIdInfo
用来表示ablecloud的一个第三方登录信息，定义如下：
```
public class ACOpenIdInfo {
    private ACThirdPlatform thirdPlatform; //第三方登录类型，通过ACThirdPlatform.QQ|SINA|WEIXIN|JINDONG|OTHER区分
    private String openId;   //从第三方登录后获取的openId，微博为id

    public ACOpenIdInfo(ACThirdPlatform thirdPlatform, String openId) {}

	// getter
}
```

###ACUserDevice
不带组设备管理模式下，用来表示一个设备，定义如下：
```
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

    public ACUserDevice(long deviceId, long owner, String name, long subDomainId, String aesKey, 
                        String physicalDeviceId,long gatewayDeviceId) {}

    // getter
}
```

###ACDeviceUser
不带组设备管理模式下，用来表示一个设备下的所有用户信息，定义如下：

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

##用户帐号管理

```
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
}
```

##设备激活

```java
public class ACDeviceActivator {
	/**
     * 获取APP端当前连接wifi的SSID
     *
     * @return	wifi的SSID
     */
	public String getSSID() {}

	/**
     * 获取指定wifi的加密方式(可以不调用)
     *
     * @return	wifi的加密方式
     */
    public String getAuthString(String SSID) {}

	/**
     * 通过smartconfig技术，使设备连上wifi，返回设备绑定码。
     * 绑定码在绑定设备的时候需要用到。
     *
     * @param SSID			wifi的SSID
     * @param password		参数SSID对应wifi的密码
     * @param physicalId	设备的物理id
     * @param timeout		连接超时时间，单位毫秒
     *
     * @return	通过回调callback，返回一个带physicalDeviceId和subDomainId（用来区分设备类型）的对象
     */
    public void startAbleLink(String SSID, String password, String physicalId,
    							int timeout, PaylodCallback<String> callback) {}

	/**
     * 通过smartconfig技术，使设备连上wifi，返回设备绑定码。
     * 绑定码在绑定设备的时候需要用到。
     *
     * @param SSID			wifi的SSID
     * @param password		参数SSID对应wifi的密码
     * @param physicalId	设备的物理id
     * @param timeout		连接超时时间，单位毫秒
     *
     * @return	通过回调callback，返回一个带physicalDeviceId和subDomainId（用来区分设备类型）的对象集合列表
     */
    public void startAbleLink(String SSID, String password, int timeout, PayloadCallback<List<ACDeviceBind>> callback) {

	/**
     * 停止连接
     */
	public void stopAbleLink() {}
}
```

##设备管理( 独立设备和网关型设备）

```java
public interface ACBindMgr {

    /**
     * 获取所有设备列表
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
     * 绑定一个设备，注意：请提醒用户务必在设备连上云端5分钟有效期内完成设备绑定
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
     * @param subDomain 子域名，如djj（豆浆机）
     * @param shareCode 分享码，由管理员调用getShareDevice获取
     * @param callback  返回结果的监听回调
     */
    public void bindDeviceWithShareCode(String subDomain, String shareCode, PayloadCallback<ACUserDevice> callback);

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
     * 绑定网关，注意：请提醒用户务必在网关设备连上云端5分钟有效期内完成网关绑定
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
     * 添加子设备，注意：要求子设备务必和网关保持连接，即子设备处于在线状态
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
     * @param subDomain       子域名，如djj（豆浆机）
     * @param gatewayDeviceId 网关逻辑id
     * @param physicalDeviceId 设备id（制造商提供的）
     * @param callback        返回结果的监听回调
     */
    public void evictSubDevice(String subDomain, long gatewayDeviceId, String physicalDeviceId, VoidCallback callback);

    /**
     * 设置设备消息序列化/反序列化器
     *
     * @param marshaller 开发者自定义的ACDeviceMarshaller
     */
    public void setDeviceMsgMarshaller(ACDeviceMsgMarshaller marshaller);

    /**
     * 为便于测试，开发者可实现一个设备的桩
     *
     * @param stub
     */
    public void addDeviceStub(String subDomain, ACDeviceStub stub);

    /**
     * 给设备发消息
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id），不提供时传0
     * @param msg       具体的消息内容
     * @param callback  返回结果的监听回调
     */
    public void sendToDevice(String subDomain, Long deviceId, ACDeviceMsg msg, PayloadCallback<ACDeviceMsg> callback);
}
```


##设备定时任务

如果需要使用定时管理服务，首先需要获取定时管理器AC.timerMgr(),如果需要手动设置时区的话，则通过AC.timerMgr(timeZone)来获取设备管理器，接口定义如下：
```
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

##消息推送管理

```
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

##本地局域网通信

```
public class AC {
	/**
	* 本地设备发现，通过广播方式和本局域网内的智能设备交互，并获取设备的相关信息返回。
	*
	* @param timeout	发现本地设备的超时时间，单位毫秒
	* @param callback	返回结果的监听回调，返回设备列表
	*/
	public static void findLocalDevice(int timeout, PaylodCallback<List<ACDevice>> callback) {}
	
	/**
	* 控制设备，通过直连方式控制而不通过云端
	*
	* @param deviceMsg	发往设备的消息
	* @param deviceId	设备的逻辑id
	* @param timeout	发送超时，单位毫秒
	* @param callback	返回结果的监听回调
	*/
	public static void sendToLocalDevice(ACDeviceMsg deviceMsg, Long deviceId,
										int timeout, PaylodCallback<ACDeviceMsg> callback) {}
}
```


