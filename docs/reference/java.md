#简介

本SDK适用于使用Java语言访问AbleCloud云端服务API的场景。

下文是Java SDK (v1.5.x)的API说明。

#配置信息
本SDK定义的配置信息如下：

```java
/**
 * AbleCloud Java API配置信息。
 * @details ACConfig是一个抽象类。开发者应依据具体应用场景的需求，提供本抽象类的实现。
 */
public abstract class ACConfig {
    public static final String TEST_MODE	   = "test";		/// 运行模式：测试模式。
    public static final String PRODUCTION_MODE = "production";	/// 运行模式：生产模式。

	/// @name 需要重载的抽象方法。
	//@{
	/**
	 * 取开发者在AbleCloud平台上的帐号的ID（可登录AbleCloud管理控制台查看）。
	 * @return 返回开发者帐号的ID。
	 */
    public abstract long getDeveloperId();

	/**
	 * 取开发者在AbleCloud平台上对应的主域的名字（可登录AbleCloud管理控制台查看）。
	 * @return 开发者的主域的名字。
	 */
    public abstract String getMajorDomain();

	/**
	 * 取开发者密钥对中的Access Key（可登录AbleCloud管理控制台查看）。
	 * @return 开发者密钥对中的Access Key。
	 */
    public abstract String getAuthAccessKey();

	/**
	 * 取开发者密钥对中的Secret Key（可登录AbleCloud管理控制台查看）。
	 * @return 开发者密钥对总的Secret Key。
	 */
    public abstract String getAuthSecretKey();

    /**
     * 取运行模式：ACConfig.TEST_MODE 或 ACConfig.PRODUCTION_MODE。
     * @return 返回运行模式：ACConfig.TEST_MODE 或 ACConfig.PRODUCTION_MODE。
     */
    public abstract String getMode();
    //@}

	// 下列方法均有默认实现，开发者可选择性地重载。

    /**
     * 取服务所关联的子域的名字。
     * @return 缺省情况下返回空字符串。
     */
    public String getSubDomain();

    /**
     * 设置AbleCloud云端服务的入口地址。
     * @param addrs 可以用英语逗号（,）分隔多个地址。如："192.168.0.1:5000"，或者"192.168.0.1:5000,192.168.0.2:5000"，
     *              或者"http://192.168.0.1:5000"，或者"http://192.168.0.1:5000,https://192.168.0.2:5000"，或者"192.168.0.1:5000,https://192.168.0.2:5000"。
     *              如果地址中没有指定协议（http或者https），则使用http协议。
     */
    public void setRouterAddr(String addrs);

    /**
     * 取AbleCloud云端服务的入口地址。
     * @return 返回的地址的格式是：http://host:port 或 https://host:port。
     */
    public String getRouterAddr();

    /**
     * 设置代理服务的入口地址。
     * @param addrs 可以用英语逗号（,）分隔多个地址。如："192.168.0.1:5000"，或者"192.168.0.1:5000,192.168.0.2:5000"，
     *              或者"http://192.168.0.1:5000"，或者"http://192.168.0.1:5000,https://192.168.0.2:5000"，或者"192.168.0.1:5000,https://192.168.0.2:5000"。
     *              如果地址中没有指定协议（http或者https），则使用http协议。
     */
    public void setProxyAddr(String addrs);

    /**
     * 取代理服务的入口地址。
     * @return 返回的地址的格式是：http://host:port 或 https://host:port。
     */
    public String getProxyAddr();

    public int getAuthTimeout();

    public int getClientTimeout();

	/// @name AbleCloud云端服务的名字及版本信息。
	//@{
    public String getAccountServiceName();

    public int getAccountServiceVersion();

    public String getBindServiceName();

    public int getBindServiceVersion();

    public String getStoreServiceName();

    public int getStoreServiceVersion();

    public String getInformServiceName();

    public int getInformServcieVersion();

    public String getBlobStoreServiceName();

    public int getBlobStoreServcieVersion();

    public String getTimerTaskServiceName();

    public int getTimerTaskServcieVersion();

    public String getJDServiceName();

    public int getJDServiceVersion();

    public String getSNServiceName();

    public int getSNServiceVersion();

    public String getQueryEngineServiceName();

    public int getQueryEngineServiceVersion();

    public String getPM25ServiceName();

    public int getPM25ServiceVersion();

    public String getWarehouseServiceName();

    public int getWarehouseServiceVersion();
    //@}
}
```
ACConfig是抽象类，要求开发者在实际应用中提供关于ACConfig的具体实现。
如，针对AbleCloud云端服务（UDS）以及微信公众号功能等场景，AbleCloud提供的相应SDK中均实现了ACConfig定义的方法。

#基础数据结构

##ACContext
ACContext即上下文，用于标记每一次交互（比如发起者、发起时间、签名等）、追踪通信事件。AbleCloud服务之间的交互消息中均需要带有上下文信息。
ACContext定义的内容如下：

```java
public class ACContext {
    private String majorDomain;			// 服务所属主域ID
    private String subDomain;			// 服务所属子域ID
    private String majorDomainName;     // 服务所属主域名
    private String subDomainName;       // 服务所属子域名
    private Long userId;				// 用户id
    private Long developerId;			// 开发者id
    private String traceId;				// 唯一事件id，可用于追查问题
    private String traceStartTime;		// 起始时间
    private String timestamp;			// 请求发起的时间戳，单位秒
    private String signature;			// 请求的签名
    private String timeout;				// 为防止签名被截获，设置签名的有效超时时间
    private String nonce;				// 用于签名的随机字符串
    private String accessKey;			// 开发者的accesskey，用于签名之用
}
```
通过ACContext的定义我们可以看出，其中包含两种用户信息：

+ **userId：**设备的终端（普通）用户id，比如用户在手机上通过app控制某一设备时，context中需要带上该用户的id，后台用于认证等之用。当用户通过云服务发起远程控制时，云服务程序透传用户的context。使用示例：`ac.newContext(userId)`
+ **developerId：**开发者id。UDS服务一方面接收APP或设备发来的消息，另一方面可能需要自主的访问云端通用服务或执行例行巡检任务，当对AbleCloud后台服务发起请求时，context中并不会有userId等终端用户的信息，此时服务创建的context需要填充developerId的值。使用示例：`ac.newContext()`

><font color="brown">**注：**</font>上下文context有一个重要的特性是，在其生成后的所有交互中，都不能更改其已有字段的值，可以添加还没有赋值的字段。比如有终端用户发起的请求中带有userId，请求到达云服务端时，云服务可以往该context中设置developerId的值，但不能修改其它值。否则就失去了追踪每一次交互的意义了。
开发者不应该直接用ACContext的构造函数构造上下文对象，而应使用AC框架的相关接口创建上下文对象，后面会有详细描述。

##ACObject
ACObject用于承载交互的具体数据，我们称之为payload（负载）。ACObject数据内部结构以HashMap来存放，通过put存入ACObject的数据内部以json方式处理，因此ACObject中的value也可以是嵌套的ACObject，能满足大部分需求场景。

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
     *
     * @param key 参数名
     * @return 参数值;如果不存在该参数值,返回null
     */
    public <T> T get(String key) {}

    /**
     * @return 返回能被转化为Byte类型的值, 否则返回0
     */
    public byte getByte(String key) {}

    /**
     * @return 返回能被转化为Integer类型的值, 否则返回0
     */
    public int getInt(String key) {}

    /**
     * @return 返回能被转化为Long类型的值, 否则返回0L
     */
    public long getLong(String key) {}

    /**
     * @return 返回能被转化为Float类型的值, 否则返回0F
     */
    public float getFloat(String key) {}

    /**
     * @return 返回能被转化为Double类型的值, 否则返回0D
     */
    public double getDouble(String key) {}

    /**
     * @return 返回能被转化为Boolean类型的值, 否则返回false
     */
    public boolean getBoolean(String key) {}

    /**
     * @return 返回能被转化为String类型的字符串, 否则返回""
     */
    public String getString(String key) {}

    /**
     * 检查某一key是否存在
     * @param key	参数名
     * @return		存在返回true，否则返回false
     */
    public boolean contains(String key) {}
}
```
><font color="brown">**注：**最常用的三个接口是put/add/get。通过**add**接口保存在ACObject中的数据实际为List；相应的，get出来也是一个List。</font>

#交互消息
多个模块、服务之间都通过*消息*`message`来通信。AbleCloud定义了两种格式的消息：

+ **ACMsg：**APP与service，service与service之间的交互消息。
+ **ACDeviceMsg：**APP与device，service与device之间的交互消息。

##ACMsg
ACMsg继承自ACObject，扩展了一些功能，比如设置了交互的方法名name、交互的上下文context以及**其它形式**的负载payload信息。通常采用ACMsg进行数据交互，较多的使用默认的**ACMsg.OBJECT_PAYLOAD**格式，该格式只需要使用ACObject提供的put、add、get接口进行数据操作即可。因为在使用OBJECT_PAYLOAD格式时，框架会对数据进行序列化/反序列化。ACMsg也提供另外的数据交互格式，如json、stream等。如果用json格式，则通过setPayload/getPayload设置/获取序列化后的json数据并设置对应的payloadFormat，开发者后续可自行对payload进解析。

```java
public class ACMsg extends ACObject {
	public static final String OBJECT_PAYLOAD = "application/x-zc-object";
    public static final String JSON_PAYLOAD = "text/json";
    public static final String STREAM_PAYLOAD = "application/octet-stream";

    private String name;
    private ACContext context;
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
     * 获取交互上下文
     * @return
     */
    public ACContext getContext() {}

    /**
     * 设置交互上下文
     * @param context
     */
    public void setContext(ACContext context) {}

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
     * 设置错误信息。在服务端处理错误时，需要显示的调用该结果设置错误信息
     * @param errCode   错误码
     * @param errMsg    错误信息
     */
    public void setErr(Integer errCode, String errMsg) {}

    /**
     * 判断服务端响应的处理结果
     * @return  true-处理出错，false-处理成功
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

    /**
     * 服务端处理成功后，调用该方法
     */
    public void setAck() {}
}
```
><font color="red">**注：**</font>开发者在本地测试或联调时，需要设置context的相关信息。客户端往后端服务发送消息，服务向另一服务发送消息的时候，均需要对所发请求进行签名，具体的签名算法见附录。

###使用示例
client端发起请求（伪代码，完整代码请参看各部分demo）：

```java
ACContext context = ac.newContext(account.getUid());	// 通过框架构造一个用户context
ACMsg req = new ACMsg();								// 创建一个空请求消息
req.setContext(context);								// 设置请求上下文
req.setName("controlLight");							// 设置请求消息名
req.put("deviceId", light.getId());						// 设置一个请求属性“设备id”
req.put("action", "on");								// 设置另一属性"动作“，开灯
ACMsg resp = client.send(req);							// 发送请求并返回服务端响应
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
该消息用于处理服务和设备之间的交互，框架会将ACDeviceMsg中的code部分解析出来，开发者可根据code来区分设备消息类型。并根据code的不同值执行不同的处理响应。
ACDeviceMsg的content部分即发送给设备的具体消息内容，由开发者解释，框架透传。除此之外，KLV是由AbleCloud规定的一种数据格式，可以理解为content部分的一种特殊解释，具体开发需要到AbleCloud平台填写数据点和数据包。

ACDeviceMsg定义如下：

```java
public class ACDeviceMsg {
    //消息码，用于区分消息类型
    private int code;
    //设备消息的具体内容,使用二进制与json格式
    private byte[] content;
    //设备消息的具体内容,使用klv通讯格式
    private ACKLVObject object;
    //设备描述信息
    private String description;

    public ACDeviceMsg() {}

    //初始化byte[]二进制数组（也支持json格式，通过"jsonString".getBytes设置）
    public ACDeviceMsg(int code, byte[] content) {}

    //初始化ACObject，本质上为json格式,与JSONObject用法相同
    public ACDeviceMsg(int code, ACObject object) {}

    //初始化ACKLVObject，使用klv通讯格式
    public ACDeviceMsg(int code, ACKLVObject object) {}

    public ACDeviceMsg(int code, byte[] content, String description) {}

    public ACDeviceMsg(int code, ACObject object, String description) {}

    public ACDeviceMsg(int code, ACKLVObject object, String description) {}
}
```

#基础框架

##AC
通过AC，开发者可以根据需要获取一系列内嵌服务的功能接口。

