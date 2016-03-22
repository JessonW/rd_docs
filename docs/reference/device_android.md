#安卓设备开发指导
#交互消息
首先，我们从基础的数据结构开始。我们知道，安卓设备APP会与后端服务和普通app进行交互，因此AbleCloud定义了与云端的消息格式：

+ **ACDeviceMsg：**安卓设备与服务或普通app之间的交互消息，使用二进制或json或klv通讯协议。

##基本数据结构
####ACDeviceMsg
该消息用于处理安卓设备与服务之间的交互，框架会将ACDeviceMsg中的code部分解析出来，开发者可根据[code](firmware/wifi_interface_guide/#13 "消息码说明")来区分设备消息类型。但是ACDeviceMsg的payload部分由开发者解释，框架透传。ACDeviceMsg定义如下：

```java
public class ACDeviceMsg {

    /**
     * 消息码，用于区分消息类型
     * <p/>
     * 注意：64-200范围代表控制查询响应，200以上范围代表消息主动上报
     */
    private int msgCode;
    
    /**
     * 消息体，数据包payload，由开发者自己解析；
     * <p/>
     * 注意：若使用KLV格式消息进行交互，则通过getKLVObject方法获取KLVObject，其他格式则直接通过getPayload获取
     */
    private byte[] payload;

    /**
     * 消息下发类型
     * <p/>
     * CLOUD代表云端控制，DIRECT代表直连控制
     */
    private OpType type;
    
    //网关设备使用
    private ACSubDevice subDevice;
   
    //若使用通讯协议为KLV格式，则通过getKLVObject获取消息req
    public ACKLVObject getKLVObject() {}
    
    //若使用通讯协议为KLV格式，则通过setKLVObject设置resp（注意resp不需设置msgCode）
    public void setKLVObject(ACKLVObject object) {} 
	       
	//若使用通讯协议为二进制格式，则通过getPayload获取消息req
    public byte[] getPayload() {}
    
    //若使用通讯协议为二进制格式，则通过setPayload设置resp
    public void setPayload(byte[] payload) {}

    //若使用通讯协议为json格式，则通过getJsonPayload获取消息req
    public String getJsonPayload() {}

    //若使用通讯协议为json格式，则通过getJsonPayload设置resp（注意resp不需设置msgCode）
    public void setJsonPayload(String payload) {}

    /**
     * 判断消息下发控制对象
     *
     * @return true即为网关给子设备发送消息，false则为给网关自己发送消息
     */
    public boolean isSendToSubDevice() {}

    /**
     * 若消息下发对象为子设备，则通过此接口获取子设备信息
     *
     * @return ACSubDevice对象，具体定义如下所示
     */
    public ACSubDevice getSubDevice() {}
    
    //若为网关子设备上报消息，则需要调此接口设置子设备信息，其他情况下不需要调用
    public void setSubDevice(ACSubDevice subDevice) {
    
    public enum OpType {
        DIRECT,
        CLOUD
    }
}
```
从上面的定义可以看到，开发者需要根据code的不同值设置不同的resp，注意64-200范围代表控制查询响应，200以上范围代表消息主动上报

####ACKLVObject
ACKLVObject用于承载KLV数据格式交互的具体数据，我们称之为payload（负载）。

```java
public class ACKLVObject {
    private HashMap<Integer, Object> data = new HashMap<>();
   
    /**
     * 允许put参数的类型
     */
    private boolean checkType(Object o) {
        return  o == null ||
                o instanceof Boolean ||
                o instanceof Byte ||
                o instanceof Short ||
                o instanceof Integer ||
                o instanceof Long ||
                o instanceof Float ||
                o instanceof Double ||
                o instanceof String ||
                o instanceof byte[]
    }
    
	/**
     * 设置一个参数
     * @param key	参数名
     * @param <T>	参数值
     * @return
     */
    public <T> ACKLVObject put(String key, T value) {}

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
><font color="brown">**注：**最常用的两个接口是put/get，若使用二进制或json的通讯协议，则不需要用到该类</font>

####ACSubDevice
该对象为网关子设备承载信息，独立设备则无需关心，具体接口定义如下：

```java
public class ACSubDevice {
    //子设备主域
    private long domainId;
    //子设备主域下所在子域
    private long subDomainId;
    //子设备物理Id(网关物理Id默认为4个0加mac地址)
    private String physicalDeviceId;

    public ACSubDevice(long domainId, long subDomainId, String physicalDeviceId) {}

    //getter
```

####ACOTACheckInfo
说明：设置设备渠道跟批次检查是否有OTA升级，定义如下：

```java
public class ACOTACheckInfo {
    //设备渠道
    private String channel;
    //设备批次
    private String batch;

    public ACOTACheckInfo() {}

    public ACOTACheckInfo(String channel, String batch) {}
```

####ACOTAUpgradeInfo
说明：用来获取OTA升级状态信息，定义如下：

```java
public class ACOTAUpgradeInfo {
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

    public ACOTAUpgradeInfo(String targetVersion, int otaMode, String upgradeLog, int status, List<ACOTAFileInfo> files) {}

    //getter
}
```

####ACOTAFileInfo
说明：OTA升级文件信息，定义如下：

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

####ACFileInfo
说明：文件管理中获取下载url或上传文件时用来表示文件信息，定义如下：

```java
public class ACFileInfo {
    //自定义文件目录，如ota
    private String bucket;
    //文件名
    private String filename;
    //上传文件二进制流数据，用于小文件上传，如拍照后头像直接上传
    private byte[] data;
    //上传文件的File对象，用于大文件上传，从内存卡读取文件
    private File file;

    public ACFileInfo(String bucket, String filename) {
    }
}
```
>data与file二选其一上传数据，一同赋值情况下，以data为准

##消息处理接口Handler

####ACConnectChangeListener

```java
public interface ACConnectChangeListener {
    
    /**
     * 设备连接上云端或者从云端断开连接时触发
     * 
     * 内置自动重连机制，开发者只需要可通过此接口提醒用户
     */
    void connect();

    void disconnect();
}
```

####ACMsgHandler

```java
public interface ACMsgHandler {

    /**
     * 处理Service-->安卓设备之间的交互消息
     *
     * @param reqMsg  请求消息体
     * @param respMsg 响应消息体
     */
    void handleMsg(ACDeviceMsg reqMsg, ACDeviceMsg respMsg);
}
```

####ACGatewayHandler

```java
public interface ACGatewayHandler {

    /**
     * 开启网关子设备接入
     *
     * @param timeout 超时时间
     * @throws Exception 开启失败即抛出异常
     */
    public void openGatewayMatch(long timeout) throws Exception;

    /**
     * 停止网关子设备接入
     * 
     * @throws Exception 停止失败即抛出异常
     */
    public void closeGatewayMatch() throws Exception;

    /**
     * 通知云端接入的所有子设备
     *
     * @param subDevices 所有接入的子设备列表（包括绑定或未绑定）
     */
    public void listSubDevices(List<ACSubDevice> subDevices);

    /**
     * 查询子设备是否在线
     *
     * @param subDevice 子设备
     */
    public boolean isSubDeviceOnline(ACSubDevice subDevice);

    /**
     * 剔除子设备（用户解绑子设备后，剔除该子设备接入）
     *
     * @param subDevice 解绑的子设备
     * @throws Exception 剔除失败即抛出异常
     */
    public void evictSubDevice(ACSubDevice subDevice) throws Exception;
}
```
#SDK
##AC
前面，我们介绍了ablecloud SDK的交互消息，那到底具体该如何使用呢？SDK入口均通过AC来获取，简而言之，AC可以认为是SDK的框架，通过AC，开发者可以根据需要获取一系列服务、功能的接口。AC的定义如下：

```java
public class AC {
    
    /**
     * 请在主Activity的onCreate()中初始化设备物理ID并开始连云操作
     *
     * @param context          Context实例
     * @param physicalDeviceId AbleCloud设备物理ID，长度为16个字节，厂商需自己保证唯一性
     */
    public static void init(Context context, String physicalDeviceId) {}
    
    /**
     * 设置安卓设备连接状态的监听器
     * 注意：若多次设置监听，则只有最后一次设置有效，以下handleMsg接口也是如此；
     * 若提示消息或其他操作不涉及activity的其他元素，比如只需要显示toast，建议把它放在application里
     * 若有多个activity需要监听网络状态，则建议把它放在前一个activity的onResume函数里，当后一个activity返回时前一个activity依然生效
     *
     * @param listener sdk内部会自动进行断线重连，所以此处只需要取状态用于更新界面显示或提示用户
     */
    public static void setConnectListener(ACConnectChangeListener listener) {}
    
    /**
     * 处理Service-->安卓设备之间的交互消息
     *
     * @param handler 根据msgCode做不同处理并设置resp
     */
    public static void handleMsg(ACMsgHandler handler) {}
    
    /**
     * 处理网关子设备接入的交互消息
     *
     * @param handler 具体定义如下所示
     */
    public static void handleGatewayMsg(ACGatewayHandler handler) {}
    
    /**
     * 安卓设备主动上报数据到云端
     * 设备汇报的消息不需要响应。
     *
     * @param reqMsg 请求消息体
     * @throws Exception
     */
    public static void reportDeviceMsg(ACDeviceMsg reqMsg) {}
   
    /**
     * 在退出app的时候调用
     */
    public static void DeviceSleep() {}
    
    /**
     * 获取设备激活相关管理器
     * sdk内部调用，开发者可通过此更新设备地理位置信息
     *
     * @return 设备激活相关管理器
     */
    public static ACDeviceMgr deviceMgr() {}
    
    /**
     * 获取OTA管理器
     *
     * @return OTA管理器
     */
    public static ACOTAMgr otaMgr() {}

    /**
     * 获取文件上传下载管理器
     *
     * @return 文件管理器
     */
    public static ACFileMgr fileMgr() {}
}
```

##OTA
在智能硬件领域，当设备固件需要升级的时候，可以借助OTA实现远程升级。首先需要获取定时管理器`AC.otaMgr()`，接口定义如下：

```java
public interface ACOTAMgr {

    /**
     * 定时查询设备OTA发布版本接口,内部通过timer实现,需在UI线程里调用
     *
     * @param checkInfo 设备OTA渠道与批次信息,可为null
     * @param duration  查询间隔时间（单位为分钟）
     * @param callback  返回结果的监听回调
     */
    public void startCheckOtaVersion(ACOTACheckInfo checkInfo, int duration, PayloadCallback<ACOTAUpgradeInfo> callback);

    /**
     * 在app退出时候停止查询
     */
    public void stopCheckOtaVersion();

    /**
     * 更新定時查詢任務的信息
     *
     * @param checkInfo 设备OTA信息
     */
    public void updateCheckInfo(ACOTACheckInfo checkInfo);

    /**
     * 查询设备OTA发布版本接口
     *
     * @param checkInfo 设备OTA渠道与批次信息,可为null
     * @param callback  返回结果的监听回调
     */
    public void checkOtaVersion(ACOTACheckInfo checkInfo, PayloadCallback<ACOTAUpgradeInfo> callback);

    /**
     * OTA文件下载成功后,建议开发者调用此接口通知云端下载文件成功
     * 此接口只用于AbleCloud控制台OTA日志追踪
     *
     * @param targetVersion 下载的版本号
     * @param callback      返回结果的监听回调
     */
    public void otaMediaDone(String targetVersion, VoidCallback callback);
}
```

##文件存储
如果需要使用文件上传下载管理服务(如OTA，头像管理，录音文件等)，在SDK端提供了相应的接口，首先需要获取定时管理器`AC.fileMgr()`,具体接口定义如下：

```java
public interface ACFileMgr {

    /**
     * 获取下载url
     *
     * @param fileInfo   文件下载信息
     * @param expireTime URL有效期，单位秒，若小于等于0则默认为int32的最大值≈80年
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
     * @param fileInfo 文件信息
     */
    public void cancelUpload(ACFileInfo fileInfo);
}
```






