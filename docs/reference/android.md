#安卓客户端开发参考
#简介

SDK即Software Develop Kit，开发者将基于此，快速的开发出APP。本文详细介绍android平台的SDK。ablecloud为开发者提供了一些通用的云端服务。
><font color="red">注意:</font>SDK里所有与云端交互的接口均采用异步回调方式，避免阻塞主线程的执行。默认接口超时时间为5s，可以通过设置全局变量`ACConfiguration.CONNECT_TIMEOUT = 5`以及`ACConfiguration.READ_TIMEOUT = 5`修改超时时间。

#交互协议

首先，我们从基础的数据结构开始。我们知道，APP会与后端服务和设备交互，因此AbleCloud定义了两种格式的消息：

+ **ACMsg：**APP与SERVICE服务之间的交互消息。
+ **ACDeviceMsg：**APP与DEVICE设备之间的交互消息。

##ACMsg 
介绍ACMsg之前，我们先来了解一下AbleCloud的基本数据结构ACObject
####ACObject
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

    //**
     * 获取一个参数值
     *
     * @param key 参数名
     * @return 参数值;如果不存在该参数值,返回null
     */
    public <T> T get(String key) {}

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

    /**
     * 获取所有的key值
     */
    public Set<String> getKeys() {}
}
```
><font color="brown">**注：**最常用的三个接口是put/add/get，通过**add**接口保存在ACObject中的数据实际为List，相应的，get出来也是一个List。</font>

####ACMsg
ACMsg继承自ACObject，扩展了一些功能，比如设置了交互的方法名name以及**其它形式**的负载payload信息。通常采用ACMsg进行数据交互，较多的使用默认的**OBJECT_PAYLOAD**格式，该格式只需要使用ACObject提供的put、add、get接口进行数据操作即可。因为在使用OBJECT_PAYLOAD格式时，框架会对数据进行序列化/反序列化。ACMsg也提供另外的数据交互格式，如json、stream等。如果用json格式，则通过setPayload/getPayload设置/获取序列化后的json数据并设置对应的payloadFormat，开发者后续可自行对payload进行解析。

```java
public class ACMsg extends ACObject {
    private String name;
    private String payloadFormat;
    private byte[] payload;****
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


##ACDeviceMsg
####ACDeviceMsg
该消息用于处理服务和设备之间的交互，框架会将ACDeviceMsg中的code部分解析出来，开发者可根据[code](firmware/wifi_interface_guide/#13 "消息码说明")来区分设备消息类型。并根据code的不同值做出不同的处理响应。
ACDeviceMsg的content部分即发送给设备的具体消息内容，由开发者解释，框架透传。除此之外，KLV是由AbleCloud规定的一种数据格式，可以理解为content部分的一种特殊解释，具体开发需要到AbleCloud平台填写数据点和数据包。

ACDeviceMsg定义如下：

```java
public class ACDeviceMsg {
    //消息码，用于区分消息类型
    private int code;
    //设备消息的具体内容,使用二进制与json格式
    private byte[] content;
    //设备消息的具体内容,使用klv通讯格式
    private ACKLVObject klvObject;
    //设备描述信息
    private String description;

    public ACDeviceMsg() {}

    //初始化byte[]二进制数组（也支持json格式，通过"jsonString".getBytes设置）
    public ACDeviceMsg(int code, byte[] content) {}

    //初始化ACObject，本质上为json格式,与JSONObject用法相同
    public ACDeviceMsg(int code, ACObject object) {}
    
    //初始化ACKLVObject，使用klv通讯格式
    public ACDeviceMsg(int code, ACKLVObject object) {}

    /**
     * 设置局域网通讯安全模式,默认为动态加密;不加密/静态加密在局域网控制模式下不要求必须先绑定该设备
     * <p/>
     * ACDeviceSecurityMode.NO_ENCRYPTED      不加密
     * ACDeviceSecurityMode.STATIC_ENCRYPTED  静态加密,即使用默认秘钥
     * ACDeviceSecurityMode.DYNAMIC_ENCRYPTED 动态加密,使用云端分配的秘钥,要求提前调用接口listDevice/listDeviceWithStatus
     */
    public void setSecurityMode(ACDeviceSecurityMode securityMode) {}
    
    public ACDeviceMsg(int code, byte[] content, String description) {}
    
    public ACDeviceMsg(int code, ACObject object, String description) {}

    public ACDeviceMsg(int code, ACKLVObject object, String description) {}
    
    public int getCode() {}

    public void setCode(int code) {}

    public byte[] getContent() {}

    public void setContent(byte[] content) {}
       
    public ACObject getObject() {}
 
    public void setObject(ACObject object) {}

    public ACKLVObject getKLVObject() {}

    public void setKLVObject(ACKLVObject object) {}

    public String getDescription() {}

    public void setDescription(String description) {}
}
```

####ACKLVObject
<font color="red">注</font>：ACKLVObject与ACObject数据格式用法相似，不同的是ACKLVObject里key值的类型为Integer，这里不做具体介绍。

#基本数据结构
这里说的基本数据结构，是指设备管理、帐号管理等要用到的各个对象定义，比如帐号、设备等。

####ACUserInfo
用来表示AbleCloud的一个注册帐号信息，定义如下：

```java
public class ACUserInfo {
    private long userId;      //用户id
    private String nickName;  //用户昵称

    public ACUserInfo(long uid, String nickName) {}

	// getter
}
```

####ACOpenIdInfo
用来表示AbleCloud的一个第三方登录信息，定义如下：

```java
public class ACOpenIdInfo {
    //第三方登录类型，通过ACThirdPlatform.QQ|SINA|WEIXIN|JINDONG|FACEBOOK|TWITTER|INSTAGRAM|OTHER区分
    private ACThirdPlatform thirdPlatform; 
    //从第三方登录后获取的openId，微博为id
    private String openId;   

    public ACOpenIdInfo(ACThirdPlatform thirdPlatform, String openId) {}

	// getter
}
```

####ACUserDevice
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

####ACDeviceUser
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

####ACHome
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

####ACRoom
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

####ACTimerTask
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
    //任务名称
    private String name;
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

####ACPushTable
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

####ACFileInfo
说明：文件管理中获取下载url或上传文件时用来表示文件信息，定义如下：

```java
public class ACFileInfo {
    /**
     * 上传文件的空间(不同空间获取下载链接getDownloadUrl时具有不同时效性)
     * <p/>
     * true:上传文件到 Public 空间，下载该文件时获取的url是永久有效的;
     * false:上传文件到 Private 空间，获取的url是有有效期的，并且带有签名信息
     */
    private boolean isPublic;
    //自定义文件目录，如ota
    private String bucket;
    //文件名
    private String filename;
    //上传文件二进制流数据，用于小文件上传，如拍照后头像直接上传
    private byte[] data;
    //上传文件的File对象，用于大文件上传，从内存卡读取文件
    private File file;
    //权限管理
    private ACACL acl;

    //默认上传到 Private空间，isPublic＝false
    public ACFileInfo(String bucket, String filename) {}
    
    public ACFileInfo(boolean isPublic, String bucket, String filename) {}
}
```
>data与file二选其一上传数据，一同赋值情况下，以data为准

####ACDeviceFind
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

####ACOTACheckInfo
说明：用来获取OTA升级状态信息，定义如下：

```java
public class ACOTACheckInfo {
    //设备逻辑ID
    private long deviceId;
    //设备物理ID
    private String physicalDeviceId;
    //设备原版本
    private String version;
    //设备升级类型 1系统MCU升级 2WiFi通信模组升级
    private int otaType;
    //设备渠道
    private String channel;
    //设备批次
    private String batch;

    /**
     * 蓝牙设备OTA检测升级
     *
     * @param physicalDeviceId 设备物理ID
     * @param version          设备原版本
     */
    public ACOTACheckInfo(String physicalDeviceId, String version) {}

    /**
     * 普通wifi设备OTA检测升级
     *
     * @param deviceId 设备逻辑ID
     * @param otaType  设备升级类型,1系统MCU升级 2WiFi通信模组升级
     */
    public ACOTACheckInfo(long deviceId, int otaType) {}
}
```
####ACOTAUpgradeInfo
说明：OTA升级信息，定义如下：

```java
public class ACOTAUpgradeInfo {
    //是否有OTA升级
    private boolean isUpdate;
    //原版本号
    private String currentVersion;
    //升级版本号
    private String targetVersion;
    //升级方式 0：静默升级（默认）1：用户确认升级 2：强制升级
    private int otaMode;
    //升级日志
    private String upgradeLog;
    //升级状态 0未下载 1文件下载成功 2升级完成
    private int status;
    //OTA文件名列表
    private List<ACOTAFileInfo> files;
    
    public ACOTAUpgradeInfo(String currentVersion, String targetVersion, int otaMode, String upgradeLog, int status, List<ACOTAFileInfo> files) {}
}
```
####ACOTAFileInfo
说明：OTA升级新文件信息，定义如下：

```java
public class ACOTAFileInfo {
    //文件名
    private String name;
    //文件类型
    private int type;
    //文件校验和
    private int checksum;
    //文件下载路径
    private String downloadUrl;

    public ACOTAFileInfo(String name, int type, int checksum, String downloadUrl){}
}
```
####ACDeviceActive
说明：用来获取OTA升级状态信息，定义如下：

```java
public class ACDeviceActive {
    //设备物理ID
    private String physicalDeviceId;
    //设备版本号
    private String deviceVersion;
    //设备MAC地址
    private String mac;
    //设备通信模组版本，对于蓝牙设备和安卓设备，非必填
    private String moduleVersion;
    //设备地理位置信息，纬度，如果有设备定位需求
    private Double latitude;
    //设备地理位置信息，经度，如果有设备定位需求
    private Double longitude;

    public ACDeviceActive(String physicalDeviceId, String deviceVersion,String mac) {}
}
```

####ACDevice
说明：获取设备激活的相关信息，定义如下：

```java
public class ACDevice {
    //设备IP地址
    private String ip;
    //设备固件版本
    private String deviceVersion;
    //设备通信模组版本
    private String moduleVersion;
    //设备激活时间，格式yyyy-MM-dd HH:mm:ss
    private String activeTime;
    //设备最后上线时间，格式yyyy-MM-dd HH:mm:ss
    private String lastOnlineTime;
    //设备地理位置，国家
    private String country;
    //设备地理位置，省
    private String province;
    //设备地理位置，地区
    private String city;

    public ACDevice() {}
}
```

####ACFeedback
说明：用来表示用户意见反馈的信息，定义如下：

```java
public class ACFeedback {
    //可以为空,也可以指定subDomain产品
    private String subDomain;
    //预留字段，可以为空
    private String type;
    //开发者自定义的扩展信息，与前端定义的字段一致
    private ACObject extend;

    public ACFeedback() {}

    //对应AbleCloud控制台反馈项设定的key与value值
    public void addFeedback(String key, Object value) {
        this.extend.put(key, value);
    }

    /**
     * 添加图片下载地址的url
     *
     * @param key   对应为AbleCloud控制台反馈项设定的key值
     * @param value 对应为AbleCloud控制台反馈项设定的图片类型,此处建议为图片的url
     */
    public void addFeedbackPicture(String key, String value) {
        extend.add(key, value);
    }
}
```
####ACPM25
说明：用来表示pm25的信息，定义如下：

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

    public ACPM25(String timestamp, int avg, int min, int max) {}
}
```

####ACAQI
说明：用来表示空气质量的信息，定义如下：

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
    
    public ACAQI(int AQI, int minAQI, int maxAQI, String timestamp) {}
}
```

####ACWeather
说明：用来表示温湿度的信息，定义如下：

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