```java
public abstract class AC {
    /**
     * 构建一个开发者上下文
     *
     * @return
     */
    public ACContext newContext();

    /**
     * 构建一个用户上下文，由于是框架创建的，因此也会带着开发者信息
     *
     * @param userId
     * @return
     */
    public ACContext newContext(long userId);

    /**
     * 构建一个用于数据查询的过滤器
     *
     * @return
     */
    public ACFilter filter();

    /**
     * 用于对数据分类进行具体的操作，如create/find/delete/update/scan等
     *
     * @param className 要操作的分类名
     * @param context   要进行操作的开发者context
     * @return
     */
    public abstract ACStore store(String className, ACContext context);

    /**
     * 用于创建数据分类/清空数据等操作。
     * 用于测试之用。
     *
     * @return
     */
    public abstract ACStoreForTest storeForTest(ACContext context);

    /**
     * 往某一服务发送命令/消息
     *
     * @param subDomain 要访问的服务的子域名。为null或空字符串时，表示访问主域级别的UDS；否则表示访问对应子域级别的UDS。
     * @param name      服务名。
     * @param version   服务版本：主版本号。
     * @param req       具体的消息内容。
     * @return 服务端响应的消息。
     * @throws Exception
     */
    public abstract ACMsg sendToService(String subDomain, String name, int version, ACMsg req) throws Exception;

    /**
     * 往JINGDONG service发送命令/消息,上报设备上的所有Stream点到JINGDONG Service
     *
     * @param context          设备的上下文，其中uid字段为系统填充
     * @param physicalDeviceId 设备的物理id
     * @param req              请求消息体(Stream数组)
     * @return 服务端响应的消息
     * @throws Exception
     */
    public abstract ACMsg sendToJDService(ACContext context, String physicalDeviceId, List<ACJDMsg> req) throws Exception;

    /**
     * 往SUNING service发送命令/消息,上报设备上的所有Stream点到SUNING Service
     *
     * @param context          设备的上下文，其中uid字段为系统填充
     * @param physicalDeviceId 设备的物理id
     * @param req              请求消息体(Stream数组)
     * @return 服务端响应的消息
     * @throws Exception
     */
    public abstract ACMsg sendToSNService(ACContext context, String physicalDeviceId, List<ACSNMsg> req) throws Exception;

    /**
     * 由于uds本身无法访问正常的外网服务，所以AbleCloud内部实现了正向代理，并提供ACHttpClient访问外网服务
     *
     * @param url 访问外网的url
     * @return ACHttpClient
     * @throws IOException
     */
    public abstract ACHttpClient getHttpClient(String url) throws IOException;

    /**
     * 获取帐号管理器。开发者组实现自定义服务时，
     * 可以调用ACAccountMgr提供的各个通用接口
     *
     * @param context 开发者的context
     * @return
     */
    public abstract ACAccountMgr accountMgr(ACContext context);

    /**
     * 获取用于单元测试的帐号管理器，可以注册用户等
     * 注意cleanAll接口会注销所有的账号，所以请慎重使用
     *
     * @param context 开发者的context
     * @return
     */
    public abstract ACAccountMgrForTest accountMgrForTest(ACContext context);

    /**
     * 获取设备绑定管理器。开发者在实现自定义服务时，
     * 可以调用ACBindMgr提供的各个通用接口
     *
     * @param context 用户的context
     * @return
     */
    public abstract ACBindMgr bindMgr(ACContext context);

    /**
     * 获取用于单元测试的设备绑定管理器，可以绑定/解绑设备等
     *
     * @param context 用户的context
     * @return
     */
    public abstract ACBindMgrForTest bindMgrForTest(ACContext context);

    /**
     * 获取通知管理器，可以给用户发送通知消息
     *
     * @param context 开发者的context
     * @return
     */
    public abstract ACNotificationMgr notificationMgr(ACContext context);

    /**
     * 获取用于单元测试的推送管理器
     *
     * @param context 开发者的context
     * @return
     */
    public abstract ACNotificationMgrForTest notificationMgrForTest(ACContext context);

    /**
     * 获取短信管理器，可以给用户发送短信
     *
     * @param context 开发者的context
     * @return
     */
    public abstract ACSmsMgr smsMgr(ACContext context);

    /**
     * 获取定时管理器，可以定时给设备发送消息
     *
     * @param context 开发者的context
     * @return
     */
    public abstract ACTimerTaskMgr timerTaskMgr(ACContext context);

    /**
     * 获取用于单元测试的定时管理器
     *
     * @param context 开发者的context
     * @return
     */
    public abstract ACTimerTaskMgrForTest timerTaskMgrForTest(ACContext context);

    /**
     * 获取数据分析管理器
     *
     * @param context 开发者的context
     * @return
     */
    public abstract ACInspireMgr inspireMgr(ACContext context);

    /**
     * 获取文件管理器，可以上传下载文件。
     * 注意：当前版本的ACFileMgr适用于直接连接互联网的服务器环境，而不适于在UDS中使用。
     *
     * @param context 开发者的context
     * @return
     */
    public abstract ACFileMgr fileMgr(ACContext context);

    /**
     * 获取天气管理器，可以获取pm25,空气质量等相关天气信息
     *
     * @param context 开发者的context
     * @return
     */
    public abstract ACWeatherMgr weatherMgr(ACContext context);

    /**
     * 取设备管理器。
     *
     * @param context  开发者的context
     * @return ACWarehouseMgr对象的实例。
     */
    public abstract ACWarehouseMgr warehouseMgr(ACContext context);

    /**
     * 为便于测试，开发者可实现一个服务的桩
     * 在框架中添加一个服务桩
     *
     * @param name 服务名
     * @param stub 服务桩的实现，实际上也是一个ACService
     */
    public abstract void addServiceStub(String name, ACServiceSub stub);

    /**
     * 为便于测试，开发者可实现一个设备的桩
     *
     * @param subDomain 设备所属子域
     * @param stub      设备桩
     */
    public abstract void addDeviceStub(String subDomain, ACDeviceStub stub);

    /**
     * 获取AC日志, 可以在打印日志时保存TraceId等信息, 便于调试
     *
     * @param context
     * @return
     */
    public abstract ACLog acLog(ACContext context);

    /**
     * 获取用于单元测试的服务框架ac
     *
     * @param config 单元测试环境构造的config
     * @return
     * @throws Exception
     */
    public static final AC getTestAc(ACConfig config) throws Exception;

    /**
     * 获取ACConfig对象。
     *
     * @return ACConfig对象。
     */
    public ACConfig getACConfig();
}
```
><font color=red>注意</font>：由于开发者具有超级权限，所以AbleCloud除了提供正常的服务管理器接口外，还提供一些用于单元测试的管理器接口，如`ac.accountMgrForTest(ac.newContext())`

#账号相关接口
该服务用于管理和某一智能设备相关的用户，比如查看用户的基本信息/状态等。发现异常用户时，服务程序能及时做出相应操作。
##获取方式
```java
ACAccountMgr accountMgr = ac.accountMgr(ac.newContext());
```
><font color="red">注意</font>：此处传开发者上下文，即`ac.newContext()`。

##接口说明
```java
public interface ACAccountMgr {

    /**
     * 为某用户获取注册帐号的验证码。
     *
     * @param account 拟注册帐号的用户的登录名（Email地址或手机号）。
     * @param timeout 是验证码的有效时长，单位为秒。
     * @return 返回验证码。
     * @throws Exception
     */
    public String getVerifyCode(String account, long timeout) throws Exception;

    /**
     * 向用户的手机发送验证码。
     *
     * @param phone    用户的手机号码。
     * @param template 短信模板的编号。
     * @param timeout  验证码的有效时长，单位为秒。
     * @throws Exception
     */
    public void sendVerifyCode(String phone, long template, long timeout) throws Exception;

    /**
     * 注册帐号。
     *
     * @param name       用户的昵称。
     * @param email      用户的登录名：Email地址。email与phone至少需提供一个。
     * @param phone      用户的登录名：手机号码。email与phone至少需要提供一个。
     * @param password   用户的密码。
     * @param verifyCode 用户的注册验证码。
     * @return 注册成功时返回一个ACAccount对象。
     * @throws Exception
     */
    public ACAccount register(String name, String email, String phone, String password, String verifyCode) throws Exception;

    /**
     * 用户登录。
     *
     * @param account  用户的登录名：email地址或手机号。
     * @param password 用户的密码。
     * @return 登录成功时返回一个ACAccount对象。
     * @throws Exception
     */
    public ACAccount login(String account, String password) throws Exception;

    /**
     * 根据用户的id，查找用户信息
     *
     * @param accountId
     * @throws Exception
     */
    public ACAccount getAccountInfo(long accountId) throws Exception;

    /**
     * 根据电话或email查找用户ID
     *
     * @param account
     * @return
     * @throws Exception
     */
    public long getIdByAccount(String account) throws Exception;

    /**
     * 根据用户ID设置用户扩展信息
     *
     * @param userId
     * @param userProfile
     * @return
     * @throws Exception
     */
    public void setUserProfile(long userId, ACObject userProfile) throws Exception;

    /**
     * 查出所有用户的信息（基本信息+扩展信息）
     *
     * @param offset
     * @param limit
     * @return
     * @throws Exception
     */
    public List<ACObject> listUserProfiles(long offset, long limit) throws Exception;

    /**
     * 根据用户uid列表查找用户的信息（基本信息+扩展信息）
     * 一次最多可查询1000个用户的信息
     *
     * @param userList 元素个数必须小于等于1000
     * @return
     * @throws Exception
     */
    public List<ACObject> getProfilesByUserList(List<Long> userList) throws Exception;

    /**
     * 根据用户ID查找用户扩展信息
     *
     * @param accountId
     * @return
     * @throws Exception
     */
    public ACObject getUserProfileById(long accountId) throws Exception;

    /**
     * 根据用户ID查找用户的所有信息（基本信息+扩展信息）
     * @param accountId
     * @return
     * @throws Exception
     */
    public ACObject getWholeUserProfileById(long accountId) throws Exception;

    /**
     * 根据用户电话或邮箱查找用户的所有信息(基本信息+扩展信息)
     * @param account
     * @return
     * @throws Exception
     */
    public ACObject getWholeUserProfileByAccount(String account) throws Exception;

    /**
     * 获取账号总数
     * @return
     * @throws Exception
     */
    public long getAccountCount() throws Exception;

    /**
     * 查询用户列表。
     *
     * @param offset    查询的记录偏移量。取值应该为非负整数。
     * @param limit     限制本次调用查询的记录的最大数目。取值范围是闭区间[1, 100]。
     * @return          返回用户列表。
     * @throws Exception
     */
    public List<ACAccount> listAllAccounts(long offset, long limit) throws Exception;

    /**
     * 注册一个来自第三方平台的用户。
     *
     * @param thirdPlatform 第三方平台的标识符。
     * @param openId        新用户在第三方平台上的ID。
     * @return
     * @throws Exception
     */
    public ACAccount registerWithOpenId(ACThirdPlatform thirdPlatform, String openId) throws Exception;

    /**
     * 注册一个来自第三方平台的用户。
     *
     * @param thirdPlatform 第三方平台的标识符。
     * @param openId        新用户在第三方平台上的ID。
     * @param unionId       对来自微信平台的用户，是其在微信平台对应的UnionID。如果不提供该参数，则无法识别同一个用户关注开发者的多个微信公众号的情况。
     * @return
     * @throws Exception
     */
    public ACAccount registerWithOpenId(ACThirdPlatform thirdPlatform, String openId, String unionId) throws Exception;

    /**
     * 登录一个来自第三方平台的用户。
     *
     * @param thirdPlatform 第三方平台的标识符。
     * @param openId        新用户在第三方平台上的ID。
     * @return
     * @throws Exception
     */
    public ACAccount loginWithOpenId(ACThirdPlatform thirdPlatform, String openId) throws Exception;

    /**
     * 获取用户在第三方平台上的OpenID。
     *
     * @param thirdPlatform 第三方平台的标识符。
     * @param userId        是用户在AbleCloud平台上的ID。
     * @return              返回一个字符串，表示用户在指定的第三方平台中对应的OpenID。
     * @throws Exception
     */
    public String getUserOpenId(ACThirdPlatform thirdPlatform, long userId) throws Exception;

    /**
     * 修改用户的手机号码。
     *
     * @param accountId  要修改手机号的用户的ID。
     * @param phone      用户的新手机号。
     * @param verifyCode 用户修改手机号时使用的验证码。
     * @param password   用户的登录密码。
     * @throws Exception
     */
    public void changePhone(long accountId, String phone, String verifyCode, String password) throws Exception;

    /**
     * 修改用户的昵称
     *
     * @param userId   要修改手机号的用户的ID。
     * @param nickName 用户的昵称
     * @throws Exception
     */
    public void changeNickName(long userId, String nickName) throws Exception;

    /**
     * 更新用户的Token.
     *
     * @param account 要更新其Token的用户。操作成功时直接修改该对象保存的信息。
     * @throws Exception
     */
    public void updateUserToken(ACAccount account) throws Exception;

    /**
     * 重设用户的密码。
     *
     * @param userId        要更新其密码的用户的ID。
     * @param account       要更新其密码的用户的登录名。
     * @param password      用户的新密码。
     * @param verifyCode    更新用户密码的验证码。
     * @throws Exception
     */
    public void resetPassword(long userId, String account, String password, String verifyCode) throws Exception;
}
```

