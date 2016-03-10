#安卓设备开发指导
#开发准备
####SDK发布库
AbleCloud发布的安卓设备SDK为`ac_device_android.jar`，除此之外，还需要导入`libDevice-Service.so`文件（可根据不同cpu做不同选择）

>**具体步骤**:把文件拷入你自己的工程的libs目录下并设置依赖。
 
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
在你的`AndroidManifest.xml`文件里的`<application>`标签里添加

```xml
<!-- [Required] 进入AbleCloud管理控制台,对应"产品管理->主域" -->
<meta-data android:name="major-domain" android:value="ablecloud"/>
<!-- [Required] 进入AbleCloud管理控制台,对应"产品管理->主域ID" -->
<meta-data android:name="major-domain-id" android:value="3"/>
<!-- [Required] 进入AbleCloud管理控制台,对应"产品管理->产品列表->子域".注意,若subDomain为数字,则需在数字前面加\0 -->
<meta-data android:name="sub-domain" android:value="test"/>
<!-- [Required] 进入AbleCloud管理控制台,对应"产品管理->产品列表->子域ID" -->
<meta-data android:name="sub-domain-id" android:value="6"/>

<!-- [Optional] 环境设置,默认值为0(0正式环境 1测试环境) -->
<meta-data android:name="mode" android:value="1"/>
<!-- [Optional] 地域设置,默认值为0(0北京地区 1东南亚地区 2华东地区) -->
<meta-data android:name="region" android:value="0"/>
<!-- [Optional] 设备私钥,正式环境下为必填项,对应"产品管理->产品列表->点击管理->设备密钥->私钥" 若使用AbleCloud默认分配的密钥对，则填写默认密钥里的私钥，如选择设备独立密钥入库，则需要使用密钥生成工具自己生成公私钥并上传文件-->
<meta-data android:name="secret-key" android:value="bd0d6a5c4aeddc963351d855e63f7241b6ac72338c0a44285fdfe478cfd2b2c3e1313de686db997d8c13d0bc629a8109d6ea780d8e0f5a45c024a254702da46bdcd95f1cc36b80a7c905f1f39f3c698921b0354b62a6536f35944881d5e7c1ab30c3722a6b9f1a86b911e44ba618add9"/>
<!-- [Optional] 设备版本,格式为"1-0-0",不设置情况下默认值为"1-0-0" -->
<meta-data android:name="version" android:value="1-0-0"/>
```

另外在你的应用使用AbleCloud服务之前，你需要在代码中对AbleCloud SDK进行初始化。 继承Application类或者主Activity的onCreate()方法中调用此方法来进行初始化

```java
/**
 * 请在Application/主Activity的onCreate()中初始化设备物理ID并开始连云操作
 *
 * @param mContext         Context实例
 * @param physicalDeviceId AbleCloud设备物理ID，长度为16个字节，厂商需自己保证唯一性
 */
AC.init(Context Context, String PhysicalDeviceId);
```

><font color=red>注</font>：初始化操作时厂商需要为每个设备分配一个**16字节长度的物理ID**，并保证该ID的唯一性。在厂商没有自己唯一的设备标识号情况下，建议使用**WIFI MAC地址**或者**手机IMEI号**并补0或其他将长度拼至16字节；可通过AbleCloud控制台查看**在线设备**查看对应设备的物理ID。

#Demo
AbleCloud提供的Demo使用的是AbleCloud的测试Domain等信息。开发自己的工程时，请修改Demo里`com.accloud.ac_device_android_demo.config.Config.java`文件里以下的配置项。

```java
public static final long DOMAINID;
public static final long SUBDOMAINID;
public static final String VERSION;
public static final String SECRETKEY;
```

下面以开关灯为例，简要介绍与安卓设备通讯的例子：
####2、使用二进制消息格式进行通讯
以开关灯为例，协议如下：

```
//请求数据包
{ 68 ：[
     //关灯(二进制流，由厂商自己解析)
     { 0 , 0 , 0 , 0 },
     //开灯(二进制流，由厂商自己解析)   
     { 1 , 0 , 0 , 0 }
]}
//响应数据包  
{ 102 ：[
     //失败(二进制流，由厂商自己解析)
     { 0 , 0 , 0 , 0 },
     //成功(二进制流，由厂商自己解析)        
     { 1 , 0 , 0 , 0 }
]}
```

```java
private static final int OFF = 0;
private static final int ON = 1;

AC.handleMsg(new ACMsgHandler() {
    @Override
    public void handleMsg(ACDeviceMsg req, ACDeviceMsg resp) {
        switch (reqMsg.getMsgCode()) {
            case Config.CODE_SWITCH_REQ:
                //请求消息体
                byte[] payload = reqMsg.getPayload();
                if (payload[0] == ON) {
                    if (Light.turnLightOn()) {
                        respMsg.setPayload(new byte[]{1, 0, 0, 0});    //开灯成功
                    } else
                        respMsg.setPayload(new byte[]{0, 0, 0, 0});    //开灯失败
                } else {
                    if (Light.turnLightOff()) {
                        respMsg.setPayload(new byte[]{1, 0, 0, 0});    //关灯成功
                    } else
                        respMsg.setPayload(new byte[]{0, 0, 0, 0});    //关灯失败
                }
                respMsg.setMsgCode(Config.CODE_SWITCH_RESP);
                break;
        }
    }
});
```

数据上报：