    public ACWeather(String timestamp, double temperature, double minTemperature, double maxTemperature, int humidity, int minHumidity, int maxHumidity) {}
}
```

####ACRankingCount
说明：用来表示排行榜用户总数，定义如下：

```java
public class ACRankingCount {
    // 时间段的起始时间戳
    private long timestamp;
    // 数量
    private long count;

    public ACRankingCount(long timestamp, long count) {}
}
```

####ACRankingValue
说明：用来表示排行榜的值与排名，定义如下：

```java
public class ACRankingValue {
   // 时间段的起始时间戳
    private long timestamp;
    // key
    private String userId;
    // value
    private double score;
    // 排名 -1代表在这个时间段内不存在数据
    private long place;

    public ACRankingValue(String userId, double score, long place, long timestamp) {}
}
```

####ACException
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
    public static int MARSHAL_ERROR = 1995;
    public static int WRONG_PAYLOAD_FORMAT = 1997;
    public static int INTERNET_ERROR = 1998;
    public static int INTERNAL_ERROR = 1999;
    public int getErrorCode() {
        return errorCode;
    }
}
```

#SDK接口列表

##AC
SDK里所有接口均可通过AC来获取，简而言之，AC可以认为是SDK的框架，通过AC，开发者可以根据需要获取一系列服务、功能的接口，这些功能包括设备激活、云端服务、测试桩等。AC的定义如下：

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
    public static final int DEVICE_ANDROID = -1;
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
     * @param subDomain	服务所属子域名，subDomain传空字符串时即代表往Domain级别的UDS服务发送消息
     * @param name    	服务名
     * @param version 	服务版本
     * @param req     	具体的消息内容
     *
     * @return 返回结果的监听回调，返回服务端的响应消息
     */
    public static void sendToService(String subDomain, String name, int version,
    								 ACMsg req, final PaylodCallback<ACMsg> callback) {}

    /**
     * 往某一服务发送命令/消息(匿名访问)
     *
     * @param subDomain	服务所属子域名，subDomain传空字符串时即代表往Domain级别的UDS服务发送消息
     * @param name    	服务名
     * @param version 	服务版本
     * @param req     	具体的消息内容
     *
     * @return 返回结果的监听回调，返回服务端的响应消息
     */
    public static void sendToServiceWithoutSign(String subDomain, String name, int version,
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
     * 获取设备激活器，用于获取激活的设备
     * 此方法用于无需配网的设备，如安卓设备等，调用startAbleLink时SSID与Password传空即可
     *
     * @return 设备激活器
     */
    public static ACDeviceActivator deviceActivator() {
        return new ACDeviceActivator();
    }
    
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
     * 获取设备激活相关管理器。
     *
     * @return 设备管理器
     */
    public static ACDeviceMgr deviceMgr() {}

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
     * 获取排行版管理器
     * 可以调用ACRankingMgr提供的各个通用接口
     *
     * @return 排行版管理器
     */
    public static ACRankingMgr rankingMgr() {}
    
    /**
     * 为便于测试，开发者可实现一个服务的桩，并添加到AC框架中
     * 在测试模式下，服务桩可以模拟真实服务对APP的请求做出响应
     *
     * @param name	服务名
     * @param stub	服务桩，需要开发者自己实现具体的stub
     */
    public static void addServiceStub(String name, ACService stub) {}
```

##用户帐号管理

一台设备最终是需要通过用户来控制的，需要发送验证码、注册、登陆、管理密码等常规功能，ablecloud提供了云端帐号管理系统来协助开发人员快速的完成，在SDK端也提供了相应的接口，定义如下：

```java
public interface ACAccountMgr {

    /**
     * 发送验证码
     *
     * @param account  用户电话或email任选其一
     * @param template 短信内容模板
     * @param callback 返回结果的监听回调
     */
    public void sendVerifyCode(String account, int template, VoidCallback callback);

    /**
     * 验证验证码
     *
     * @param account    用户电话或email任选其一
     * @param verifyCode 验证码
     * @param callback   返回结果的监听回调
     */
    public void checkVerifyCode(String account, String verifyCode, PayloadCallback<Boolean> callback);

    /**
     * 注册一个新用户
     *
     * @param email      用户邮箱，与phone任选其一，或都提供
     * @param phone      用户电话，或email任选其一，或都提供
     * @param password   用户密码
     * @param name       名字
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
     * @param password   密码
     * @param verifyCode 验证码
     * @param callback   返回结果的监听回调
     */
    public void changePhone(String phone, String password, String verifyCode, VoidCallback callback);

    /**
     * 修改邮箱
     *
     * @param email      新邮箱地址
     * @param password   密码
     * @param verifyCode 验证码
     * @param callback   返回结果的监听回调
     */
    public void changeEmail(String email, String password, String verifyCode, final VoidCallback callback);

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
     * 第三方账号登录
     *
     * @param thirdPlatform 第三方类型（如QQ、微信、微博、FaceBook等）
     * @param openId        通过第三方登录获取的openId
     * @param accessToken   通过第三方登录获取的accessToken
     * @param callback      返回结果的监听回调
     */
    public void loginWithOpenId(ACThirdPlatform thirdPlatform, String openId, String accessToken, PayloadCallback<ACUserInfo> callback);

    /**
     * 绑定第三方账号
     *
     * @param thirdPlatform 第三方类型（如QQ、微信、微博、FaceBook等）
     * @param openId        通过第三方登录获取的openId
     * @param accessToken   通过第三方登录获取的accessToken
     * @param callback      返回结果的监听回调
     */
    public void bindWithOpenId(ACThirdPlatform thirdPlatform, String openId, String accessToken, VoidCallback callback);

    /**
     * 第三方账号登录状态下绑定用户信息
     *
     * @param email      用户邮箱，与phone任选其一，或都提供
     * @param phone      用户电话，或email任选其一，或都提供
     * @param password   用户密码
     * @param nickName   名字
     * @param verifyCode 验证码
     * @param callback   返回结果的监听回调
     */
    public void bindWithAccount(String email, String phone, String password, String nickName, String verifyCode, VoidCallback callback);

    /**
     * 列举所有的第三方登录信息
     *
     * @param callback 返回结果的监听回调
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


    /**
     * 是否登录
     */
    public boolean isLogin();

    /**
     * 注销
     */
    public void logout();
}
```
<font color="red">注意：</font>用户调用登录接口成功之后，会在app本地存储一个token，下次启动app时即默认app已经登录，无需再进行登录，从v1.09版本之后，这个token具有有效期，在长期未使用app的情况下会过期，这个时候需要进行重新登录处理，所以建议在主页获取设备列表的错误回调里对3516的token过期错误码进行单独处理，返回登录页让用户重新登录。

##设备激活

当一款智能设备上市，交付到终端用户时，虽然是智能设备，但是目前大多数智能设备并没有键盘、屏幕等UI（用户界面），那么如何让一台新设备连上网络呢，这里就要用到设备激活功能。新设备激活的大致流程如下：
 
>1. 调用激活器的以下接口，将wifi的ssid，密码广播给设备；

>+ 通过扫码方式获取设备物理Id(每一台设备厂商都会给它分配一个设备号，AbleCloud称为设备的物理id)，通过此物理ID激活并绑定指定的设备

>+ 批量激活并绑定多个设备

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
>通过以上`ACDeviceActivator`提供的接口，使一台设备连上wifi，我们认为已经将设备激活了。但是只是激活设备还不够，用户控制设备前需要对设备进行绑定

成功激活设备之后，即可以通过调用以下接口获取设备激活相关信息，其中包括设备IP地址、设备固件版本、设备通信模组版本、设备激活时间、设备最后上线时间、设备地理位置国家/省/地区等。

```java
public interface ACDeviceMgr {
    /**
     * 设备激活查询接口
     *
     * @param subDomain        子域名，如djj（豆浆机）
     * @param physicalDeviceId 设备物理ID
     * @param callback         返回结果的监听回调
     */
    public void getDeviceInfo(String subDomain, String physicalDeviceId, final PayloadCallback<ACDevice> callback);
}
```


##设备管理( 独立和网关型）

将用户和设备绑定后，用户才能使用设备。AbleCloud提供了设备绑定、解绑、分享、网关添加子设备、删除子设备等接口。

```java
public interface ACBindMgr {
    /**
     * 从云端获取所有设备列表(sdk会自动保存列表到本地缓存中)
     *
     * @param callback 返回结果的监听回调
     */
    public void listDevices(PayloadCallback<List<ACUserDevice>> callback);

    /**
     * 从云端获取所有设备列表和设备状态(sdk会自动保存列表到本地缓存中)
     * 如果只是简单的设备管理请使用listDevices更轻便的接口
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
     * @param physicalDeviceId 设备物理id（制造商提供的）,不提供时传""
     * @param callback         返回结果的监听回调
     */
    public void isDeviceOnline(String subDomain, long deviceId, String physicalDeviceId, PayloadCallback<Boolean> callback);

    /**
     * 查询设备是否局域网在线（deviceId与physicalDeviceId两个参数至少提供其一，两者都提供以physicalDeviceId为准）
     *
     * @param physicalDeviceId 设备物理id（制造商提供的）
     */
    public boolean isDeviceLocalOnline(String physicalDeviceId);

    /**
     * 查询设备是否被绑定
     *
     * @param subDomain        子域名，如djj（豆浆机）
     * @param physicalDeviceId 设备id（制造商提供的）
     * @param callback         返回结果的监听回调
     */
    public void isDeviceBound(String subDomain, String physicalDeviceId, PayloadCallback<Boolean> callback);

    /**
     * 更新设备的密钥accessKey
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param deviceId  设备id（这里的id，是调用list接口返回的id，不是制造商提供的id）
     * @param callback  返回结果的监听回调
     */
    public void resetDeviceToken(String subDomain, long deviceId, VoidCallback callback);
    
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
     * @param timeout         开启时间
     * @param callback        返回结果的监听回调
     */
    public void openGatewayMatch(String subDomain, long gatewayDeviceId, int timeout, VoidCallback callback);

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
     * 为便于测试，开发者可实现一个设备的桩
     *
     * @param stub
     */
    public void addDeviceStub(String subDomain, ACDeviceStub stub);


    /**
     * 给设备发消息
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
    @Deprecated
    public void sendToDeviceWithOption(String subDomain, long deviceId, ACDeviceMsg deviceMsg, int option, PayloadCallback<ACDeviceMsg> callback);
}

    /**
     * 给设备发消息(建议使用该接口)
     *
     * @param subDomain        子域名，如djj（豆浆机）
     * @param physicalDeviceId 设备物理id
     * @param deviceMsg        具体的消息内容
     * @param option           AC.ONLY_LOCAL  只通过局域网直连方式给设备发消息
     *                         AC.ONLY_CLOUD  只通过云端给设备发消息
     *                         AC.LOCAL_FIRST 优先通过局域网直连方式给设备发消息
     *                         AC.CLOUD_FIRST 优先通过云端给设备发消息
     * @param callback         返回结果的监听回调
     */
    public void sendToDeviceWithOption(String subDomain, String physicalDeviceId, ACDeviceMsg deviceMsg, int option, PayloadCallback<ACDeviceMsg> callback);
```


##Home模型
除了绑定控制设备之外，你可能需要对设备进行合理的分组管理，AbleCloud提供的Home模型可以满足大部分复杂的模型场景。

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
除了以上对设备的绑定控制以及管理之外，你可能还需要对设备OTA进行升级，接口定义如下：

```java
public interface ACOTAMgr {

    /**
     * 检查设备OTA发布版本
     * 不管有无新版本，都会回调ACOTAUpgradeInfo，根据isUpdate()判断有无OTA更新
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param checkInfo 设备与OTA信息
     * @param callback  返回结果的监听回调
     */
    public void checkUpdate(String subDomain, ACOTACheckInfo checkInfo, PayloadCallback<ACOTAUpgradeInfo> callback);

    /**
     * 确认OTA升级
     *
     * @param subDomain     子域名，如djj（豆浆机）
     * @param targetVersion 升级文件版本号
     * @param otaType       升级类型,1系统MCU升级 2WiFi通信模组升级
     * @param callback      返回结果的监听回调
     */
    public void confirmUpdate(String subDomain, long deviceId, String targetVersion, int otaType, VoidCallback callback);
}
```
>**<font color="red">注</font>：具体使用步骤见开发指导-->OTA**


##设备定时任务

>**<font color="red">注意</font>：**

>**1、timePoint的格式为`"yyyy-MM-dd HH:mm:ss"`，否则会失败**

>**2、timeCycle需要在timePoint时间点的基础上,选择循环方式**

>+ **"once":**单次循环

>+ **"hour":**在每小时的**`mm:ss`**时间点循环执行

>+ **"day":**在每天的**`HH:mm:ss`**时间点循环执行

>+ **"month":**在每月的**`dd HH:mm:ss`**时间点循环执行

>+ **"year":**在每年的**`MM-dd HH:mm:ss`**时间点循环执行

>+ **"week[0,1,2,3,4,5,6]":**在每星期的**`HH:mm:ss`**时间点循环执行(如周日，周五重复，则表示为"week[0,5]")

接口定义如下：

```java
public interface ACTimerMgr {

    /**
     * 创建定时任务
     *
     * @param opType      定时任务类型，云端定时/设备定时，设备定时需要设备在线才能添加成功，云端定时无此限制
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
    public void addTask(ACTimerTask.OP_TYPE opType, long deviceId, String timePoint, String timeCycle, String description, ACDeviceMsg msg, PayloadCallback<ACTimerTask> callback);

    /**
     * 修改定时任务
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
    public void modifyTask(long deviceId, long taskId, String timePoint, String timeCycle, String description, ACDeviceMsg msg, VoidCallback callback);
    
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

如果想使用推送服务，在SDK端提供了相应的接口（封装了友盟2.4.1的部分接口），定义如下：

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

```xml
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

```xml
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

```xml
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

```xml
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

##实时消息同步
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
**<font color="red">注</font>：具体使用步骤见开发指导-->与云端通信**

##局域网通信

```java
/**
 * 本地设备发现，通过广播方式和本局域网内的智能设备交互，并获取设备的相关信息返回。
 *
 * @param timeout	发现本地设备的超时时间，单位毫秒
 * @param callback	返回结果的监听回调，返回设备列表
 */
public static void findLocalDevice(int timeout, PaylodCallback<List<ACDeviceFind>> callback) {}
```
**<font color="red">注</font>：具体使用步骤见[开发指导-->局域网通信](http://shumonluo.github.io/rd_docs/develop_guide/android/#_28)**

##文件存储
如果需要使用文件上传下载管理服务，在SDK端提供了相应的接口，首先需要获取定时管理器AC.fileMgr(),具体接口定义如下：

```java
public interface ACFileMgr {

    /**
     * 获取下载url
     *
     * @param fileInfo   文件下载信息
     * @param expireTime 如果文件上传到 public 空间，则expireTime这个参数无效，获取的url是永久有效的，且不带签名信息;
     *                   如果文件上传到 private 空间，所获取的访问/下载URL的有效时长。单位为秒。
     *                   如果取值为小于或等于0,国内环境表示80年，国外环境表示7天。
     */
    public void getDownloadUrl(ACFileInfo fileInfo, long expireTime, PayloadCallback<String> callback);

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
><font color="red">**规则**：</font>优先判断黑名单，黑名单命中后其他设置无效，其次判断白名单，最后判断全局设置属性。例如同时设置userId为1的用户为黑名单和白名单，则设置的白名单无效。

##排行榜
除了存储服务之外，AbleCloud还提供了丰富的排行榜功能，支持对多用户不同时间段进行排行操作。具体接口定义如下：

```java
public interface ACRankingMgr {

    /**
     * 增加或减少当前用户的分值(原有分值进行累加),如果存在多个排行周期,全部累加更新
     * 用于数据累积类排行榜,比如记步,游戏积分等,不能和覆盖类排行榜的set接口混用.
     *
     * @param name      排行榜名称
     * @param timestamp 时间点,如果为0,则表示当前时间(单位秒,UTC时间戳，相对于1970年的秒数)
     * @param score     当前用户增加/减少的分值
     */
    void inc(String name, long timestamp, double score, VoidCallback callback);

    /**
     * 设置更新当前用户分值(原有分值会被覆盖),如果存在多个排行周期,都会只保留最后一次分值
     * 用于数据覆盖类排行榜,比如空气质量,体重测量等,不能和累积类排行榜的inc接口混用.
     *
     * @param name      排行榜名称
     * @param timestamp 时间点,如果为0,则表示当前时间(单位秒,UTC时间戳，相对于1970年的秒数)
     * @param score     更新分值
     */
    void set(String name, long timestamp, double score, VoidCallback callback);

    /**
     * 获取当前用户指定排行周期内(比如当天)的分值和排名
     *
     * @param name      排行榜名称
     * @param period    排行榜周期 (day, week, month)
     * @param timestamp 时间点，如果为0，则表示当前时间所在排行榜(UTC时间戳，相对于1970年的秒数)
     * @param order     排序方式: ASC(正序), DESC(逆序）
     * @param callback  当前用户某一时间点所在排行周期的分值和排名
     */
    void get(String name, String period, long timestamp, String order, PayloadCallback<ACRankingValue> callback);

    /**
     * 批量获取当前用户连续多排行周期内(比如上周每天)分值和排名等历史数据
     * </p>
     * 如取当前用户最近5天的排行数据(value以正序方式排名),则使用 ranks("ranking", "day", 0, 5, "ASC", ...)
     * 如取当前用户上一周每天的排行数据,则使用 ranks("ranking", "day", (System.currentTimeMillis() / 1000 - 7 * 24 * 60 * 60L), 7, "ASC", ...)
     *
     * @param name      排行榜名称
     * @param period    排行榜周期 (day, week, month)
     * @param timestamp 时间点，如果为0，则表示当前时间所在排行榜(UTC时间戳，相对于1970年的秒数)
     * @param count     向前取连续count个period周期
     * @param order     排序方式: ASC(正序), DESC(逆序）
     * @param callback  当前用户在指定周期内的历史排行
     */
    void ranks(String name, String period, long timestamp, long count, String order, PayloadCallback<List<ACRankingValue>> callback);

    /**
     * 获取指定某个排行周期内(比如当天)的所有参与排行的用户总数
     * <p/>
     * 如totalCount("ranking", "day", 0, ...) 代表查询当天的用户总数
     * 如当前时间为12:30, totalCount("ranking", "hour", 0, ...) 代表查询12:00-13:00的用户总数
     *
     * @param name      排行榜名称
     * @param period    排行榜周期(day, week, month)
     * @param timestamp 时间点，如果为0，则表示当前时间所在排行榜(UTC时间戳，相对于1970年的秒数)
     * @param callback  所有参与排行的用户总数
     */
    void totalCount(String name, String period, long timestamp, PayloadCallback<ACRankingCount> callback);

    /**
     * 获取指定排行周期内(比如当天)所有用户的score分值和rank排名等数据
     *
     * @param name      排行榜名称
     * @param period    排行榜周期 (day, week, month)
     * @param timestamp 时间点，如果为0，则表示当前时间所在排行榜(UTC时间戳，相对于1970年的秒数)
     * @param startRank 排名的起始名次 (闭区间,包含startRank)
     * @param endRank   排名的结束名次 (闭区间,包含endRank)
     * @param order     排序方式: ASC(正序), DESC(逆序）
     * @param callback  某一时间点所在排行周期，某个排名范围内的数据
     */
    void scan(String name, String period, long timestamp, long startRank, long endRank, String order, PayloadCallback<List<ACRankingValue>> callback);

    /**
     * 获取指定某个排行周期(比如当天)符合分值范围内所有用户的总数
     * <p/>
     * 如 rangeCount("ranking", "day", 0, 100, 200, ...) 代表查询当天value在100-200的用户总数
     *
     * @param name       排行榜名称
     * @param period     排行榜周期 (day, week, month)
     * @param timestamp  时间点，如果为0，则表示当前时间所在排行榜(单位秒,UTC时间戳,相对于1970年的秒数)
     * @param startScore 分值起始值 (闭区间,包含startScore)
     * @param endScore   分值结束值 (闭区间,包含endScore)
     * @param callback   所有符合分值范围用户总数
     */
    void rangeCount(String name, String period, long timestamp, double startScore, double endScore, PayloadCallback<ACRankingCount> callback);
}
```

##辅助功能
除以上基础功能外，AbleCloud SDK还提供了一些额外的辅助功能，如用户的意见反馈以及室外天气状况获取。
####用户意见反馈

```java
public interface ACFeedbackMgr {

    /**
     * 提交用户反馈信息
     *
     * @param feedback 用户自定义的反馈信息
     * @param callback 返回结果的监听回调
     */
    public void submitFeedback(ACFeedback feedback, VoidCallback callback);
}
```
####获取室外天气
SDK可以获取到室外的pm2.5, AQI(空气质量)以及天气状况.

```java
public interface ACWeatherMgr {
    /**
     * 获取最新的PM25值
     *
     * @param area 地区,如北京,只支持地级市
     */
    public void getLatestPM25(String area, PayloadCallback<ACPM25> callback);

    /**
     * 获取最近n天的PM25值
     *
     * @param area 地区,如北京,只支持地级市
     * @param day  最近n天,n最大为7,0表示7天
     */
    public void getLastDaysPM25(String area, int day, PayloadCallback<List<ACPM25>> callback);

    /**
     * 获取最近n小时的PM25值
     *
     * @param area 地区
     * @param hour 最近n个小时(0-24),0表示24小时
     */
    public void getLastHoursPM25(String area, int hour, PayloadCallback<List<ACPM25>> callback);

    /**
     * 获取最新的空气质量值
     *
     * @param area 地区
     */
    public void getLatestAqi(String area, PayloadCallback<ACAQI> callback);

    /**
     * 获取最近n天的空气质量值
     *
     * @param area 地区
     * @param day  最近n天,n最大为7,0表示7天
     */
    public void getLastDaysAqi(String area, int day, PayloadCallback<List<ACAQI>> callback);

    /**
     * 获取最近n小时的空气质量值
     *
     * @param area 地区
     * @param hour 最近n个小时(0-24),0表示24小时
     */
    public void getLastHoursAqi(String area, int hour, PayloadCallback<List<ACAQI>> callback);

    /**
     * 获取最新的温湿度
     *
     * @param area 地区
     */
    public void getLatestWeather(String area, PayloadCallback<ACWeather> callback);

    /**
     * 获取最近n天的温湿度
     *
     * @param area 地区
     * @param day  最近n天,n最大为7,0表示7天
     */
    public void getLastDaysWeather(String area, int day, PayloadCallback<List<ACWeather>> callback);

    /**
     * 获取最近n小时的温湿度
     *
     * @param area 地区
     * @param hour 最近n个小时(0-24),0表示24小时
     */
    public void getLastHoursWeather(String area, int hour, PayloadCallback<List<ACWeather>> callback);
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
     * @param thirdPlatform 第三方类型（如QQ、微信、微博、FaceBook等）
     * @param openId        通过第三方登录获取的openId
     * @param accessToken   通过第三方登录获取的accessToken
     * @param callback      返回结果的监听回调
     */
    public void loginWithOpenId(ACThirdPlatform thirdPlatform, String openId, String accessToken, PayloadCallback<ACUserInfo> callback);

    /**
     * 绑定第三方账号
     *
     * @param thirdPlatform 第三方类型（如QQ、微信、微博、FaceBook等）
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
<font color="red">注意：</font>用户调用登录接口成功之后，会在app本地存储一个token，下次启动app时即默认app已经登录，无需再进行登录，从v1.09版本之后，这个token具有有效期，在长期未使用app的情况下会过期，这个时候需要进行重新登录处理，所以建议在主页获取设备列表的错误回调里对3516的token过期错误码进行单独处理，返回登录页让用户重新登录。

##2、设备激活

```java
public interface ACDeviceMgr {

    /**
     * 设备激活,如蓝牙设备每次连接到app时需要调用此接口
     *
     * @param subDomain    子域名，如djj（豆浆机）
     * @param deviceActive 激活设备信息
     * @param callback     返回结果的监听回调
     */
    public void activateDevice(String subDomain, ACDeviceActive deviceActive, VoidCallback callback);
}
```
> 通过`AC.deviceMgr()`获取设备管理器

##3、设备管理

```java
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
   
##4、OTA

```java
public interface ACOTAMgr {

    /**
     * 检查设备OTA发布版本
     * 不管有无新版本，都会回调ACOTAUpgradeInfo，根据isUpdate()判断有无OTA更新
     *
     * @param subDomain 子域名，如djj（豆浆机）
     * @param checkInfo 设备与OTA信息
     * @param callback  返回结果的监听回调
     */
    public void checkUpdate(String subDomain, ACOTACheckInfo checkInfo, PayloadCallback<ACOTAUpgradeInfo> callback);

    /**
     * OTA文件下载成功后,建议开发者调用此接口通知云端下载文件成功
     * 此接口只用于AbleCloud控制台OTA日志追踪
     *
     * @param subDomain        子域名，如djj（豆浆机）
     * @param physicalDeviceId 设备物理ID
     * @param currentVersion   设备当前版本号
     * @param targetVersion    下载的版本号
     * @param callback         返回结果的监听回调
     */
    public void otaMediaDone(String subDomain, String physicalDeviceId, String currentVersion, String targetVersion, VoidCallback callback);
}
```

##5、消息推送

参考[开发指导-安卓-推送](../develop_guide/android/#_34)

##6、和云端通信

```java
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

##7、文件存储
如果需要使用文件上传下载管理服务(如OTA，头像管理，录音文件等)，在SDK端提供了相应的接口，首先需要获取定时管理器`AC.fileMgr()`,具体接口定义如下：

```java
public interface ACFileMgr {

    /**
     * 获取下载url
     *
     * @param fileInfo   文件下载信息
     * @param expireTime URL有效期，单位秒，国内环境下若小于等于0则默认为int32的最大值≈80年，国外环境暂时不支持长期有效
     */
    public void getDownloadUrl(ACFileInfo fileInfo, long expireTime, PayloadCallback<String> callback);


    /**
     * 下载文件到内存里,适合小文件下载（如头像下载）
     *
     * @param url              文件下载的url
     * @param checksum         文件校验和,除OTA升级外一般情况下不需要检查校验和(0代表不检查crc)
     * @param progressCallback 下载进度回调，百分比，不需要时传null
     * @param callback         下载结果回调
     */
    public void downloadFile(String url, int checksum, ProgressCallback progressCallback, PayloadCallback<byte[]> callback);

    /**
     * 下载文件到本地sdcard，适合大文件下载,支持断点续传
     *
     * @param file             文件下载的路径File对象
     * @param url              文件下载的url
     * @param checksum         文件校验和,除OTA升级外一般情况下不需要检查校验和(0代表不检查crc)
     * @param progressCallback 下载进度回调,百分比,不需要时传null
     * @param callback         下载结果回调
     */
    public void downloadFile(File file, String url, int checksum, ProgressCallback progressCallback, VoidCallback callback);

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

##8、排行榜
除了存储服务之外，AbleCloud还提供了丰富的排行榜功能，支持对多用户不同时间段进行排行操作。具体接口定义如下：

```java
public interface ACRankingMgr {

    /**
     * 增加或减少当前用户的分值(原有分值进行累加),如果存在多个排行周期,全部累加更新
     * 用于数据累积类排行榜,比如记步,游戏积分等,不能和覆盖类排行榜的set接口混用.
     *
     * @param name      排行榜名称
     * @param timestamp 时间点,如果为0,则表示当前时间(单位秒,UTC时间戳，相对于1970年的秒数)
     * @param score     当前用户增加/减少的分值
     */
    void inc(String name, long timestamp, double score, VoidCallback callback);

    /**
     * 设置更新当前用户分值(原有分值会被覆盖),如果存在多个排行周期,都会只保留最后一次分值
     * 用于数据覆盖类排行榜,比如空气质量,体重测量等,不能和累积类排行榜的inc接口混用.
     *
     * @param name      排行榜名称
     * @param timestamp 时间点,如果为0,则表示当前时间(单位秒,UTC时间戳，相对于1970年的秒数)
     * @param score     更新分值
     */
    void set(String name, long timestamp, double score, VoidCallback callback);

    /**
     * 获取当前用户指定排行周期内(比如当天)的分值和排名
     *
     * @param name      排行榜名称
     * @param period    排行榜周期 (day, week, month)
     * @param timestamp 时间点，如果为0，则表示当前时间所在排行榜(UTC时间戳，相对于1970年的秒数)
     * @param order     排序方式: ASC(正序), DESC(逆序）
     * @param callback  当前用户某一时间点所在排行周期的分值和排名
     */
    void get(String name, String period, long timestamp, String order, PayloadCallback<ACRankingValue> callback);

    /**
     * 批量获取当前用户连续多排行周期内(比如上周每天)分值和排名等历史数据
     * </p>
     * 如取当前用户最近5天的排行数据(value以正序方式排名),则使用 ranks("ranking", "day", 0, 5, "ASC", ...)
     * 如取当前用户上一周每天的排行数据,则使用 ranks("ranking", "day", (System.currentTimeMillis() / 1000 - 7 * 24 * 60 * 60L), 7, "ASC", ...)
     *
     * @param name      排行榜名称
     * @param period    排行榜周期 (day, week, month)
     * @param timestamp 时间点，如果为0，则表示当前时间所在排行榜(UTC时间戳，相对于1970年的秒数)
     * @param count     向前取连续count个period周期
     * @param order     排序方式: ASC(正序), DESC(逆序）
     * @param callback  当前用户在指定周期内的历史排行
     */
    void ranks(String name, String period, long timestamp, long count, String order, PayloadCallback<List<ACRankingValue>> callback);

    /**
     * 获取指定某个排行周期内(比如当天)的所有参与排行的用户总数
     * <p/>
     * 如totalCount("ranking", "day", 0, ...) 代表查询当天的用户总数
     * 如当前时间为12:30, totalCount("ranking", "hour", 0, ...) 代表查询12:00-13:00的用户总数
     *
     * @param name      排行榜名称
     * @param period    排行榜周期(day, week, month)
     * @param timestamp 时间点，如果为0，则表示当前时间所在排行榜(UTC时间戳，相对于1970年的秒数)
     * @param callback  所有参与排行的用户总数
     */
    void totalCount(String name, String period, long timestamp, PayloadCallback<ACRankingCount> callback);

    /**
     * 获取指定排行周期内(比如当天)所有用户的score分值和rank排名等数据
     *
     * @param name      排行榜名称
     * @param period    排行榜周期 (day, week, month)
     * @param timestamp 时间点，如果为0，则表示当前时间所在排行榜(UTC时间戳，相对于1970年的秒数)
     * @param startRank 排名的起始名次 (闭区间,包含startRank)
     * @param endRank   排名的结束名次 (闭区间,包含endRank)
     * @param order     排序方式: ASC(正序), DESC(逆序）
     * @param callback  某一时间点所在排行周期，某个排名范围内的数据
     */
    void scan(String name, String period, long timestamp, long startRank, long endRank, String order, PayloadCallback<List<ACRankingValue>> callback);

    /**
     * 获取指定某个排行周期(比如当天)符合分值范围内所有用户的总数
     * <p/>
     * 如 rangeCount("ranking", "day", 0, 100, 200, ...) 代表查询当天value在100-200的用户总数
     *
     * @param name       排行榜名称
     * @param period     排行榜周期 (day, week, month)
     * @param timestamp  时间点，如果为0，则表示当前时间所在排行榜(单位秒,UTC时间戳,相对于1970年的秒数)
     * @param startScore 分值起始值 (闭区间,包含startScore)
     * @param endScore   分值结束值 (闭区间,包含endScore)
     * @param callback   所有符合分值范围用户总数
     */
    void rangeCount(String name, String period, long timestamp, double startScore, double endScore, PayloadCallback<ACRankingCount> callback);
}
```

##9、辅助功能
除以上基础功能外，AbleCloud SDK还提供了一些额外的辅助功能，如用户的意见反馈以及室外天气状况获取。
####用户意见反馈

```java
public interface ACFeedbackMgr {

    /**
     * 提交用户反馈信息
     *
     * @param feedback 用户自定义的反馈信息
     * @param callback 返回结果的监听回调
     */
    public void submitFeedback(ACFeedback feedback, VoidCallback callback);
}
```
####获取室外天气
SDK可以获取到室外的pm2.5, AQI(空气质量)以及天气状况.

```java
public interface ACWeatherMgr {
    /**
     * 获取最新的PM25值
     *
     * @param area 地区,如北京,只支持地级市
     */
    public void getLatestPM25(String area, PayloadCallback<ACPM25> callback);

    /**
     * 获取最近n天的PM25值
     *
     * @param area 地区,如北京,只支持地级市
     * @param day  最近n天,n最大为7,0表示7天
     */
    public void getLastDaysPM25(String area, int day, PayloadCallback<List<ACPM25>> callback);

    /**
     * 获取最近n小时的PM25值
     *
     * @param area 地区
     * @param hour 最近n个小时(0-24),0表示24小时
     */
    public void getLastHoursPM25(String area, int hour, PayloadCallback<List<ACPM25>> callback);

    /**
     * 获取最新的空气质量值
     *
     * @param area 地区
     */
    public void getLatestAqi(String area, PayloadCallback<ACAQI> callback);

    /**
     * 获取最近n天的空气质量值
     *
     * @param area 地区
     * @param day  最近n天,n最大为7,0表示7天
     */
    public void getLastDaysAqi(String area, int day, PayloadCallback<List<ACAQI>> callback);

    /**
     * 获取最近n小时的空气质量值
     *
     * @param area 地区
     * @param hour 最近n个小时(0-24),0表示24小时
     */
    public void getLastHoursAqi(String area, int hour, PayloadCallback<List<ACAQI>> callback);

    /**
     * 获取最新的温湿度
     *
     * @param area 地区
     */
    public void getLatestWeather(String area, PayloadCallback<ACWeather> callback);

    /**
     * 获取最近n天的温湿度
     *
     * @param area 地区
     * @param day  最近n天,n最大为7,0表示7天
     */
    public void getLastDaysWeather(String area, int day, PayloadCallback<List<ACWeather>> callback);

    /**
     * 获取最近n小时的温湿度
     *
     * @param area 地区
     * @param hour 最近n个小时(0-24),0表示24小时
     */
    public void getLastHoursWeather(String area, int hour, PayloadCallback<List<ACWeather>> callback);
}
```

#Error Code
参考[reference-Error Code](../reference/error_code.md)

>+ **建议在调用AbleCloud云服务接口之前先判断网络处于可访问状态之后再调用相关接口，可以省去对error回调里网络错误的处理。**
>+ **调试阶段，可通过`e.getErrorCode()`获取错误码，`e.getMessage()`获取错误信息。**

