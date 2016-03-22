#云端服务开发参考

#简介
为了快速开发和业务逻辑相关的服务端程序，提高开发者效率，提高企业产品研发/上线的效率，AbleCloud提供了统一的服务开发框架，并内嵌了一系列由AbleCloud提供的云端服务。该框架支持开发者开发可运行于AbleCloud云端的自定义后端服务（UDS：User Defined Service）以及定时任务。AbleCloud的服务框架提供了高度封装的RPC服务，client与server通信时，client只需要知道service的名字，并提供相应的访问参数即可。当前AbleCloud提供Java版本的服务编程框架。本章介绍该框架提供的API。

#服务框架发布库
AbleCloud一期发布Java版本服务开发框架，其发布目录、文件如下所示
```
/config
	/cloudservice-conf.xml
/lib
	/ablecloud-framework-1.1.0.jar
    /ac-java-api-1.0.0.jar
	/commons-collections-3.2.1.jar
    /commons-configuration-1.10.jar
    /commons-lang-2.6.jar
    /slf4j-api-1.7.7.jar
    /...
start.sh
start.cmd
```
><font color=red>注意事项：</font>

>1. 所有依赖的第三方jar包，均放在lib文件夹下。其中包括AbleCloud的服务框架`ablecloud-framework-1.1.0.jar`和`ac-java-api-1.0.0.jar`。根据AbleCloud的发行状态，各jar包的版本号可能不同。

>1. 开发者开发的自定义服务也编译成jar包，并置于lib文件夹下。同时，还要在pom.xml里的`<additionalClasspathElement>`标签下添加测试依赖。

>1. 按上述目录结构将所有文件压缩、打包成一个ZIP文件（文件名可自取）。要求ZIP文件解压缩后能直接得到上述目录或文件，不能存在其它中间层次的目录。

>1. 在开发者管理控制台中提交压缩后的ZIP文件，之后即可通过“上线”/“下线”功能管理UDS的运行状态。

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
```
private void handleControlLight(ACMsg req, ACMsg resp) throws Exception {
    Long lightId = req.get("deviceId");		// 从请求中获取“设备id”
    String action = req.get("action");		// 从请求中获取“动作”
    // do something
}
```

##ACDeviceMsg
该消息用于处理服务和设备之间的交互，框架会将ACDeviceMsg中的code部分解析出来，开发者可根据code来区分设备消息类型。并根据code的不同值执行不同的序列化/反序列化操作。
>+ **二进制/json**
>在使用二进制或json格式通讯协议的情况下,ACDeviceMsg的content部分由开发者解释，框架透传，因此开发者需要自己编写设备消息序列化/反序列化器。
>+ **KLV**
>KLV是由AbleCloud规定的一种数据格式，即可以理解为content部分的一种特殊格式。具体应用时，需要到AbleCloud平台定义设备的数据点和数据包。此时开发者不需要自己编写消息序列化/反序列化器，AbleCloud可依据定义的数据点和数据包自动解析消息的内容。

ACDeviceMsg定义如下：
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
    public void setKLVObject(ACKLVObject object) {}
    public ACKLVObject getKLVObject() {}
}
```

<font color=red>注意</font>：从上面的定义可以看到，设备消息的具体内容为Object类型。开发者需要根据实际情况实现序列化器用来解释content的内容。

##ACDeviceMsgMarshaller
设备消息的序列化/反序列化器，用于解释ACDeviceMsg的具体内容。其定义如下：
```java
public interface ACDeviceMsgMarshaller {
	/**
     * 将具体的ACDeviceMsg序列化成字节数组，用于控制设备时通过网络下发****给设备
     *
     * @param msg       设备消息
     * @return          序列化后的字节数组
     * @throws Exception
     */
    public byte[] marshal(ACDeviceMsg msg) throws Exception;

    /**
     * 将通过网络收到的字节数组数据，反序列化成具体的消息，以便从消息中提取各个字段。
     *
     * @param msgCode   消息码
     * @param payload   设备消息序列化后的字节数组
     * @return          设备消息
     * @throws Exception
     */
    public ACDeviceMsg unmarshal(int msgCode, byte[] payload) throws Exception;
}
```

开发者应该在其重载的ACService.init()方法中初始化设备消息的序列化/反序列化器，并将其配置给服务开发框架。
当UDS向设备发送消息时，开发框架会自动调用该序列化/反序列化器的marshal方法将数据序列化为设备可理解的数据，之后再通过AbleCloud云端服务传输给设备。
当UDS接收到设备上报的消息时，开发框架会自动调用该序列化/反序列化器的unmarshal方法依据设备上报的消息创建ACDeviceMsg对象，并以该ACDeviceMsg对象为参数调用开发者重载的ACService.handleDeviceMsg()方法。

#服务开发框架
开发者在使用AbleCloud框架开发服务时，仅需简单的使用前文介绍的基础数据结构，将精力集中在实现应用的业务逻辑上，快速完成服务程序的开发/测试/发布。
##ACService：UDS
AbleCloud定义了抽象基类ACService，开发者只需要继承该类，并实现各个handler即可。定义如下:
```java
public abstract class ACService {
    // 开发者可以调用ac的相关接口直接调用AbleCloud提供的云服务。
    protected AC ac;
    
