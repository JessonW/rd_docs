#安卓设备开发指导
#开发准备
####SDK发布库
AbleCloud发布的安卓设备SDK为`ac_device_android.jar`，除此之外，还需要导入`libDevice-Service.so`文件（可根据不同cpu做不同选择）

>**具体步骤**:把文件拷入你自己的工程的libs目录下并设置依赖
 
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
<receiver android:name="com.accloud.clientservice.ACNetworkChangeReceiver"
          android:label="NetworkConnection">
    <intent-filter>
        <action android:name="android.net.conn.CONNECTIVITY_CHANGE"/>
    </intent-filter>
</receiver>
```
及配置信息如下

```xml
<!-- [Required] 进入AbleCloud管理控制台,对应"产品管理->主域" -->
<meta-data android:name="major-domain" android:value="ablecloud"/>
<!-- [Required] 进入AbleCloud管理控制台,对应"产品管理->主域ID" -->
<meta-data android:name="major-domain-id" android:value="3"/>
<!-- [Required] 进入AbleCloud管理控制台,对应"产品管理->产品列表->子域".注意,若subDomain为数字,则需在数字前面加\0 -->
<meta-data android:name="sub-domain" android:value="demo"/>
<!-- [Required] 进入AbleCloud管理控制台,对应"产品管理->产品列表->子域ID" -->
<meta-data android:name="sub-domain-id" android:value="4"/>
<!-- [Required] 设备私钥,对应"产品管理->产品列表->点击管理->设备密钥->私钥" 若使用AbleCloud默认分配的密钥对，则填写默认密钥里的私钥，如选择设备独立密钥入库，则需要使用密钥生成工具自己生成公私钥并上传文件-->
<meta-data android:name="secret-key" android:value="BEADD508A1A0AC77523FA741DD1FF754D5BBBDFC93A32619A77A5B510D3C7F65C65323EEB6951129B79E70E4DE514E49F6217BA4CA80891048114C3EE856183D9F86C8E47F6130C909B61CC13C42D261809C4C6476A0257EC979A872B2AAD22D6821AFB64E1EAB246AB4D7008821CA4E"/>

<!-- [Optional] 环境设置,默认值为0(0正式环境 1测试环境) -->
<meta-data android:name="mode" android:value="1"/>
<!-- [Optional] 地域设置,默认值为0(0北京地区 1东南亚地区 2华东地区 3北美地区 4中欧地区) -->
<meta-data android:name="region" android:value="0"/>
<!-- [Optional] 设备版本,格式为"1-0-0",不设置情况下默认值为"1-0-0",也可通过ACConfig进行设置 -->
<meta-data android:name="version" android:value="1-0-0"/>
```

另外在你的应用使用AbleCloud服务之前，你需要在代码中对AbleCloud SDK进行初始化。 请在MainActivity的onCreate()方法中调用此方法来进行初始化

```java
/**
 * 请在MainActivity的onCreate()中初始化设备物理ID并开始连云操作
 *
 * @param mContext         Context实例
 * @param physicalDeviceId AbleCloud设备物理ID，长度为16个字节，厂商需自己保证唯一性
 */
AC.init(Context Context, String PhysicalDeviceId);
```

><font color=red>注</font>：初始化操作时厂商需要为每个设备分配一个**16字节长度的物理ID**，并保证该ID的唯一性。在厂商没有自己唯一的设备标识号情况下，建议使用**WIFI MAC地址**或者**手机IMEI号**并补0或其他将长度拼至16字节；可通过AbleCloud控制台查看**在线设备**查看对应设备的物理ID。

#安卓设备的控制与数据上报

下面以开关灯为例，通过二进制、klv、json三种格式简要介绍与安卓设备通讯的例子。注意实际开发请只选择以下其中一种消息格式。
####1、使用二进制消息格式进行通讯
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
private static final int CODE_SWITCH_REQ = 68;
private static final int CODE_SWITCH_RESP = 102;

private static final int OFF = 0;
private static final int ON = 1;
    
AC.handleMsg(new ACMsgHandler() {
    @Override
    public void handleMsg(ACDeviceMsg req, ACDeviceMsg resp) {
        switch (reqMsg.getMsgCode()) {
            case CODE_SWITCH_REQ:
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
                respMsg.setMsgCode(CODE_SWITCH_RESP);
                break;
        }
    }
});
```

数据上报：

```java
private static final int CODE_REPORT = 203;

/**
 * 上报数据到AbleCloud云端
 *
 * @param status 开关状态，1代表开，0代表关
 * @param type   开关类型，0代表app控制，1代表本机控制
 */
public void reportLight(int status, int type) {
    ACDeviceMsg req = new ACDeviceMsg();
    req.setMsgCode(CODE_REPORT);
    req.setPayload(new byte[]{(byte) status, (byte) type, 0, 0});
    //把数据真正上报给云端
    AC.reportDeviceMsg(req);
}
```

