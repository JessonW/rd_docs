#简介#

AbleCloud提供了PHP语言SDK，包括访问AbleCloud云端服务的API，以及AbleCloud与微信公众号对接的API。

- 子目录 lib/ablecloud

    AbleCloud云端服务API。

- 子目录 lib/bridge

    AbleCloud与第三方云平台对接的工具。与微信对接：ACBridgeWeChat。

- 子目录 demo

    微信公众号与AbleCloud对接demo。

- 子目录 docs

    API参考文档。首页名字：index.html。

- 适用PHP版本

    本SDK使用了PHP v5.6及其后续版本才支持的不定长参数。使用v5.6之前版本PHP的开发者可以修改文件 ablecloud/services/ACStoreScanner.php 第45行及第123行，分别去掉行中函数select及函数groupBy参数列表里的'...'符号，并在调用此两行所对应的函数时使用字符串数组作为参数。

下文是PHP SDK (v1.8.x)的API说明。

#对接微信#

##ACBridgeWeChat##

```php
/**
 * AbleCloud-微信公众号服务接口。
 * 主要用于同步用户信息及用户与设备的绑定关系。
 */
class ACBridgeWeChat {
    /**
     * 构造函数。
     * @param $accessToken  string	是微信公众号的Access Token。注意：微信的Access Token的有效期是有期限限制的。
     * @param $jsTicket     string	字符串，是微信公众号的JS API Ticket。注意：微信公众号的JS API Ticket的有效期是有期限限制的。
     */
    function __construct($accessToken, $jsTicket);

    /**
  	 * 设置/更新微信公众号的Access Token。
  	 * @param $accessToken string	是新的Access Token。
  	 */
  	public function setAccessToken($accessToken);

    /**
  	 * 设置/更新微信公众号的JS API Ticket。
  	 * @param $jsTicket    string	是新的JS API Ticket。
  	 */
  	public function setJsTicket($jsTicket);

    /// @name 微信推送的事件的处理方法
    //@{
    /**
  	 * 微信推送消息：MsgType为"event"，Event为"subscribe"时的响应函数：将微信用户注册为开发者所提供服务的用户。
  	 * @param $xmlMsg    string	微信推送的原始XML消息内容。
  	 * @param $unionId   string	字符串。是关注公众号的用户在微信平台对应的UnionID。如果不提供该参数，则无法识别同一个用户关注开发者的多个微信公众号的情况。
  	 * @return           ACUser	操作成功时返回ACUser对象，表示新注册的用户信息。失败时返回NULL，并且可调用getLastError()方法获取错误消息。
  	 */
  	public function onEventSubscribe($xmlMsg, $unionId = '');

    /**
  	 * 微信推送消息：MsgType为"event"，Event为"unsubscribe"时的响应函数：在AbleCloud平台中解除该用户与所有设备的绑定关系。
  	 * @param $xmlMsg  string  微信推送的原始XML消息内容。
  	 * @return         bool    返回TRUE表示操作成功，否则返回FALSE。失败时，可调用getLastError()方法获取错误消息。
  	 */
  	public function onEventUnsubscribe($xmlMsg);

    /**
  	 * 微信推送消息：MsgType为"device_event"，Event为"bind"时的响应函数：将微信记录的用户与设备的绑定关系同步到AbleCloud平台。
  	 * @param $xmlMsg      string  微信推送的原始XML消息内容。
  	 * @param $deviceName  string  字符串，表示设备的显示名。
  	 * @param $subDomain   string  字符串，是将要绑定的设备在AbleCloud平台上所属的子域的名字。如果设备的二维码信息中包含了其所属子域的名字，则以二维码中的信息为准。
  	 * @param $isGateway   bool    布尔值，为TRUE时表示设备是网关设备；为FALSE时表示设备是独立设备。
  	 * @return             ACDevice  操作成功时返回ACDevice对象，表示绑定后设备的信息。失败时返回NULL，并且可调用getLastError()方法获取错误消息。
  	 */
  	public function onDeviceEventBind($xmlMsg, $deviceName, $subDomain, $isGateway);

    /**
  	 * 微信推送消息：MsgType为"device_event"，Event为"unbind"时的响应函数：将微信记录的用户与设备解除绑定的关系同步到AbleCloud平台。
  	 * @details 本方法解绑设备后会自动通知微信平台执行额外的设备绑定关系同步。
  	 * @param $xmlMsg      string  微信推送的原始XML消息内容。
  	 * @param $subDomain   string  字符串，是要解绑的设备在AbleCloud平台上所属的子域的名字。
  	 * @param $isGateway   bool    布尔值，为TRUE时表示该设备为网关设备，否则表示该设备为独立设备。
  	 * @return             bool    操作成功时返回TRUE；失败时返回FALSE，并且可调用getLastError()方法获取错误消息。
  	 */
  	public function onDeviceEventUnbind($xmlMsg, $subDomain, $isGateway);

    /**
  	 * 微信推送消息：MsgType为"device_event"，Event为"subscribe_status"时的响应函数：微信订阅设备状态信息（目前微信仅查询WIFI设备的状态信息）。
  	 * @param $xmlMsg  string  微信推送的原始XML消息内容。
  	 * @param $doSync  bool    标记是否执行设备绑定状态的同步操作。同步设备绑定状态是指同步该设备在AbleCloud平台与微信平台上分别记录的绑定状态。该过程可能需要耗费一定的时间。缺省值为TRUE，表示需要执行同步操作。
  	 * @return         string  返回XML格式的文本内容，表示可回复给微信的设备状态信息。返回空字符串表示操作失败，并且可调用getLastError()方法获取错误消息。
  	 */
  	public function onDeviceEventSubscribeStatus($xmlMsg, $doSync = TRUE);

    /**
  	 * 微信推送消息：MsgType为"device_event"，Event为"unsubscribe_status"时的响应函数：微信退订设备状态信息（目前微信仅查询WIFI设备的状态信息）。
  	 * @param $xmlMsg  string  微信推送的原始XML消息内容。
  	 * @param $doSync  bool    标记是否执行设备绑定状态的同步操作。同步设备绑定状态是指同步该设备在AbleCloud平台与微信平台上分别记录的绑定状态。该过程可能需要耗费一定的时间。缺省值为TRUE，表示需要执行同步操作。
  	 * @return         string  返回XML格式的文本内容，表示可回复给微信的设备状态信息。返回空字符串表示操作失败，并且可调用getLastError()方法获取错误消息。
  	 */
  	public function onDeviceEventUnsubscribeStatus($xmlMsg, $doSync = TRUE);
    //@}

    /**
  	 * 获取开发者用户信息。
  	 * @param $openId  string  字符串，是要检查的微信用户的OpenID。
  	 * @return         ACUser  操作成功时返回ACUser对象，表示AbleCloud平台存储的用户信息。返回NULL表示失败，并且可调用getLastError()方法获取错误消息。
  	 */
  	public function getUser($openId);

    /**
  	 * 获取用户的OpenId。
  	 * @param $userId  int     整数，是用户在AbleCloud平台上的ID。
  	 * @return         string  返回一个字符串，表示用户在微信系统中对应的OpenID。如果返回值为空字符串，表示操作失败。此时，可调用getLastError()方法获取错误信息。
  	 */
  	public function getUserOpenId($userId);

    /**
  	 * 设置用户的手机号。
  	 * @param $openId      string  字符串，是微信用户的OpenID。
  	 * @param $phone       string  字符串，是用户的新手机号。
  	 * @param $verifyCode  string  字符串，是用户修改手机号码的验证码。
  	 * @return             bool    操作成功时返回TRUE；否则返回FALSE，并且可调用getLastError()获取错误信息。
  	 */
  	public function setPhone($openId, $phone, $verifyCode);

    /**
  	 * 获取设备的二维码：微信二维码（附加设备在AbleCloud平台上所属的子域的信息），还可选择是否附加AbleCloud分享码。附加的信息是以JSON格式的字符串表示的。
  	 * @param $physicalId      string  表示设备的物理ID。
  	 * @param $subDomain       string  表示设备在AbleCloud平台中所属的子域的名字。如果值不为空字符串，则会以第三方自定义数据的方式在微信标准二维码的末尾附加该子域信息。
  	 * @param $withACShareCode bool    为TRUE时表示需要附加设备的AbleCloud分享码，否则表示不需附加该信息。
  	 * @param $openId          string  $withShareCode为TRUE时，需要指定获取该分享码的用户的微信OpenID。仅设备的管理员用户有权限获取设备的分享码。
  	 * @param $timeout         int     $withShareCode为TRUE时，需要指定分享码的有效时长。该参数的类型为整数，是以秒为单位指定分享码的有效时长。
  	 * @return                 string  操作成功时返回制作设备二维码的字符串。依据参数设置，该字符串中可能包含AbleCloud平台的分享码。操作失败时返回空字符串，此时可调用getLastError()方法获取错误消息。
  	 */
  	public function getDeviceQRCode($physicalId, $subDomain, $withACShareCode = FALSE, $openId = '', $timeout = 300);

    /// @name 信息同步方法。
    //@{
    /**
  	 * 针对指定用户，同步AbleCloud平台与微信硬件平台记录的用户-设备绑定信息。同时检查指定设备的在线状态。
  	 * @details 在响应微信硬件平台推送的subscribe_status/unsubscribe_status事件（比如用户打开/关闭公众号主界面）的方法 #onDeviceEventSubscribeStatus 及 #onDeviceEventUnsubscribeStatus 中，
  	 * 可选择性地调用本方法同步数据。开发者也可根据实际情况主动调用本方法同步数据，比如处理蓝牙设备绑定关系的同步，或者将用户从“家”或“房间”里移除之后。
  	 * @param $openId              string  待检查的用户的微信OpenID。
  	 * @param $physicalIdOfStatus  string  是要查询其在线状态的设备的物理ID。
  	 * @return                     bool    返回TRUE表示待查询的设备在线；返回FALSE表示待查询的设备不在线。
  	 */
  	public function syncBindings($openId, $physicalIdOfStatus = '');

    /**
  	 * 针对指定设备，同步AbleCloud平台与微信硬件平台记录的用户-设备绑定信息。
  	 * @details 在调用AbleCloud平台提供的API解除了某用户与设备的绑定关系后，或者将设备从“房间”或“家”中移除后，开发者需要调用本方法在AbleCloud平台与微信平台之间同步设备与用户的绑定关系。
  	 * 在其它情况下，开发者也可根据实际情况主动调用本方法同步数据。
  	 * @param $physicalId  string  是设备的物理ID。
  	 * @param $deviceType  string  是本设备在微信公众号平台上的设备类型。
  	 * @param $subDomain   string  是本设备在AbleCloud平台上所属的子域的名字。
  	 * @return             bool    操作成功时返回TRUE；操作失败时返回FALSE，同时可调用方法getLastError()获取错误信息。
  	 */
  	public function syncBindingsByDevice($physicalId, $deviceType, $subDomain);

    /**
  	 * 删除一个“家”对象。
  	 * @details 微信公众号开发者应该通过本方法来删除“家”。本方法将在AbleCloud平台与微信平台之间同步因删除“家”而引起的用户-设备绑定关系的变更。
  	 * @param $openId  string  是发起删除“家”这个操作的用户的OpenID。
  	 * @param $homeId  int     是要被删除的“家”的ID。
  	 * @return         bool    操作成功时返回TRUE，操作失败时返回FALSE。操作失败时，可以调用方法getLastError()获取错误信息。
  	 */
  	public function deleteHome($openId, $homeId);

    /**
  	 * 检查设备在微信平台的授权及绑定状态，并尝试绑定设备与指定的用户。
  	 * @details 使用微信客户端扫描设备二维码绑定设备却无反应时，可能是因为：（1）设备未在微信平台授权；（2）或用户已经绑定了该设备。
  	 * 本方法首先检查设备在微信平台的授权状态，其次检查设备是否已在微信平台绑定了该用户，之后尝试在AbleCloud平台绑定设备，并与微信平台同步用户绑定设备的信息。
  	 * @param $openId      string  拟要绑定设备的用户在微信平台的OpenID。
  	 * @param $physicalId  string  要检查其状态并被绑定的设备在微信平台上的ID，即设备的物理ID。
  	 * @param $deviceName  string  绑定设备和用户时，设备的显示名称。
  	 * @param $subDomain   string  设备在AbleCloud平台上所属的子域的名字。
  	 * @param $isGateway   bool    为TRUE时表示设备是网关设备；为FALSE时表示设备是独立设备。
  	 * @return             bool    操作成功时返回TRUE，否则返回FALSE。操作失败时可调用getLastError()方法获取错误信息。
  	 */
  	public function checkAndBindDevice($openId, $physicalId, $deviceName, $subDomain, $isGateway);
    //@}

    /**
  	 * 通知微信绑定设备与用户。普通绑定失败时尝试强制绑定。
  	 * @param $openId      string	要绑定设备的用户的OpenID。
  	 * @param $physicalId  string	要被绑定的设备在微信平台上的ID，即设备的物理ID。
  	 * @return             bool   成功时返回TRUE，否则可调用getLastError()方法获取错误信息。
  	 */
  	public function wxBindDevice($openId, $physicalId);

    /**
  	 * 通知微信解绑设备。普通解绑失败时尝试强制解绑。
  	 * @param $openId      string	要解绑设备的用户的OpenID。
  	 * @param $physicalId	 string	要被解绑的设备在微信平台上的ID，即设备的物理ID。
  	 * @return				     bool	  成功时返回TRUE，否则可调用getLastError()方法获取错误信息。
  	 */
  	public function wxUnbindDevice($openId, $physicalId)

    /**
     * 取最近一次错误消息。
     * @return 返回一个包含错误码和消息的关联数组：['errCode': 0, 'errMessage': '']。errCode为0时表示没有错误发生。
     */
    public function getLastError();
}
```

#基础工具#

##ACContext##

```php
/**
 * 访问AbleCloud服务时的环境信息。
 */
class ACContext {
    /**
     * 构造函数。
     * @param $developerId 整数。AbleCloud开发者帐号ID。
     * @param $accessKey 字符串。开发者的Access Key。
     * @param $secretKey 字符串。开发者的Secret Key。
     * @param $majorDomain 字符串。本地服务对应的主域的名字。
     * @param $runtimeMode 字符串。运行模式：test（测试模式），production（生产模式）。
     * @param $routerAddress 字符串。AbleCloud远程服务的入口地址。
     */
    function __construct($developerId, $accessKey, $secretKey, $majorDomain, $runtimeMode, $routerAddress);

    /**
     * 取AbleCloud开发者信息。
     * @return 返回ACDeveloper对象。
     */
    public function getDeveloper();

    /**
     * 取本地服务对应的主域的名字。
     * @return 返回本地服务对应的主域的名字。
     */
    public function getMajorDomain();

    /**
     * 取AbleCloud远程服务的访问入口地址。
     * @return 返回AbleCloud远程服务的访问入口地址。
     */
    public function getRouterAddress();

    /**
     * 检查是否配置为生产环境。
     * @return 返回TRUE表示当前配置为生产环境，否则表示为测试环境。
     */
    public function isProductionMode();

    /**
     * 设置用户控制设备时所使用的终端工具的信息。
     * @param $name 字符串，是终端工具所使用的应用的名字，如'weixin'（表示微信终端）等。
     * @param $version 字符串，是终端工具所使用的应用的版本信息。缺省值为空字符串。
     * @param $id 字符串，是终端工具的ID，用于标识该工具。缺省值为空字符串。
     * @param $osName 字符串，是终端工具所使用的操作系统的名字，如android，ios等。
     */
    public function setHandset($name, $version = '', $id = '', $osName = '');

    /**
     * 为发给AbleCloud云端的HTTP请求配置自定义的HTTP Header。
     * @param $header 字符串，是要配置的HTTP Header的名字。
     * @param $value 字符串，是$header对应的值。
     * @return 无。
     */
    public function addExtHttpHeader($header, $value);

    /**
     * 取自定义的HTTP Header信息。
     * @return 返回一个关联数组。数组的每一个键值对表示一项自定义的Header。
     */
    public function getExtHttpHeaders();

    /**
     * 取当前的Trace-Id。
     * @return 当前的Trace-Id。
     */
    public function getTraceId();

    /**
     * 设置Trace-Id。
     * @param $traceId 字符串。是符合RFC 4122 - Section 4.4规范的UUID的十六进制表示形式，用来作为请求的Trace-Id。
     */
    public function setTraceId($traceId);

    /**
     * 生成一个Trace-ID。
     * @return string
     */
    public static function newTraceId();
}
```