    // 以下信息可用于服务内部追踪问题等用，比如打印到日志中
    protected long developerId;			// 开发者id
    protected String majorDomain;		// 服务的主域名
    protected String subDomain;			// 服务的子域名
    protected int majorVersion;			// 服务的主版本号
    protected int minorVersion;			// 服务的副版本号
    protected int patchVersion;			// 服务的修订版本号

    /**
     * 开发者可根据自身需要，重载该方法，在该方法里做一些初始化工作，框架在启动服务时会调用该函数。
     * 比如，该服务要处理和设备之间的交互消息，需要自定义设备消息的序列化/反序列化器
     * ACDeviceMsgMarshaller，在init函数内将marshaller设置到ac中。
     *
     * @throws Exception
     */
    public void init() throws Exception {}

    /**
     * 处理APP-->Service，Service-->Service之间的交互消息
     * @param req   请求消息体
     * @param resp  响应消息体
     * @throws Exception
     */
    public abstract void handleMsg(ACMsg req, ACMsg resp) throws Exception;

    /**
     * 处理匿名请求
     *
     * @param req  请求消息体
     * @param resp 响应消息体
     * @throws Exception
     */
    public void handleAnonymousMsg(ACMsg req, ACMsg resp) throws Exception {}
    
    /**
     * 处理Device-->Service之间的交互消息
     * 如果服务不处理和设备之间的交互消息，则无须重载该方法。
     *
     * 当前，处理设备汇报的消息不做响应。
     *
     * @param context		设备的上下文，其中uid字段为系统填充
     * @param deviceId		设备的逻辑id
     * @param req			请求消息体
     * @throws Exception
     */
    public abstract void handleDeviceMsg(ACContext context, long deviceId, ACDeviceMsg req) throws Exception;

    /**
     * 处理JINDDONG-->Service之间的交互消息，收到Stream点数组，进行设备控制
     *
     * @param context          设备的上下文，其中uid字段为系统填充
     * @param physicalDeviceId 设备的物理id
     * @param req              请求消息体(Stream数组)
     * @param resp             响应消息体
     * @throws Exception
     */
    public void handleJDSetStatusMsg(ACContext context, String physicalDeviceId, List<ACJDMsg> req, ACMsg resp) throws Exception {}

    /**
     * 处理JINDDONG-->Service之间的交互消息,获取设备上所有Stream点
     *
     * @param context          设备的上下文，其中uid字段为系统填充
     * @param physicalDeviceId 设备的物理id
     * @param resp             响应消息体(Stream数组)
     * @throws Exception
     */
    public void handleJDGetStatusMsg(ACContext context, String physicalDeviceId, List<ACJDMsg> resp) throws Exception {}
    
    /**
     * 处理SUNING-->Service之间的交互消息，收到Stream点数组，进行设备控制
     *
     * @param physicalDeviceId 设备的物理id
     * @param req              请求消息体(Stream数组)
     * @param resp             响应消息体
     * @throws Exception
     */
    public void handleSNSetStatusMsg(ACContext context, String physicalDeviceId, List<ACSNMsg> req, ACMsg resp) throws Exception {
    }

    /**
     * 处理SUNING-->Service之间的交互消息,获取设备上所有Stream点
     *
     * @param physicalDeviceId 设备的物理id
     * @param resp             响应消息体(Stream数组)
     * @throws Exception
     */
    public void handleSNGetStatusMsg(ACContext context, String physicalDeviceId, List<ACSNMsg> resp) throws Exception {
    }

    /**
     * 处理设备强制解绑的消息（不需要调解绑接口，此时不能与设备进行交互）
     * 如果除了解绑设备之外没有任何其他的处理逻辑，则无需继承此方法
     *
     * @param context          设备的上下文，其中uid字段为系统填充
     * @param physicalDeviceId 设备的物理id
     */
    public void handleDeviceForceUnbind(ACContext context, String physicalDeviceId, ACMsg resp) throws Exception {
    }

