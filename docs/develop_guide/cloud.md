#云端自定义服务开发指导

正在整理文档。

#Error Code

## <span class="skip">||SKIP||</span>

完整的错误码定义如下
###请求相关常用错误码 (3000 - 3500)

|错误码(code)|错误消息(error)|
|-----------|--------------|
|3000|internal error|
|3001|invalid header|
|3002|invalid param|
|3003|not supported|
|3004|not allowed|
|3005|no privilege|
|3006|invalid request uri|
|3007|major domain not exist|
|3008|sub domain not exist|
|3009|service not exist|
|3010|message not supported|
|3011|service not available|
|3012|request timeout|
|3013|network error|
|3014|signature timeout|
|3015|invalid signature|
|	|				|

###帐号管理相关错误码 (3501 - 3600)

|错误码(code)|错误消息(error)|
|-----------|--------------|
|3501|account not exist|
|3502|account already exist|
|3503|invalid name|
|3504|password wrong|
|3505|invalid verify code|
|3506|verify code timeout|
|3507|invalid email address|
|3508|invalid phone number|
|3509|invalid account status|
|	|				|

###设备分组管理相关错误码 (3601 - 3900)

|错误码(code)|错误消息(error)|
|-----------|--------------|
|3601|group not exist|
|3602|group already exist|
|3603|invalid group status|
|3604|member not exist|
|3605|member already exist|
|3606|invalid member status|
|3801|invalid message code|
|3802|device not exist|
|3803|device exist|
|3804|invalid device|
|3805|bind code timeout|
|3806|invalid bind code|
|3807|device offline|
|3808|master device not exist|
|3809|device is master|
|3810|device is slave|
|3811|device already bound|
|3812|device not bound|
|3813|invalid device status|
|	|				|

###存储服务相关错误码 (3901 - 4000)

|错误码(code)|错误消息(error)|
|-----------|--------------|
|3901|file not exist|
|3902|file already exist|
|3903|invalid file state|
|3904|file checksum error|
|3905|invalid file content|
|3920|class not exist|
|3921|class already exist|
|3922|data error|
|3923|data already exist|
|3924|data not exist|
|3925|class mismatch|
|	|				|

###平台相关错误码 (5001 - 5300)

|错误码(code)|错误消息(error)|
|-----------|--------------|
|5001|project not exist|
|5002|major domain already exist|
|5003|domain format invalid|
|5004|too many key pairs|
|5005|service is online|
|5006|version not exist|
|5007|version rollback|
|5008|too many version published|
|5009|invalid rollback|
|5010|version compatible|
|5011|version not compatible|
|5012|invalid major version|
|5013|invalid minor version|
|5014|invalid patch version|
|5015|instance not exist|
|5016|instance already exist|
|5017|empty app file from blobstore|
|5018|port already in use|
|5019|port not in use|
|5020|port exhausted|
|5021|invalid container name|
|5022|agent already registered|
|5023|agent not registered yet|
|5024|agent already exist|
|5025|agent not exist|
|5026|exceed agent capacity|
|5027|can not log at ALL level|
|	|				|

###AbleCloud内部错误码 (6001 - ~)

|错误码(code)|错误消息(error)|
|-----------|--------------|
|6001|null value|
|6002|invalid config|
|6003|not inited|
|6004|already inited|
|6005|entry not dir|
|6006|invalid encrypt key|
|6007|entry not exist|
|6008|entry already exist|
|6009|iterator end|
|6011|invalid version|
|6012|invalid result|
|6013|encode error|
|6014|decode error|
|6015|data type error|
|6016|database not exist|
|6017|partition not exist|
|6018|no privilege send message|
|6019|no valid endpoint|
|6020|endpoint not in white list|
|6021|device connection exception|
|6022|invalid device message|
|6023|invalid inner request|
|6024|check payload length failed|
|6025|decrypt message error|
|6026|encrypt message error|
|6027|invalid format|
|6028|invalid meta name|
|	|				|

#Error Code

## <span class="skip">||SKIP||</span>

error code[3000-5000]为AbleCloud内置的帐号管理，设备管理，存储服务等返回的错误码，[5001,6000]为AbleCloud平台返回的错误码，[6001-10000]为AbleCloud内部服务返回的错误码，因此建议用户自定义服务错误码区间为(1000-2000）或者10000以上。

如果您使用AbleCloud提供的SDK进行APP或者云端Service开发，需关注[3000-5000]的错误码，具体说明如下：

###请求相关常用错误码 (3000 - 3500)

|错误码|简要说明|
|---|---|
|3000|系统内部错误|
|3001|请求HEADER错误|
|3002|请求参数不合法|
|3003|不支持的请求|
|3004|不允许的请求|
|3005|请求没有权限|
|3006|请求URI错误|
|3007|请求主域不存在|
|3008|请求子域不存在|
|3009|请求服务不存在|
|3010|请求方法不存在|
|3011|服务暂不可用|
|3012|请求超时|
|3013|网络异常|
|3014|签名已失效|
|3015|签名错误|


###帐号管理相关错误码 (3501 - 3600)

|错误码|简要说明|
|---|---|
|3501|帐号不存在|
|3502|帐号已存在|
|3503|帐号不合法|
|3504|密码错误|
|3505|验证码错误|
|3506|验证码已失效|
|3507|邮箱不合法|
|3508|手机不合法|
|3509|帐号状态异常|
|3510|账号已经绑定|
|3511|安全认证失败|



###设备分组管理相关错误码 (3601 - 3900)

|错误码|简要说明|
|---|---|
|3601|分组不存在|
|3602|分组已存在|
|3603|分组状态异常|
|3604|成员不存在|
|3605|成员已存在|
|3606|成员状态异常|
|3801|设备消息码非法|
|3802|设备不存在|
|3803|设备已存在|
|3804|消息不合法|
|3805|绑定码已失效|
|3806|绑定码错误|
|3807|设备不在线|
|3808|主设备不存在|
|3809|设备为主机|
|3810|消息为备机|
|3811|设备已绑定|
|3812|设备未绑定|
|3813|设备状态异常|
|3814|设备响应超时|
|3815|分享码不存在|
|3816|分享码不合法|
|3817|分享码已过期|
|3818|绑定设备超时|
|3819|不存在的管理员|
|3820|网关不匹配|
|3821|管理员不匹配|
|3822|设备未激活|

###存储服务相关错误码 (3901 - 4000)

|错误码|简要说明|
|---|---|
|3901|文件不存在|
|3902|文件已存在|
|3903|文件状态异常|
|3904|文件校验失败|
|3905|文件内容异常|
|3920|数据集不存在|
|3921|数据集已存在|
|3922|数据存在错误|
|3923|数据已存在|
|3924|数据不存在|
|3925|数据集不匹配|
|3926|数据索引超出索引范围|