##ACDeveloper##

```php
/**
 * AbleCloud开发者。
 */
class ACDeveloper {
    /**
     * 构造函数。
     * @param $id 开发者帐号的ID。
     * @param $accessKey 开发者AK/SK密钥对中的AccessKey。
     * @param $secretKey 开发者AK/SK密钥对中的SecretKey。
     */
    function __construct($id, $accessKey, $secretKey);

    /**
     * 取开发者的ID。
     * @return 返回一个整数，表示开发者的ID。
     */
    public function getId();

    /**
     * 取开发者的AK/SK密钥对中的AccessKey。
     * @return 返回一个字符串表示AccessKey。
     */
    public function getAccessKey();

    /**
     * 取开发者的AK/SK密钥对中的SecretKey。
     * @return 返回一个字符串表示SecretKey。
     */
    public function getSecretKey();
}
```

##ACDeveloperSignature##

```php
/**
 * 开发者签名工具。
 */
class ACDeveloperSignature {
	/**
     * 计算开发者的签名。
     * @param $developer ACDeveloper对象，表示要生成其签名的开发者。
     * @param $context ACContext对象，表示访问AbleCloud远程服务的环境信息。
     * @param $subDomain 字符串。表示要访问的远程服务所属的子域的名字。可能为空字符串。
     * @param $methodName 字符串。表示要访问的远程服务的方法名。
     * @param $timestamp 此次签名所示使用的时间戳。是以秒为单位的UTC时间。
     * @param $timeout 此次签名的有效时长（以秒为单位）。表示该签名在自$timestamp时刻起的$timeout秒之内有效。
     * @param $nonce 此次签名所使用的随机字符串。
     * @return 返回表示签名结果的字符串。
     */
    public static function signature($developer, $context, $subDomain, $methodName, $timestamp, $timeout, $nonce);
}
```

##ACHttpClient##

```php
/**
 * 访问AbleCloud远程服务的HTTP客户端。
 */
class ACHttpClient {
    /**
     * 访问AbleCloud远程服务。
     * @param $request ACRequest对象。访问AbleCloud服务的请求信息。
     * @param $context ACContext对象。访问AbleCloud服务的环境信息。
     * @return 返回一个ACResponse对象，表示远程服务的响应消息。
     */
    public static function doRequest($request, $context);

	/**
     * 计算随机字符串。
     * @param $len 整数。表示要生成的字符串的长度。
     * @return 返回长度为$len的随机字符串。
     */
    public static function nonce($len);

    /**
     * 计算AbleCloud服务的访问地址。
     * @param $request ACRequest对象，是访问AbleCloud服务的请求消息。
     * @param $context ACContext对象，是访问AbleCloud服务的环境信息。
     * @return 返回对应的AbleCloud服务的访问地址。
     */
    public static function makeACURL($request, $context);
}
```

##ACRequest##

```php
/**
 * 访问AbleCloud远程服务的请求消息。
 */
class ACRequest {
    /**
     * 构造函数。
     * @param $serviceName 字符串。是拟访问的远程服务的名字。
     * @param $methodName 字符串。是拟访问的远程服务的方法的名字。
     * @param $serviceVersion 整数。是拟访问的远程服务的主版本号。
     * @param $subDomain 字符串。是拟访问的远程服务所属的子域的名字。缺省值为空字符串，表示访问主域级别的服务。不为空字符串时，表示访问该子域所对应的服务。
     */
    function __construct($serviceName, $methodName, $serviceVersion, $subDomain = '');

    /**
     * 设置本次请求所关联的用户。该用户是AbleCloud平台中开发者所提供服务的用户。
     * @param $user ACUser对象或NULL。AbleCloud平台中开发者所提供服务的用户。NULL表示清除设置的用户信息。
     * @return 无
     */
    public function setUser($user);

    /**
     * 取当前设置的用户信息。
     * @return 返回NULL或ACUser对象。
     */
    public function getUser();

    /**
     * 取拟访问的远程服务的名字。
     * @return 返回拟访问的远程服务的名字。
     */
    public function getServiceName();

    /**
     * 取拟访问的远程服务的主版本号。
     * @return 返回拟访问的远程服务的主版本号。
     */
    public function getServiceVersion();

    /**
     * 取拟访问的远程服务的方法名。
     * @return 返回拟访问的远程服务的方法名。
     */
    public function getMethodName();

    /**
     * 取拟访问的远程服务所属的子域的名字。
     * @return 返回拟访问的远程服务所属的子域的名字。
     */
    public function getSubDomain();

    /**
     * 添加请求的参数。这些参数是键值对，将会以查询字符串的方式置于访问远程服务的URL中传递给远程服务。
     * @param $key 参数的名字。
     * @param $value 参数的值。对同名的参数多次赋值时，取最后一次设置的值。
     * @return 无
     */
    public function addParameter($key, $value);

    /**
     * 取设置的所有参数的名字。
     * @return 返回参数名字所形成的数组。
     */
    public function getParameterKeys();

    /**
     * 取参数的值。
     * @param $key 参数的名字。
     * @return 返回指定参数的值。参数不存在时返回NULL。
     */
    public function getParameterValue($key);

    /**
     * 消息内容要么是JSON格式的要么是二进制格式的。取最后一次设置的内容为最终内容。本方法用于设置JSON格式的消息内容。
     * @param $payload 字符串。JSON格式的内容。
     * @return 无。
     */
    public function setPayloadAsJSON($payload);

    /**
     * 消息内容要么是JSON格式的要么是二进制格式的。取最后一次设置的内容为最终内容。本方法用于设置二进制格式的消息内容。
     * @param $payload string类型的数据，表示二进制格式的内容。
     * @return 无。
     */
    public function setPayloadAsStream($payload);

    /**
     * 取请求所包含的数据的格式：application/x-zc-object或application/octet-stream，分别表示JSON格式和二进制数据格式。
     * @return 返回请求所包含的数据的格式。
     */
    public function getPayloadFormat();

    /**
     * 取请求所包含数据的大小。
     * @return 返回请求所包含数据的字节数。
     */
    public function getPayloadSize();

    /**
     * 取设置的请求所包含的数据。
     * @return 返回以string数据类型表示的数据。
     */
    public function getPayload();
}
```

##ACResponse##

```php
/**
 * AbleCloud服务的响应消息。
 */
class ACResponse {
    /**
     * 构造函数。
     * @param $errorCode 整数，响应的状态码。为0时表示成功，否则表示有错误发生。
     * @param $errorMessage 字符串。远程服务返回的成功的响应消息或者错误消息。
     */
    function __construct($errorCode = 0, $errorMessage = '');

    /**
     * 检查当前响应消息代表的状态：成功或出错。
     * @return 返回TRUE表示成功，否则表示出错。
     */
    public function isAck();

    /**
     * 检查当前响应消息代表的状态：成功或出错。
     * @return 返回TRUE表示出错，否则表示成功。
     */
    public function isError();

    /**
     * 取状态码。
     * @return 返回状态码。为0时表示成功，其它值表示出错。
     */
    public function getErrorCode();

    /**
     * 取响应的错误消息。
     * @return 本方法返回的内容与getResponse()方法返回的内容是一致的。只是从概念上来看，本方法返回的是出错状态下的错误消息。
     */
    public function getErrorMessage();

    /**
     * 取响应的内容。
     * @return 本方法返回的内容与getResponse()方法返回的内容是一致的。只是从概念上来看，本方法返回的是成功状态下的消息内容。
     */
    public function getResponse();
}
```

##ACUserSignature##

```php
/**
 * 非开发者用户的签名工具。
 */
class ACUserSignature {
	/**
     * 非开发者用户的签名工具。
     * @param $user ACUser对象，表示要计算其签名的用户。
     * @param $timestamp 此次签名所示使用的时间戳。是以秒为单位的UTC时间。
     * @param $timeout 此次签名的有效时长（以秒为单位）。表示该签名在自$timestamp时刻起的$timeout秒之内有效。
     * @param $nonce 此次签名所使用的随机字符串。
     */
    public static function signature($user, $timestamp, $timeout, $nonce);
}
```

#配置#

##ACConfig##

```php
/**
 * AbleCloud服务配置信息。
 */
class ACConfig {
	public static $RuntimeMode = 'test';	/// 运行模式：test（测试模式）；production（生产模式）。
    public static $DeveloperId = 0;			/// AbleCloud开发者帐号ID。整数。
    public static $AccessKey   = '';		/// 开发者的AK/SK密钥对中的AK。字符串。
    public static $SecretKey   = '';		/// 开发者的AK/SK密钥对中的SK。字符串。
    public static $MajorDomain = '';		/// 本地服务对应的主域的名字。
    public static $RouterUrl   = 'http://test.ablecloud.cn:5000';	/// AbleCloud远程服务的访问入口地址，如：http://test.ablecloud.cn:5000。
}
```

#客户端#

##ACClient##

```php
/**
 * AbleCloud服务的客户端。
 */
class ACClient {
    /**
     * 通用的以HTTP POST方法访问AbleCloud云端服务（包括开发者自定义的服务）。
     * @param $request ACRequest对象。描述访问目标及参数。
     * @return 返回ACResponse对象，表示远程服务的应答消息。
     */
    public static function sendToService($request);

    /**
     * AbleCloud帐号服务。
     * @return 返回ACAccountMgr对象。
     */
    public static function getAccountMgr();

    /**
     * AbleCloud文件存储服务。
     * @return ACFileMgr	返回ACFileMgr对象。
     */
    public static function getFileMgr();

    /**
     * AbleCloud设备管理服务。
     * @return 返回ACBindMgr对象。
     */
    public static function getBindMgr();

    /**
     * AbleCloud设备OTA服务。
     * @return 返回ACOtaMgr对象。
     */
    public static function getOtaMgr();

    /**
     * AbleCloud消息推送服务。
     * @return 返回ACNotificationMgr对象。
     */
    public static function getNotificationMgr();

    /**
     * AbleCloud数据存储服务。
     * @return 返回ACStore对象。
     */
    public static function getStore();

    /**
     * AbleCloud定时任务管理服务。
     * @return 返回ACTimerTaskMgr对象。
     */
    public static function getTimerTaskMgr();

    /**
	   * AbleCloud数分分析服务。
	   * @return ACAnalysisMgr 返回ACAnalysisMgr对象。
	   */
	  public static function getAnalysisMgr();

    /**
  	 * AbleCloud设备入库服务。
  	 * @return ACWarehouseMgr 返回ACWarehouseMgr对象。
  	 */
  	public static function getWarehouseMgr();

    /**
  	 * AbleCloud产品服务。
  	 * @return ACProductMgr 返回ACProductMgr对象。
  	 */
  	public static function getProductMgr();

  	/**
  	 * AbleCloud用户反馈服务。
  	 * @return ACFeedbackMgr 返回ACFeedbackMgr对象。
  	 */
  	public static function getFeedbackMgr();

    /**
     * 取访问AbleCloud远程服务的环境信息。
     * @return 返回ACContext对象，表示访问AbleCloud远程服务的环境信息。
     */
    public static function getContext();
}
```

##ACService##

```php
/**
 * AbleCloud服务。
 */
class ACService {
    /**
     * 构造函数。
     * @param $name 服务的名字。字符串。
     * @param $version 服务的主版本值。整数。
     * @param $context ACContext对象，表示访问该远程服务所依赖的环境信息。
     */
    function __construct($name, $version, $context);

    /**
     * 取服务的名字。
     * @return 返回服务的名字。
     */
    public function getName();

    /**
     * 取服务的主版本值。
     * @return 返回一个整数，表示服务的主版本值。
     */
    public function getVersion();

    /**
     * 取访问该服务所依赖的环境信息。
     * @return 返回ACContext对象，表示环境信息。
     */
    public function getContext();

    /**
     * 取最近一次错误消息。
     * @return 返回一个包含错误码和消息的关联数组：['errCode': 0, 'errMessage': '']。errCode为0时表示没有错误发生。
     */
    public function getLastError();
}
```

#帐号接口#

##ACUser##

```php
/**
 * 用户信息。
 */
class ACUser {
    /**
     * 构造函数。
     * @param $id		string	用户的ID。
     * @param $token	string	用户的Token。
     * @param $name		string	用户的显示名。字符串。
     * @param $refreshToken				string	用于更新用户Token的Token。
     * @param $tokenExpiration			string	用户Token的过期时间（UTC）：YYYY-MM-DD hh:mm:ss。空字符串表示不过期。
     * @param $refreshTokenExpiration	string	用户的$refreshToken的过期时间（UTC）：YYYY-MM-DD hh:mm:ss。空字符串表示不过期。
     * @param $email	string	用户注册的邮箱地址。
	   * @param $phone	string	用户注册的电话号码。
     */
    function __construct($id, $token, $name = '', $refreshToken = '', $tokenExpiration = '', $refreshTokenExpiration = '', $email = '', $phone = '');

    /**
     * 取用户的ID。
     * @return 返回用户的ID。整数。
     */
    public function getId();

    /**
     * 取用户的名字。
     * @return 返回用户的名字。
     */
    public function getName();

    /**
     * 取用户的Token。
     * @return 返回用户的Token。字符串。
     */
    public function getToken();

    /**
     * 取Token的过期时间（UTC）：YYYY-MM-DD hh:mm:ss。
     * @return string	Token的过期时间。空字符串表示不过期。
     */
    public function getTokenExpiration();

    /**
     * 设置用户Token。
     * @param $token			string	用户的Token。
     * @param $tokenExpiration	string	用户的Token的过期时间（UTC）：YYYY-MM-DD hh:mm:ss。空字符串表示不过期。
     */
    public function setToken($token, $tokenExpiration);

    /**
     * 取用于更新用户Token的Token。
     * @return string	用于更新用户Token的Token。
     */
    public function getRefreshToken();

    /**
     * 取RefreshToken的过期时间（UTC）：YYYY-MM-DD hh:mm:ss。
     * @return string	RefreshToken的过期时间。空字符串表示不过期。
     */
    public function getRefreshTokenExpiration();

    /**
     * 设置用于更新Token的Token。
     * @param $refreshToken				string	用于更新Token的Token。
     * @param $refreshTokenExpiration	string	RefreshToken的过期时间（UTC）：YYYY-MM-DD hh:mm:ss。空字符串表示不过期。
     */
    public function setRefreshToken($refreshToken, $refreshTokenExpiration);

    /**
  	 * 取用户的注册邮箱地址。
  	 * @return string	用户注册邮箱地址。
  	 */
  	public function getEmail();

  	/**
  	 * 取用户注册的电话。
  	 * @return string	用户注册的电话。
  	 */
  	public function getPhone();
}
```

##ACAccountMgr##