##单元测试接口说明
服务框架接收的命令大部分来自于APP端，因此需要创建一些*测试用户*，以便模拟客户发起的请求。该单元测试类即用于此类场景。需要注意的是，该测试接口只在测试环境中正常工作，具体定义如下：

```java
public interface ACAccountMgrForTest extends ACAccountMgr {

    /**
     * 注册一个用户
     * @param email     用户邮箱
     * @param phone     用户电话
     * @param password  用户密码
     * @return
     * @throws Exception
     */
    public ACAccount register(String email, String phone, String password) throws Exception;

    /**
     * 开发者接口，删除一个用户
     * @param account   用户邮箱或电话
     * @return
     * @throws Exception
     */
    public long deleteAccount(String account) throws Exception;

    /**
     * 清除开发者主域下的所有帐号数据
     * 注意：测试环境有效，正式环境不允许，请慎重使用
     * @throws Exception
     */
    public void cleanAll() throws Exception;
}
```

#绑定相关接口
该服务接口主要用于用户和设备绑定关系管理，可以获取设备的详细信息，给设备发送消息等，定制化自己开发的服务。
##获取方式
```java
ACBindMgr bindMgr = ac.bindMgr(ACContext context);
```
><font color="red">注意</font>：此处应该传用户上下文，即`req.getContext()`，单测中使用`ac.newContext(userId)`(仅调用listUsers方法时，可以使用`ac.newContext()`)。

##接口说明
```java
public interface ACBindMgr {

    /**
     * 列举用户绑定的所有设备（包括独立设备与网关设备等）。
     * @param userId 要查询的用户的ID。
     * @return 所有设备信息
     * @throws Exception
     */
    public List<ACUserDevice> listDevices(long userId) throws Exception;

    /**
     * 列举某一设备的所有用户
     *
     * @param deviceId 设备逻辑id
     * @return 所有设备信息
     * @throws Exception
     */
    public List<ACDeviceUser> listUsers(long deviceId) throws Exception;

    /**
     * 修改设备名
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param name      新的设备名
     * @param userId    修改该设备名的用户的ID
     */
    public void changeName(String subDomain, long deviceId, String name, long userId) throws Exception;

    /**
     * 绑定设备
     *
     * @param subDomain         拟被绑定的设备所属的子域的名字
     * @param physicalDeviceId  设备物理id
     * @param name              名字
     * @param userId            要绑定该设备的用户的ID
     * @throws Exception
     */
    public ACUserDevice bindDevice(String subDomain, String physicalDeviceId, String name, long userId) throws Exception;

    /**
     * 绑定设备,无管理员概念,所有人都可以绑定设备,同时所有人只能使自己解绑设备
     *
     * @param subDomain        拟被绑定的设备所属的子域的名字
     * @param physicalDeviceId 设备物理id
     * @param name             名字
     * @param userId           要绑定该设备的用户的ID
     * @throws Exception
     */
    public ACUserDevice bindDeviceWithoutOwner(String subDomain, String physicalDeviceId, String name, long userId) throws Exception;

    /**
     * 获取分享码（只有管理员可以获取 ，默认一小时内生效）
     *
     * @param deviceId  设备逻辑id
     * @param userId    设备的管理员用户的ID
     * @return 分享码
     * @throws Exception
     */
    public String getShareCode(long deviceId, long userId) throws Exception;

    /**
     *
     * 获取分享码
     * @param deviceId  设备逻辑id
     * @param userId    设备的管理员用户
     * @param timeout   分享码的超时时间(以秒为单位)
     * @return 分享码
     * @throws Exception
     */
    public String getShareCode(long deviceId, long userId, long timeout) throws Exception;

    /**
     * 通过分享码绑定设备
     *
     * @param shareCode 分享码
     * @param userId    要通过分享码绑定设备的用户的ID
     * @return          绑定的设备的信息。
     * @throws Exception
     */
    public ACUserDevice bindDeviceWithShareCode(String shareCode, long userId) throws Exception;

    /**
     * 设备的管理员用户将设备与指定的用户绑定起来。
     * @param deviceId 设备的逻辑ID。
     * @param account  要帮定设备的用户的登录名。
     * @param adminId 设备的管理员用户的ID。
     * @throws Exception
     */
    public void bindDeviceWithUser(long deviceId, String account, long adminId) throws Exception;

    /**
     * 解绑设备
     *
     * @param subDomain 要被解除绑定的设备所属的子域的名字。
     * @param deviceId  设备逻辑id。
     * @param userId    要解除与设备的绑定关系的用户的ID。
     * @throws Exception
     */
    public void unbindDevice(String subDomain, long deviceId, long userId) throws Exception;

    /**
     * 设备的管理员用户解除设备与用户的绑定关系。
     * @param deviceId  设备的逻辑ID。
     * @param userId    要被解除绑定关系的用户的ID。
     * @param adminId   设备的管理员用户的ID。
     * @throws Exception
     */
    public void unbindDeviceWithUser(long deviceId, long userId, long adminId) throws Exception;

    /**
     * 使用物理ID为physicalDeviceId的新设备替换逻辑ID为deviceId的设备。替换成功后，physicalDeviceId对应的设备的逻辑ID为deviceId。
     * @param userId            逻辑ID为deviceId的设备的管理员用户的ID。
     * @param deviceId          要被替换的设备的逻辑ID。
     * @param physicalDeviceId  新设备的物理ID。
     * @param subDomain         新设备所属的子域的名字。
     * @throws Exception
     */
    public void changeDevice(long userId, long deviceId, String physicalDeviceId, String subDomain) throws Exception;

    /**
     * 查询设备在线状态
     *
     * @param deviceId 设备逻辑id
     * @return 设备是否在线
     * @throws Exception
     */
    public boolean isDeviceOnline(long deviceId) throws Exception;

    /**
     * 查询设备在线状态
     *
     * @param subDomain         设备所属的子域的名字。
     * @param physicalDeviceId  设备物理id。
     * @return 设备是否在线。
     * @throws Exception
     */
    public boolean isDeviceOnline(String subDomain, String physicalDeviceId) throws Exception;

    /**
     * 根据设备物理Id查询逻辑Id
     *
     * @param subDomain         设备所属的子域的名字。
     * @param physicalDeviceId  设备物理id。
     * @return 设备逻辑id。
     * @throws Exception
     */
    public long getDeviceId(String subDomain, String physicalDeviceId) throws Exception;

    /**
     * 根据逻辑Id查询设备信息
     *
     * @param deviceId 设备逻辑id
     * @return ACUserDevice 设备对象信息
     * @throws Exception
     */
    public ACUserDevice getUserDevice(long deviceId) throws Exception;

    /// @name 设备的扩展属性
    //@{
    /**
     * 设置用户所绑定设备的扩展属性。
     * @param userId    发起该操作的用户的ID。
     * @param deviceId  要设置其扩展属性的设备的逻辑ID。
     * @param profile   由键值对表达的设备的扩展属性。
     * @throws Exception
     */
    public void setDeviceProfile(long userId, long deviceId, ACObject profile) throws Exception;

    /**
     * 列举某一设备的所有扩展属性
     *
     * @param deviceId 设备逻辑id
     * @return 所有设备扩展属性信息
     * @throws Exception
     */
    public ACObject getDeviceProfile(long deviceId) throws Exception;
    //@}

    /**
     * 直接往设备发送命令/消息
     *
     * @param subDomain 设备所属的子域的名字。
     * @param deviceId  设备逻辑id。
     * @param reqMsg    具体的消息内容。
     * @param userId    向设备发送消息的用户的ID。
     * @return 设备返回的消息
     * @throws Exception
     */
    public ACDeviceMsg sendToDevice(String subDomain, long deviceId, ACDeviceMsg reqMsg, long userId) throws Exception;

    /// @name 网关设备管理
    //@{
    /**
     * 将网关设备绑定给某个用户。
     * @param subDomain         拟被绑定的网关设备所属的子域的名字。
     * @param physicalDeviceId  拟被绑定的网关设备的物理ID。
     * @param name              设备被绑定后的显示名称。
     * @param userId            拟绑定该设备的用户的ID。
     * @return  被绑定的设备的信息。
     * @throws Exception
     */
    public ACUserDevice bindGateway(String subDomain, String physicalDeviceId, String name, long userId) throws Exception;

    /**
     * 解除网关设备与某用户的绑定关系。
     * @param subDomain 拟被解绑的网关设备所属的子域的名字。
     * @param deviceId  拟被解绑的网关设备的逻辑ID。
     * @param userId    拟被解绑的用户的ID。
     * @throws Exception
     */
    public void unbindGateway(String subDomain, long deviceId, long userId) throws Exception;

    /**
     * 开启网关设备允许新的子设备接入的功能。开启该功能后，网关才能发现新的子设备。
     * @param subDomain 要被操作的网关设备所属的子域的名字。
     * @param deviceId  要被操作的网关设备的逻辑ID。
     * @param userId    发起该操作的用户的ID。该用户应该是网关设备的管理员。
     * @param timeout   表示在该参数指定的时长范围内，网关设备将允许发现新的子设备。单位为秒。
     * @throws Exception
     */
    public void openGatewayMatch(String subDomain, long deviceId, long userId, long timeout) throws Exception;

    /**
     * 关闭网关设备允许新的子设备接入的功能。
     * @param subDomain 要操作的网关设备所属的子域的名字。
     * @param deviceId  要被操作的网关设备的逻辑ID。
     * @param userId    发起该操作的用户的ID。该用户应该是网关设备的管理员。
     * @throws Exception
     */
    public void closeGatewayMatch(String subDomain, long deviceId, long userId) throws Exception;

    /**
     * 将指定设备添加为网关设备的子设备。
     * @param userId            是网关设备的管理员用户的ID。
     * @param gatewayId         网关设备的逻辑ID。
     * @param physicalDeviceId  拟被添加为子设备的设备物理ID。
     * @param name              子设备被添加后的名字。
     * @param subDomain         拟新添加的子设备所属的子域的名字。
     * @return  子设备被添加后的设备信息。
     * @throws Exception
     */
    public ACUserDevice addSubDevice(long userId, long gatewayId, String physicalDeviceId, String name, String subDomain) throws Exception;

    /**
     * 删除网关设备的某个子设备。
     * @param userId    网关设备的管理员用户的ID。
     * @param deviceId  要被删除的子设备的逻辑ID。
     * @throws Exception
     */
    public void deleteSubDevice(long userId, long deviceId) throws Exception;

    /**
     * 查询用户绑定的网关设备。
     * @param userId    被查询的用户的ID。
     * @return  用户已经绑定的所有网关设备的信息。
     * @throws Exception
     */
    public List<ACUserDevice> listGateways(long userId) throws Exception;

    /**
     * 查询某网关下用户所绑定的子设备。
     * @param userId    要查寻的用户的ID。
     * @param gatewayId 被查询的网关的逻辑ID。
     * @return  网关下用户绑定的所有子设备的信息。
     * @throws Exception
     */
    public List<ACUserDevice> listSubDevices(long userId, long gatewayId) throws Exception;

    /**
     * 查询某网关下新增的设备。这些设备尚未被用户正式绑定。
     * @param userId    发起本查询操作的用户的ID。
     * @param gatewayId 被查询的网关的逻辑ID。
     * @return  新接入的所有子设备的信息。
     * @throws Exception
     */
    public List<ACUserDevice> listNewSubDevices(long userId, long gatewayId) throws Exception;
    //@}

    /// @name 设备分组管理模型。
    //@{

    /**
     * 创建一个“家”对象。
     * @param userId    创建该“家”的用户的ID。
     * @param name      拟创建的“家”的名字。
     * @return  新创建的“家”的信息。
     * @throws Exception
     */
    public ACHome createHome(long userId, String name) throws Exception;

    /**
     * 删除一个“家”对象。
     * @param userId    发起该操作的用户的ID。
     * @param homeId    拟删除的“家”的ID。
     * @throws Exception
     */
    public void deleteHome(long userId, long homeId) throws Exception;

    /**
     * 创建一个“房间”对象。
     * @param userId    创建该“房间”的用户的ID。
     * @param homeId    该“房间”所属“家”的ID。
     * @param name      拟创建的“房间”的名字。
     * @return  新创键的“房间”的信息。
     * @throws Exception
     */
    public ACRoom createRoom(long userId, long homeId, String name) throws Exception;

    /**
     * 删除一个“房间”对象。
     * @param userId    发起该操作的用户的ID。
     * @param homeId    拟删除的“房间”所属的“家”的ID。
     * @param roomId    拟删除的“房间”的ID。
     * @throws Exception
     */
    public void deleteRoom(long userId, long homeId, long roomId) throws Exception;

    /**
     * 向“家”添加一个设备。
     * @param userId    发起该操作的用户的ID。
     * @param homeId    添加该设备的“家”的ID。
     * @param name      新添加的设备的名字。
     * @param subDomain 新添加的设备所属的子域的名字。
     * @param deviceId  要添加至“家”中的设备的逻辑ID。
     * @return  新添加的设备的信息。
     * @throws Exception
     */
    public ACUserDevice addDeviceToHome(long userId, long homeId, String name, String subDomain, long deviceId) throws Exception;

    /**
     * 向“家”添加一个设备。
     * @param userId        发起该操作的用户的ID。
     * @param homeId        添加该设备的“家”的ID。
     * @param name          新添加的设备的名字。
     * @param subDomain     新添加的设备所属的子域的名字。
     * @param physicalId    要添加至“家”中的设备的物理ID。
     * @return  新添加的设备的信息。
     * @throws Exception
     */
    public ACUserDevice addDeviceToHome(long userId, long homeId, String name, String subDomain, String physicalId) throws Exception;

    /**
     * 从“家”中删除一个设备。
     * @param userId        发起该操作的用户的ID。
     * @param homeId        要删除设备的“家”的ID。
     * @param deviceId      要被删除的设备的逻辑ID。
     * @throws Exception
     */
    public void deleteDeviceFromHome(long userId, long homeId, long deviceId) throws Exception;

    /**
     * 将设备移至指定“房间”。
     * @param userId    发起该操作的用户的ID。
     * @param deviceId  要被迁移的设备的逻辑ID。
     * @param roomId    设备拟迁入的“房间”的ID。
     * @param homeId    要被迁移的设备及目标“房间”所属的家的ID。
     * @throws Exception
     */
    public void moveDeviceToRoom(long userId, long deviceId, long roomId, long homeId) throws Exception;

    /**
     * 从指定“房间”内删除设备。
     * @param userId    发起该操作的用户的ID。
     * @param deviceId  要被删除的设备的逻辑ID。
     * @param roomId    拟删除设备的“房间”的ID。
     * @param homeId    要被迁移的设备及“房间”所属的家的ID。
     * @throws Exception
     */
    public void removeDeviceFromRoom(long userId, long deviceId, long roomId, long homeId) throws Exception;

    /**
     * 取“家”的分享码/邀请码。
     * @param userId    发起该操作的用户的ID。
     * @param homeId    是“家”的ID。
     * @param timeout   分享码的有效时长。单位为秒。
     * @return  返回新用户加入“家”的分享码/邀请码。
     * @throws Exception
     */
    public String getHomeShareCode(long userId, long homeId, long timeout) throws Exception;

    /**
     * 用户使用分享码加入“家”对象。
     * @param userId    要加入“家”的用户的ID。
     * @param shareCode 用户加入“家”所使用的分享码/邀请码。
     * @return  用户所加入的“家”的信息。
     * @throws Exception
     */
    public ACHome joinHomeWithShareCode(long userId, String shareCode) throws Exception;

    /**
     * 将指定的用户加入“家”中。
     * @param adminId   “家”的管理员用户的ID。该管理员用户可以将帐号名字为account的用户添加至“家”中。
     * @param homeId    是“家”的ID。
     * @param account   将被添加至“家”中的用户的帐号名：Email或手机号码。
     * @throws Exception
     */
    public void addUserToHome(long adminId, long homeId, String account) throws Exception;

    /**
     * 将用户从“家”中删除。
     * @param adminId   是“家”的管理员用户的ID。
     * @param homeId    “家”的ID。
     * @param userId    要从“家”中删除的用户的ID。
     * @throws Exception
     */
    public void removeUserFromHome(long adminId, long homeId, long userId) throws Exception;

    /**
     * 查询某用户已创建的“家”。
     * @param userId    待查询的用户的ID。
     * @return  用户所创建的所有“家”的信息。
     * @throws Exception
     */
    public List<ACHome> listHomes(long userId) throws Exception;

    /**
     * 查询某用户的“家”中的“房间”列表。
     * @param userId    待查询的用户的ID。
     * @param homeId    待查询的“家”的ID。
     * @return  “家”中所有“房间”的信息。
     * @throws Exception
     */
    public List<ACRoom> listRooms(long userId, long homeId) throws Exception;

    /**
     * 查询某用户的“家”中已加入的设备。
     * @param userId    待查询的用户的ID。
     * @param homeId    待查询的“家”的ID。
     * @return  “家”中所有设备的信息。
     * @throws Exception
     */
    public List<ACUserDevice> listHomeDevices(long userId, long homeId) throws Exception;

    /**
     * 查询某用户的“房间”中已加入的设备。
     * @param userId    待查询的用户的ID。
     * @param homeId    待查询的“房间”所属的“家”的ID。
     * @param roomId    待查询的“房间”的ID。
     * @return  “房间”中所有设备的信息。
     * @throws Exception
     */
    public List<ACUserDevice> listRoomDevices(long userId, long homeId, long roomId) throws Exception;

    /**
     * 查询“家”中的成员列表。
     * @param userId    发起此次查询的用户的ID。该用户应该是“家”的成员。
     * @param homeId    待查询的“家”的ID。
     * @return  “家”中成员的信息。
     * @throws Exception
     */
    public List<ACAccount> listHomeUsers(long userId, long homeId) throws Exception;

    /**
     * 修改“家”的名字。
     * @param userId    发起该操作的用户的ID。
     * @param homeId    拟修改名字的“家”的ID。
     * @param name      是“家”的新名字。
     * @throws Exception
     */
    public void changeHomeName(long userId, long homeId, String name) throws Exception;

    /**
     * 修改“房间”的名字。
     * @param userId    发起该操作的用户的ID。
     * @param homeId    拟修改名字的“房间”所属的“家”的ID。
     * @param roomId    拟修改名字的“房间”的ID。
     * @param name      “房间”的新名字。
     * @throws Exception
     */
    public void changeRoomName(long userId, long homeId, long roomId, String name) throws Exception;
    //@}
}
```