    /**
     * 内部调用接口，开发者不用关注且不能修改。
     * 设置服务相关的信息，并将全局AC框架传给服务
     * 服务内部可以使用AC框架提供的各种功能，如
     * 帐号管理、设备管理、存储服务等。
     * @param ac
     * @param config
     */
    public final void setEnv(AC ac, ACConfiguration config) {}

    /**
     * 内部调用接口，开发者不用关注且不能修改。
     * @return
     */
    public final AC getAc() {}
}
```
在上述抽象类中，对开发者来说，总共有七个公共接口，其中init提供了默认实现。如果开发者实现的某一服务不需要和设备直接交互，则直接重载handleDeviceMsg为空实现即可。通常情况下，init只需要设置设备消息处理的序列化器即可。因此，开发者可以将精力集中在handleMsg接口的实现中，该接口处理客户端请求，并作出响应。下文会对该抽象类进行详细介绍。

><font color="red">**注：**</font>通常情况下，开发者只需要重点实现**handleMsg**即可。当然如果需要处理复杂的设备上报数据，则还需要重点实现**handleDeviceMsg**并根据不同code做不同处理 。

##ACCronJob：后台任务
### ACCronJob
AbleCloud定义了云端定时任务的抽象基类ACCronJob。开发者需要继承该类，并实现其定义的抽象方法ACCronJob::run，即能完成定时任务的开发。ACCronJob的定义如下：
```java
public abstract class ACCronJob {
    // 开发者可以调用ac的相关接口直接调用AbleCloud提供的云服务。
    protected AC ac;
    
    // 以下信息可用于任务内部追踪问题等用，比如打印到日志中等。
    protected long developerId;         // 开发者id
    protected String majorDomain;       // 服务的主域名
    protected String subDomain;         // 服务的子域名
    protected int majorVersion;         // 服务的主版本号
    protected int minorVersion;         // 服务的副版本号
    protected int patchVersion;         // 服务的修订版本号

    /**
     * 内部调用接口，开发者不用关注且不能修改。
     * 设置服务相关的信息，并将全局AC框架传给服务。服务内部可以使用AC框架提供的各种功能，如帐号管理、设备管理、存储服务等。
     * @param ac
     * @param config
     */
    public final void setEnv(AC ac, ACConfiguration config) {
        this.ac = ac;
        this.developerId = config.getDeveloperId();
        this.majorDomain = config.getServiceMajorDomain();
        this.subDomain = config.getServiceSubDomain();
        this.majorVersion = config.getServiceMajorVersion();
        this.minorVersion = config.getServiceMinorVersion();
        this.patchVersion = config.getServicePatchVersion();
    }

    /**
     * 用于获取AC框架。
     * @return AC对象。
     */
    public final AC getAc() {
        return ac;
    }

    /**
     * 定时任务的执行函数。
     * @return 返回任务的结束后，进程退出时所使用的状态码。
     * @throws Exception
     */
    public abstract int run() throws Exception;
}
```
上述抽象类共定义了三个公共方法：ACCronJob::setEnv，ACCronJob::getAC，以及ACCronJob::run。其中，ACCronJob::run是定时任务的执行函数，要求开发者提供具体实现。

### Crontab
Crontab定时规则由五部分组成，由左至右分别表示分、时、日、月、周。每个部分之间以空格字符分隔。如“30 12 \* \* \*”表示“每天的12:30”。其中，第一个部分的“30”表示30分，第二个部分的“12”表示12点，后面三个部分的“\*”分别表示每天、每月及一星期内的每一天。
规则中各部分的取值范围如下（参考http://linux.vbird.org/linux_basic/0430cron.php）：

|代表意义|分钟|小时|日期|月份|周|
|---|---|---|---|---|---|
|数字范围|0-59|0-23|1-31|1-12|0-7|
| | | | | | |

其中，“周”的取值为0或7时都表示“星期天”。除此之外，还有如下辅助字符可用于定义时间规则。

|辅助字符|代表意义|
|---|---|
|\*（星号）|代表任何时刻。例如“30 12 \* \* \*”中日、月、周都是\*， 表示“不论何月、何日、星期几的 12:30”。|
|,（英文逗号）|用于指定确定的多个值。如果要定义“每天的3:10及6:10”可使用如下规则：“10 3,6 \* \* \*”。|
|-（连字符）|用于指定时间范围。如果定义“每天的8点至12点之间每小时的20分钟”可使用如下规则：“20 8-12 \* \* \*”。|
|/n（斜杠后跟数字）|表示每个n个单位。例如定义“每5分钟”时可使用如下规则：“\*/5 \* \* \* \*”。|
| | |

##AC
在介绍ACService和ACCronJob的时候提到过重要的成员变量ac，ac实际上是AbleCloud对抽象服务框架AC的具体实现，其实现过程对开发者透明。通过AC，开发者可以根据需要获取一系列内嵌服务的功能接口。AC的定义如下：
```java
public abstract class AC {
    protected ACConfiguration config;
    protected ACDeviceMsgMarshaller deviceMsgMarshaller;