```php
/**
 * AbleCloud帐号服务。
 */
class ACAccountMgr extends ACService {
    /**
     * 构造函数。
     * @param $name    string    AbleCloud帐号服务的名字。
     * @param $version int       AbleCloud帐号服务的主版本号。
     * @param $context ACContext 表示访问该远程服务所依赖的环境信息。
     */
    function __construct($name, $version, $context);

    /// @name 用户帐号注册与登录。
    //@{
    /**
     * 获取用户注册的验证码。
     * @param $login    string  是用户的登录名：email地址或手机号。
     * @param $timeout  int     是验证码的有效时长。单位为秒。
     * @return          string  操作成功时返回字符串形式的验证码。操作失败时返回空字符串，并且可以调用getLastError()方法获取错误信息。
     */
    public function getVerifyCode($login, $timeout);

    /**
     * 注册用户帐号。
     * @param $name       string 用户的显示名。
     * @param $email      string 新用户的邮箱。$email与$phone不能都为空字符串。
     * @param $phone      string 新用户的手机号码。$email与$phone不能都为空字符串。
     * @param $password   string 新用户的登录密码。
     * @param $verifyCode string 注册新用户时所使用的验证码。
     * @param $enableTokenExpiration bool 是否使用用户TOKEN过期的机制。缺省为不使用。
     * @return            ACUser|NULL 用户注册成功时返回一个ACUser对象，表示新用户的信息。失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function register($name, $email, $phone, $password, $verifyCode, $enableTokenExpiration = FALSE);

    /**
     * 按登录名和密码登录，取用户的信息。
     * @param $login    string  用户的登录名。
     * @param $password string  用户登录密码。
     * @param $enableTokenExpiration  bool  是否使用用户TOKEN过期的机制。缺省为不使用。
     * @return          ACUser|NULL 返回一个ACUser对象，表示该用户的信息。失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function login($login, $password, $enableTokenExpiration = FALSE);

    /**
     * 按登录名和密码取用户的信息。
     * @param $login    string  用户的登录名。
     * @param $password string  用户登录密码。
     * @param $enableTokenExpiration  bool  是否使用用户TOKEN过期的机制。缺省为不使用。
     * @return          ACUser|NULL 返回一个ACUser对象，表示该用户的信息。失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function getUser($login, $password, $enableTokenExpiration = FALSE);

    /**
  	 * 根据用户的Id查找用户信息。
  	 * @param $userId int    用户的ID。
  	 * @return        ACUser|NULL	返回一个ACUser对象，表示该用户的信息。失败时返回NULL，并且可调用getLastError()方法获取错误消息。
  	 */
  	public function getAccountInfo($userId);

    /**
     * 检查帐号是否已经存在。
     * @param $login  string  表示用户的登录名，如邮箱或者手机号。
     * @return        bool    返回TRUE表示存在该帐号；不存在该帐号时返回FALSE；操作失败时也返回FALSE。
     * 返回值为FALSE时，应该调用getLastError()方法获取错误信息，并检查其errCode值：errCode为0时，表示操作成功；否则表示操作失败。
     */
    public function checkAccountExist($login);

    /**
     * 检查用户的总数。
     * @return int  返回用户总数。返回值小于0时表示操作失败，可调用getLastError()方法获取错误消息。
     */
    public function getAccountCount();

    /**
     * 查询用户列表。
     * @param $offset int   查询的记录偏移量。取值应该为非负整数。
     * @param $limit  int   限制本次调用查询的记录的最大数目。取值范围是闭区间[1, 100]。
     * @return        array|FALSE 成功时返回ACUser对象的数组。失败时返回FALSE，并且可调用getLastError()方法获取错误消息。
     */
    public function listAllAccounts($offset, $limit);
    //@}

    /// @name 第三方平台用户
    //@{
    /**
     * 使用第三方帐号注册用户。
     * @param $openId   string 第三方帐号的OpenID。
     * @param $provider string 第三方帐号的来源。如"weixin"。
     * @param $unionId  string 对来自微信平台的用户，是其在微信平台对应的UnionID。如果不提供该参数，则无法识别同一个用户关注开发者的多个微信公众号的情况。
     * @param $enableTokenExpiration bool 是否使用用户TOKEN过期的机制。缺省为不使用。
     * @return          ACUser|NULL 注册成功后返回一个ACUser对象，表示新用户的信息。失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function registerByOpenId($openId, $provider, $unionId = '', $enableTokenExpiration = FALSE);

    /**
     * 按OpenID和帐号来源取用户的信息。
     * @param $openId 	string 用户的OpenID。
     * @param $provider	string 用户的来源。如"weixin"等。
     * @param $unionId	string 对来自微信平台的用户，是其在微信平台对应的UnionID。
     * @param $enableTokenExpiration bool 是否使用用户TOKEN过期的机制。缺省为不使用。
     * @return          ACUser|NULL 返回一个ACUser对象，表示该用户的信息。失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function getUserByOpenId($openId, $provider, $unionId = '', $enableTokenExpiration = FALSE);

    /**
     * 获取用户在第三方平台上的OpenID。
     * @param $userId	  int    是用户在AbleCloud平台上的ID。
     * @param $provider string 标识第三方平台。如'weixin'表示微信平台。
     * @return          string 返回一个字符串，表示用户在指定的第三方平台中对应的OpenID。如果返回值为空字符串，表示操作失败。此时，可调用getLastError()方法获取错误信息。
     */
    public function getUserOpenId($userId, $provider);
    //@}

    /**
     * 向指定的手机号发送验证码。
     * @param $phone    string 接收验证码的手机号。
     * @param $template int    是短信模板的代码。
     * @param $timeout  int    是验证码的有效时长，单位是秒。
     * @return          bool   操作成功时返回TRUE；操作失败时返回FALSE，并且可调用getLastError()后去错误信息。
     */
    public function sendVerifyCode($phone, $template, $timeout);

    /**
     * 修改用户的手机号码。
     * @param $user       ACUser 是要修改手机号的用户。
     * @param $phone      string 字符串，是用户的新手机号码。
     * @param $verifyCode string 是验证码。
     * @param $password   string 是用户的密码。
     * @return            bool   操作成功返回TRUE；操作失败则返回FALSE，并且可调用getLastError()方法获取错误信息。
     */
    public function changePhone($user, $phone, $verifyCode, $password);

    /**
     * 修改用户显示名称。
     * @param $user     ACUser 是要修改显示名的用户。
     * @param $nickName string 用户的新名字。
     * @return          bool   操作成功返回TRUE；操作失败则返回FALSE，并且可调用getLastError()方法获取错误信息。
     */
    public function changeNickName($user, $nickName);

    /**
     * 更新用户的Token。
     * @param $user ACUser 要更新其Token的用户。操作成功后直接更新该对象保存的信息。
     * @return      bool   返回TRUE表示操作成功，并且会更新$user对象的信息；返回FALSE表示操作失败，可以调用getLassError()获取错误信息。
     */
    public function updateUserToken($user);

    /**
     * 重设用户的密码。
     * @param $userId     int    要更新其密码的用户的ID。
     * @param $account    string 要更新其密码的用户的登录名。
     * @param $password   string 用户的新密码。
     * @param $verifyCode string 更新用户密码的验证码。
     * @return            bool   操作成功返回TRUE；操作失败则返回FALSE，并且可调用getLastError()方法获取错误信息。
     */
    public function resetPassword($userId, $account, $password, $verifyCode);

    /// @name 用户的扩展属性
    //@{
    /**
     * 设置用户的扩展属性。
     * @param $user    ACUser ACUser对象，表示要设置其扩展属性的用户。
     * @param $profile array  是由键值对组成的关联数组，表示用户的扩展属性值。
     * @return         bool   操作成功时返回TRUE，否则返回FALSE。操作失败时可以调用getLastError()方法获取错误信息。
     */
    public function setUserProfile($user, $profile);

    /**
     * 获取用户的扩展属性。
     * @param $user ACUser        表示要获取其扩展属性的用户。
     * @return      array|NULL  操作成功时返回一个由键值对组成的关联数组，表示该用户的扩展属性。操作失败时返回NULL，并且可调用getLastError()方法获取错误信息。
     */
    public function getUserProfile($user);

    /**
     * 获取用户的全部属性：包括基础属性及扩展属性。
     * @param $uid     int    表示要获取其属性的用户的ID。参数$uid和$account至少需提供一个。
     * @param $account string	表示要获取其属性的用户的帐号名：Email地址或者电话。参数$uid和$account至少需提供一个。
     * @return         array|NULL 操作成功时返回一个由键值对组成的关联数组，表示该用户的属性。操作失败时返回NULL，并且可调用getLastError()方法获取错误信息。
     */
    public function getUserWholeProfile($uid = 0, $account = '');

    /**
     * 根据用户uid列表查找用户的信息（基本信息+扩展信息）。一次最多可查询1000个用户的信息。
     * @param $userIds  array 待查询的用户ID的数组。元素个数必须小于等于1000。
     * @return          array 操作成功时返回用户属性数据的数组。数组中的每个元素是一个关联数组，对应于一个用户的属性。操作失败时返回NULL，并且可调用getLastError()方法获取错误信息。
     */
    public function getProfilesByUserList($userIds);
    //@}

    /**
     * 清除已注册的帐号信息。仅测试环境支持该方法。
     * @return bool 操作成功返回TRUE；否则返回FALSE，并且可调用getLastError()方法获取错误消息。
     */
    public function clearUsers();
}
```

#设备绑定接口#

##ACDevice##

```php
/**
 * 设备信息。
 */
class ACDevice {
    /**
     * 构造函数。
     * @param $deviceId 设备的逻辑ID。整数。
     * @param $physicalId 设备的物理ID。字符串。
     * @param $name 设备的名字。
     * @param $ownerId 设备的管理员用户的ID。整数。
     * @param $aesKey 设备的AES密钥。字符串。
     * @param $gatewayId 设备所属的网关的设备逻辑ID。整数。
     * @param $subDomainId 设备所属的子域的ID。整数。
     * @param $rootId 整数，设备的RootId。
     * @param $status 整数，状态码。
     * @param $subDomain 字符串，是设备所属的子域的名字。
     */
    function __construct($deviceId, $physicalId, $name = '', $ownerId = 0, $aesKey = '', $gatewayId = 0, $subDomainId = 0, $rootId = 0, $status = 0, $subDomain = '');

    public function getId();

    public function getPhysicalId();

    public function getName();

    public function getOwnerId();

    public function getAesKey();

    public function getGatewayId();

    public function getSubDomainId();

    public function getSubDomainName();

    public function getRootId();

    public function getStatus();
}
```

##ACBindMgr##

