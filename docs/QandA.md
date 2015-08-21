#客户端相关

##Android端

###1.uid和token获取与保存

long userId=PreferencesUtils.getLong(AC.context, ACConfiguration.KEY_USERID, 0);

String token=PreferencesUtils.getString(AC.context, ACConfiguration.KEY_TOKEN, "");

PreferencesUtils.putLong(AC.context, ACConfiguration.KEY_USERID, uid);

PreferencesUtils.putString(AC.context, ACConfiguration.KEY_TOKEN, token);

##微信开发

###1.makeQRCode方法，会报service not available的错误
解决方法：
针对service not available的问题，可以检查一下ac.js文件里面第47附近的acServiceDevice的值，以及配置文件config.properties里第17行附近的device_service的值。这两个配置项的值应该都是zc-bind。
###2.在ac.js中，ac.config方法获取wxOpenid、acMajordomain和acsubdomain这三个参数都是从URL中获取的，只是不是意味着html的URL中必须要带有这三个参数
Ac.js支持通过url及cookie两种方式获取参数。如果用 /weixin/oauth2 做完了网页授权，那这个框架会自动在cookie里加上这三个参数，开发者就不用关心了。如果是其它途径加载的网页，那开发者要么用url传参，要么用cookie传参
###3.在js中获取deviceid的值
这个值需要在HTML中通过URL传入，再次需要保证HTML页面已经在微信授权过。
###4.设备现在出现了故障，需要向微信客户端及时报警！这种消息通过什么接口直接发给客户端？
（1）设备向我们的服务器上报数据，在UDS里接收到警报消息，然后由UDS推送消息给微信公众号服务器，最后公众号服务器推消息给微信客户端
（2）另外一种方法，要求设备自己向微信公众号服务器发起HTTP请求，报告消息，然后公众号服务器推消息给微信客户端


#设备相关




#云端服务相关
###1.UDS返回查询结果为NULL
H5中获取的时间单位是秒，我们需要的是毫秒。
###2.UDS服务不能上线
配置文件中没有Service的name和classname
###3.报错subdomain不存在
请看DeveloperID填写是否错误


#管理后台使用相关