><font color=red>注意</font>：msgCode从64-200范围代表控制查询及响应，200-255范围代表消息主动上报，其他范围为AbleCloud内部使用，不允许重复定义。
####2、使用KLV消息格式进行通讯
**在AbleCloud控制台新建产品的时候选择KLV通讯协议，并填写数据点与数据包**。
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
//响应数据包--KLV格式的resp不需要设置msgCode 
{
    //数据点[key：value(int8)]
    //失败
    { 1 : false },
    //成功      
    { 1 : true }
}
```

```java
private static final int CODE_KLV = 69;

private static final int KEY_SWITCH = 1;
private static final int KEY_TYPE = 2;

private static final int OFF = 0;
private static final int ON = 1;

AC.handleMsg(new ACMsgHandler() {
    @Override
    public void handleMsg(ACDeviceMsg reqMsg, ACDeviceMsg respMsg) {
         //KLV格式的resp不需要设置msgCode
         switch (reqMsg.getMsgCode()) {
            case CODE_KLV:
                //请求消息体
                ACKLVObject req = reqMsg.getKLVObject();
                //请求操作类型，关灯或开灯
                int value = req.get(KEY_SWITCH);
                //响应消息体
                ACKLVObject resp = new ACKLVObject();
                if (value == ON) {
                    if (Light.turnLightOn()) {
                        resp.put(KEY_SWITCH, true);    //开灯成功
                        respMsg.setKLVObject(resp);
                    } else {
                        resp.put(KEY_SWITCH, false);   //开灯失败
                        respMsg.setKLVObject(resp);
                    }
                } else if (value == OFF) {
                    if (Light.turnLightOff()) {
                        resp.put(KEY_SWITCH, true);    //关灯成功
                        respMsg.setKLVObject(resp);
                    } else {
                        resp.put(KEY_SWITCH, false);   //关灯失败
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
private static final int CODE_REPORT = 203;

/**
 * 上报数据到AbleCloud云端
 *
 * @param status 开关状态，1代表开，0代表关
 * @param type   开关类型，0代表app控制，1代表本机控制
 */
public void reportLight(int status, int type) {
    ACDeviceMsg req = new ACDeviceMsg();
    req.setMsgCode(CODE_REPORT);
    ACKLVObject object = new ACKLVObject();
    object.put(KEY_SWITCH, (byte) status);
    object.put(KEY_TYPE, (byte) type);
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
//响应数据包--JSON格式的resp不需要设置msgCode
{ 
     //失败
     {"result", false},
     //成功   
     {"result", true}
]}
```

```java
private static final int CODE_JSON = 70;

private static final int OFF = 0;
private static final int ON = 1;

AC.handleMsg(new ACMsgHandler() {
    @Override
    public void handleMsg(ACDeviceMsg req, ACDeviceMsg resp) {
        //JSON格式的resp不需要设置msgCode
        switch (reqMsg.getMsgCode()) {
            case CODE_JSON:
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
private static final int CODE_REPORT = 203;

/**
 * 上报数据到AbleCloud云端
 *
 * @param status 开关状态，1代表开，0代表关
 * @param type   开关类型，0代表app控制，1代表本机控制
 */
public void reportLight(int status, int type) {
    ACDeviceMsg req = new ACDeviceMsg();
    req.setMsgCode(CODE_REPORT);
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

#安卓设备OTA
####一、获取OTA管理器对象

```java
ACOTAMgr otaMgr = AC.otaMgr();
```

####二、轮询OTA新版本信息

```java
// 初始化当前设备的版本号otaCheckInfo信息,30为检查的时间间隔，单位为分钟
otaMgr.startCheckUpdate(null, 30, new PayloadCallback<ACOTAUpgradeInfo>() {
    @Override
    public void success(ACOTAUpgradeInfo upgradeInfo) {
        //获取升级类型
        if (upgradeInfo.getOtaMode() == 0) {
            //静默升级
        }else if(upgradeInfo.getOtaMode() == 1){
            //用户确认升级
        }else {
            //强制升级
        }
    }

    @Override
    public void error(ACException e) {
        //轮询新版本，并不会走到这里   
    }
});
```

####下载OTA文件
```java
//upgradeInfo由上面接口获得；一般只有一个升级文件，所以取列表第一个文件
String url = upgradeInfo.getFiles().get(0).getDownloadUrl();
String checksum = upgradeInfo.getFiles().get(0).getCheckSum();
ACUtils.createSDDir("ota_download_path");
File file = null;
try {
    //建议首先执行垃圾文件清理工作，防止磁盘写满升级失败，同时也防止异常情况下下载文件不完整被使用 
    file = ACUtils.createSDFile("ota_download_path/file_name");
} catch (IOException e) {
}
AC.fileMgr().downloadFile(file, url, checksum, new ProgressCallback() {
    @Override
    public void progress(double progress) {
        //下载进度更新
    }, new VoidCallback() {
    @Override
    public void success() {
        //下载成功，建议调用otaMediaDone()接口通知云端下载文件成功，用于日志追踪
        //同时进行设备ota升级，另升级成功后，建议在此清理已完成升级的版本文件
    }

    @Override
    public void error(ACException e) {
        //下载失败，建议清理掉当前下载的不完整文件
    }
});
```

#文件存储

><font color="red">注意</font>：

>1、下载文件到sdcard或者从sdcard上传文件到云端需要在 **application** 标签下增加如下权限

> ```
> <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
> ```

>2、使用文件存储需导入**[option]文件管理模块sdk**到libs目录下

>3、上传下载支持断点续传功能


##一、获取文件管理器
```java
ACFileMgr fileMgr = AC.fileMgr();
```
##二、下载文件
###1、获取下载url
```java
ACFileInfo fileInfo = new ACFileInfo(bucket, name);
//0代表url链接有效时间为长期有效
fileMgr.getDownloadUrl(fileInfo, 0 ，new PayloadCallback<String>() {
    @Override
    public void success(String url) {
         //成功获取文件url
    }

    @Override
    public void error(ACException e) {
         //没有权限或其他网络错误
    }
});
```
###2、根据url下载文件
####1)、下载文件到sdcard
```java
ACUtils.createSDDir("myDir");
File file = null;
try {
     file = ACUtils.createSDFile("myDir/" + name);
} catch (IOException e) {
}
//0代表不校验checksum
fileMgr.downloadFile(file, url, 0, new ProgressCallback() {
    @Override
    public void progress(double progress) {
         //用于显示进度条，百分比，如99.99；如果没有显示进度条的需求则传null
    }
}, new VoidCallback() {
    @Override
    public void success() {
        //下载成功
    }

    @Override
    public void error(ACException e) {
         //支持断点续传，所以此处无网络错误，在恢复网络连接之后会继续下载
    }
});
```

####2)、下载文件到内存，比如头像下载
```java
//0代表不校验checksum
fileMgr.downloadFile(url, 0, new ProgressCallback() {
    @Override
    public void progress(double progress) {
         //用于显示进度条，百分比，如99.99；此处一般为小文件下载，所以不需要显示进度条的时候传null
    }
}, new PayloadCallback<byte[]>() {
    @Override
    public void success(byte[] bytes) {
         //下载成功
    }

    @Override
    public void error(ACException e) {
         //支持断点续传，所以此处无网络错误，在恢复网络连接之后会继续下载
    }
});
```

##三、上传文件
####1)、上传sdcard文件
```java
//bucket可理解为文件目录，name为文件名，开发者自己维护。另外可通过这两个参数获取到下载url，注意不同文件不能重目录重名，不然原文件会被覆盖
ACFileInfo fileInfo = new ACFileInfo(bucket, name);
//设置上传文件的sdcard路径
fileInfo.setFile(new File(Environment.getExternalStorageDirectory() + "/myDir/" + name));
fileMgr.uploadFile(fileInfo, new ProgressCallback() {
    @Override
    public void progress(double progress) {
        //用于显示进度条，百分比，如99.99；如果没有显示进度条的需求则传null
    }
}, new VoidCallback() {
    @Override
    public void success() {
        //上传成功
    }

    @Override
    public void error(ACException e) {
        //支持断点续传，所以此处无网络错误，在恢复网络连接之后会继续上传
    }
});
```
####2)、上传小文件，比如头像
```java
//bucket可理解为文件目录，name为文件名，开发者自己维护。另外可通过这两个参数获取到下载url，注意不同文件不能重目录重名，不然原文件会被覆盖
ACFileInfo fileInfo = new ACFileInfo(bucket, name);
//设置acl
fileInfo.setACL(acl);
//比如头像比特流数组
fileInfo.setData(bytes);
fileMgr.uploadFile(fileInfo, new ProgressCallback() {
    @Override
    public void progress(double progress) {
        //用于显示进度条，百分比，如99.99；此处一般为小文件上传，所以不需要显示进度条的时候传null
    }
}, new VoidCallback() {
    @Override
    public void success() {
        //上传成功
    }

    @Override
    public void error(ACException e) {
        //支持断点续传，所以此处无网络错误，在恢复网络连接之后会继续上传
    }
});
```