```php
/**
 * AbleCloud设备绑定管理服务。
 */
class ACBindMgr extends ACService {
    /**
     * 构造函数。
     * @param $name AbleCloud设备管理服务的名字。
     * @param $version AbleCloud设备管理服务的版本。
     * @param $context ACContext对象，表示访问该远程服务所依赖的环境信息。
     */
    function __construct($name, $version, $context);

    /// @name 独立设备
    //@{
    /**
     * 将设备绑定至指定的用户。
     * @param $subDomain 字符串，是要被绑定的设备所属的子域的名字。
     * @param $physicalId 要被绑定的设备的物理ID。字符串。
     * @param $name 字符串，设备的名字。
     * @param $user ACUser对象，表示要被绑定的用户。
     * @return 操作成功返回ACDevice对象，表示被绑定的设备的信息。操作失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function bindDevice($subDomain, $physicalId, $name, $user);

    /**
     * 解除设备与用户的绑定关系。
     * @param $subDomain 字符串，是要被解绑的设备所属的子域的名字。
     * @param $deviceId 要被解除绑定关系的设备的逻辑ID。整数。
     * @param $user ACUser对象，表示要被解除绑定关系的用户。如果该用户是该设备的管理员，则解除这两者之间的绑定关系时，将解除设备与其它所有用户的绑定。
     * @return 操作成功返回TRUE，否则返回FALSE。失败时可调用getLastError()方法获取错误消息。
     */
    public function unbindDevice($subDomain, $deviceId, $user);

    /**
     * 设备的管理员用户获取设备的分享码。
     * @param $deviceId 要操作的对象的逻辑ID。整数。
     * @param $user ACUser对象，表示该设备的管理员用户。
     * @param $timeout 生成的分享码的有效时长。以秒为单位。
     * @return 操作成功后返回分享码字符串。操作失败，则返回空字符串，并且可调用getLastError()方法获取错误消息。
     */
    public function getDeviceShareCode($deviceId, $user, $timeout);

    /**
     * 将设备绑定至获取了分享码的用户。
     * @param $user ACUser对象，表示获取了分享码的用户。设备将被绑定至该用户。
     * @param $shareCode 绑定设备使用的分享码。
     * @return 操作成功将返回ACDevice对象，表示被绑定的设备的信息。失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function bindDeviceWithShareCode($user, $shareCode);
    //@}

    /// @name 网关及其子设备
    //@{
    /**
     * 将一个网关设备绑定至指定的用户。
     * @param $subDomain 字符串，是要被绑定的网关设备所属的子域的名字。
     * @param $physicalId 要被绑定的网关设备的物理ID。字符串。
     * @param $name 字符串，设备的名字。
     * @param $user ACUser对象，表示要被绑定的用户。
     * @return 操作成功时返回ACDeivce对象，表示被绑定设备的信息。操作失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function bindGateway($subDomain, $physicalId, $name, $user);

    /**
     * 解除网关设备与用户的绑定关系。
     * @param $subDomain 字符串，是要被解绑的网关设备所属的子域的名字。
     * @param $deviceId 要被解除绑定关系的网关设备的逻辑ID。整数。
     * @param $user ACUser对象，表示要被解除绑定关系的用户。如果该用户是该设备的管理员，则解除这两者之间的绑定关系时，将解除设备与其它所有用户的绑定。
     * @return 操作成功返回TRUE，否则返回FALSE。失败时可调用getLastError()方法获取错误消息。
     */
    public function unbindGateway($subDomain, $deviceId, $user);

    /**
     * 开启网关设备允许新的子设备接入的功能。开启该功能后，网关才能发现新的子设备。
     * @param $subDomain 字符串，是要被操作的网关设备所属的子域的名字。
     * @param $deviceId 整数，表示要被操作的网关设备的逻辑ID。
     * @param $user ACUser对象，表示发起该操作的用户。该用户应该是网关设备的管理员。
     * @param $timeout 整数，单位为秒。表示在该参数指定的时长范围内，网关设备将允许发现新的子设备。
     * @return 操作成功返回TRUE，否则返回FALSE。返回FALSE时，可以调用getLastError()获取错误信息。
     */
    public function openGatewayMatch($subDomain, $deviceId, $user, $timeout);

    /**
     * 关闭网关设备允许新的子设备接入的功能。
     * @param $subDomain 字符串，是要操作的网关设备所属的子域的名字。
     * @param $deviceId 整数，表示要被操作的网关设备的逻辑ID。
     * @param $user ACUser对象，表示发起该操作的用户。该用户应该是网关设备的管理员。
     * @return 操作成功返回TRUE，否则返回FALSE。返回FALSE时，可以调用getLastError()获取错误信息。
     */
    public function closeGatewayMatch($subDomain, $deviceId, $user);

    /**
     * 将指定设备添加为网关设备的子设备。
     * @param $user ACUser对象，是网关设备的管理员用户。
     * @param $gatewayId 网关设备的逻辑ID。整数。
     * @param $physicalId 拟被添加为子设备的设备物理ID。字符串。
     * @param $name 字符串，拟添加的子设备的名字。
     * @param $subDomain 字符串，是拟新添加的子设备所属的子域的名字。
     * @return 操作成功返回ACDevice对象，表示新添加的设备的信息。操作失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function addSubDeviceToGateway($user, $gatewayId, $physicalId, $name, $subDomain);

    /**
     * 删除网关设备的某个子设备。
     * @param $user ACUser对象，表示网关设备的管理员用户。
     * @param $deviceId 要被删除的子设备的逻辑ID。整数。
     * @return 操作成功返回TRUE；否则返回FALSE，并且可调用getLastError()方法获取错误消息。
     */
    public function deleteSubDeviceFromGateway($user, $deviceId);

    /**
     * 查询用户绑定的网关设备。
     * @param $user ACUser对象，表示被查询的用户。
     * @return 返回由ACDevice对象组成的数组，表示该用户所绑定的网关设备。操作失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function listGateways($user);

    /**
     * 查询某网关下用户所绑定的子设备。
     * @param $user ACUser对象，表示要查寻的用户。
     * @param $gatewayId 网关的逻辑ID。整数。
     * @return 返回由ACDevice对象组成的数组，表示该用户所绑定的子设备。操作失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function listSubDevicesFromGateway($user, $gatewayId);

    /**
     * 查询某网关下新增的设备。这些设备尚未被用户正式绑定。
     * @param $user ACUser对象，表示要查询的用户。
     * @param $gatewayId 整数，是被查询的网关的逻辑ID。
     * @return 返回由ACDevice对象组成的数组，表示新接入的子设备。操作失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function listNewSubDevicesFromGateway($user, $gatewayId);
    //@}

    /**
     * 查询用户绑定的所有设备（包括网关及其子设备）。
     * @param $user ACUser对象，表示被查询的用户。
     * @return 返回由ACDevice对象组成的数组，表示该用户所绑定的全部设备。操作失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function listDevices($user);

    /**
     * 查询某设备的所有用户。
     * @param $deviceId 整数，是拟查询的设备的逻辑ID。
     * @return 操作成功时返回一个由ACUser对象组成的数组，表示所有绑定了该设备的用户。操作失败时返回NULL，并且可调用getLastError()方法获取错误信息。
     */
    public function listUsers($deviceId);

    /**
     * 通过设备逻辑ID查询设备的在线状态。
     * @param $deviceId 整数。设备的逻辑ID。
     * @return 返回TRUE表示设备在线；返回FALSE表示设备不在线或状态未知。返回FALSE时，需要调用getLastError()方法检查状态。如果errCode为0，则表示设备不在线；否则表示操作出错，设备的状态为未知。
     */
    public function isDeviceOnline($deviceId);

    /**
     * 通过设备物理ID查询设备的在线状态。
     * @param $subDomain 字符串，是设备所属的子域的名字。
     * @param $physicalId 字符串，设备的物理ID。
     * @return 返回TRUE表示设备在线；返回FALSE表示设备不在线或状态未知。返回FALSE时，需要调用getLastError()方法检查状态。如果errCode为0，则表示设备不在线；否则表示操作出错，设备的状态为未知。
     */
    public function isDeviceOnlineByPhysicalId($subDomain, $physicalId);

    /**
  	 * 检查设备是否已经被用户绑定了。
  	 * @param $subDomain	string	是设备所属的子域的名字。
  	 * @param $physicalId	string	要被检查的设备的物理ID。
  	 * @return				    bool	  返回TRUE表示设备已被绑定；返回FALSE表示设备未被绑定或状态未知。返回FALSE时，需要调用getLastError()方法检查状态。如果errCode为0，则表示设备未被绑定；否则表示操作出错，设备的状态为未知。
  	 */
  	public function isDeviceBound($subDomain, $physicalId);

    /**
     * 取设备的逻辑ID。
     * @param $subDomain 字符串，是设备所属的子域的名字。
     * @param $physicalId 字符串，表示设备的物理ID。
     * @return 返回设备的逻辑ID。有效的逻辑ID是正整数。返回0表示操作失败。可调用getLastError()方法获取错误消息。
     */
    public function getDeviceId($subDomain, $physicalId);

    /**
     * 向设备发送消息。
     * @param $user ACUser对象，表示向设备发送消息的用户。
     * @param $deviceId 整数，是目标设备的逻辑ID。
     * @param $subDomain 字符串，是拟操作的设备所属的子域的名字。
     * @param $messageCode 发送给设备的消息的码。整数。
     * @param $message 以string对象存储的拟发送给设备的二进制数据。
     * @param $handset 字符串。表示调用本方法时用户所使用的终端工具的名字，如'weixin'表示微信终端。
     * 					开发者也可以通过ACContext对象设置终端工具信息。如果指定了本参数，则以本参数指定的值为准。
     * @param $handsetVersion 字符除啊，表示调用本方法时用户所使用的终端工具的版本信息。
     * @return 返回ACResponse对象，表示设备或云端服务的响应。
     */
    public function sendToDevice($user, $deviceId, $subDomain, $messageCode, $message, $handset = '', $handsetVersion = '');

    /**
     * 修改设备名称。
     * @param $user ACUser对象，表示要修改设备名字的用户。
     * @param $deviceId 整数，是目标设备的逻辑ID。
     * @param $name 字符串，是设备的新名字。
     * @return 返回TRUE表示操作成功；返回FALSE表示操作失败，此时可调用getLastError()获取错误信息。
     */
    public function changeName($user, $deviceId, $name);

    /// @name 设备分组模型
    //@{
    /**
     * 创建一个“家”对象。
     * @param $user ACUser对象，是创建该“家”的用户。
     * @param $name 字符串，是拟创建的“家”对象的名字。
     * @return 操作成功时返回ACHome对象；否则返回NULL。操作失败时可以调用getLastError()获取错误信息。
     */
    public function createHome($user, $name);

    /**
     * 删除一个“家”对象。
     * @param $user ACUser对象，是发起该操作的用户。
     * @param $homeId 整数，是拟删除的“家”的ID。
     * @return 操作成功时返回TRUE，否则返回FALSE。操作失败时可调用getLastError()获取错误信息。
     */
    public function deleteHome($user, $homeId);

    /**
     * 创建一个“房间”对象。
     * @param $user ACUser对象，是创建该“房间”的用户。
     * @param $homeId 整数，表示该“房间”所属“家”的ID。
     * @param $name 字符串，是拟创建的“房间”对象的名字。
     * @return 操作成功时返回ACRoom对象；否则返回NULL。操作失败时可以调用getLastError()获取错误信息。
     */
    public function createRoom($user, $homeId, $name);

    /**
     * 删除一个“房间”对象。
     * @param $user ACUser对象，是发起该操作的用户。
     * @param $homeId 整数，是拟删除的“房间”所属的“家”的ID。
     * @param $roomId 整数，是拟删除的“房间”的ID。
     * @return 操作成功时返回TRUE，否则返回FALSE。操作失败时可调用getLastError()获取错误信息。
     */
    public function deleteRoom($user, $homeId, $roomId);

    /**
     * 向“家”添加一个设备。
     * @param $user ACUser对象，是发起该操作的用户。
     * @param $homeId 整数，要添加该设备的“家”对象的ID。
     * @param $name 字符串，是新添加的设备的名字。
     * @param $subDomain 字符串，是拟被添加的设备所属子域的名字。
     * @param $physicalId 字符串，是要添加至“家”中的设备的物理ID。该参数与参数$deviceId任意提供一个即可。
     * @param $deviceId 整数，是要添加至“家”中的设备的逻辑ID。该参数与参数$physicalId任意提供一个即可。
     * @return 操作成功返回ACDevice对象，表示被绑定的设备的信息。操作失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function addDeviceToHome($user, $homeId, $name, $subDomain, $physicalId = '', $deviceId = 0);

    /**
     * 从“家”中删除一个设备。
     * @param $user ACUser对象，是发起该操作的用户。
     * @param $homeId 整数，是要删除设备的“家”对象的ID。
     * @param $deviceId 整数，是要被删除的设备的逻辑ID。
     * @return 操作成功时返回TRUE，否则返回FALSE。操作失败时，可调用getLastError()获取错误信息。
     */
    public function deleteDeviceFromHome($user, $homeId, $deviceId);

    /**
     * 将设备移至指定“房间”。
     * @param $user ACUser对象，是发起该操作的用户。
     * @param $deviceId 整数，是要被迁移的设备的逻辑ID。
     * @param $roomId 整数，是设备拟迁入的“房间”的ID。
     * @param $homeId 整数，是要被迁移的设备及目标“房间”所属的家的ID。
     * @return 操作成功时返回TRUE，否则返回FALSE。操作失败时，可调用getLastError()获取错误信息。
     */
    public function moveDeviceToRoom($user, $deviceId, $roomId, $homeId);

    /**
     * 从指定“房间”内删除设备。
     * @param $user ACUser对象，是发起该操作的用户。
     * @param $deviceId 整数，是要被删除的设备的逻辑ID。
     * @param $roomId 整数，是拟删除设备的“房间”的ID。
     * @param $homeId 整数，是要被迁移的设备及“房间”所属的家的ID。
     * @return 操作成功时返回TRUE，否则返回FALSE。操作失败时，可调用getLastError()获取错误信息。
     */
    public function removeDeviceFromRoom($user, $deviceId, $roomId, $homeId);

    /**
     * 取“家”的分享码/邀请码。
     * @param $user ACUser对象，是发起该操作的用户。
     * @param $homeId 整数，是“家”的ID。
     * @param $timeout 整数，是分享码的有效时长。单位为秒。
     * @return 操作成功时返回一个长度不为0的字符串，即生成的分享码。操作失败时返回空字符串，并且可调用getLastError()获取错误信息。
     */
    public function getHomeShareCode($user, $homeId, $timeout);

    /**
     * 用户加入“家”对象。
     * @param $user ACUser对象，是要加入“家”的用户。
     * @param $shareCode 字符串，是用户加入“家”所使用的分享码/邀请码。
     * @return 操作成功时返回一个ACHome对象，否则返回NULL。操作失败时可调用getLastError()获取错误信息。
     */
    public function joinHomeWithShareCode($user, $shareCode);

    /**
     * 将指定的用户加入“家”对象。
     * @param $user ACUser对象，是“家”的管理员用户。该管理员用户可以将帐号名字为$login的用户添加至“家”中。
     * @param $homeId 整数，是“家”的ID。
     * @param $login 字符串，是将被添加至“家”中的用户的帐号名：Email或手机号码。
     * @return 操作成功时返回TRUE，否则返回FALSE。操作失败时可调用getLastError()获取错误信息。
     */
    public function addUserToHome($user, $homeId, $login);

    /**
     * 将用户从“家”中删除。
     * @param $user ACUser对象，是“家”的管理员用户。
     * @param $homeId 整数，是“家”对象的ID。
     * @param $userId 整数，是要从“家”中删除的用户的ID。
     * @return 操作成功时返回TRUE，否则返回FALSE。操作失败时，可调用getLastError()获取错误信息。
     */
    public function removeUserFromHome($user, $homeId, $userId);

    /**
     * 查询某用户已创建的“家”对象。
     * @param $user ACUser对象，是待查询的用户。
     * @return 操作成功时返回ACHome对象组成的数组。操作失败时返回NULL，并且可调用getLastError()获取错误信息。
     */
    public function listHomes($user);

    /**
     * 查询某用户的“家”中的“房间”列表。
     * @param $user ACUser对象，是待查询的用户。
     * @param $homeId 整数，是待查询的“家”的ID。
     * @return 操作成功时返回ACRoom对象组成的数组。操作失败时返回NULL，并且可调用getLastError()获取错误信息。
     */
    public function listRooms($user, $homeId);

    /**
     * 查询某用户的“家”中已加入的设备。
     * @param $user ACUser对象，是待查询的用户。
     * @param $homeId 整数，是待查询的“家”的ID。
     * @return 操作成功时返回ACDevice对象组成的数组。操作失败时返回NULL，并且可调用getLastError()获取错误信息。
     */
    public function listHomeDevices($user, $homeId);

    /**
     * 查询某用户的“房间”中已加入的设备。
     * @param $user ACUser对象，是待查询的用户。
     * @param $homeId 整数，是待查询的“房间”所属的“家”的ID。
     * @param $roomId 整数，是待查询的“房间”的ID。
     * @return 操作成功时返回ACDevice对象组成的数组。操作失败时返回NULL，并且可调用getLastError()获取错误信息。
     */
    public function listRoomDevices($user, $homeId, $roomId);

    /**
     * 查询“家”中的成员列表。
     * @param $user ACUser对象，是待查询的“家”的成员用户。
     * @param $homeId 整数，是待查询的“家”的ID。
     * @return 操作成功时返回ACUser对象组成的数组（但是用户的TOKEN为空）。操作失败时返回NULL，并且可调用getLastError()获取错误信息。
     */
    public function listHomeUsers($user, $homeId);

    /**
     * 修改“家”的名字。
     * @param $user ACUser对象，是发起该操作的用户。
     * @param $homeId 整数，是拟修改名字的“家”的ID。
     * @param $name 字符串，是“家”的新名字。
     * @return 操作成功时返回TRUE，否则返回FALSE。操作失败时，可调用getLastError()获取错误信息。
     */
    public function changeHomeName($user, $homeId, $name);

    /**
     * 修改“房间”的名字。
     * @param $user ACUser对象，是发起该操作的用户。
     * @param $homeId 整数，是拟修改名字的“房间”所属的“家”的ID。
     * @param $roomId 整数，是拟修改名字的“房间”的ID。
     * @param $name 字符串，是“房间”的新名字。
     * @return 操作成功时返回TRUE，否则返回FALSE。操作失败时，可调用getLastError()获取错误信息。
     */
    public function changeRoomName($user, $homeId, $roomId, $name);
    //@}

    /// @name 设备的扩展属性
    //@{
    /**
     * 设置用户所绑定设备的扩展属性。
     * @param $user ACUser对象，是发起该操作的用户。
     * @param $deviceId 整数，是要设置其扩展属性的设备的逻辑ID。
     * @param $profile 是由键值对组成的关联数组，表示设备的扩展属性值。
     * @return 操作成功时返回TRUE，否则返回FALSE。操作失败时可调用getLastError()获取错误信息。
     */
    public function setDeviceProfile($user, $deviceId, $profile);

    /**
     * 取设备的扩展属性。
     * @param $deviceId 整数，是要查询其扩展属性的设备的逻辑ID。
     * @param $user ACUser对象，是发起该操作的用户。如果不为NULL则要求该用户已经绑定了参数$deviceId表示的设备。为NULL时，直接查询设备的扩展属性。
     * @return 操作成功时返回一个由键值对组成的关联数组，表示设备的扩展属性。操作失败时返回NULL，并且可调用getLastError()方法获取错误信息。
     */
    public function getDeviceProfile($deviceId, $user = NULL);
    //@}
}
```

##ACRoom##

```php
/**
 * 房间。
 */
class ACRoom {
    public $name;       /// 字符串，“房间”的名字。
    public $ownerId;    /// 整数，管理员用户的ID。
    public $homeId;     /// 整数，“房间”所属的“家”的ID。
    public $roomId;     /// 整数，“房间”的ID。该ID由云端分配。

    /**
     * 构造函数。
     * @param $name 字符串，是“房间”的名字。
     * @param $ownerId 整数，是管理员用户的ID。
     * @param $homeId 整数，是“房间”所属“家”的ID。
     * @param $roomId 整数，是“房间”的ID。
     */
    function __construct($name, $ownerId = 0, $homeId = 0, $roomId = 0);
}
```

##ACHome##

```php
/**
 * 家。
 */
class ACHome {
    public $name;       /// 字符串，“家”的名字。
    public $ownerId;    /// 整数，管理员用户的ID。
    public $homeId;     /// 整数，“家”的ID。该ID由云端分配。

    /**
     * 构造函数。
     * @param $name 字符串，是“家”的名字。
     * @param $ownerId 整数，是管理员用户的ID。
     * @param $homeId 整数，是“家”对象的ID。
     */
    function __construct($name, $ownerId = 0, $homeId = 0);
}
```