##单元测试接口说明
为了便于对UDS进行单元测试，可以模拟APP的基本操作，包括设备绑定，解绑，更改设备的owner等。另外该类还提供了cleanAll和unbindUser接口，用于清理单元测试中产生的数据，在单元测试中可重复执行。需要注意的是，该类接口只在测试环境中正常工作，具体定义如下：

```java
public interface ACBindMgrForTest extends ACBindMgr {

    /**
     * 管理员接口，更改一个逻辑ID对应的物理设备
     * @param deviceId          设备的逻辑id
     * @param physicalDeviceId  新设备的物理id
     * @throws Exception
     */
    public void changeDevice(long deviceId, String physicalDeviceId) throws Exception;

    /**
     * 管理员接口，更改设备管理员
     * @param deviceId    设备的逻辑id
     * @param userId      新设备的物理id
     * @throws Exception
     */
    public void changeOwner(long deviceId, long userId) throws Exception;

    /**
     * 管理员接口，绑定一个设备和一个帐号（手机/邮箱）
     * @param deviceId     设备的逻辑id
     * @param account      帐号手机或邮箱
     * @return
     * @throws Exception
     */
    public void bindDeviceWithUser(long deviceId, String account) throws Exception;

    /**
     * 管理员接口，解绑一个设备和一个普通用户
     * @param deviceId     设备的逻辑id
     * @param userId       用户id
     * @return
     * @throws Exception
     */
    public void unbindDeviceWithUser(long deviceId, long userId) throws Exception;

    /**
     * 开发者接口，解绑一个用户的所有设备
     * 如果该用户是某个设备的管理员，则该设备的所有绑定关系被清除，该设备被删除
     * @throws Exception
     */
    public void unbindUser(long userId) throws Exception;

    /**
     * 清除开发者所属主域下的所有分组/设备/成员相关数据
     * 注意：测试环境有效，请慎重使用
     * @throws Exception
     */
    public void cleanAll() throws Exception;
}
```

##数据结构说明

被绑定的设备的基础信息。

```java
public class ACUserDevice {
    private long id;                  // 设备的逻辑ID
    private String physicalId;        // 设备的物理ID
    private long owner;               // 设备的管理员ID
    private String name;              // 设备的名称
    private long subDomainId;         // 设备所属产品子域ID
    private long gatewayDeviceId;     // 如果是子设备，其网关设备的逻辑ID
    private long rootId;              // 分组设备管理模型
    private long status;              // 设备的状态
    private String subDomainName;     // 设备所属产品子域的名字

    public ACUserDevice(long id, long owner, String name, String physicalId, long subDomainId, long gatewayDeviceId, long rootId, long status, String subDomainName);

    public long getId();

    public String getPhysicalId();

    public String getSubDomainName();

    public long getSubDomainId();

    public long getOwner();

    public String getName();

    public long getGatewayDeviceId();

    public long getRootId();

    public long getStatus();

    public String toString();
}
```

绑定设备的用户的基础信息。
```java
public class ACDeviceUser {
    public static final long NORMAL = 0;
    public static final long OWNER = 1;

    private long id;           // 用户唯一标识ID
    private long deviceId;     // 设备唯一标识，逻辑ID
    private long userType;     // 设备绑定的用户类型：0普通用户，1管理员
    private String phone;      // 用户的手机号码
    private String email;      // 用户的Email

    public ACDeviceUser(long id, long deviceId, long userType, String phone, String email);

    public long getId();

    public long getDeviceId();

    public long getUserType();

    public String getPhone();

    public String getEmail();

    public String toString();
}
```

#存储相关接口
AbleCloud存储服务为开发者提供了一个通用的key-value存储系统服务。开发者可用此服务存储自定义数据。
##获取方式
```java
ACStore store = ac.store(String className, ACContext contexte);
```
><font color="red">注意</font>：此处传开发者上下文，即`ac.newContext()`。

##存储模型
AbleCloud目前提供基于MySQL的分布式存储服务。开发者需要预先设定数据集的结构，同时可以选择对数据进行分区或不分区。为定位数据所在分区，需要定义数据分区key，AbleCloud称其为entity group key（分区键）。当我们要查找一条存储在AbleCloud中的数据时，需要提供其key值，通过key值定位到具体的数据，这种用于定位具体数据的key，AbleCloud称其为primary key（主键）。

存储模型示例如下：
![store](../pic/reference/store.png)

从上图我们可以看到，定义的一个存储模型如下：

+ **分区键(entiry group keys)：**deviceId，类型为字符串`String`。
+ **主键(primary keys)：**deviceId，类型为字符串；timestamp，类型为整型`Long`。
+ **属性(attributes)**：mode，类型为字符串；speed，类型为整型`Long`。

><font color="brown">**注：**目前整型统一为Long，浮点型统一为Double，字符串型可以设定字符串长度。如果云端数据类型是浮点型，而实际存储的数据中不包含小数点的话，比如3.000，JDK从云端查询的数据结果是整型（3）而不是3.000，需要用户自己根据需要做类型转换</font>


><font color=red>务必注意</font>：
1.存储服务为了保证服务整体可用性，限制单次查询最多返回1000条结果。

2.scan在使用orderBy,groupBy,sum,count,filter,max,min等操作符时，最好设定start和end，否则容易造成性能问题

##分区键与主键

分区键（entity group key）用于实现数据库分表，写入store的数据会根据分区键的值，写入到不同的分区。
主键（primary key）用于唯一索引一条数据。
分区键必须为主键的一部分，可以相同。

以下面这个实例来说明：

数据集：device_data
分区键：device_id
主键：device_id, timestamp
所有列：device_id, timestamp, pm25