    /**
     * 构建一个开发者上下文
     * @return
     */
    public ACContext newContext() {}

    /**
     * 构建一个用户上下文，由于是框架创建的，因此也会带着开发者信息，一般用于单测
     * @param userId
     * @return
     */
    public ACContext newContext(long userId) {}
    
    /**
     * 构建一个用于数据查询的过滤器
     *
     * @return
     */
    public ACFilter filter(){}
    
    /**
     * 用于对数据分类进行具体的操作，如create/find/delete/update/scan等
     *
     * @param className     要操作的分类名
     * @param context       要进行操作的开发者context
     * @return
     */
    public abstract ACStore store(String className, ACContext context);
    
    /**
     * 则用于创建数据分类/清空数据等操作。
     * 用于测试之用。
     *
     * @return
     */
    public abstract ACStoreForTest storeForTest(ACContext context);

    /**
     * 往某一服务发送命令/消息
     *
     * @param subDomain 该服务所在产品名
     * @param name      服务名
     * @param version   服务版本
     * @param req       具体的消息内容，此处req无需构造ACContext
     * @return 服务端相应的消息
     * @throws Exception
     */
    public abstract ACMsg sendToService(String subDomain, String name, int version, ACMsg req) throws Exception;
    
    /**
     * 往JD service发送命令/消息,上报设备上的所有Stream点到JINGDONG Service
     *
     * @param context          设备的上下文，其中uid字段为系统填充
     * @param physicalDeviceId 设备的物理id
     * @param req              请求消息体(Stream数组)
     * @return 服务端相应的消息
     * @throws Exception
     */
    public abstract ACMsg sendToJDService(ACContext context, String physicalDeviceId, List<ACJDMsg> req) throws Exception;
    
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
     * @param context   开发者的context
     * @return
     */
    public abstract ACAccountMgr accountMgr(ACContext context);

    /**
     * 获取用于单元测试的帐号管理器，可以注册用户等
     *
     * @param context   开发者的context
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
     * 获取推送通知管理器，可以给用户发送通知消息
     *
     * @param context   开发者的context
     * @return
     */
    public abstract ACNotificationMgr notificationMgr(ACContext context);
    
    /**
     * 获取用于单元测试的推送通知管理器
     *
     * @param context 开发者的context
     * @return
     */
    public abstract ACNotificationMgrForTest notificationMgrForTest(ACContext context);
    
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
     * 为便于测试，开发者可实现一个服务的桩
     * 在框架中添加一个服务桩，即mock
     *
     * @param name  服务名
     * @param stub  服务桩的实现，实际上也是一个ACService
     */
    public abstract void addServiceStub(String name, ACService stub);

    /**
     * 为便于测试，开发者可实现一个设备的桩
     *
     * @param subDomain     设备所属子域
     * @param stub          设备桩
     */
    public abstract void addDeviceStub(String subDomain, ACDeviceStub stub);

    /**
     * 如果服务要处理和设备之间的交互消息，需要实现设备消息序列化/反序列化器
     * 该接口将序列化/反序列化器设置给ac框架
     *
     * @param marshaller    设备消息序列化/反序列化器
     */
    public void setDeviceMsgMarshaller(ACDeviceMsgMarshaller marshaller) {}

    /**
     * 获取设备消息序列化/反序列化器
     * @return
     */
    public ACDeviceMsgMarshaller getDeviceMsgMarshaller() {}

    /**
     * 获取用于单元测试的服务框架ac
     * @param config    单元测试环境构造的config
     * @return
     * @throws Exception
     */
    public static final AC getTestAc(ACConfiguration config) throws Exception {}
}
```
><font color=red>注意</font>：由于开发者具有超级权限，所以AbleCloud除了提供正常的服务管理器接口外，还提供一些用于单元测试的管理器接口，如`ac.accountMgrForTest(ac.newContext())`

#内嵌云端服务
顾名思义，内嵌云端服务，是指AbleCloud抽象并实现的多种通用后端服务，避免开发者重复开发这些基础设施。开发者可直接使用这些服务，降低应用服务程序的开发代价，提高开发效率。各个云端服务的对象可通过上节介绍的服务框架AC的相关接口获取。

API说明请参考[Java SDK开发参考](./java.md)。

#Error Code
参考[Reference-Error Code](../reference/error_code.md)。