#文件存储接口#

##ACACL##

```php
/**
 * AbleCloud文件存储服务中文件的访问权限。
 */
class ACACL {
    /**
     * 构造函数。
     * @param $allowPublicRead  bool    是否可读。不可读的文件不能被访问。
     * @param $allowPublicWrite bool    是否可写。不可写的文件上传后不能被修改。
     */
    function __construct($allowPublicRead = true, $allowPublicWrite = true);

    /**
     * 设置是否可读。
     * @param $allow    bool    布尔值，是否可读。
     * @return $this            返回本对象。
     */
    public function allowPublicRead($allow);

    /**
     * 检查是否允许读。
     * @return bool 返回TRUE表示可读，否则表示不可读。
     */
    public function isPublicReadAllowed();

    /**
     * 设置是否可写。
     * @param $allow    bool    布尔值，是否可写。
     * @return $this            返回本对象。
     */
    public function allowPublicWrite($allow);

    /**
     * 检查是否允许写。
     * @return bool 返回TRUE表示可写，否则表示不可写。
     */
    public function isPublicWriteAllowed();
}
```

##ACFileMgr##
```php
/**
 * AbleCloud文件存储服务。
 */
class ACFileMgr extends ACService {
    /**
     * 构造函数。
     * @param $name     string      AbleCloud文件存储服务的名字。
     * @param $version  int         AbleCloud文件存储服务的版本。
     * @param $context  ACContext   ACContext对象，表示访问该远程服务所依赖的环境信息。
     */
    function __construct($name, $version, $context);

    /**
     * 获取文件的访问/下载URL。
     * @param $bucket       string  要访问/下载的文件在云端所属的类别的名字。
     * @param $name         string  要访问/下载的文件在云端的名字。
     * @param $expireTime   int     所获取的访问/下载URL的有效时长。单位为秒。如果取值为小于或等于0,表示不限定有效期。
     * @return              string  返回指定文件的访问/下载URL。返回空字符串时表示操作失败，可以调用getLastError()获取错误信息。
     */
    public function getDownloadUrl($bucket, $name, $expireTime = 0);

    /**
     * 上传文件至云端。云端使用七牛或AWS由所对应的AC-BlobStore服务决定。
     * @param $filePath     string  要被上传的文件的本地路径。
     * @param $bucket       string  文件上传后在云端所属的类别的名字。
     * @param $name         string  文件上传后在云端所使用的文件名（包括文件扩展名）。如不指定（null或空字符串），则表示使用从filePath中提取的文件名字。
     * @param $acl          ACACL   文件的访问权限。如果为NULL，则使用缺省值。
     * @return              bool    操作成功是返回TRUE，否则表示操作失败。失败时可以调用getLastError()获取错误信息。
     */
    public function uploadFile($filePath, $bucket, $name, $acl = NULL);
}
```

#用户反馈接口#

##ACFeedbackColumn##

```php
/**
 * 反馈消息的列定义。
 */
class ACFeedbackColumn {
    public $columnName = '';    ///< 列的名字。
    public $columnType = 0;     ///< 列的类型：1（整数），2（浮点数），3（布尔），4（字符串），5（图片）。
    public $columnLength = 0;   ///< 列的值的长度。
    public $description = '';   ///< 列的描述信息。

    public static function fromObject($obj);
}
```

##ACFeedbackMgr##

```php
/**
 * AbleCloud客户反馈消息服务。
 */
class ACFeedbackMgr extends ACService {
    /**
     * 构造函数。
     * @param $name     string    AbleCloud产品服务的名字。
     * @param $version  int       AbleCloud产品服务的主版本号。
     * @param $context  ACContext 表示访问该远程服务所依赖的环境信息。
     */
    function __construct($name, $version, $context);

    /**
     * 取用户反馈信息的列信息。
     * @return array 操作成功时返回ACFeedbackColumn对象的数组。操作失败时返回NULL，并可调用方法getLastError()获取错误信息。
     */
    public function listColumns();

    /**
     * 查询用户反馈记录的数目。
     * @param $startTime            string  指定查询条件的起始时刻：YYYY-MM-DD HH:MM:SS。为空表示不指定该条件。
     * @param $endTime              string  指定查询条件的截止时刻：YYYY-MM-DD HH:MM:SS。为空表示不指定该条件。
     * @param $productSubDomainName string  所查询产品所属的子域的名字。为空表示不指定该条件。APP应用对应的名字为'app'。
     * @param $productModel         string  所查询产品的型号。为空表示不指定该条件。
     * @param $status               int     指定反馈记录的状态：1（开放）；2（关闭）。为0表示不指定该条件。
     * @return                      int     返回非负的整数表示符合条件的记录的数目。返回负数表示查询失败，可以调用方法getLastError()获取错误信息。
     */
    public function getFeedbacksCount($startTime = '', $endTime = '', $productSubDomainName = '', $productModel = '', $status = 0);

    /**
     * 查询用户反馈记录。
     * @param $startTime            string  指定查询条件的起始时刻：YYYY-MM-DD HH:MM:SS。为空表示不指定该条件。
     * @param $endTime              string  指定查询条件的截止时刻：YYYY-MM-DD HH:MM:SS。为空表示不指定该条件。
     * @param $productSubDomainName string  所查询产品所属的子域的名字。为空表示不指定该条件。APP应用对应的名字为'app'。
     * @param $productModel         string  所查询产品的型号。为空表示不指定该条件。
     * @param $status               int     指定反馈记录的状态：1（开放）；2（关闭）。为0表示不指定该条件。
     * @param $offset               int     $offset与$limit参数用于实现分页查询的效果。$offset是从0开始的偏移量，表示返回记录集中从第offset位置开始的共limit条记录的信息。
     * @param $limit                int     $offset与$limit参数用于实现分页查询的效果。$limit是正整数，表示返回记录集中从第offset位置开始的共limit条记录的信息。
     * @param $orderByASC           bool    是否以记录的创建时间的升序排序。
     * @return                      array   操作成功时，返回一个数组表示查询的结果。数组中的每个元素为由键值对组成的关联数组，表示对应的反馈记录。
     *                                      操作失败时返回NULL，可以调用方法getLastError()获取错误信息。
     */
    public function scanFeedbacks($startTime = '', $endTime = '', $productSubDomainName = '', $productModel = '', $status = 0, $offset = 0, $limit = 0, $orderByASC = false);
}
```

#OTA接口#

##ACOtaMgr##

```php
/**
 * AbleCloud设备OTA服务。
 */
class ACOtaMgr extends ACService {
    /**
     * 构造函数。
     * @param $name AbleCloud设备OAT服务的名字。
     * @param $version AbleCloud设备OTAS服务的版本。
     * @param $context ACContext对象，表示访问该远程服务所依赖的环境信息。
     */
    function __construct($name, $version, $context);

    /**
     * 检查设备的固件升级信息。
     * @param $user ACUser对象，表示设备的用户。
     * @param $deviceId 整数，是要被检查的设备的逻辑ID。
     * @param $subDomain 字符串，是待检查的设备所属的子域的名字。
     * @return 返回一个ACOtaVersion对象，表示版本信息。如果操作失败，则返回NULL。此时，可调用getLastError()获取错误信息。
     */
    public function checkUpdate($user, $deviceId, $subDomain);

    /**
     * 确认升级设备的固件版本。
     * @param $user ACUser对象，表示执行该操作的用户。
     * @param $deviceId 整数，是要被升级的设备的逻辑ID。
     * @param $subDomain 字符串，是待操作的设备所属的子域的名字。
     * @param $toVersion 字符串，表示升级的目标版本号，如：2-0-3。
     * @return 操作成功时返回TRUE，否则返回FALSE。操作失败时可调用getLastError()获取错误信息。
     */
    public function confirmUpdate($user, $deviceId, $subDomain, $toVersion);
}
```

##ACOtaVersion##

```php
/**
 * OTA版本信息。
 */
class ACOtaVersion {
    /**
     * 构造函数。
     * @param $currentVersion 字符串，表示当前版本号，如：1-0-1。
     * @param $newVersion 字符串，表示新版本号，如：1-0-2。
     * @param $updateLog 字符串，表示新版本的升级说明。
     */
    function __construct($currentVersion, $newVersion, $updateLog = '');

    /**
     * 取当前版本信息。
     * @return 返回一个字符串，表示当前版本。
     */
    public function getCurrentVersion();

    /**
     * 取新版本信息。
     * @return 返回一个字符串，表示新版本。
     */
    public function getNewVersion();

    /**
     * 取新版本的更新信息。
     * @return 返回一个字符串，表示新版本的升级信息。
     */
    public function getUpdateLog();

    /**
     * 检查是否可升级：检查新版本是否高于当前版本。
     * @return 返回TRUE表示新版本高于当前版本；否则返回FALSE。
     */
    public function canUpdate();
}
```

#产品接口#

##ACProduct##

```php
/**
 * 产品信息。
 */
class ACProduct {
    public $domainId = '';          ///< 字符串，主域ID。
    public $domainName = '';        ///< 字符串，主域名字。
    public $subDomainId = '';       ///< 字符串，子域ID。
    public $subDomainName = '';     ///< 字符串，子域名字。
    public $name = '';              ///< 字符串，产品的名字。
    public $type = '';              ///< 字符串，产品类型，如独立设备、网关设备、安卓设备、子设备等。
    public $dataProtocol = '';      ///< 字符串，产品的通信数据格式，如JSON、KLV、二进制等。
    public $transportProtocol = ''; ///< 字符串，产品的数据传输协议，如tcp、simple tcp、mqtt、http等。
    public $model = '';             ///< 字符串，产品的型号。
    public $os = '';                ///< 字符串，设备的操作系统名。
    public $connectProtocol = '';   ///< 字符串，设备的连接协议，如wifi、bluetooth、ethernet、cellular等。
    public $description = '';       ///< 字符串，产品的描述信息。
    public $thirdCloud = '';        ///< 字符串，设备对接的物联网云平台的名字。
    public $secType = '';           ///< 字符串，数据加密方式，如RSA、DES等。
    public $category = 0;           ///< 整数，标记产品的品类，如智能家居、可穿戴设备等。
    public $deviceMode = 0;         ///< 整数，设备的管理模式：0（非绑定模式），1（管理员绑定模式），2（普通绑定模式）。
    public $taskMode = 0;           ///< 整数，设备定时模式：0（无定时），1（云端定时），2（设备定时(支持云端定时)）。
    public $taskUpdatePolicy = 0;   ///< 整数，定时任务删除机制：1（普通用户解绑不删除定时任务，管理员解绑删除所有定时任务），2（用户解绑删除定时任务）。

    /**
     * 从关联数组对象构造ACProduct对象。
     * @param $obj  array               保存了设备信息的对象。
     * @return      ACProduct | NULL    构造的ACProduct对象或者NULL。
     */
    public static function fromObject($obj);
}
```

##ACProductMgr##

```php
/**
 * AbleCloud产品服务。
 */
class ACProductMgr extends ACService {
    /**
     * 构造函数。
     * @param $name     string    AbleCloud产品服务的名字。
     * @param $version  int       AbleCloud产品服务的主版本号。
     * @param $context  ACContext 表示访问该远程服务所依赖的环境信息。
     */
	  function __construct($name, $version, $context);

    /**
     * 获取开发者的产品列表。
     * @return array 操作成功时返回ACProduct对象的数组。操作失败时返回NULL，并可调用方法getLastError()获取错误信息。
     */
    public function getDomainProducts();
}
```

#数据库接口#

##ACStoreClassColumn##

```php
/**
 * AlbeCloud数据存储服务的数据集中数据列的定义。
 */
class ACStoreClassColumn {
    public $name;	/// 列的名字。字符串。
    public $type;	/// 列的数据类型。整数。1：整数类型；2：浮点数类型；3：布尔值；4：字符串；其它：未知类型。
    public $length;	/// 列的值的长度。仅字符串类型的列需要指定长度：[1, 1024]。默认为255。

    /**
     * 构造函数。
     * @param $name 列的名字。
     * @param $type 列的数据类型，整数。1：整数类型；2：浮点数类型；3：布尔值；4：字符串；其它：未知类型。
     * @param $length 列的值的长度。仅字符串类型的列需要指定长度：[1, 1024]。默认为255。
     */
    function __construct($name, $type, $length = 255);

    /**
     * 取本列的数据类型的名字。
     * @return 返回本列的数据类型的名字。
     */
    public function getTypeName();
}
```

##ACStoreClass##

```php
/**
 * AbleCloud数据存储服务的数据集。
 */
class ACStoreClass {
	public $domain;				/// 数据集所属主域的名字。
    public $name;				/// 数据集的名字：字母、数字或下划线。
    public $columns;			/// 数据集的全部数据列：ACStoreClassColumn对象的数组。
    public $primaryKeys;		/// 数据集的主键：ACStoreClassColumn对象的数组。
    public $entityGroupKeys;	/// 数据集的分区键：ACStoreClassColumn对象的数组。如果该数组不为空数组，则表示使用分区策略；否则表示不使用分区策略。
    public $enableWatch;		/// 布尔值，是否启用数据监控功能。缺省取FALSE。

	/**
     * 构造函数。
     * @param $domain 数据集所属的主域的名字。
     * @param $name 数据集的名字：字母、数字或下划线。
     */
    function __construct($domain, $name);

    /**
     * 将本对象编码成JSON格式的字符串。
     * @return 返回JSON格式的字符串。
     */
    public function jsonEncode();
}
```

##ACStoreComplicatedFilter##

```php
/**
 * 复杂查询条件：单个或多个ACStoreFilter通过逻辑操作符组合起来形成复杂查询条件。如：“time < 1436170756857177”，“time > 1436170756857177 AND name = '张三'”等都是复杂查询条件。
 * 多个复杂条件连接在一起时，同一个复杂条件内的条件会被包括在一个括弧内，如：(time > 1436170756857177 AND name = '张三') OR (deviceId = 12 AND name = '张三')。
 * 其中，条件“time > 1436170756857177 AND name = '张三'”是一个负载查询条件的内容，“deviceId = 12 AND name = '张三'”是另一个复杂查询条件的内容。
 * 这两个复杂查询条件通过逻辑或（OR）连接起来。
 */
class ACStoreComplicatedFilter {
    /**
     * 构造函数。
     * @param $filter ACStoreFitler对象，是初始化复杂查询条件的简单条件。
     */
    function __construct($filter);

    /**
     * 将一个简单查询条件ACStoreFilter链接至本对象所包含的简单查询条件链表的末尾。
     * @param $filter     ACStoreFilter ACStoreFilter对象，表示要被连接的查询条件。
     * @param $logicalAnd bool          为true时，表示以逻辑“与”的关系连接$filter，否则表示以逻辑“或”的关系连接$filter。
     * @return            ACStoreComplicatedFilter 本ACStoreComplicatedFilter对象。
     */
    public function appendFilter($filter, $logicalAnd = true);

    /**
     * 计算本对象所含的简单查询对象（ACStoreFilter）链表中元素的数目。
     * @return 返回链表中的简单查询对象（ACStoreFilter）的数目。
     */
    public function countFilters();

    /**
     * 将另一个复杂查询条件（ACStoreComplicatedFilter）链接至本对象所属复杂查询条件链表的末尾。
     * @param $complicatedFilter ACStoreComplicatedFilter对象，表示要链接的复杂查询条件。
     * @param $logicalAnd 为true时，表示以逻辑与操作链接$complicatedFilter对象，否则表示以逻辑或操作链接$complicatedFilter对象。
     * @return 位于链表末尾的ACStoreComplicatedFilter对象。
     */
    public function linkTo($complicatedFilter, $logicalAnd);

    /**
     * 假设以本复杂查询对象为链表的头，计算该链表中所包含的复杂查询条件对象（ACStoreComplicatedFilter）的数目。
     * @return 返回链表中复杂查询条件对象（ACStoreComplicatedFilter）的数目。
     */
    public function countComplicatedFilters();

    /**
     * 将以本对象为头元素的复杂查询对象链表转化为数组结构。
     * @return 以数组结构表达的复杂查询条件。
     */
    public function toArray();
}
```