假设云端有4个分区，这个数据集总共有5行分数据：

|device_id|timestamp|pm25|
|---------|---------|----|
|00001|1420872001|10|
|00001|1420872002|11|
|00002|1420872003|12|
|00003|1420872004|13|
|00004|1420872005|14|

因为device_id是分区键，所以分区键相同的数据肯定会在同一个分区，在上面的实例中：
设备00001的两行数据，肯定是在同一个分区。而设备00001与设备00002是有可能不再同一个分区的。

分区的优点是可以实现存储的水平扩展，缺点是会导致一些使用的限制，比如，用户无法在一次请求中跨分区查询或写入数据，任何请求都要加上分区键才能实现。

所以如果数据集的数据量比较少的话，可以选择不分区，如果数据量很大的话，建议选择分区;分区键的选择要符合自己的场景，比如对于设备上报数据集的话，分区键一般为设备ID，主键一般为设备ID+时间戳。是否分区，一旦选定，不能更改

##接口说明
###ACFilter：
数据查询过滤器，独立于数据集之外，同一个过滤器可用于在不同的数据集中进行数据查询过滤。

获取方式：
```java
ACFilter filter = ac.filter();

```

><font color="red">注意</font>：此处使用开发者或用户上下文都可以。

><font color="red">注意</font>：在同一级filter,and的优先级要高于or。


接口定义如下：
```java
public class ACFilter {
    // 各种关系连接符
    public static long INVALID          = 0;
    public static long EQUAL            = 1;  // 等于
    public static long NOT_EQUAL        = 2;  // 不等于
    public static long GREATER          = 3;  // 大于
    public static long GREATER_OR_EQUAL = 4;  // 大于等于
    public static long LESS             = 5;  // 小于
    public static long LESS_OR_EQUAL    = 6;  // 小于等于
    public static long LIKE             = 7;
    public static long NOT_LIKE         = 8;
    public static long BINARY_LIKE      = 9;
    public static long BINARY_NOT_LIKE  = 10;
    public static long IN               = 11;
    public static long NOT_IN           = 12;

    // 向查询过滤器中添加等于表达式
    public ACFilter whereEqualTo(String key, Object value); //添加（默认为and）一个等于表达式
    public ACFilter andEqualTo(String key, Object value);   //and一个等于表达式
    public ACFilter orEqualTo(String key, Object value);    //or一个等于表达式

    // 向查询过滤器中添加不等于表达式
    public ACFilter whereNotEqualTo(String key, Object value);    //添加（默认为and）一个不等于表达式
    public ACFilter andNotEqualTo(String key, Object value);      //and一个不等于表达式
    public ACFilter orNotEqualTo(String key, Object value);       //or一个不等于表达式

    // 向查询过滤器中添加大于表达式
    public ACFilter whereGreaterThan(String key, Object value);   //添加（默认为and）一个大于表达式
    public ACFilter andGreaterThan(String key, Object value);     //and一个大于表达式
    public ACFilter orGreaterThan(String key, Object value);      //or一个大于表达式

    // 向查询过滤器中添加大于等于表达式
    public ACFilter whereGreaterThanOrEqualTo(String key, Object value); //添加（默认为and）一个大于等于表达式
    public ACFilter andGreaterThanOrEqualTo(String key, Object value);   //and一个大于等于表达式
    public ACFilter orGreaterThanOrEqualTo(String key, Object value);    //or一个大于等于表达式

    // 向查询过滤器中添加小于表达式
    public ACFilter whereLessThan(String key, Object value);  //添加（默认为and）一个小于表达式
    public ACFilter andLessThan(String key, Object value);    //and一个小于表达式
    public ACFilter orLessThan(String key, Object value);     //or一个小于表达式

    // 向查询过滤器中添加小于等于表达式
    public ACFilter whereLessThanOrEqualTo(String key, Object value); //添加（默认为and）一个小于等于表达式
    public ACFilter andLessThanOrEqualTo(String key, Object value);   //and一个小于等于表达式
    public ACFilter orLessThanOrEqualTo(String key, Object value);    //or一个小于等于表达式

    // 向查询过滤器中添加LIKE表达式(不区分大小写)
    // value的类型必须是String类型，格式和mysql一致，尽量使用前缀匹配，否则可能造成索引失效
    // 匹配以abcd为前缀的值: "abcd%"
    // 匹配以abcd为后缀的值: "%abcd"
    // 任意位置匹配: "%abcd%"
    public ACFilter whereLike(String key, Object value); //添加（默认为and）一个Like表达式
    public ACFilter andLike(String key, Object value);   //and一个like表达式
    public ACFilter orLike(String key, Object value);    //or一个like表达式

    // 向查询过滤器中添加NOT LIKE表达式(不区分大小写)
    public ACFilter whereNotLike(String key, Object value); //添加（默认为and）一个Not Like表达式
    public ACFilter andNotLike(String key, Object value);   //and一个Not Like表达式
    public ACFilter orNotLike(String key, Object value);    //or一个Not Like表达式

    // 向查询过滤器中添加LIKE表达式(区分大小写)
    public ACFilter whereBinaryLike(String key, Object value); //添加（默认为and）一个Like表达式
    public ACFilter andBinaryLike(String key, Object value);   //and一个Like表达式
    public ACFilter orBinaryLike(String key, Object value);    //or一个Like表达式

    // 向查询过滤器中添加NOT LIKE表达式(区分大小写)
    public ACFilter whereBinaryNotLike(String key, Object value); //添加（默认为and）一个Not Like表达式
    public ACFilter andBinaryNotLike(String key, Object value);   //and一个Not Like表达式
    public ACFilter orBinaryNotLike(String key, Object value);    //or一个Not Like表达式

    // 向查询过滤器中添加IN表达式(不区分大小写)
    public ACFilter whereIn(String key, Object value); //添加（默认为and）一个IN表达式
    public ACFilter andIn(String key, Object value);   //and一个IN表达式
    public ACFilter orIn(String key, Object value);    //or一个IN表达式

    // 向查询过滤器中添加NOT IN表达式(不区分大小写)
    public ACFilter whereNotIn(String key, Object value); //添加（默认为and）一个NOT IN表达式
    public ACFilter andNotIn(String key, Object value);   //and一个NOT IN表达式
    public ACFilter orNotIn(String key, Object value);    //or一个NOT IN表达式
}
```

###ACStore:
```java
public abstract class ACStore {

    // 各数据类型
    public static long INVALID_TYPE= 0;
    public static long INT_TYPE    = 1;     // 整型数据，目前统一为Long
    public static long FLOAT_TYPE  = 2;     // 浮点型数据，目前统一为double
    public static long BOOL_TYPE   = 3;     // 布尔型数据
    public static long STRING_TYPE = 4;     // 字符串类型数据
    public static long OBJECT_TYPE = 5;     // 对象数据
    public static long ARRAY_TYPE  = 6;     // 数组/列表型数据

    // 查询过滤器的连接符
    public static long INVALID_CONNECTOR = 0;
    public static long AND               = 1;  // 表示过滤器之间“且”的关系
    public static long OR                = 2;  // 表示过滤器之间“或”的关系

    // 数据排序的参数
    public static long INVALID_ORDER = 0;
    public static long ASC           = 1;  // 正序排序
    public static long DESC          = 2;  // 倒序排序

    // 创建一条数据
    public interface Create {
        // 将key, value写入client端内存，可以连续调用put
        public Create put(String key, Object value) throws Exception;
        // 该接口最终将client端的key-value(s)写入AbleCloud的存储服务
        public void execute() throws Exception;
    }

    // 查找数据
    public interface Find {
        // 设置查找的keys，可以不调用。如果不掉用select，则
        // 返回primary key所对应的所有attributes
        public Find select(String... keys);
        // 该接口最终从AbleCloud的存储服务进行查找并返回数据
        public ACObject execute() throws Exception;
    }

    // 删除数据
    public interface Delete {
        // 该接口最终从AbleCloud的存储服务中删除数据
        public void execute() throws Exception;
    }

    // 批量删除数据
    public interface BatchDelete {
        // 设置第一个用于删除的条件过滤器，不允许重复调用
        public BatchDelete where(ACFilter filter);
        // 追加设置一个条件过滤器，与之前过滤器的关系是“且”，必须在where之后调用
        // 注意在追加过滤器时，and的优先级高于or
        public BatchDelete and(ACFilter filter);
        // 追加设置一个条件过滤器，与之前过滤器的关系是“或”，必须在where之后调用
        public BatchDelete or(ACFilter filter);
        // 该接口最终从AbleCloud的存储服务中删除数据
        public void execute() throws Exception;
    }

    // 更新数据
    public interface Update {
        // 将已存在的key设置新的value值，可以连续调用put
        public Update put(String key, Object value);
        // 该接口最终将client端的key-value(s)写入AbleCloud的存储服务
        public void execute() throws Exception;
    }

    // 批量更新数据
    public interface BatchUpdate {
        // 设置第一个用于更新的条件过滤器，不允许重复调用
        public BatchUpdate where(ACFilter filter);
        // 追加设置一个条件过滤器，与之前过滤器的关系是“且”，必须在where之后调用
        // 注意在追加过滤器时，and的优先级高于or
        public BatchUpdate and(ACFilter filter);
        // 追加设置一个条件过滤器，与之前过滤器的关系是“或”，必须在where之后调用
        public BatchUpdate or(ACFilter filter);
        // 将某一列设置为一个值，key为列名，value的类型与列的类型要匹配
        public BatchUpdate set(String key, Object value);
        // 将某一列加上一个值，key为列名，value的类型与列的类型要匹配，仅支持整数和符点数
        public BatchUpdate inc(String key, Object value);
        // 将某一列减去一个值，key为列名，value的类型与列的类型要匹配，仅支持整数和符点数
        public BatchUpdate dec(String key, Object value);
        // 该接口最终从ablecloud的存储服务中更新数据
        public void execute() throws Exception;
    }

    // 替换数据，和update的区别是，update只能更改已经存在的attributes，而
    // replace可以设置全新的attributes
    public interface Replace {
        // 同Create的put
        public Replace put(String key, Object value);
        // 同Create的execute
        public void execute() throws Exception;
    }

    // 扫描数据，注意每次查询最多返回1000条结果
    public interface Scan {
        // 设置需要返回的keys，类似find的select
        public Scan select(String... keys);
        // 设置扫描的起始点，需传入除entity group key之外的primary keys
        // 不调用该接口默认从头开始扫描
        public Scan start(Object... primaryKeys) throws Exception;
        // 设置扫描的结束点，需传入除entity group key之外的primary keys
        // （end需要和start一起使用，不能单独出现）
        public Scan end(Object... primaryKeys) throws Exception;
        // 设置扫描的offset,默认为0
        public Scan offset(int number);
        // 设置扫描数据最大值
        public Scan limit(int number);
        // 设置第一个查询过滤器，不允许重复调用
        public Scan where(ACFilter filter);
        // 追加设置一个查询过滤器，与之前过滤器的关系是“且”，必须在where之后调用
        // 注意在追加过滤器时，and的优先级高于or
        public Scan and(ACFilter filter);
        // 追加设置一个查询过滤器，与之前过滤器的关系是“或”，必须在where之后调用
        public Scan or(ACFilter filter);
        // 按照参数列表中的顺序，对各字段进行正向排序，可重复调用
        public Scan orderByAsc(String... keys);
        // 按照参数列表中的顺序，对各字段进行逆向排序，可重复调用
        public Scan orderByDesc(String... keys);
        // 按照参数列表中的顺序，对各字段进行分组，可重复调用
        public Scan groupBy(String... keys);
        // 统计结果集或者其中各个分组的记录数量
        public Scan count();
        // 按照参数列表中的顺序，对各字段在结果集或者各分组中的值分别统计求和，结果值将以Double型呈现
        public Scan sum(String... keys);
        // 按照参数列表中的顺序，对各字段在结果集或者各分组中的值分别统计求平均值，结果值将以Double型呈现
        public Scan avg(String... keys);
        // 按照参数列表中的顺序，对各字段在结果集或者各分组中的值分别统计求最大值
        public Scan max(String... keys);
        // 按照参数列表中的顺序，对各字段在结果集或者各分组中的值分别统计求最小值
        public Scan min(String... keys);
        // 该接口最终从AbleCloud的存储服务中扫描数据，返回数据列表。
        public List<ACObject> execute() throws Exception;
    }

    // 基于entity group key（分区键）的全表扫描，每次处理一个数据分区的数据并返回结果集。
	//<font color = "red">注意：</font>FullScan会对数据库产生很大的压力，因此只允许在后台任务中使用。严禁在UDS中调用该接口。如果要在UDS中使用类似功能，请使用“scan”接口。
    public interface FullScan {
        // 设置需要返回的keys，类似find的select
        public FullScan select(String... keys);
        // 设置扫描的起始点，需传入除entity group key之外的primary keys
        // 不调用该接口默认从头开始扫描（start和end至少需要调用一个）
        public FullScan start(Object... primaryKeys) throws Exception;
        // 设置扫描的结束点，需传入除entity group key之外的primary keys
        // 不掉用该接口默认扫描到末尾（start和end至少需要调用一个）
        public FullScan end(Object... primaryKeys) throws Exception;
        // 设置扫描数据最大值
        public FullScan limit(int number);
        // 设置第一个查询过滤器，不允许重复调用
        public FullScan where(ACFilter filter);
        // 追加设置一个查询过滤器，与之前过滤器的关系是“且”，必须在where之后调用
        // 注意在追加过滤器时，and的优先级高于or
        public FullScan and(ACFilter filter);
        // 追加设置一个查询过滤器，与之前过滤器的关系是“或”，必须在where之后调用
        public FullScan or(ACFilter filter);
        // 按照参数列表中的顺序，对各字段进行正向排序，可重复调用
        public FullScan orderByAsc(String... keys);
        // 按照参数列表中的顺序，对各字段进行逆向排序，可重复调用
        public FullScan orderByDesc(String... keys);
        // 按照参数列表中的顺序，对各字段进行分组，可重复调用
        public FullScan groupBy(String... keys);
        // 统计结果集或者其中各个分组的记录数量
        public FullScan count();
        // 对各字段在结果集或者各分组中的值分别统计求和，结果值将以Double型呈现，参数顺序不敏感
        public FullScan sum(String... keys);
        // 对各字段在结果集或者各分组中的值分别统计求平均值，结果值将以Double型呈现，参数顺序不敏感
        public FullScan avg(String... keys);
        // 对各字段在结果集或者各分组中的值分别统计求最大值，参数顺序不敏感
        public FullScan max(String... keys);
        // 对各字段在结果集或者各分组中的值分别统计求最小值，参数顺序不敏感
        public FullScan min(String... keys);
        // 该接口最终从AbleCloud的存储服务中扫描数据，返回各分区的数据游标供调用者使用
        public ACIterator execute() throws Exception;
    }

    // 简单全表扫描，基于用户每次设定的limit
	//	//<font color = "red">注意：</font>FullScan会对数据库产生很大的压力，因此只允许在后台任务中使用。严禁在UDS中调用该接口。如果要在UDS中使用类似功能，请使用“scan”接口。
    public interface SimpleFullScan {
        // 设置需要返回的keys，类似find的select
        public SimpleFullScan select(String... keys);
        // 设置第一个查询过滤器，不允许重复调用
        public SimpleFullScan where(ACFilter filter);
        // 追加设置一个查询过滤器，与之前过滤器的关系是“且”，必须在where之后调用
        // 注意在追加过滤器时，and的优先级高于or
        public SimpleFullScan and(ACFilter filter);
        // 追加设置一个查询过滤器，与之前过滤器的关系是“或”，必须在where之后调用
        public SimpleFullScan or(ACFilter filter);
        // 该接口最终从AbleCloud的存储服务中扫描数据，返回数据游标供调用者使用，调用者需要每次给定一个数据条数limit
        public ACRowIterator execute() throws Exception;
    }

    /**
     * 创建数据写入对象
     * @param primaryKeys   完整的primary keys包括entity group keys
     *
     * @notice  不定参数primaryKeys可以有两种形态，如果是key-value对的方式
     *          k-v必须是成对出现。也可以传入一个ACObject对象，此时只能传入
     *          一个参数，并且ACObject对象中需要将所有的primary key的value
     *          值put进去。
     * @return
     */
    public abstract Create create(Object... primaryKeys);

    /**
     * 创建数据查找对象
     * @param primaryKeys   同create的参数primaryKeys
     * @return
     */
    public abstract Find find(Object... primaryKeys);

    /**
     * 创建数据删除对象
     * @param primaryKeys   同create的参数primaryKeys
     * @return
     */
    public abstract Delete delete(Object... primaryKeys);

    /**
     * 创建数据批量删除对象
     * @param entityKeys    完整的entity group keys
     * @notice  不定参数entityKeys可以有两种形态，如果是key-value对的方式
     *          k-v必须是成对出现。也可以传入一个ACObject对象，此时只能传入
     *          一个参数，并且ACObject对象中需要将所有的entity group key的
     *          value值put进去。
     * @return
     */
    public abstract BatchDelete batchDelete(Object... entityKeys);

    /**
     * 创建数据更新对象
     * @param primaryKeys   同create的参数primaryKeys
     * @return
     */
    public abstract Update update(Object... primaryKeys);

    /**
     * 创建数据替换对象
     * @param primaryKeys   同create的参数primaryKeys
     * @return
     */
    public abstract Replace replace(Object... primaryKeys);

    /**
     * 创建数据扫描对象
     * @param entityKeys    对于已分区的数据集，需要传入完整的entity group keys；
     *                      对于未分区的数据集，不需要传入任何参数；
     * @notice  不定参数entityKeys可以有两种形态，如果是key-value对的方式
     *          k-v必须是成对出现。也可以传入一个ACObject对象，此时只能传入
     *          一个参数，并且ACObject对象中需要将所有的entity group key的
     *          value值put进去。
     * @return
     */
    public abstract Scan scan(Object... entityKeys);

    /**
     * 创建全表数据扫描对象，基于数据分区
     * @return
     */
    public abstract FullScan fullScan();

    /**
     * 创建简单全表数据扫描对象
     * @return
     */
    public abstract SimpleFullScan simpleFullScan();
}
```