```java
/**
 * 上报数据到AbleCloud云端
 *
 * @param status 开关状态，1代表开，0代表关
 * @param type   开关类型，0代表app控制，1代表本机控制
 */
public void reportLight(int status, int type) {
    ACDeviceMsg req = new ACDeviceMsg();
    req.setMsgCode(Config.CODE_REPORT);
    req.setPayload(new byte[]{(byte) status, (byte) type, 0, 0});
    //把数据真正上报给云端
    AC.reportDeviceMsg(req);
}
```

><font color=red>注意</font>：msgCode从64-200范围代表控制查询及响应，200-255范围代表消息主动上报，其他范围为AbleCloud内部使用，不允许重复定义。
####1、使用KLV消息格式进行通讯
**在新建产品的时候选择KLV通讯协议，并填写数据点与数据包**。
以开关灯为例,协议如下：

```
//请求数据包
{ 68 ：[
     //数据点[key：value(int8)]
     //关灯
     { 1 : 0 },
     //开灯      
     { 1 : 1 }
]}
//响应数据包  
{ 60 ：[
     //数据点[key：value(int8)]
     //失败
     { 1 : false },
     //成功      
     { 1 : true }
]}
```

```java
private static final int OFF = 0;
private static final int ON = 1;

AC.handleMsg(new ACMsgHandler() {
    @Override
    public void handleMsg(ACDeviceMsg reqMsg, ACDeviceMsg respMsg) {
         //KLV格式的resp不需要设置msgCode
         switch (reqMsg.getMsgCode()) {
            case Config.CODE_KLV:
                //请求消息体
                ACKLVObject req = reqMsg.getKLVObject();
                //请求操作类型，关灯或开灯
                int value = req.get(Config.KEY_SWITCH);
                //响应消息体
                ACKLVObject resp = new ACKLVObject();
                if (value == ON) {
                    if (Light.turnLightOn()) {
                        resp.put(Config.KEY_SWITCH, true);    //开灯成功
                        respMsg.setKLVObject(resp);
                    } else {
                        resp.put(Config.KEY_SWITCH, false);   //开灯失败
                        respMsg.setKLVObject(resp);
                    }
                } else if (value == OFF) {
                    if (Light.turnLightOff()) {
                        resp.put(Config.KEY_SWITCH, true);    //关灯成功
                        respMsg.setKLVObject(resp);
                    } else {
                        resp.put(Config.KEY_SWITCH, false);   //关灯失败
                        respMsg.setKLVObject(resp);
                    }
                }
                break;
        }
    }
});
```
数据上报：

```java
/**
 * 上报数据到AbleCloud云端
 *
 * @param status 开关状态，1代表开，0代表关
 * @param type   开关类型，0代表app控制，1代表本机控制
 */
public void reportLight(int status, int type) {
    ACDeviceMsg req = new ACDeviceMsg();
    req.setMsgCode(Config.CODE_REPORT);
    ACKLVObject object = new ACKLVObject();
    object.put(Config.KEY_SWITCH, (byte) status);
    object.put(Config.KEY_TYPE, (byte) type);
    req.setKLVObject(object);
    //把数据真正上报给云端
    AC.reportDeviceMsg(req);
}
```
><font color=red>注意</font>：msgCode从64-200范围代表控制查询及响应，200-255范围代表消息主动上报，其他范围为AbleCloud内部使用，不允许重复定义。

####3、使用JSON消息格式进行通讯
以开关灯为例，协议如下：

```
//请求数据包
{ 70 ：[
     //关灯
     {"switch", 0}
     //开灯
     {"switch", 1}
]}
//响应数据包  
{ 102 ：[
     //失败
     {"result", false},
     //成功   
     {"result", true}
]}
```

```java
private static final int OFF = 0;
private static final int ON = 1;

AC.handleMsg(new ACMsgHandler() {
    @Override
    public void handleMsg(ACDeviceMsg req, ACDeviceMsg resp) {
        //JSON格式的resp不需要设置msgCode
        switch (reqMsg.getMsgCode()) {
            case Config.CODE_JSON:
                //请求消息体
                JSONObject req = new JSONObject(reqMsg.getJsonPayload());
                //请求操作类型，关灯或开灯
                int value = req.getInt("switch");
                //响应消息体
                JSONObject resp = new JSONObject();
                if (value == ON) {
                    if (Light.turnLightOn()) {
                        resp.put("result", true);
                        respMsg.setJsonPayload(resp.toString());    //开灯成功
                    } else {
                        resp.put("result", false);
                        respMsg.setJsonPayload(resp.toString());    //开灯失败
                    }
                } else if (value == OFF) {
                    if (Light.turnLightOff()) {
                        resp.put("result", true);
                        respMsg.setJsonPayload(resp.toString());    //关灯成功
                    } else {
                        resp.put("result", false);
                        respMsg.setJsonPayload(resp.toString());    //关灯失败
                    }
                }
                break;
        }
    }
});
```
```java
/**
 * 上报数据到AbleCloud云端
 *
 * @param status 开关状态，1代表开，0代表关
 * @param type   开关类型，0代表app控制，1代表本机控制
 */
public void reportLight(int status, int type) {
    ACDeviceMsg req = new ACDeviceMsg();
    req.setMsgCode(Config.CODE_REPORT);
    JSONObject jsonObject = new JSONObject();
    try {
        jsonObject.put("status", status);
        jsonObject.put("controltype", type);
        req.setJsonPayload(jsonObject.toString());
    } catch (JSONException e) {
        e.printStackTrace();
    }
    //把数据真正上报给云端
    AC.reportDeviceMsg(req);
}
```
><font color=red>注意</font>：msgCode从64-200范围代表控制查询及响应，200-255范围代表消息主动上报，其他范围为AbleCloud内部使用，不允许重复定义。