##ACStoreFilter##

```php
/**
 * AbleCloud存储服务的查询条件，如：time > 1436170756857177。
 */
class ACStoreFilter {
    /// @name 查询条件中的操作附。
    //@{
    public static $Equal          = 1;    /// 相等
    public static $NotEqual       = 2;    /// 不相等
    public static $Greater        = 3;    /// 大于
    public static $GreaterOrEqual = 4;    /// 大于或等于
    public static $Less           = 5;    /// 小于
    public static $LessOrEqual    = 6;    /// 小于或等于
    public static $Like           = 7;    /// SQL: like。不区分大小写。需要显示指定通配符'%'。
    public static $NotLike        = 8;    /// SQL: not like。不区分大小写。需要显示指定通配符'%'。
    public static $BinaryLike     = 9;    /// SQL: binary like。区分大小写。需要显示指定通配符'%'。
    public static $BinaryNotLike  = 10;   /// SQL: binary not like。区分大小写。需要显示指定通配符'%'。
    public static $In             = 11;   /// SQL: in
    public static $NotIn          = 12;   /// SQL: not in
    //@}

    /**
     * 构造函数。
     * @param $columnName 字符串，是查询条件中的数据列的名字。
     * @param $operator   整数，是查询条件中的操作符，如ACStoreFilter::$Equal，ACStoreFilter::$NotEqual等。
     * @param $value      整数、浮点数、字符串或布尔值，是查询条件中的目标值。
     */
    function __construct($columnName, $operator, $value);

    /**
     * 将本对象以逻辑“与”的关系与另一个ACStoreFilter对象关联起来。
     * @param $filter ACStoreFilter对象，要关联的查询条件。
     * @return ACStoreFitler对象，是当前关联起来的查询条件的列表中处于末尾位置的ACStoreFilter对象。
     */
    public function andFilter($filter);

    /**
     * 将本对象以逻辑“或”的关系与另一个ACStoreFilter对象关联起来。
     * @param $filter ACStoreFilter对象，要关联的查询条件。
     * @return ACStoreFitler对象，是当前关联起来的查询条件的列表中处于末尾位置的ACStoreFilter对象。
     */
    public function orFilter($filter);

    /**
     * 生成本对象的一个拷贝：仅复制数据列名、操作符，以及目标值。
     * @return ACStoreFilter 是本对象的拷贝。
     */
    public function getCopy();

    public $columnName;        /// 查询所依赖的数据列。
    public $operator;          /// 查询的操作符。
    public $value;             /// 查询条件的参考值。
    // ACStoreFilter对象链表
    public $nextFilter;        /// 所链接的后一个ACStoreFilter对象。缺省为NULL，表示没有下一个查询条件。
    public $andToPrevious;     /// 与前一个ACStoreFilter对象的链接关系：true-逻辑与；false-逻辑或。
}
```

##ACStoreIterator##

```php
/**
 * AbleCloud存储服务查询结果集合的迭代器。
 */
class ACStoreIterator extends ACService {
    /**
     * 构造函数。
     * @param $name 数据存储服务的名字。
     * @param $version 数据存储服务的版本。
     * @param $context ACContext对象，表示访问该远程服务所依赖的环境信息。
     * @param $scanner ACStoreScanner对象，表示查询条件。
     */
    function __construct($name, $version, $context, $scanner);

    /**
     * 取查询结果集合中的下一批数据记录。返回NULL时表示已遍历完整个数据集。
     * @details 实际上，当前第一次调用本方法就返回所有符合条件的记录，因此不用多次调用来检查是否已取到了所有数据。
     * @return - 返回一个数组。数组中的每个元素是一个关联数组，表示一条数据记录。
     *  - 返回NULL表示已遍历完整个集合。
     *  - 返回FALSE时，表示有错误发生。此时可调用getLastError()方法获取错误消息。
     */
    public function next();
}
```

##ACStoreScanner##

```php
/**
 * AbleCloud数据存储服务的查询工具。
 */
class ACStoreScanner {
    /**
     * 构造函数。
     * @param $name 字符串。要被查询的数据集的名字。
     * @param $entityGroupKeyValues 以键值对的方式（如关联数组等）描述的查询数据集时所使用的分区键的值。如果数据集没有分区，则使用NULL。
     */
    function __construct($name, $entityGroupKeyValues = NULL);

    /**
     * 取要查询的数据集的名字。
     * @return 要查询的数据集的名字。
     */
    public function getClassName();

    /**
     * 设置要被查询的数据列。该方法可被多次调用，每次调用指定的数据列将被添加至之前设置的集合中。
     * 该方法的调用方式，如查询单列：$scanner->select('deviceId')；或查询多列：$scanner->select('deviceId', 'time', 'message')。
     * @param $columnNames 字符串，表示要被查询的数据列的名字。
     * @return 本ACStoreScanner对象。
     */
    public function select(...$columnNames);

    /**
     * 清除要查询的目标列。
     * @return 本ACStoreScanner对象。
     */
    public function clearSelection();

    /**
     * 设置查询条件。该方法如果被多次调用，则后续调用传入的参数将覆盖之前设置的所有查询条件。
     * @param $complicatedFilter ACStoreComplicatedFilter对象，表示查询的过滤条件。
     * @return 本ACStoreScanner对象。
     */
    public function where($complicatedFilter);

    /**
     * 设置查询条件。该方法如果被多次调用，则后续调用传入的参数将覆盖之前设置的所有查询条件。
     * @param $filter ACStoreFilter或ACStoreComplicatedFilter对象，表示查询条件。如果是ACStoreFilter对象，将先生成一个组合条件，并将该对象放置在组合条件中，然后再设置为过滤条件。
     * @return 本ACStoreScanner对象。
     */
    public function whereExt($filter);

    /**
     * 以逻辑“与”的关系添加一个查询条件或条件的组合。
     * @details 该方法应该在调用了ACStoreScanner::where方法或ACStoreScanner::whereExt之后再调用。
     * @param $filter ACStoreFilter或ACStoreComplicatedFilter对象，表示新添加的查询条件或条件的组合。如果是ACStoreFilter，那该条件将会被添加至已存在的第一个组合条件中；如果是组合条件，则组合条件将会跟已存在的组合条件并列组合起来。
     * @return 本ACStoreScanner对象。
     */
    public function andWhere($filter);

    /**
     * 以逻辑“或”的关系添加一个查询条件或条件的组合。
     * @details 该方法应该在调用了ACStoreScanner::where方法或ACStoreScanner::whereExt之后再调用。
     * @param $filter ACStoreFilter或ACStoreComplicatedFilter对象，表示新添加的查询条件或条件的组合。如果是ACStoreFilter，那该条件将会被添加至已存在的第一个组合条件中；如果是组合条件，则组合条件将会跟已存在的组合条件并列组合起来。
     * @return 本ACStoreScanner对象。
     */
    public function orWhere($filter);

    /**
     * 清除查询条件。
     * @return 本ACStoreScanner对象。
     */
    public function clearWhere();

    /**
     * 增加对查询结果进行排序的列及方式。
     * @param $columnName 字符串，是用作排序的列的名字。如该名字与之前添加过的列重名，则以最后一次设置的排序方式为准。
     * @param $asc 布尔值，为true时表示依据$columnName升序排序，否则表示以降序排序。
     * @return 本ACStoreScanner对象。
     */
    public function addOrderBy($columnName, $asc);

    /**
     * 清除排序条件。
     * @return 本ACStoreScanner对象。
     */
    public function clearOrderBy();

    /**
     * 设置查询结果集的分组数据列。该方法可被多次调用，每次调用指定的数据列将被添加至之前设置的集合中。
     * @param $columnNames 字符串，是分组所依据的数据列的名字。
     * @return 本ACStoreScanner对象。
     */
    public function groupBy(...$columnNames);

    /**
     * 清除分组参数。
     * @return 本ACStoreScanner对象。
     */
    public function clearGroupBy();

    /**
     * 设置置扫描的offset，默认为0。
     * @param $number 非负整数。
     * @return 本ACStoreScanner对象。
     */
    public function offset($number);

    /**
     * 设置查询结果集的最大记录数。
     * @param $number 非负整数，指定查询结果集中的最大记录数。其取值范围限制为闭区间[0, 1000]。如果为0（缺省值），其效果等于取值为1000。
     * @return 本ACStoreScanner对象。
     */
    public function limit($number);

    /**
     * 清除Offset及Limit参数。
     * @return 本ACStoreScanner对象。
     */
    public function clearOffsetAndLimit();

    /**
     * 添加聚集函数COUNT()为查询结果列。
     * @return 本ACStoreScanner对象。
     */
    public function count();

    /**
     * 添加聚集函数SUM()为查询结果列。该方法可被多次调用，每次调用指定的数据列将被添加至之前设置的集合中。
     * @param $columnName SUM()函数作用的目标数据列。
     * @return 本ACStoreScanner对象。
     */
    public function sum($columnName);

    /**
     * 添加聚集函数AVG()为查询结果列。该方法可被多次调用，每次调用指定的数据列将被添加至之前设置的集合中。
     * @param $columnName AVG()函数作用的目标数据列。
     * @return 本ACStoreScanner对象。
     */
    public function avg($columnName);

    /**
     * 添加聚集函数MAX()为查询结果列。该方法可被多次调用，每次调用指定的数据列将被添加至之前设置的集合中。
     * @param $columnName MAX()函数作用的目标数据列。
     * @return 本ACStoreScanner对象。
     */
    public function max($columnName);

    /**
     * 添加聚集函数MIN()为查询结果列。该方法可被多次调用，每次调用指定的数据列将被添加至之前设置的集合中。
     * @param $columnName MIN()函数作用的目标数据列。
     * @return 本ACStoreScanner对象。
     */
    public function min($columnName);

    /**
     * 执行查询，返回查询结果。
     * @return - 返回一个数组。数组中的每个元素是一个关联数组，表示一条数据记录。
     *  - 返回FALSE时，表示有错误发生。此时可调用getLastError()方法获取错误消息。
     */
    public function execute();

    /**
     * 清除Aggregate参数。
     * @return 本ACStoreScanner对象。
     */
    public function clearAggregates();

    /**
     * 设置访问ACStore服务的参数。
     * @details 调用ACStoreScanner::execute之前需要调用本方法配置ACStore的访问信息。
     * @param $serviceName 字符串，是ACStore服务的名字。
     * @param $serviceVersion 整数，是ACStore服务的主版本号。
     * @param $acContext ACContext对象，是访问ACStore服务的上下文环境。
     * @return 本ACStoreScanner对象。
     */
    public function setACStore($serviceName, $serviceVersion, $acContext);

    /**
     * 取最近一次错误消息。
     * @return 返回一个包含错误码和消息的关联数组：['errCode': 0, 'errMessage': '']。errCode为0时表示没有错误发生。
     */
    public function getLastError();

    /**
     * 将本对象转换为AbleCloud存储服务的scanParam结构。
     * @return 返回一个关联数组，代表存储服务的scanParam参数。
     */
    public function toScanParam();
}
```

##ACStoreBatchDelete##

```php
/**
 * AbleCloud数据存储服务的批量删除工具。
 */
class ACStoreBatchDelete extends ACService {
	/**
     * 构造函数。
     * @param $name 数据存储服务的名字。
	 * @param $version 数据存储服务的版本。
	 * @param $context ACContext对象，表示访问该远程服务所依赖的环境信息。
     * @param $className 字符串。要操作的数据集的名字。
     * @param $entityGroupKeyValues 以键值对的方式（关联数组）描述的操作数据集时所使用的分区键的值。如果数据集没有分区，则使用NULL。
     */
    function __construct($name, $version, $context, $className, $entityGroupKeyValues = NULL);

    /**
     * 取要操作的数据集的名字。
     * @return 要操作的数据集的名字。
     */
    public function getClassName();

    /**
     * 设置删除条件。该方法如果被多次调用，则后续调用传入的参数将覆盖之前设置的所有删除条件。
     * @param $filter ACStoreFilter或ACStoreComplicatedFilter对象，表示删除条件。
     * @return 本ACStoreBatchDelete对象。
     */
    public function where($filter);

    /**
     * 以逻辑“与”的关系添加一个删除条件或条件的组合。
     * @details 该方法应该在调用了ACStoreBatchDelete::where方法之后再调用。
     * @param $filter ACStoreFilter或ACStoreComplicatedFilter对象，表示新添加的删除条件或条件的组合。如果是组合条件，则组合条件将会被括号组合在一起。
     * @return 本ACStoreScanner对象。
     */
    public function andWhere($filter);

    /**
     * 以逻辑“或”的关系添加一个删除条件或条件的组合。
     * @details 该方法应该在调用了ACStoreBatchDelete::where方法之后再调用。
     * @param $filter ACStoreFilter或ACStoreComplicatedFilter对象，表示新添加的删除条件或条件的组合。如果是组合条件，则组合条件将会被括号组合在一起。
     * @return 本ACStoreScanner对象。
     */
    public function orWhere($filter);

    /**
     * 清除删除条件。
     * @return 本ACStoreScanner对象。
     */
    public function clearWhere();

    /**
     * 执行删除操作。
     * @return 返回TRUE或FALSE。返回FALSE表示有错误发生。此时可调用getLastError()方法获取错误消息。
     */
    public function execute();
}
```

##ACStoreBatchUpdate##

```php
/**
 * AbleCloud数据存储服务的批量更新工具。
 */
class ACStoreBatchUpdate extends ACService {
	/**
     * 构造函数。
     * @param $name 数据存储服务的名字。
	 * @param $version 数据存储服务的版本。
	 * @param $context ACContext对象，表示访问该远程服务所依赖的环境信息。
     * @param $className 字符串。要操作的数据集的名字。
     * @param $entityGroupKeyValues 以键值对的方式（关联数组）描述的操作数据集时所使用的分区键的值。如果数据集没有分区，则使用NULL。
     */
    function __construct($name, $version, $context, $className, $entityGroupKeyValues = NULL);

    /**
     * 取要操作的数据集的名字。
     * @return 要操作的数据集的名字。
     */
    public function getClassName();

    /**
     * 设置更新条件。该方法如果被多次调用，则后续调用传入的参数将覆盖之前设置的所有删除条件。
     * @param $filter ACStoreFilter或ACStoreComplicatedFilter对象，表示删除条件。
     * @return 本ACStoreBatchDelete对象。
     */
    public function where($filter);

    /**
     * 以逻辑“与”的关系添加一个更新条件或条件的组合。
     * @details 该方法应该在调用了ACStoreBatchDelete::where方法之后再调用。
     * @param $filter ACStoreFilter或ACStoreComplicatedFilter对象，表示新添加的更新条件或条件的组合。如果是组合条件，则组合条件将会被括号组合在一起。
     * @return 本ACStoreBatchUpdate对象。
     */
    public function andWhere($filter);

    /**
     * 以逻辑“或”的关系添加一个更新条件或条件的组合。
     * @details 该方法应该在调用了ACStoreBatchDelete::where方法之后再调用。
     * @param $filter ACStoreFilter或ACStoreComplicatedFilter对象，表示新添加的更新条件或条件的组合。如果是组合条件，则组合条件将会被括号组合在一起。
     * @return 本ACStoreBatchUpdate对象。
     */
    public function orWhere($filter);

    /**
     * 清除更新条件。
     * @return 本ACStoreBatchUpdate对象。
     */
    public function clearWhere();

    /**
     * 将某一列设置为一个值。
     * @param $column string 是列名。如果之前设置过该列，则之前设置的值会被覆盖。
     * @param $value  mixed	 是值，其类型与列的类型要匹配。
     * @return 本ACStoreBatchUpdate对象。
     */
    public function set($column, $value);

    /**
     * 将某一列加上一个值。
     * @param $column string 是列名。如果之前设置过该列，则之前设置的值会被覆盖。
     * @param $value  mixed	 是值，其类型与列的类型要匹配。
     * @return 本ACStoreBatchUpdate对象。
     */
    public function inc($column, $value);

    /**
     * 将某一列减去一个值。
     * @param $column string 是列名。如果之前设置过该列，则之前设置的值会被覆盖。
     * @param $value  mixed	 是值，其类型与列的类型要匹配。
     * @return 本ACStoreBatchUpdate对象。
     */
    public function dec($column, $value);

    /**
     * 清除更新值。
     * @return 本ACStoreBatchUpdate对象。
     */
    public function clearColumns();

    /**
     * 执行更新操作。
     * @return 返回TRUE或FALSE。返回FALSE表示有错误发生。此时可调用getLastError()方法获取错误消息。
     */
    public function execute();
}
```