<font color=red>务必注意</font>：全表扫描FullScan操作非常消耗资源，建议只在后台做离线的定时任务用。为了保证在线用户数据访问的高可用性，会限制线上服务直接使用这样的接口；另外，全表数据扫描接口FullScan只能保证扫描结果在分区内的是有序的，而不能保证其在全局内有序

###ACIterator：
FullScan操作的游标。
```java
public class ACIterator {
    // 从游标中取出下一份数据结果集，每一份结果集对应一个分区键
    public List<ACObject> next() throws Exception;

    // 获取游标当前所在的分区键
    public ACObject currentEntityGroup();
}
```
><font color=red>注意</font>：ACIterator仅用于分区数据集。对于未分区的数据集，请直接使用Scan接口。

##单元测试接口说明
测试过程如果用到了AbleCloud云端存储，也会在云端存储中存储一些测试用的数据。在每次单元测试执行前（junit的@Before或@BeforClass）或执行后（junit的@After或@AfterClass），可对测试数据进行清理。该类便提供了创建/删除数据集（类似于table）的功能。接口定义如下：
```java
public interface ACStoreForTest {
    /**
     * 创建一个class
     */
    public interface CreateClass {
        public CreateClass addEntityGroupKey(String attrName, long attrType) throws Exception;
        public CreateClass addPrimaryKey(String attrName, long attrType) throws Exception;
        public void execute() throws Exception;
    }

    /**
     * 删除一个class
     */
    public interface DeleteClass {
        public void execute() throws Exception;
    }

    /**
     * 创建一个class
     * @param className     要创建的class名
     * @return
     */
    public abstract ACStoreForTest.CreateClass createClass(String className);

    /**
     * 删除一个class
     * @param className     要删除的class名
     * @return
     */
    public abstract ACStoreForTest.DeleteClass deleteClass(String className);
}
```

#推送服务接口
该服务用于向当前设备的拥有者（owner）或所有用户发送推送消息（App端）。
##获取方式
```java
ACNotificationMgr notificationMgr = ac.notificationMgr(ac.newContext());
```
><font color="red">注意</font>：此处使用开发者上下文，即`ac.newContext()`。

##接口说明
```java
public interface ACNotificationMgr {
    //通知绑定该设备的所有用户
    public static long NOTIFY_ALL_USER = 0;
    //通知绑定该设备的管理员
    public static long NOTIFY_OWNER    = 1;

    /**
     * 向当前设备owner或所有用户App发送通知
     * @param deviceId 逻辑id
     * @param userType 指定向当前设备的owner还是所有用户发送消息
     * @param notification 指定通知标题/内容/是否振动、响铃、呼吸灯/通知点击后的动作
     * @throws Exception
     */
    public void sendNotification(long deviceId, long userType, ACNotification notification) throws Exception;

    /**
     * 向指定用户发送通知
     * @param userList 用户id列表
     * @param notification 指定通知标题/内容/是否振动、响铃、呼吸灯/通知点击后的动作
     * @throws Exception
     */
    public void sendNotification(List<Long> userList, ACNotification notification) throws Exception;
}
```

##单元测试接口说明
```java
public interface ACNotificationMgrForTest extends ACNotificationMgr {

    /**
     * 添加一个测试用推送账号数据
     * @name  name        推送名称（用户自定义，不为空即可）
     * @param channel     推送渠道（友盟YM/信鸽XG）
     * @param platform    推送平台（android/ios)
     * @param accessId    用户access id
     * @param accessKey   用户access key
     * @param secretKey   用户secret key
     * @return
     * @throws Exception
     */
    public void addNotifyInfo(String name, String channel, String platform, String accessId, String accessKey, String secretKey, Boolean isDevMode) throws Exception;

    /**
     * 清除所有推送帐号数据
     * 注意：测试环境有效，正式环境不允许，请慎重使用
     * @throws Exception
     */
    public void cleanAll() throws Exception;
}
```

##数据结构说明
```java
public class ACNotification {
    public static final long GO_APP = 0;
    public static final long GO_URL = 1;
    public static final long GO_ACTIVITY = 2;

    public static final long NOTIFICATION = 0;
    public static final long MESSAGE = 1;

    // 通知显示类型
    // NOTIFICATION:通知，MESSAGE:自定义消息
    private long displayType;

    // 通知标题,必填
    private String title;

    // 通知内容,必填
    private String content;

    // 是否振动
    private boolean vibrate;

    // 是否呼吸灯
    private boolean lights;

    // 是否响铃
    private boolean sound;

    // 点击通知时的动作类型
    // GO_APP:跳转到APP, GO_URL:跳转到指定url, GO_ACTIVITY:跳转到指定activity
    private long openType;

    // 当openType为GO_URL时指定url地址
    private String url;

    // 当openType为GO_ACTIVITY时指定activity
    private String activity;

    // 用户自定义数据
    private Map<String, String> userData;

    // 本地化自定义格式（用于多地域、多国语言推送功能）
    private String locKey;

    // 本地化自定义参数（用于多地域、多国语言推送功能）
    private List<String> locArgs;

    // 初始化
    public ACNotification() {
        this.displayType = NOTIFICATION;
        this.title = "";
        this.content = "";
        this.vibrate = true;
        this.lights = true;
        this.sound = true;
        this.openType = GO_APP;
        this.url = "";
        this.activity = "";
        this.userData = new HashMap();
        this.locKey = "";
        this.locArgs = new ArrayList();
    }

    // 初始化
    public ACNotification(String title, String content) {
        this.displayType = NOTIFICATION;
        this.title = title;
        this.content = content;
        this.vibrate = true;
        this.lights = true;
        this.sound = true;
        this.openType = GO_APP;
        this.url = "";
        this.activity = "";
        this.userData = new HashMap();
        this.locKey = "";
        this.locArgs = new ArrayList();
    }
```
><font color=red>注意：</font>`title`跟`content`为必填项，其它为可选项。

#文件相关接口
该服务接口用于通过云端服务管理文件数据，如用户的头像文件等。

**注意：当前版本的ACFileMgr适用于直接连接互联网的服务器环境，而不适于在UDS中使用。**

##获取方式
```java
ACFileMgr fileMgr = ac.fileMgr(ACContext context);
```
><font color="red">注意</font>：此处应该传用户上下文，即`req.getContext()`。

