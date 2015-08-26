#安卓设备开发文档
##开发步骤
####SDK发布库
AbleCloud发布的安卓设备SDK为`ac_device_android.jar`，除此之外，还需要导入`libDevice-Service.so`文件（可根据不同cpu做不同选择）
>具体步骤:把文件拷入你自己的工程的libs目录下并设置依赖

####开发环境设置
以下为 AbleCloud Android SDK 需要的所有的权限，请在你的AndroidManifest.xml文件里的`<manifest>`标签里添加
```java
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE"/>
```

####应用程序初始化
在你的应用使用AbleCloud服务之前，你需要在代码中对AbleCloud SDK进行初始化。
> 具体步骤:在启动App的`MainActivity`的`onCreate()`方法中调用此方法来进行初始化

开发阶段，请初始化测试环境
```java
/**
     * 请在主Activity的onCreate()中初始化安卓设备信息并开始连云操作
     *
     * @param mContext      获取Context实例
     * @param MajorDomainId AbleCloud domainId，可到AbleCloud平台工程管理查看
     * @param SubDomainId   AbleCloud subDomainId，可到AbleCloud平台工程管理查看
     * @param secretKey     AbleCloud设备私钥，在设备管理中-->设备入库-->按工程批量注册-->入库模式-->统一入库对应这里私钥，同时把设备对应的公钥入库,如选择批量入库，则需要把每个设备对应的公钥和私钥文件上传
     * @param version       AbleCloud设备版本，格式为"1-0-0";在初始化一个OTA版本后，若需要进行OTA升级，需要在设备管理中-->OTA-->新建OTA版本把新的apk文件上传
     * @param mode          AC.TEST_MODE,当迁移到正式环境后使用AC.PRODUCTION_MODE
     */
AC.init(this, MajorDomainId, SubDomainId, SecretKey, Version, AC.TEST_MODE);
```
在完成测试阶段之后，需要迁移到正式环境下
```java
AC.init(this, MajorDomainId, SubDomainId, SecretKey, Version, AC.PRODUCTION_MODE);
```

##交互消息
首先，我们从基础的数据结构开始。我们知道，安卓设备APP会与后端服务和普通app进行交互，因此AbleCloud定义了与的消息：

+ **ACDeviceMsg：**安卓设备与服务或普通app之间的交互消息，使用二进制或json或klv通讯协议。