##ACStoreModify##

```php
/**
 * AbleCloud数据存储服务的修改单条数据记录的方法。
 * 本方法先检查符合条件的记录是否存在。如存在则更新该记录，否则不执行操作。
 */
class ACStoreModify extends ACService {

    /**
     * 构造函数。
     * @param $name     string      数据存储服务的名字。
     * @param $version  int         数据存储服务的版本。
     * @param $context  ACContext   ACContext对象，表示访问该远程服务所依赖的环境信息。
     * @param $className    string  要修改的记录所属的数据集的名字。
     */
    function __construct($name, $version, $context, $className);

    /**
     * 设置要更新的记录
     * @param $row      array   以键值对的方式（关联数组）描述的要被更新的记录。$row参数应指定所有主键的值，用于定位要被更新的记录。
     * 如果主键指定的记录不存在，则不执行操作。
     * @return          ACStoreModify   返回本对象。
     */
    public function where($row);

    /**
     * 设置要更新的列的值：将记录中该列的值修改为指定的值。
     * @param $column   string  要修改的列的名字。
     * @param $value    mixed   要修改的目标值。
     * @return          ACStoreModify   返回本对象。
     */
    public function set($column, $value);

    /**
     * 设置更新某列的值为当前值加上$value后的结果。
     * @param $column   string  要修改的列的名字。
     * @param $value    int|float|double    修改的增量值。
     * @return          ACStoreModify       返回本对象。
     */
    public function inc($column, $value);

    /**
     * 设置更新某列的值为当前值减去$value后的结果。
     * @param $column   string  要修改的列的名字。
     * @param $value    int|float|double    修改的减量值。
     * @return          ACStoreModify       返回本对象。
     */
    public function dec($column, $value);

    /**
     * 执行查询，返回查询结果。
     * @return bool 操作成功返回TRUE；否则返回FALSE，并且可调用getLastError()方法获取错误消息。
     */
    public function execute();
}
```

##ACStore##

```php
/**
 * AbleCloud数据存储服务。
 */
class ACStore extends ACService {
    /**
     * 构造函数。
     * @param $name 	string	数据存储服务的名字。
     * @param $version	int		数据存储服务的版本。
     * @param $context	ACContext	ACContext对象，表示访问该远程服务所依赖的环境信息。
     */
    function __construct($name, $version, $context);

    /**
     * 创建数据集。仅测试环境支持该方法。
     * @param $classDef ACStoreClass	ACStoreClass对象，表示数据集的定义。
     * @return			bool			操作成功返回TRUE；否则返回FALSE，并且可调用getLastError()方法获取错误消息。
     */
    public function createClass($classDef);

    /**
     * 查询已创建的数据集。
     * @return array 返回ACStoreClass数组，表示已定义的数据集。操作失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function listClasses();

    /**
     * 删除指定的数据集。仅测试环境支持该方法。
     * @param $name string	字符串，表示要被删除的数据集的名字。
     * @return 		bool	操作成功返回TRUE；否则返回FALSE，并且可调用getLastError()方法获取错误消息。
     */
    public function dropClass($name);

    /**
     * 清除指定数据集中的数据。仅测试环境支持该方法。
     * @param $name string	要清除其数据的数据集的名字。
     * @return 		bool	操作成功返回TRUE；否则返回FALSE，并且可调用getLastError()方法获取错误消息。
     */
    public function clearClass($name);

    /**
     * 在数据集中添加一条数据记录。
     * @param $name string	要添加数据的数据集的名字。
     * @param $row	array	以键值对的方式（关联数组）描述的要添加的数据记录。其中，至少应包含所有主键的值。
     * @return 		bool	操作成功返回TRUE；否则返回FALSE，并且可调用getLastError()方法获取错误消息。
     */
    public function create($name, $row);

    /**
     * 从数据集中删除指定的记录。
     * @param $name string	要删除数据的数据集的名字。
     * @param $row	array	以键值对的方式（关联数组）描述的要被删除的记录。$row参数应指定所有主键的值，删除操作将删除主键值与$row匹配的记录。
     * @return 		bool	操作成功返回TRUE；否则返回FALSE，并且可调用getLastError()方法获取错误消息。
     */
    public function delete($name, $row);

    /**
     * 更新数据集中指定的记录。
     * @param $name string	要更新的数据所属的数据集的名字。
     * @param $row	array	以键值对的方式（关联数组）描述的要被更新的记录，以及更新后的值。$row参数应指定所有主键的值，用于定位要被更新的记录；$row中记录的其它列的值用于更新该记录：只更新原数据记录中已经存在的字段。如果主键指定的记录不存在，本方法将会在数据集中新建一条对应的记录。
     * @return		bool	操作成功返回TRUE；否则返回FALSE，并且可调用getLastError()方法获取错误消息。
     */
    public function update($name, $row);

    /**
     * 查询指定的记录。
     * @param $name				string	要查询的数据集的名字。
     * @param $primaryKeyValues array	以键值对方式（如关联数组等）描述的要查询的记录的主键值。
     * @param $select 			array	字符串数组，记录了查询结果中应显示的数据列的集合。可选。如为NULL，则表示要查询所有数据列。
     * @return 					array	操作成功时返回一个关联数组，记录查询结果。操作失败时返回NULL，并且可调用getLastError()方法获取错误消息。
     */
    public function find($name, $primaryKeyValues, $select = NULL);

    /**
     * 查询分区内的数据。兼容v1.3.x之前的版本。
     * @param $scanner	ACStoreScanner	ACStoreScanner对象，表示查询条件。
     * @return 			ACStoreIterator	返回一个ACStoreIterator对象，用于遍历查询结果集合中的数据。返回NULL时表示操作失败，此时可调用getLastError()方法获取错误消息。
     */
    public function scan($scanner);

    /**
     * 查询数据。
     * @param $name					string	字符串。要被查询的数据集的名字。
     * @param $entityGroupKeyValues array	以键值对的方式（如关联数组等）描述的查询数据集时所使用的分区键的值。如果数据集没有分区，则使用NULL。
     * @return						ACStoreScanner	返回一个ACStoreScanner对象，以便于设置查询参数，执行查询，获取查询结果。
     */
    public function scanExt($name, $entityGroupKeyValues = NULL);

	/**
     * 批量删除数据。
     * @param $name 				string	字符串。要被操作的数据集的名字。
     * @param $entityGroupKeyValues array	以键值对的方式（关联数组）描述的操作数据集时所使用的分区键的值。如果数据集没有分区，则使用NULL。
     * @return 						ACStoreBatchDelete	返回一个ACStoreBatchDelete对象，以便于设置删除参数，执行操作。
     */
	public function batchDelete($name, $entityGroupKeyValues = NULL);

	/**
     * 批量更新数据。
     * @param $name 				string	字符串。要被操作的数据集的名字。
     * @param $entityGroupKeyValues array	以键值对的方式（关联数组）描述的操作数据集时所使用的分区键的值。如果数据集没有分区，则使用NULL。
     * @return 						ACStoreBatchUpdate	返回一个ACStoreBatchUpdate对象，以便于设置更新参数，执行操作。
     */
	public function batchUpdate($name, $entityGroupKeyValues = NULL);

	/**
     * 更新单条记录。
     * @param $name				string	字符串，是要被操作的数据集的名字。
     * @return					ACStoreModify	返回一个ACStoreModify对象，以便于设置更新参数，执行操作。
     */
    public function modify($name);
}
```

#定时任务接口#

##ACTimerTask##

```php
/**
 * APP端定时任务。
 */
class ACTimerTask {
    // 由用户提供的参数
    public $name;           // 字符串，是任务的名字。
    public $description;    // 字符串，任务的描述信息。
    public $timePoint;      // DateTime对象，表示初次执行该任务的时间。周期任务的周期执行时间也以此时间为基准。
    public $timeCycle;      // 字符串，表示该任务的定时规则：
                            //      once - 单次执行任务；
                            //      min  - 每隔一分钟执行一次；
                            //      hour - 每隔一小时执行一次；
                            //      day  - 每隔一天执行一次；
                            //      month - 每隔一个月执行一次；
                            //      year - 每隔一年执行一次；
                            //      week - 指定每周的某一天或某几天执行一次。如[0,1,2,3,4,5,6]表示周日至周六每天都执行一次；[1,3,6]表示每周一、周三、周六各执行一次。每天执行的时间以ACTimerTask.timePoint指定的时间（忽略年-月-日）为准。
    public $userId;         // 整数，表示定义该任务的用户的ID。
    public $deviceId;       // 整数，表示该任务要操作的设备的逻辑ID。
    public $messageCode;    // 整数，表示执行该任务时，要发送给设备的消息码。
    public $message;        // 以string对象存储的，将于执行该任务时发送给设备的二进制数据。
    public $taskFlag;       // 整数，标记是使用云端定时还是使用设备端定时：0-云端定时（任务由云端定时器驱动）；1-设备端定时（任务由设备端的定时器驱动）。

    // 由云端分配的参数
    public $taskId;         // 整数，表示任务的ID。该ID由云端分配。
    public $status;         // 整数，表示任务的状态：0 - 已停止；1 - 已启动；2 - 已冻结。
    public $createTime;     // DateTime对象，表示任务的创建时间。
    public $modifyTime;     // DateTime对象，表示任务的修改时间。
}
```

##ACTimerTaskMgr##

```php
/**
 * APP端定时任务服务。
 */
class ACTimerTaskMgr extends ACService {
    /**
     * 构造函数。
     * @param $name AbleCloud APP端定时任务管理服务的名字。
     * @param $version AbleCloud APP端定时任务管理服务的版本。
     * @param $context ACContext对象，表示访问该远程服务所依赖的环境信息。
     */
    function __construct($name, $version, $context);

    /**
     * 添加一个新定时任务。
     * @param $task ACTimerTask对象，表示要新添加的任务。
     * @param $user ACUser对象，表示定义该任务的用户。
     * @return 返回TRUE表示操作成功，否则表示操作失败。失败时，可调用getLastError()获取错误信息。
     */
    public function addTask($task, $user);

    /**
     * 修改指定的定时任务。
     * @param $taskId 整数，表示要被修改的任务的ID。
     * @param $task ACTimerTask对象，表示任务的新内容。
     * @param $user ACUser对象，表示定义$taskId这个任务的用户。
     * @return 返回TRUE表示操作成功，否则表示操作失败。失败时，可调用getLastError()获取错误信息。
     */
    public function modifyTask($taskId, $task, $user);

    /**
     * 查询用户针对某设备定制的定时任务。
     * @param $user ACUser对象，表示创建该定时任务的用户。
     * @param $deviceId 整数，是设备的逻辑ID。
     * @return 操作成功时，返回一个数组，数组的元素是ACTimerTask对象。操作失败时返回NULL，并且可调用getLastError()获取错误信息。
     */
    public function listTasks($user, $deviceId);

    /**
     * 删除一个定时任务。
     * @param $user ACUser对象，是要被删除的任务所关联的用户。
     * @param $deviceId 整数，是要被删除的任务所关联的设备的逻辑ID。
     * @param $taskId 整数，是要被删除的任务的ID。
     * @return 操作成功时返回TRUE；操作失败时返回FALSE，并且可调用getLastError()获取错误信息。
     */
    public function deleteTask($user, $deviceId, $taskId);

    /**
     * 停止一个定时任务。
     * @param $user ACUser对象，是要被停止的任务所关联的用户。
     * @param $deviceId 整数，是要被停止的任务所关联的设备的逻辑ID。
     * @param $taskId 整数，是要被停止的任务的ID。
     * @return 操作成功时返回TRUE；操作失败时返回FALSE，并且可调用getLastError()获取错误信息。
     */
    public function stopTask($user, $deviceId, $taskId);

    /**
     * 启动一个定时任务。
     * @param $user ACUser对象，是要被启动的任务所关联的用户。
     * @param $deviceId 整数，是要被启动的任务所关联的设备的逻辑ID。
     * @param $taskId 整数，是要被启动的任务的ID。
     * @return 操作成功时返回TRUE；操作失败时返回FALSE，并且可调用getLastError()获取错误信息。
     */
    public function startTask($user, $deviceId, $taskId);
}
```

#数据分析接口#

##ACAnalysisMgr##

```php
/**
 * AbleCloud数据分析服务。
 */
class ACAnalysisMgr extends ACService {
    /**
     * 构造函数。
     * @param $name		string		AbleCloud数据分析服务的名字。
     * @param $version	int			AbleCloud数据分析服务的主版本号。
     * @param $context	ACContext	表示访问该远程服务所依赖的环境信息。
     */
    function __construct($name, $version, $context);

    /**
     * 取ACQECount对象。
     * @return ACQECount    ACQECount对象。
     */
    public function count();

    /**
     * 取ACQECountUnique对象。
     * @return ACQECountUnique  ACQECountUnique对象。
     */
    public function countUnique();

    /**
     * 取ACQEDistribution对象。
     * @return ACQEDistribution  ACQEDistribution对象。
     */
    public function distribution();
}
```

##ACQEAggFilters##

```php
/**
 * AbleCloud数据分析服务的查询条件集合：ACQEPropertyFilters对象的集合。
 */
class ACQEAggFilters {
    /**
     * 设置集合中ACQEPropertyFilters对象之间的连接关系。缺省值为'AND'。
     * @param $isAnd    bool    为TRUE时表示集合中的ACQEPropertyFilters对象以AND关系连接。
     * @return          ACQEAggFilters 返回本集合对象。
     */
    public function setRelation($isAnd);

    /**
     * 向集合中添加查询条件。
     * @param $filters  ACQEPropertyFilters 查询条件。
     * @return          ACQEAggFilters      返回本集合对象。
     */
    public function appendFilter($filters);

    /**
     * 将对象转为AC-QueryEngine接受的参数格式。
     * @return array    以数组形式记录的参数。
     */
    public function toParamInArray();
}
```

##ACQECount##
```php
/**
 * * AbleCloud数据分析服务的数据查询类方法的基类。
 */
class ACQECount extends ACQEReadInterface {
    /**
     * 构造函数。
     * @param $name		string		AbleCloud数据分析服务的名字。
     * @param $version	int			AbleCloud数据分析服务的主版本号。
     * @param $context	ACContext	表示访问该远程服务所依赖的环境信息。
     */
    function __construct($name, $version, $context);

    /**
     * 执行AC-QueryEngine::count查询。
     * @return array|bool   返回服务端返回的结果。返回结果为数组时表示访问成功。
     * 返回FALSE时，表示有错误发生。此时可调用getLastError()方法获取错误消息。
     */
    public function execute();
}
```