##接口说明
```java
public interface ACFileMgr {

    /**
     * 获取文件的访问/下载URL。
     *
     * @param bucket        要访问/下载的文件在云端所属的类别的名字。
     * @param name          要访问/下载的文件在云端的名字。
     * @param expireTime    所获取的访问/下载URL的有效时长。单位为秒。如果取值为小于或等于0,表示不限定有效期。
     * @return              指定文件的访问/下载URL。
     * @throws Exception    获取文件访问/下载URL失败时抛出异常。
     */
    public String getDownloadUrl(String bucket, String name, long expireTime) throws Exception;

    /**
     * 上传文件至云端。云端使用七牛或AWS由所对应的AC-BlobStore服务决定。
     *
     * @param filePath      要被上传的文件的本地路径。
     * @param bucket        文件上传后在云端所属的类别的名字。
     * @param name          文件上传后在云端所使用的文件名（包括文件扩展名）。如不指定（null或空字符串），则表示使用从filePath中提取的文件名字。
     * @param acl           文件的访问权限。如果为null，则使用缺省值。
     * @throws Exception    上传文件失败时抛出异常。
     */
    public void uploadFile(String filePath, String bucket, String name, ACACL acl) throws Exception;
}
```

##数据结构说明

文件的访问权限。

```java
public class ACACL {

    /**
     * 用户类型
     * <p/>
     * USER：终端用户，DEVELOPER：开发者
     */
    public enum UserType {
        USER,
        DEVELOPER
    }

    public enum OpType {
        READ("read"),
        WRITE("write");

        public String type;

        OpType(String type) {
            this.type = type;
        }
    }

    public static String readTag = "read";
    public static String writeTag = "write";

    private boolean isPublicReadAllow;    // 缺省为true。
    private boolean isPublicWriteAllow;   // 缺省为true。

    private ACObject userAccessObj;
    private ACObject userDenyObj;

    public ACACL();

    // 设置全局访问权限
    public void setPublicReadAccess(boolean allow);
    public void setPublicWriteAccess(boolean allow);

    // 设置用户访问权限（白名单）
    public void setUserAccess(OpType opType, UserType userType, long user);
    public void unsetUserAccess(OpType opType, UserType userType, long user);

    // 设置用户访问权限（黑名单）
    public void setUserDeny(OpType opType, UserType userType, long user);
    public void unsetUserDeny(OpType opType, UserType userType, long user);

    // 检查用户读权限，先检查黑名单，再检查白名单
    public boolean isReadAllowed(UserType userType, Long user);

    // 检查用户写权限
    public boolean isWriteAllowed(UserType userType, Long user);

    // 辅助函数
    public boolean isAllowed(UserType userType, Long user, OpType opType);

    public ACObject toObject();
}
```

#短信服务接口
该服务用于向当前注册用户发送短信消息。
##获取方式
```java
ACSmsMgr smsMgr = ac.smsMgr(ac.newContext());
```
><font color="red">注意</font>：此处使用开发者上下文，即`ac.newContext()`。

##接口说明
```java
public interface ACSmsMgr {
    /**
     * 向注册用户发送短信通知
     * @param userList 用户Id列表, 每次最多发送给50名用户
     * @param templateId 模版Id
     * @param content 短信内容: 用于替换模板中{数字}，若有多个替换内容，用英文逗号隔开即可
     * @throws Exception
     */
    public void sendSmsByUserList(List<Long> userList, int templateId, String content) throws Exception;
}
```

#定时服务接口
该服务用于定时向设备下发消息。

##获取方式
```java
ACTimerTaskMgr timerMgr = ac.timerTaskMgr(ACContext context);
```
><font color="red">注意</font>：此处应该使用用户上下文，即`req.getContext()`，单测中使用`ac.newContext(userId)`。

##接口说明
```java
public interface ACTimerTaskMgr {

    /**
     * 添加一个新定时任务。
     *
     * @param task 新定时任务。
     * @return ACTimerTask 包含taskId
     * @throws Exception
     */
    public ACTimerTask addTask(ACTimerTask task) throws Exception;


    /**
     * 修改指定的定时任务。
     *
     * @param taskId 要被修改的任务的ID。
     * @param task   任务的新内容。
     * @throws Exception
     */
    public void modifyTask(long taskId, ACTimerTask task) throws Exception;

    /**
     * 取用户针对某设备定制的定时任务。
     *
     * @param deviceId 设备的逻辑ID。
     * @return 返回用户（userId）针对设备（deviceId）设置的所有定时任务的列表。
     * @throws Exception
     */
    public ArrayList<ACTimerTask> listTasks(long deviceId) throws Exception;

    /**
     * 删除一个定时任务。
     *
     * @param deviceId 要被删除的任务所关联的设备的逻辑ID。
     * @param taskId   要被删除的任务的ID。
     * @throws Exception
     */
    public void deleteTask(long deviceId, long taskId) throws Exception;

    /**
     * 停止一个定时任务。
     *
     * @param deviceId 要被停止的任务所关联的设备的逻辑ID。
     * @param taskId   要被停止的任务的ID。
     * @throws Exception
     */
    public void stopTask(long deviceId, long taskId) throws Exception;

    /**
     * 启动一个定时任务。
     *
     * @param deviceId 要被启动的任务所关联的设备的逻辑ID。
     * @param taskId   要被启动的任务的ID。
     * @throws Exception
     */
    public void startTask(long deviceId, long taskId) throws Exception;
}
```

##单元测试接口说明
```java
public interface ACTimerTaskMgrForTest {

    /**
     * 清除所有定时任务
     * 注意：测试环境有效，正式环境不允许，请慎重使用
     * @throws Exception
     */
    public void cleanAll() throws Exception;
}
```

##数据结构说明
```java
public class ACTimerTask {
    private String name;            // 任务的名字。
    private String description;     // 该任务的描述信息。
    private Calendar timePoint;     // 初次执行该任务的时间。周期任务的周期执行时间也以此时间为基准。
    private String timeCycle;       // 该任务的定时规则。
    private long userId;            // 定义该任务的用户的ID。
    private long deviceId;          // 该任务要操作的设备的逻辑ID。
    private ACDeviceMsg devMsg;     // 执行该任务时，要发送给设备的消息。
    private long taskFlag;          // 标记是使用云端定时还是设备端定时：0 - 云端定时；1 - 设备端定时。

    private long taskId;            // 任务的ID。由云端分配。
    private byte status;            // 任务的状态：0 - 已停止；1 - 已启动；2 - 已冻结。
    private String createTime;      // 任务的创建时间。
    private String modifyTime;      // 任务的更新时间。

    public ACTimerTask() {
        this.timePoint = Calendar.getInstance();
        this.devMsg = new ACDeviceMsg();
    }

    /**
     * 设置任务的名字。
     *
     * @param name 任务的名字。
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 取任务的名字。
     *
     * @return 返回任务的名字。
     */
    public String getName() {
        return this.name;
    }

    /**
     * 设置任务的描述信息。
     *
     * @param description 任务的描述信息。
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * 取任务的描述信息。
     *
     * @return 返回任务的描述信息。
     */
    public String getDescription() {
        return this.description;
    }

    /**
     * 设置初次执行该任务的时间。周期任务的周期执行时间也以此时间为基准。
     *
     * @param timePoint 初次执行该任务的时间。
     */
    public void setTimePoint(Calendar timePoint) {
        this.timePoint = timePoint;
    }

    /**
     * 取初次执行任务的时间。周期任务的周期执行时间也以此时间为基准。
     *
     * @return 返回初次执行该任务的时间。
     */
    public Calendar getTimePoint() {
        return this.timePoint;
    }

    /**
     * 设置任务的定时规则。
     *
     * @param timeCycle 任务的周期执行规则。
     *                  once - 单次执行任务；；
     *                  hour - 每隔一小时执行一次；
     *                  day  - 每隔一天执行一次；
     *                  month - 每隔一个月执行一次；
     *                  year - 每隔一年执行一次；
     *                  week - 指定每周的某一天或某几天执行一次。如week[0,1,2,3,4,5,6]表示周日至周六每天都执行一次；week[1,3,6]表示每周一、周三、周六各执行一次。每天执行的时间以ACTimerTask.timePoint指定的时间（忽略年-月-日）为准。
     * @return 无
     */
    public void setTimeCycle(String timeCycle) {
        this.timeCycle = timeCycle;
    }

    /**
     * 取本任务的定时规则。
     *
     * @return 返回本任务的定时规则。
     */
    public String getTimeCycle() {
        return this.timeCycle;
    }

    /**
     * 制定本任务的用户。
     *
     * @param userId 制定本任务的用户的ID。
     */
    public void setUser(long userId) {
        this.userId = userId;
    }

    /**
     * 取制定本任务的用户的ID。
     *
     * @return 制定本任务的用户的ID。
     */
    public long getUser() {
        return this.userId;
    }

    /**
     * 设置本任务要操作的设备。
     *
     * @param deviceId 要操作的设备的逻辑ID。
     */
    public void setDevice(long deviceId) {
        this.deviceId = deviceId;
    }

    /**
     * 取本任务要操作的设备。
     *
     * @return 返回本任务要操作的设备的逻辑ID。
     */
    public long getDevice() {
        return this.deviceId;
    }

    /**
     * 设置任务执行时要发送给设备的消息。
     *
     * @param msg 任务执行时要发送给设备的消息。
     */
    public void setDeviceMessage(ACDeviceMsg msg) {
        this.devMsg = msg;
    }

    /**
     * 取任务执行时，要发送给设备的消息。
     *
     * @return 返回任务执行时要发送给设备的消息。
     */
    public ACDeviceMsg getDeviceMessage() {
        return this.devMsg;
    }

    /**
     * 设置任务的ID。该ID由云端分配。
     *
     * @param taskId
     */
    public void setTaskId(long taskId) {
        this.taskId = taskId;
    }

    /**
     * 取任务的ID。
     *
     * @return 返回本任务的ID。
     */
    public long getTaskId() {
        return this.taskId;
    }

    /**
     * 设置任务的状态。
     *
     * @param status 任务的状态：0 - 已停止；1 - 已启动；2 - 已冻结。
     */
    public void setStatus(byte status) {
        this.status = status;
    }

    /**
     * 获取任务的状态。
     *
     * @return 返回任务的状态码：0 - 已停止；1 - 已启动；2 - 已冻结。
     */
    public byte getStatus() {
        return this.status;
    }

    /**
     * 设置任务的创建时间。
     *
     * @param timeString 任务的创建时间。
     */
    public void setCreateTime(String timeString) {
        this.createTime = timeString;
    }

    /**
     * 取任务的创建时间。
     *
     * @return 返回本任务的创建时间。
     */
    public String getCreateTime() {
        return this.createTime;
    }

    /**
     * 设置任务的修改时间。
     *
     * @param timeString 任务的修改时间。
     */
    public void setModifyTime(String timeString) {
        this.modifyTime = timeString;
    }

    /**
     * 取任务的更新时间。
     *
     * @return 返回任务的更新时间。
     */
    public String getModifyTime() {
        return this.modifyTime;
    }

    /**
     * 设置是使用云端定时还是使用设备端定时。
     * @details 云端定时表示该任务由云端的定时器驱动；设备端定时表示该任务由设备端的定时器驱动。
     * @param taskFlag 为0时表示使用云端定时，为其它值时表示使用设备端定时。
     */
    public void setTaskFlag(long taskFlag) {
        if (taskFlag != 0)
            this.taskFlag = 1;
        else
            this.taskFlag = 0;
    }

    /**
     * 检查定时任务是使用云端定时还是使用设备端定时。
     * @return 返回0表示设备使用云端定时，返回1表示设备使用设备端定时。
     */
    public long getTaskFlag() {
        if (this.taskFlag != 0)
            return 1;
        else
            return 0;
    }
}
```

#天气服务接口
该服务用于获取到室外的pm2.5, AQI(空气质量)以及天气状况等信息.

##获取方式
```java
ACWeatherMgr weatherMgr = ac.weatherMgr(ACContext context);
```
><font color="red">注意</font>：此处应该使用开发者上下文即可，即`ac.newContext()`。