###基础数据结构
####ACDeviceMsg
该消息用于处理安卓设备与服务之间的交互，框架会将ACDeviceMsg中的code部分解析出来，开发者可根据[code](firmware/wifi_interface_guide/#13 "消息码说明")来区分设备消息类型。但是ACDeviceMsg的payload部分由开发者解释，框架透传。ACDeviceMsg定义如下：
```java
public class ACDeviceMsg {
    //消息码，用于区分消息类型
    private int msgCode;
    private byte[] payload;
    private List<ACMessageOption> optionList;

    public ACDeviceMsg() {}

    public ACDeviceMsg(int msgCode, byte[] payload) {}
    
    /**
     * 消息数据包
     *
     * @param msgCode 注意：64-200范围代表控制查询响应，200以上范围代表消息主动上报
     * @param payload 消息数据包payload，由开发者自己解析；若使用KLV格式消息进行交互，则通过getKLVObject方法获取KLVObject
     * @param optionList 该项只用于网关对于子设备的处理，若安卓设备不为网关，则不需关心
     */
    public ACDeviceMsg(int msgCode, byte[] payload, List<ACMessageOption> optionList) {}

    //若使用通讯协议为KLV格式，则通过getKLVObject获取消息req
    public ACKLVObject getKLVObject() {}
    
    //若使用通讯协议为KLV格式，则通过setKLVObject设置resp
    public void setKLVObject(ACKLVObject object) {} 
	       
	//若使用通讯协议为二进制或json格式，则通过getPayload获取消息req
    public byte[] getPayload() {}
    
    //若使用通讯协议为二进制或json格式，则通过setPayload设置resp
    public void setPayload(byte[] payload) {}
}
```
从上面的定义可以看到，开发者需要根据code的不同值设置不同的resp

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

##SDK
###AC
前面，我们介绍了ablecloud SDK的交互消息，那到底具体该如何使用呢？SDK入口均通过AC来获取，简而言之，AC可以认为是SDK的框架，通过AC，开发者可以根据需要获取一系列服务、功能的接口。AC的定义如下：
```java
public class AC {

    /**
     * 调试模式
     */
    public static final int TEST_MODE = 1;
    public static final int PRODUCTION_MODE = 0;
    
    public static void init(Context context, long MajorDomainId, long SubDomainId, String secretKey, String version, int mode) {}

    /**
     * 获取本机Mac地址，即AbleCloud物理Id，可用于生成二维码进行绑定
     *
     * @return 物理Id
     */
    public static String getMacAddress() {}
    
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
    public static void DeviceSleep() {
}
```

##Demo
AbleCloud提供的Demo使用的是AbleCloud的测试Domain等信息，若想开发自己的工程，则需要通过修改Demo里com.accloud.ac_device_android_demo.config.Config.java文件里的配置项即可。

下面以开关灯为例，简要介绍与安卓设备通讯的例子：

###1、使用KLV消息格式进行通讯
**在新建产品的时候选择klv通讯协议，并填写数据点与数据包**
**例如**：以开关灯为例,协议如下:

>+  **请求数据包code:68**
>>  数据点key:1
>>+  value:0       //关闭
>>+  value:1       //开启

>+ **响应数据包code:102**
>>+  数据点key:1
>> value:0       //失败
>> value:1       //成功
```java
AC.handleMsg(new ACMsgHandler() {
    @Override
    public void handleMsg(ACDeviceMsg reqMsg, ACDeviceMsg respMsg) {
         switch (reqMsg.getMsgCode()) {
             case 68:
                 //请求消息体
                 ACKLVObject req = reqMsg.getKLVObject();
                 //请求操作类型，关灯或开灯
                 int type = req.get(1);
                 //响应消息体
                 ACKLVObject resp = new ACKLVObject();
                 if (type == 0) {
                     //关灯成功
                     if (Light.turnLightOff()) {
                         resp.put(1, 1);
                     //关灯失败
                     } else {
                         resp.put(1, 0);
                     }
                 } else if (type == 1) {
                     //开灯成功
                     if (Light.turnLightOn()) {
                         resp.put(1, 1);
                     //开灯失败
                     } else {
                         resp.put(1, 0);
                     }
                 }
                 //设置响应code
                 respMsg.setMsgCode(102);
                 //设置响应消息体
                 respMsg.setKLVObject(resp);
                 break;
        }
    }
});
```

###2、使用二进制消息格式进行通讯
**例如**：以开关灯为例,协议如下:
>+ **请求数据包code:68** 
>>+ 开灯:{1,0,0,0}
>>+ 关灯:{0,0,0,0}

>+ **响应数据包code:102**
>>+ 成功:{1,0,0,0}
>>+ 失败:{0,0,0,0}
```java
AC.handleMsg(new ACMsgHandler() {
    @Override
    public void handleMsg(ACDeviceMsg req, ACDeviceMsg resp) {
        switch (req.getMsgCode()) {
            case 68:
                if (req.getPayload()[0] == 1) {
                    if (Light.turnLightOn())
                        resp.setPayload(new byte[]{1, 0, 0, 0});
                    else
                        resp.setPayload(new byte[]{0, 0, 0, 0});
                } else {
                    if (Light.turnLightOff())
                        resp.setPayload(new byte[]{1, 0, 0, 0});
                    else
                        resp.setPayload(new byte[]{0, 0, 0, 0});
                }
                resp.setMsgCode(102);
                break;
        }
    }
});
```


