#蓝牙方案

由于蓝牙设备和APP之间的通信协议比较简单，因此对于蓝牙设备和APP之间的通信协议，AbleCloud并未做任何处理。
AbleCloud提供了适用于蓝牙设备的APP和云端的交互接口。接口功能包括：帐号登录注册、用户属性添加、设备绑定、设备扩展属性设置、推送、蓝牙设备OTA、文件存储等。

对于蓝牙设备数据的存取，都是通过和云端通信的访问云端服务实现。目前所有的数据库的操作都需要经过云端服务进行，客户端的SDK中不能直接进行数据库访问。云端服务的开发参考[开发指导-云端服务]


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
具体使用步骤见开发指导-->OTA 接口定义如下：

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

参考[开发指导-安卓-推送](http://shumonluo.github.io/rd_docs/develop_guide/android/#_34)

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