##ACQECountUnique##

```php
/**
 * AbleCloud数据分析服务的Count_unique方法。
 */
class ACQECountUnique extends ACQEReadInterface {
    /**
     * 构造函数。
     * @param $name		string		AbleCloud数据分析服务的名字。
     * @param $version	int			AbleCloud数据分析服务的主版本号。
     * @param $context	ACContext	表示访问该远程服务所依赖的环境信息。
     */
    function __construct($name, $version, $context);

    /**
     * 设置拟操作的属性的名字。是必要参数。
     * @param $name     string  拟操作的属性的名字。
     * @return          ACQECountUnique 返回本对象。
     */
    public function property($name);

    /**
     * 执行AC-QueryEngine::count_unique查询。
     * @return array|bool   返回服务端返回的结果。返回结果为数组时表示访问成功。
     * 返回FALSE时，表示有错误发生。此时可调用getLastError()方法获取错误消息。
     */
    public function execute();
}
```

##ACQEDistribution##

```php
/**
 * AbleCloud数据分析服务的distribution方法。
 */
class ACQEDistribution extends ACQEReadInterface {
    /**
     * 构造函数。
     * @param $name		string		AbleCloud数据分析服务的名字。
     * @param $version	int			AbleCloud数据分析服务的主版本号。
     * @param $context	ACContext	表示访问该远程服务所依赖的环境信息。
     */
    function __construct($name, $version, $context);

    /**
     * 设置对数据进行哪种聚合操作。是必要参数。
     * @param $name     string      聚合操作的名字：count/count_unique/min/max/avg/sum。
     * @return          ACQECount   返回本对象。
     */
    public function aggregation($name);

    /**
     * 设置order_by参数。是必要参数。
     * @param $range    array   整数组成的数组，如array(1, 2, 10, 20)，是不同区间内的聚合结果行的个数。
     * @return          ACQECount   返回本对象。
     */
    public function range($range);

    /**
     * 执行AC-QueryEngine::distribution查询。
     * @return array|bool   返回服务端返回的结果。返回结果为数组时表示访问成功。
     * 返回FALSE时，表示有错误发生。此时可调用getLastError()方法获取错误消息。
     */
    public function execute();
}
```

##ACQEFilter##

```php
/**
 * AbleCloud数据分析服务的过滤条件，如：temperature >= 38.5。
 */
class ACQEFilter {
    /// @name 过滤条件中的操作符。
    //@{
    /// 相等
    public static $Equal              = 'eq';
    /// 不相等
    public static $NotEqual           = 'ne';
    /// 小于
    public static $LessThan           = 'lt';
    /// 小于或等于
    public static $LessThanOrEqual    = 'lte';
    /// 大于
    public static $GreaterThan        = 'gt';
    /// 大于或等于
    public static $GreaterThanOrEqual = 'gte';
    /// 包含，用于字符串模糊匹配。
    public static $Contain            = 'contains';
    /// 不包含，用于字符串模糊匹配。
    public static $NotContain         = 'not_contains';
    /// 在...中。此时用作判断的基准值应该为数组形式,如[2, 3, 4,5]等。
    public static $In                  = 'in';
    /// 值在某个范围内。此时用作判断的基准值应该为包含两个元素的数组，如[10, 20]或["2015-07-10","2015-07-11"]等。
    public static $Between             = 'between';
    //@}

    /**
     * 构造函数。
     * @param $propertyName string  是查询条件中的数据列的名字。
     * @param $operator     string  是查询条件中的操作符，ACQEFilter::$Equal，ACQEFilter::$NotEqual等。
     * @param $value        mixed   是查询条件的判断基准值，其类型取决于对应的数据列的类型以及操作符的要求。
     */
    function __construct($propertyName, $operator, $value);

    /**
     * 重置过滤条件。
     * @param $propertyName string  是查询条件中的数据列的名字。
     * @param $operator     string  是查询条件中的操作符，ACQEFilter::$Equal，ACQEFilter::$NotEqual等。
     * @param $value        mixed   是查询条件的判断基准值，其类型取决于对应的数据列的类型以及操作符的要求。
     * @return              ACQEFilter  返回本对象。
     */
    public function set($propertyName, $operator, $value);

    /**
     * 将对象转为AC-QueryEngine接受的参数格式。
     * @return array    以数组形式记录的参数。
     */
    public function toParamInArray();
}
```

##ACQEPropertyFilters##

```php
/**
 * AbleCloud数据分析服务的查询条件集合：ACQEFilter对象的集合。
 */
class ACQEPropertyFilters {
    /**
     * 设置集合中ACQEFilter对象之间的连接关系。缺省值为'AND'。
     * @param $isAnd    bool    为TRUE时表示集合中的ACQEFilter对象以AND关系连接。
     * @return          ACQEPropertyFilters 返回本集合对象。
     */
    public function setRelation($isAnd);

    /**
     * 向集合中添加查询条件。
     * @param $filter   ACQEFilter          查询条件。
     * @return          ACQEPropertyFilters 返回本集合对象。
     */
    public function appendFilter($filter);

    /**
     * 将对象转为AC-QueryEngine接受的参数格式。
     * @return array    以数组形式记录的参数。
     */
    public function toParamInArray();
}
```

##ACQEReadInterface##

```php
/**
 * AbleCloud数据分析服务的Count方法。
 */
abstract class ACQEReadInterface extends ACService {
    /**
     * 构造函数。
     * @param $name		string		AbleCloud数据分析服务的名字。
     * @param $version	int			AbleCloud数据分析服务的主版本号。
     * @param $context	ACContext	表示访问该远程服务所依赖的环境信息。
     */
    function __construct($name, $version, $context);

    /**
     * 设置拟操作的数据集的名字。是必要参数。
     * @param $name     string  拟操作的数据集的名字。
     * @return          ACQEReadInterface   返回本对象。
     */
    public function collection($name);

    /**
     * 设置数分分析的时间段。是必要参数。
     * @param $frame    ACQETimeframe       时间段对象。
     * @return          ACQEReadInterface   返回本对象。
     */
    public function timeframe($frame);

    /**
     * 设置分析的时间间隔参数。可选参数。
     * @param $interval ACQETimeInterval    时间间隔对象。
     * @return          ACQEReadInterface   返回本对象。
     */
    public function timeInterval($interval);

    /**
     * 设置object_filters参数。可选参数。
     * @param $aggFilters   ACQEAggFilters      查询条件。
     * @return              ACQEReadInterface   返回本对象。
     */
    public function objectFilters($aggFilters);

    /**
     * 设置filters参数。可选参数。
     * @param $aggFilters   ACQEAggFilters      查询条件。
     * @return              ACQEReadInterface   返回本对象。
     */
    public function filters($aggFilters);

    /**
     * 设置group_by参数。可选参数。
     * @param $properties   array   指定group_by所依赖的属性列（可以是多个），以及每个属性列的性质，如：array(array('province', 'actor'), array('gender', 'collection'))。
     * 参数$properties是一个数组，数组的每个元素是一个由两个字符串组成的数组。由这两个字符串组成的数组可描述一个属性列：
     * 第一个字符串是属性列的名字；第二个字符串标记属性列的性质——actor，object，phone或者collection（缺省值）。
     * @return              ACQEReadInterface   返回本对象。
     */
    public function groupBy($properties);

    /**
     * 设置order_by参数。可选参数。
     * @param $property string              用来排序的属性列的名字。符号“#”表示依据聚合函数的结果排序。
     * @param $ascend   bool                为TRUE时表示按升序排序，否则表示按降序排序。
     * @return          ACQEReadInterface   返回本对象。
     */
    public function orderBy($property, $ascend);

    /**
     * 执行数据分析查询。
     * @return array|bool   返回服务端返回的结果。返回结果为数组时表示访问成功。
     * 返回FALSE时，表示有错误发生。此时可调用getLastError()方法获取错误消息。
     */
    abstract public function execute();
}
```

##ACQETimeframe##

```php
/**
 * AbleCloud数据分析服务的时间段参数。可以是绝对时间，或者是相对时间。
 */
class ACQETimeframe {
    /// @name 时间单位
    //@{
    public static $Unit_Second  = 'seconds';    ///< 秒
    public static $Unit_Minute  = 'minutes';    ///< 分钟
    public static $Unit_Hour    = 'hours';      ///< 小时
    public static $Unit_Day     = 'days';       ///< 天
    public static $Unit_Week    = 'weeks';      ///< 周
    public static $Unit_Month   = 'months';     ///< 月
    public static $Unit_Year    = 'years';      ///< 年
    //@}

    /**
     * 构造函数。
     */
    function __construct();

    /// @name 绝对时间
    //@{
    /**
     * 设置本对象为绝对时间段。
     * @param $start   DateTime 表示时间段的起始时刻的DateTime对象。$start与$end必须使用相同的时区。
     * @param $end     DateTime 表示时间段的结束时间的DateTime对象。$start与$end必须使用相同的时区。
     */
    public function setAbsoluteFrame($start, $end);
    //@}

    /// @name 相对时间段
    //@{
    /**
     * 设置时间段为“当前N个单位”。
     * “当前”与“之前”的区别是，“当前3分钟”是包含当前时刻所在的这一分钟在内往前3分钟，“之前3分钟”是不包含当前时刻所在的这一分钟在内往前3分钟。
     * @param $n        int     正整数，表示时间量。
     * @param $unit     string  时间单位，如ACQETimeframe::$Unit_Second，ACQETimeframe::$Unit_Minute，……，ACQETimeframe::$Unit_Year等。
     * @param $timezone string  时区的名字。缺省值为'Asia/Shanghai'。
     */
    public function thisRelativeFrame($n, $unit, $timezone = 'Asia/Shanghai');

    /**
     * 设置时间段为“之前N个单位”。
     * “当前”与“之前”的区别是，“当前3分钟”是包含当前时刻所在的这一分钟在内往前3分钟，“之前3分钟”是不包含当前时刻所在的这一分钟在内往前3分钟。
     * @param $n        int     正整数，表示时间量。
     * @param $unit     string  时间单位，如ACQETimeframe::$Unit_Second，ACQETimeframe::$Unit_Minute，……，ACQETimeframe::$Unit_Year等。
     * @param $timezone string  时区的名字。缺省值为'Asia/Shanghai'。
     */
    public function previousRelativeFrame($n, $unit, $timezone = 'Asia/Shanghai');
    //@}

    /**
     * 取时间段的时区。
     * @return string   返回时区的名字。
     */
    public function getTimezone();

    /**
     * 将时间段转换为AC-QueryEngine要求的参数格式。
     * @return          array|string   以数组格式记录的绝对时间段，或者以字符串记录的相对时间段。
     */
    public function toParamInArray();
}
```

##ACQETimeInterval##

```php
/**
 * AC-QueryEngine的时间区间参数。
 */
class ACQETimeInterval {
    /// @name 时间单位。
    //@{
    public static $Unit_Second  = 'seconds';    ///< 秒
    public static $Unit_Minute  = 'minutes';    ///< 分钟
    public static $Unit_Hour    = 'hours';      ///< 小时
    public static $Unit_Day     = 'days';       ///< 天
    public static $Unit_Week    = 'weeks';      ///< 周
    public static $Unit_Month   = 'months';     ///< 月
    public static $Unit_Year    = 'years';      ///< 年
    //@}

    /**
     * 构造函数。
     * @param $n    int     正整数，是时间数量。
     * @param $unit string  时间单位，ACQETimeInterval::$Unit_Second，ACQETimeInterval::$Unit_Minute，……，ACQETimeInterval::$Unit_Year等。
     */
    function __construct($n, $unit);

    /**
     * 将对象转为AC-QueryEngine接受的参数格式。
     * @return string   以字符串记录的时间间隔参数。
     */
    public function toParamInArray();
}
```

#设备管理接口#

##ACDeviceInfo##
```php
/**
 * 设备的元数据信息。
 */
class ACDeviceInfo {
    public $domain = '';         ///< 字符串。设备所属的主域的ID。
    public $subDomain = '';      ///< 字符串。设备所属的子域的ID。
    public $physicalDeviceId = '';   ///< 字符串。设备的物理ID。
    public $type = '';           ///< 字符串。
    public $ipAddr = '';         ///< 字符串。设备的IP地址。
    public $mac = '';            ///< 字符串。设备的MAC地址。
    public $devVersion = '';     ///< 字符串。设备的MCU固件版本。
    public $modVersion = '';     ///< 字符串。设备的通信模块版本。
    public $activeTime = '';     ///< 字符串。设备的激活时间。格式为：YYYY-MM-DD HH:mm:ss。
    public $lastOnlineTime = ''; ///< 字符串。设备最近一次上线时间。格式为：YYYY-MM-DD HH:mm:ss。
    public $country = '';        ///< 字符串。设备所处地理位置信息：所在国家。
    public $province = '';       ///< 字符串。设备所处地理位置信息：所在省份。
    public $city = '';           ///< 字符串。设备所处地理位置信息：所在城市。
    public $street = '';         ///< 字符串。设备所处地理位置信息：所在街道。
    public $status = '';         ///< 整数。设备状态：0-不存在；1-未激活；2-激活。

    /**
     * 从关联数组对象构造ACDeviceInfo对象。
     * @param $obj  array             保存了设备信息的对象。
     * @return      ACDeviceInfo|NULL ACDeviceInfo对象或者NULL。
     */
    public static function fromObject($obj);
}
```

##ACWarehouseMgr##
```php
/**
 * AbleCloud设备入库管理服务。
 */
class ACWarehouseMgr extends ACService {
    /**
     * 构造函数。
     * @param $name    string    AbleCloud设备入库管理服务的名字。
     * @param $version int       AbleCloud设备入库管理服务的版本。
     * @param $context ACContext ACContext对象，表示访问该远程服务所依赖的环境信息。
     */
    function __construct($name, $version, $context);

    /**
     * 查询已入库设备的数目。
     * @param $subDomain string 指定要查寻的设备所属的子域的名字。如为NULL或空字符串表示不区分子域。
     * @return           int     返回非负整数表示设备数目。返回负整数表示查询失败，可调用getLastError()方法获取错误信息。
     */
    public function getDeviceCount($subDomain = '');

    /**
     * 批量查询设备信息。
     * @param $subDomain string     指定要查询的设备所属的子域的名字。如为NULL或空字符串表示不区分子域。
     * @param $offset    int        $offset与$limit参数用于实现分页查询的效果。$offset是从0开始的偏移量，表示返回设备列表中从第offset位置开始的共limit个设备的信息。
     * @param $limit     int        $offset与$limit参数用于实现分页查询的效果。$limit是正整数，表示返回设备列表中从第offset位置开始的共limit个设备的信息。
     * @return           array|NULL 操作成功时返回ACDeviceInfo对象的数组，否则返回NULL。失败时可调用getLastError()方法获取错误信息。
     */
    public function listDevices($subDomain, $offset, $limit);

    /**
     * 查询设备信息。
     * @param $physicalDeviceId string            拟查询的设备的物理ID。
     * @return                  ACDeviceInfo|NULL 操作成功时返回ACDeviceInfo对象，失败时返回NULL。失败时可调用getLastError()方法获取错误信息。
     */
    public function getDeviceInfo($physicalDeviceId);

    /**
     * 批量查询设备信息。
     * @param $physicalDeviceIds array      拟查询的设备的物理ID组成的数组。
     * @return                   array|NULL 操作成功时返回ACDeviceInfo对象的数组，否则返回NULL。失败时可调用getLastError()方法获取错误信息。
     */
    public function getDevicesInfo($physicalDeviceIds);
}
```

#Error Code#
参考[reference-Error Code](./error_code.md)。