##接口说明
```java
public interface ACWeatherMgr {

    /**
     * 获取最新的PM25值
     *
     * @param area 地区,如北京,只支持地级市
     */
    public ACPM25 getLatestPM25(String area) throws Exception;

    /**
     * 获取最近n天的PM25值
     *
     * @param area 地区,如北京,只支持地级市
     * @param day  最近n天,n最大为7,0表示7天
     */
    public List<ACPM25> getLastDaysPM25(String area, int day) throws Exception;

    /**
     * 获取最近n小时的PM25值
     *
     * @param area 地区
     * @param hour 最近n个小时(0-24),0表示24小时
     */
    public List<ACPM25> getLastHoursPM25(String area, int hour) throws Exception;

    /**
     * 获取最新的空气质量值
     *
     * @param area 地区
     */
    public ACAQI getLatestAqi(String area) throws Exception;

    /**
     * 获取最近n天的空气质量值
     *
     * @param area 地区
     * @param day  最近n天,n最大为7,0表示7天
     */
    public List<ACAQI> getLastDaysAqi(String area, int day) throws Exception;

    /**
     * 获取最近n小时的空气质量值
     *
     * @param area 地区
     * @param hour 最近n个小时(0-24),0表示24小时
     */
    public List<ACAQI> getLastHoursAqi(String area, int hour) throws Exception;

    /**
     * 获取最新的温湿度
     *
     * @param area 地区
     */
    public ACWeather getLatestWeather(String area) throws Exception;

    /**
     * 获取最近n天的温湿度
     *
     * @param area 地区
     * @param day  最近n天,n最大为7,0表示7天
     */
    public List<ACWeather> getLastDaysWeather(String area, int day) throws Exception;

    /**
     * 获取最近n小时的温湿度
     *
     * @param area 地区
     * @param hour 最近n个小时(0-24),0表示24小时
     */
    public List<ACWeather> getLastHoursWeather(String area, int hour) throws Exception;
}
```

##数据结构说明
PM2.5相关信息的结构说明:

```java
public class ACPM25 {
    /**
     * 时间,字符串格式
     *
     * 获取最新pm25时间格式为"yyyy-MM-dd HH:mm:ss"
     * 获取最近几天时间格式为"yyyy-MM-dd"
     * 获取最近几小时时间格式为"yyyy-MM-dd HH"
     */
    public String timestamp;
    //pm25平均值
    public int avg;
    //pm25最小值
    public int min;
    //pm25最大值
    public int max;

    public ACPM25(String timestamp, int avg, int min, int max) {
        this.timestamp = timestamp;
        this.avg = avg;
        this.min = min;
        this.max = max;
    }
}
```

空气质量相关信息的结构说明:

```java
public class ACAQI {
    /**
     * 时间,字符串格式
     *
     * 获取最新空气质量时间格式为"yyyy-MM-dd HH:mm:ss"
     * 获取最近几天时间格式为"yyyy-MM-dd"
     * 获取最近几小时时间格式为"yyyy-MM-dd HH"
     */
    String timestamp;
    //空气质量
    int AQI;
    //最低空气质量
    int minAQI;
    //最高空气质量
    int maxAQI;

    public ACAQI(int AQI, int minAQI, int maxAQI, String timestamp) {
        this.AQI = AQI;
        this.minAQI = minAQI;
        this.maxAQI = maxAQI;
        this.timestamp = timestamp;
    }
}
```

温湿度相关信息的结构说明:

```java
public class ACWeather {
    /**
     * 时间,字符串格式
     *
     * 获取最新天气时间格式为"yyyy-MM-dd HH:mm:ss"
     * 获取最近几天时间格式为"yyyy-MM-dd"
     * 获取最近几小时时间格式为"yyyy-MM-dd HH"
     */
    String timestamp;
    //温度
    double temperature;
    //最低温度
    double minTemperature;
    //最高温度
    double maxTemperature;
    //湿度
    int humidity;
    //最低湿度
    int minHumidity;
    //最高湿度
    int maxHumidity;

    public ACWeather(String timestamp, double temperature, double minTemperature, double maxTemperature, int humidity, int minHumidity, int maxHumidity) {
        this.timestamp = timestamp;
        this.temperature = temperature;
        this.minTemperature = minTemperature;
        this.maxTemperature = maxTemperature;
        this.humidity = humidity;
        this.minHumidity = minHumidity;
        this.maxHumidity = maxHumidity;
    }
}
```

#设备管理接口
该服务提供了入库设备的查询接口。

##获取方式
```java
ACWarehouseMgr warehouseMgr = ac.warehouseMgr(ACContext context);
```
><font color="red">注意</font>：此处使用开发者上下文即可，即`ac.newContext()`。

##接口说明
```java
public interface ACWarehouseMgr {

    /**
     * 查询已入库设备的数目。
     *
     * @param subDomain 要查寻的设备所属的子域的名字。可以为NULL或空字符串，表示不区分子域。
     * @return 返回设备数目。
     * @throws Exception
     */
    public long getDeviceCount(String subDomain) throws Exception;

    /**
     * 批量查询设备信息。
     *
     * @param subDomain 要查寻的设备所属的子域的名字。可以为NULL或空字符串，表示不区分子域。
     * @param offset    参数offset和limit用于指定查询的列表范围，实现“分页”的效果。
     *                  offset是从0开始的偏移量，表示返回设备列表中从第offset位置开始的共limit个设备的信息。
     * @param limit     参数limit和offset用于指定查询的列表范围，实现“分页”的效果。
     *                  limit是正整数，表示返回设备列表中从第offset位置开始的共limit个设备的信息。
     * @return          返回设备列表。
     */
    public List<ACDeviceInfo> listDevices(String subDomain, long offset, long limit) throws Exception;

    /**
     * 查询设备信息。
     *
     * @param physicalDeviceId  拟查询的设备的物理ID。
     * @return 设备的信息。
     * @throws Exception
     */
    public ACDeviceInfo getDeviceInfo(String physicalDeviceId) throws Exception;

    /**
     * 批量查询设备信息。
     *
     * @param physicalDeviceIds 拟查询的设备的物理ID组成的数组。
     * @return 设备的信息。
     * @throws Exception
     */
    public List<ACDeviceInfo> getDevicesInfo(List<String> physicalDeviceIds) throws Exception;
}
```

##数据结构说明
设备信息的数据结构。
```java
/**
 * 设备的信息。
 */
public class ACDeviceInfo {

    public ACDeviceInfo();

    /// 设备所属的主域的ID。
    public void setMajorDomain(String name);
    public String getMajorDomain();

    /// 设备所属的子域的ID。
    public void setSubDomain(String name);
    public String getSubDomain();

    /// 设备的物理ID。
    public void setPhysicalId(String id);
    public String getPhysicalId();

    public void setType(String t);
    public String getType();

    /// 设备的IP地址。
    public void setIPAddress(String ip);
    public String getIPAddress();

    /// 设备的MAC地址。
    public void setMacAddress(String mac);
    public String getMacAddress();

    /// 设备的MCU固件版本。
    public void setDevVersion(String version);
    public String getDevVersion();

    /// 设备的通信模块版本。
    public void setModVersion(String version);
    public String getModVersion();

    /// 设备的激活时间。格式为：YYYY-MM-DD HH:mm:ss。
    public void setActiveTime(String time);
    public String getActiveTime();

    /// 设备最近一次上线时间。格式为：YYYY-MM-DD HH:mm:ss。
    public void setLastOnlineTime(String time);
    public String getLastOnlineTime();

    /// 设备所处地理位置信息：所在国家。
    public void setCountry(String name);
    public String getCountry();

    /// 设备所处地理位置信息：所在省份。
    public void setProvince(String name);
    public String getProvince();

    /// 设备所处地理位置信息：所在城市。
    public void setCity(String name);
    public String getCity();

    /// 设备所处地理位置信息：所在街道。
    public void setStreet(String name);
    public String getStreet();

    /// 设备状态：0-不存在；1-未激活；2-激活。
    public void setStatus(int status);
    public int getStatus();
}
```

#测试桩
在开发较大型项目时，通常会多个系统/模块并行开发。这多个系统/模块又相互依赖，例如上游程序相对简单，开发进度较快即将进入测试阶段，而其所依赖的下游服务还在开发之中。此时不能等着下游完全就绪后才开始测试。上游的开发人员一般会写桩程序（stub）用以模拟下游的简单实现，以使得上游程序能顺利的进行单元测试或模块测试。
开发者基于AbleCloud的服务开发框架开发的服务既可能会和设备交互，也可能会和另外的服务交互，因此AbleCloud的服务开发框架支持两类桩：

+ **设备桩：**模拟一个智能设备，对服务发过来的命令/消息做出响应。
+ **服务桩：**模拟一个服务，对当前服务发过来的消息做出响应。

##设备桩
设备桩的目的是为了模拟设备，对服务发来的请求做出响应，因此设备桩只定义了一个处理请求并做出响应的接口。如下所示：

```java
public abstract  class ACDeviceStub {
    public abstract void handleControlMsg(String majorDomain, String subDomain,
                                          ACDeviceMsg req, ACDeviceMsg resp) throws Exception;
}
```

##服务桩
服务桩的定义和真正的服务开发类似，开发者需要实现其中的`handleMsg(ACMsg req, ACMsg resp)`接口以模拟服务提供的功能。

```java
public abstract class ACServiceSub {

    /**
     * 服务桩，处理Service-->Service之间的交互消息
     *
     * @param req  请求消息体
     * @param resp 响应消息体
     * @throws Exception
     */
    public abstract void handleMsg(ACMsg req, ACMsg resp) throws Exception;
}
```

><font color="red">**注：**无论是设备桩，还是服务桩，仅在测试（**test**）模式生效，正式生产（**production**）环境无效。</font>


#附录
##签名算法
```java
public class ACSigner {
    private static final Logger logger = LoggerFactory.getLogger(ACSigner.class);
    private static final String ENCODING = "UTF-8";
    private static final String HASH = "HmacSHA256";

    /**
     * 获取用于签名字符串
     *
     * @param developerId 开发者id
     * @param majorDomain 主域名
     * @param subDomain   子域名
     * @param method      接口方法名(即ACMsg里对应的name)
     * @param timestamp   当前时间，单位秒
     * @param timeout     签名有效期，单位秒
     * @param nonce       随机16位字符串
     */
    public static String genSignString(long developerId, String majorDomain,
                                       String subDomain, String method,
                                       long timestamp, long timeout, String nonce) {
        String stringToSign = String.valueOf(timeout) +
                    String.valueOf(timestamp) +
                    nonce +
                    String.valueOf(developerId) +
                    method +
                    majorDomain +
                    subDomain;
        return stringToSign;
    }

    /**
     * 获取X-Zc-Developer-Signature的签名值
     *
     * @param sk 开发密钥对，与ak对应，从控制台-->服务管理-->开发密钥-->Secrety Key获取
     * @param stringToSign 由上面函数获取
     */
    public static String genSignature(String sk, String stringToSign) {
        String signature = "";

        try {
            String encodedSign = URLEncoder.encode(stringToSign, ENCODING);
            try {
                Mac mac = Mac.getInstance(HASH);
                mac.init(new SecretKeySpec(sk.getBytes(ENCODING), HASH));
                byte[] hashData = mac.doFinal(encodedSign.getBytes(ENCODING));

                StringBuilder sb = new StringBuilder(hashData.length * 2);
                for (byte data : hashData) {
                    String hex = Integer.toHexString(data & 0xFF);
                    if (hex.length() == 1) {
                        // append leading zero
                        sb.append("0");
                    }
                    sb.append(hex);
                }
                signature = sb.toString().toLowerCase();
            } catch (Exception e) {
                logger.warn("sha256 exception for[" + sk + "," + stringToSign + "]. e:", e);
            }
        } catch (UnsupportedEncodingException e) {
            logger.warn("encode error, string[" + stringToSign + "] e:" + e);
        }

        return signature;
    }
}
```

其中，timestamp精确到秒；nonce是一个随机字符串（一般选则长度为16个字符）。如：

```java
long timestamp = System.currentTimeMillis() / 1000;
String nonce = genNonce(timestamp, 16);
public static String genNonce(long seed, int length) {
    String base = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYAC0123456789";
    Random random = new Random();
    random.setSeed(seed);
    StringBuilder sb = new StringBuilder(length);
    for (int i = 0; i < length; i++) {
        sb.append(base.charAt(random.nextInt(base.length())));
    }
    return sb.toString();
}
```
><font color=red>注意</font>：使用如上方法算出签名后，通过HTTP请求的Header将签名的结果发送给云端服务，用于验证请求的消息是否被篡改。

示例：以下为windows通过curl命令发送HTTP请求。其中Header项“X-Zc-Developer-Signature”即用来发送签名值。

```curl
curl -v -X POST -H "Content-Type:application/x-zc-object" -H "X-Zc-Major-Domain:ablecloud" -H "X-Zc-Sub-Domain:test" -H "X-Zc-Developer-Id:developerId" -H "X-Zc-Timestamp:timestamp" -H "X-Zc-Timeout:timeout" -H "X-Zc-Nonce:exzabc9xy10a2cb3" -H "X-Zc-Developer-Signature:signature" --data-ascii "{\"deviceId\":\"1\"}"
```

#Error Code
参考[Reference-Error Code](./error_code.md)。
