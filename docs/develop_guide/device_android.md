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
在你的应用使用AbleCloud服务之前，你需要在代码中对AbleCloud SDK进行初始化。

> 具体步骤:在启动App的`MainActivity`的`onCreate()`方法中调用此方法来进行初始化。

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
在完成测试阶段之后，需要迁移到正式环境下。
```java
AC.init(this, MajorDomainId, SubDomainId, SecretKey, Version, AC.PRODUCTION_MODE);
```
><font color=red>注</font>：初始化操作时AbleCloud会默认为每个设备生成一个`物理ID`，为保证物理ID的唯一性，默认使用为`4个0加上mac地址`。

#Demo
AbleCloud提供的Demo使用的是AbleCloud的测试Domain等信息。开发自己的工程时，请修改Demo里`com.accloud.ac_device_android_demo.config.Config.java`文件里的配置项。

下面以开关灯为例，简要介绍与安卓设备通讯的例子：

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
{ 102 ：[
     //数据点[key：value(int8)]
     //失败
     { 1 : 0 },
     //成功      
     { 1 : 1 }
]}
```
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


