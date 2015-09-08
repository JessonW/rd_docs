#JavaScript开发参考
# 编程模型
按JavaScript的通用编程模型，该SDK提供的所有公共接口均以异步通信方式与AbleCloud云服务或终端设备通信。每个接口都要求分别指定操作成功和操作失败的回调函数。

## 操作成功的回调函数

除特殊说明外，接口操作成功的回调函数的原型如下：
~~~
/*
 * 接口操作成功的回调函数。
 * @param data Object类型的实例，表示远程服务返回的应答消息。
 * @return 无。
 */
function(data) {
}
~~~

## 操作失败的回调函数

除特殊说明外，接口操作失败的回调函数的原型如下：
~~~
/*
 * 接口操作失败的回调函数。
 * @param errorType 字符串，表示远程服务返回的错误消息的类型。
 * @param error     字符串，表示远程服务返回的错误消息的内容。
 * @return 无。
 */
function(errorType, error) {
}
~~~

# 第三方依赖库

本SDK依赖于三个第三方JavaScript库：

- **[Zepto](http://zeptojs.com/)**

    Zepto是一个可运行于几乎所有现代浏览器中的JavaScript代码库。它提供了与jQuery几乎兼容的API，但是它比jQuery更精简、小巧，因而比jQuery更适合于开发针对移动设备的Web应用程序。

    本SDK使用Zepto库来解决跨浏览器运行的兼容性问题。Zepto库包含了多个模块，本SDK仅依赖于其缺省发行包中所包含的五个模块：Core，Ajax，Event，Form，以及IE。开发者可依据具体需求选配更多的模块。

- **[jsSHA](http://caligatio.github.io/jsSHA/)**

    jsSHA是关于SHA哈希函数族的一种JavaScript实现，并且兼容多个浏览器的运行环境。

    本SDK使用jsSHA库来实现API的签名计算。

- **[QRCodeJS](https://github.com/davidshimjs/qrcodejs)**

	QRCode.js是可在浏览器环境下生成二维码图像的Javascript代码库。

	本SDK使用该库来生成分享设备的二维码图像。

- **[cookie.js](https://developer.mozilla.org/en-US/docs/Web/API/document/cookie)**

    cookie.js是来自Mozilla Developer Network的一个cookie读/写工具库。

    cookie.js的源代码非常精简，已被直接包含在本SDK中。

## 使用说明

本小结介绍AbleCloud JavaScript SDK的使用方法，包括调用API之前的配置内容以及各API的参数说明。

我们推荐将本SDK与AbleCloud发布的ac-weixin-server框架配合使用。
在该框架下，开发者仅需关注微信客户端中HTML页面的设计和开发工作，所有与微信公众号服务器的交互工作均由ac-weixin-server框架负责处理，对开发者而言是完全透明的。
后文的内容都按照与ac-weixin-server框架配合使用的方式来介绍本SDK的使用方法。与普通Web应用开发模式类似，本SDK的API用于在浏览器端显示的HTML页面中执行动态交互任务。

### 配置

调用本SDK的API之前的配置工作包括引用第三方库，以及初始化本SDK。

#### 引用代码库

在Web页面中应先引用相关的JavaScript代码库，包括前述所依赖的第三方库。
~~~
<!-- 引用Zepto库 -->
<script src="./js/zepto.min.js"></script>
<!-- 应用jsSHA库 -->
<script src="./js/sha.js"></script>
<!-- 应用QRCodeJS库 -->
<script src="./js/qrcode.js"></script>
<!-- 引用本SDK -->
<script src="./js/ac.js"></script>
~~~

#### 库初始化

本SDK库定义了一个全局变量ac，所有的API都是该全局变量的成员函数。在调用任何API之前，需要先调用ac.config()完成初始化工作。初始化的任务是设置如下五个参数的值：

- **wxOpenId**：当前微信客户端用户的OpenID。

- **acMajorDomain**：当前应用所对应的AbleCloud服务的主域名。

- **acSubDomain**：当前应用所对应的AbleCloud服务的子域名。

- **servletContextPathPrefix**：访问当前应用的Servlet方法时，置于Servlet-Context-Path之前的前缀。缺省值为空字符串。该参数用于配合Apache、Nginx等Web服务器的proxy_pass配置项。其取值的模式为："/xxx"或空字符串。

- **defaultCallbackError**：接口操作失败时的缺省回调函数（可选）。

本SDK支持从Cookie中或页面的URL地址包含的查询参数中提取前三个参数（wxOpenId，acMajorDomain及acSubDomain）的值。其中，Cookie的配置方式是在根路径（"/"）下设置如下三个键/值对：

- wxOpenId = xxx
- acMajorDomain = xxx
- acSubDomain = xxx

URL地址查询参数的配置方式是在地址中配置上述三个键/值对。例如：http://www.example.com/demoPage.html?**wxOpenId=xxx&acMajorDomain=xxx&acSubDomain=xxx**

**注：**特别的，AbleCloud提供的ac-weixin-server框架集成了通过Cookie设置上述三个参数的功能，因此使用ac-weixin-server框架的开发者无需额外处理这三个参数的赋值问题。

参数 **servletContextPathPrefix**和**defaultCallbackError** 可以在调用ac.config()方法时显示配置。

下述代码片段是在ac-weixin-server框架下引用依赖库，并初始化本SDK库的示例。
~~~
<script src="./js/zepto.min.js"></script>
<script src="./js/sha.js"></script>
<script src="./js/qrcode.js"></script>
<script src="./js/ac.js"></script>
<script type="text/javascript">
	$(document).ready(function() {
		// 初始化
		ac.config({
			servletContextPathPrefix: '',
			defaultCallbackError: function(errorType, error) {
				console.log('Error: ' + errorType + ' - ' + error);
			}
		});
	});
</script>
~~~

### 接口说明

本SDK定义了一个全局变量ac，所有API都是该变量或其成员变量的成员函数。同时约定以下划线（_）开头的成员函数是私有函数（如ac._randomString()是私有函数），其它函数是公共函数（如ac.config()是公共函数）。

#### 初始化

调用任何API之前需要先调用ac.config()方法完成初始化。该方法的声明如下：
~~~
/*
 * 初始化全局对象ac。
 * @param conf Object对象。该对象可包括两个属性：servletContextPathPrefix和defaultCallbackError。
 *    其中，servletContextPathPrefix是访问当前应用的Servlet方法时，置于Servlet-Context-Path之前的前缀。可选，且其缺省值为空字符串；
 *    defaultCallbackError是接口操作失败时的默认回调函数。其原型为：function(errorType, error) {}。该属性为可选属性。
 * @return 无
 */
config : function(defaultCallbackError) {
}
~~~

#### 用户

对象ac定义了一个成员对象user，该成员对象提供了用户登录/登出的API。

##### 判断用户是否已登录

检查用户是否已登录方法的声明如下：
~~~
/*
 * 判断用户是否已登录。
 * @return 返回true表示用户已登录，否则表示用户未登录。
 */
isSignedIn : function() {
}
~~~

##### 用户登录

用户登录方法的声明如下：
~~~
/*
 * 用户登录。
 * @param callbackOk 用户登录操作成功的回调函数。
 * @param callbackError 用户登录操作失败的回调函数。
 * @return 无
 */
login : function(callbackOk, callbackError) {
}
~~~

##### 用户登出

用户登出方法的声明如下：
~~~
/*
 * 用户登出。
 * @return 无
 */
logout : function() {
}
~~~

#### 设备管理

对象ac定义了一个成员对象device，该成员对象提供了包括绑定/解除绑定设备、查询设备、检查和控制设备状态等功能在内的API。

##### 绑定设备

此处，绑定设备是指设备没有对应管理员的情况下，用户绑定该设备并且成为管理员。该方法的声明如下：
~~~
/*
 * 绑定设备并成为该设备的管理员。
 * @param physicalDeviceId 设备的物理ID。
 * @param name 绑定成功后为设备设置的名字。
 * @param callbackOk 可选。接口操作成功时的回调函数，其原型为：function(data) {}。其中，参数data的值是设备绑定后的信息，其结构是如下内容对应的JSON对象。
 *   {"device":{"deviceId":xxx, "owner":xxx, "name":"xxx", "subDomainId":xxx, "aesKey":"xxx", "physicalDeviceId":"xxx"}}
 * @param callbackError 可选。接口操作失败时的回调函数，其原型为：function(physicalDeviceId, errorType, error) {}。其中，physicalDeviceId是拟绑定的设备的物理ID；errorType是字符串，表示远程服务返回的错误消息的类型；error是字符串，表示远程服务返回的错误消息的内容。
 * @return 无
 */
bindDevice : function(physicalDeviceId, name, callbackOk, callbackError) {
}
~~~

##### 解除绑定设备

设备的管理员调用解除绑定设备时，将解除该设备与所有用户（包括管理员自己）的绑定关系。普通用户调用该方法仅解除自己与设备的绑定关系。该方法的声明如下：
~~~
/*
 * 解除与指定设备的绑定关系。
 * @param deviceId 整数，表示要被解邦的设备的逻辑ID。
 * @param physicalDeviceId 字符串，表示要被解邦的设备的物理ID。
 * @param callbackOk 可选。接口操作成功时的回调函数，其原型为：function(deviceId, physicalDeviceId) {}。其中，deviceId是拟解除绑定关系的设备的逻辑ID；physicalDeviceId是拟解除绑定关系的设备的物理ID。
 * @param callbackError 可选。接口操作失败时的回调函数，其原型为：function(deviceId, physicalDeviceId, errorType, error) {}。其中，deviceId是拟解除绑定关系的设备的逻辑ID；physicalDeviceId是拟解除绑定关系的设备的物理ID；errorType是字符串，表示远程服务返回的错误消息的类型；error是字符串，表示远程服务返回的错误消息的内容。
 * @return 无
 */
unbindDevice : function(deviceId, physicalDeviceId, callbackOk, callbackError) {
}
~~~

##### 设备管理员绑定设备到指定用户

设备管理员可直接将设备绑定到指定用户。该方法的声明如下：
~~~
/*
 * 设备管理员绑定设备到指定用户。
 * @param deviceId 整数，拟被绑定的设备的逻辑ID。
 * @param uid 整数，指定用户的AbleCloud帐号ID。
 * @param callbackOk 可选。接口操作成功时的回调函数，其原型为：function(deviceId, uid) {}。其中，deviceId是拟绑定设备的逻辑ID；uid是指定用户的ID。
 * @param callbackError 可选。接口操作失败时的回调函数，其原型为：function(deviceId, uid, errorType, error) {}。其中，deviceId是拟绑定设备的逻辑ID；uid是指定用户的ID；errorType是字符串，表示远程服务返回的错误消息的类型；error是字符串，表示远程服务返回的错误消息的内容。
 * @return 无
 */
bindDeviceWithUser : function(deviceId, uid, callbackOk, callbackError) {
}
~~~

##### 设备管理员解除设备与指定用户的绑定关系

设备管理员可直接解除设备与指定用户的绑定关系。该方法的声明如下：
~~~
/*
 * 设备管理员解除设备与指定用户的绑定关系。
 * @param deviceId 整数，拟被解邦的设备的逻辑ID。
 * @param uid 整数，指定用户的AbleCloud帐号ID。
 * @param callbackOk 可选。接口操作成功时的回调函数，其原型为：function(deviceId, uid) {}。其中，deviceId是拟解绑设备的逻辑ID；uid是指定用户的ID。
 * @param callbackError 可选。接口操作失败时的回调函数，其原型为：function(deviceId, uid, errorType, error) {}。其中，deviceId是拟解绑设备的逻辑ID；uid是指定用户的ID；errorType是字符串，表示远程服务返回的错误消息的类型；error是字符串，表示远程服务返回的错误消息的内容。
 * @return 无
 */
unbindDeviceWithUser : function(deviceId, uid, callbackOk, callbackError) {
}
~~~

##### 设备管理员生成设备的分享码

设备管理员邀请其他用户绑定设备，或将设备分享给其他用户绑定时，需要配置分享码（字符串）。该方法的声明如下：
~~~
/*
 * 设备管理员生成分享设备或邀请用户绑定设备时所使用的分享码。
 * @param deviceId 整数，拟被分享的设备的逻辑ID。
 * @param timeout 整数，该分享码的有效时长。单位为秒。
 * @param callbackOk 可选。接口操作成功时的回调函数，其原型为：function(deviceId, timeout, shareCode) {}。其中，deviceId是拟被分享的设备的逻辑ID；timeout是分享码的有效时长（单位为秒）；shareCode是字符串，是生成的分享码。
 * @param callbackError 可选。接口操作失败时的回调函数，其原型为：function(deviceId, timeout, errorType, error) {}。其中，deviceId是拟被分享的设备的逻辑ID；timeout是分享码的有效时长（单位为秒）；errorType是字符串，表示远程服务返回的错误消息的类型；error是字符串，表示远程服务返回的错误消息的内容。
 * @return 无
 */
getShareCode : function(deviceId, timeout, callbackOk, callbackError) {
}
~~~

##### 用户使用设备管理员给出的分享码绑定设备

设备具有对应的管理员时，其他用户只能通过管理员邀请或分享的方式绑定设备。该方法的声明如下：
~~~
/*
 * 用户使用设备管理员给出的分享码绑定设备。
 * @param deviceId 整数，拟绑定的设备的逻辑ID。
 * @param shareCode 字符串，管理员给定的分享码。
 * @param callbackOk 可选。接口操作成功时的回调函数，其原型为：function(data) {}。其中，data是远程服务返回的绑定成功的消息，其结构是如下数据对应的JSON对象：
 *  {"device": {"deviceId":xxx, "owner":xxx, "name":"xxx", "subDomainId":xxx, "aesKey":"xxx", "physicalDeviceId":"xxx"}}
 * @param callbackError 可选。接口操作失败时的回调函数，其原型为：function(deviceId, shareCode, errorType, error) {}。其中，deviceId是拟绑定设备的逻辑ID；shareCode是所使用的分享码；errorType是字符串，表示远程服务返回的错误消息的类型；error是字符串，表示远程服务返回的错误消息的内容。
 * @return 无
 */
bindDeviceWithShareCode : function(deviceId, shareCode, callbackOk, callbackError) {
}
~~~

##### 设备管理员生成可分享设备的二维码

设备管理员可直接生成设备的分享二维码，其他用户通过扫描该二维码的方式来绑定设备。该方法的声明如下：
~~~
/*
 * 管理员生成分享设备的二维码。
 * @param physicalDeviceId 字符串，拟分享的设备的物理ID。
 * @param timeout 整数，该二维码的有效时长。单位为秒。
 * @param imageConf Object对象，是关于所生成的二维码图像的配置信息。有效的配置项包括：
 *   {
 *     id: 'xxx',				// 字符串，是用于显示结果图片的DOM对象的ID。
 *     width: xxx,				// 整数，表示结果图片的宽度。单位是像素。缺省值为128。
 *     height: xxx,				// 整数，表示结果图片的高度。单位是像素。缺省值为128。
 *     colorDark: '#000000',	// 字符串表示的RGB颜色值，是结果图片中深色的颜色。缺省值为'#000000'。
 *     colorLight: '#ffffff'	// 字符串表示的RGB颜色值，是结果图片中浅色的颜色。缺省值为'#ffffff'。
 *   }
 * @param callbackOk 可选。接口操作成功时的回调函数，其原型为：function(data) {}。
 * @param callbackError 可选。接口操作失败时的回调函数，其原型为：function(errorType, error) {}。
 * @return 无
 */
makeQRCode : function(physicalDeviceId, timeout, imageConf, callbackOk, callbackError) {
}
~~~

##### 更换设备

更换设备是以一台新设备替换当前设备，新设备仍旧使用当前设备的逻辑ID。该方法的声明如下：
~~~
/*
 * 更换设备。
 * @param deviceId 类型为整数，表示要被更换的设备的逻辑ID。
 * @param physicalDeviceId 类型为字符串，是新设备的物理ID。
 * @param callbackOk 可选。接口操作成功时的回调函数，其原型为：function(deviceId, physicalDeviceId) {}。其中deviceId是被操作的设备的逻辑ID；physicalDeviceId是新设备的物理ID。
 * @param callbackError 可选。接口操作失败时的回调函数，其原型为：function(deviceId, physicalDeviceId, errorType, error) {}。其中deviceId是被操作的设备的逻辑ID；physicalDeviceId是新设备的物理ID；errorType是字符串，表示远程服务返回的错误消息的类型；error是字符串，表示远程服务返回的错误消息的内容。
 * @return 无
 */
changeDevice : function(deviceId, physicalDeviceId, callbackOk, callbackError) {
}
~~~

##### 更改设备的管理员

更改设备的管理员方法的声明如下：
~~~
/*
 * 更改设备的管理员。
 * @param deviceId 类型为整数，表示要操作的设备的逻辑ID。
 * @param newOwner 类型为整数，表示新管理员的AbleCloud帐号的uid。
 * @param callbackOk 可选。接口操作成功时的回调函数，其原型为：function(deviceId, newOwner) {}。其中，deviceId是被操作的设备的逻辑ID；newOwner是新管理员的AbleCloud帐号ID。
 * @param callbackError 可选。接口操作失败时的回调函数，其原型为：function(deviceId, newOwner, errorType, error) {}。其中，deviceId是被操作的设备的逻辑ID；newOwner是新管理员的AbleCloud帐号ID；errorType是字符串，表示远程服务返回的错误消息的类型；error是字符串，表示远程服务返回的错误消息的内容。
 * @return 无
 */
changeOwner : function(deviceId, newOwner, callbackOk, callbackError) {
}
~~~

##### 修改设备的名字

修改设备名字的方法的声明如下：
~~~
/*
 * 修改设备的名字。
 * @param deviceId 类型为整数，表示要操作的设备的逻辑ID。
 * @param name 类型为字符串，是拟设置的设备的新名字。
 * @param callbackOk 可选。接口操作成功时的回调函数，其原型为：function(deviceId, name) {}。其中，deviceId是被操作的设备的逻辑ID；name是设备的新名字。
 * @param callbackError 可选。接口操作失败时的回调函数，其原型为：function(deviceId, name, errorType, error) {}。其中，deviceId是被操作的设备的逻辑ID；name是设备的新名字；errorType是字符串，表示远程服务返回的错误消息的类型；error是字符串，表示远程服务返回的错误消息的内容。
 * @return 无
 */
changeName : function(deviceId, name, callbackOk, callbackError) {
}
~~~

##### 查询用户已绑定的设备

用户可查询其已经绑定的所有设备。该方法的声明如下：
~~~
/*
 * 查询当前用户所绑定的所有设备。
 * @param callbackOk 可选。接口操作成功时的回调函数，其原型为：function(data) {}。回调函数的参数data的值是设备列表，结构为如下内容所对应的JSON对象。
 *   {"devices":
 *     [
 *       {"deviceId":1,"name":"xxx","subDomainId":10,"status":1,"aesKey":"xxx","masterDeviceId":1,"physicalDeviceId":"xxx"},
 *       {"deviceId":2,"name":"xxx","subDomainId":10,"status":1,"aesKey":"xxx","masterDeviceId":2,"physicalDeviceId":"xxx"},
 *       {"deviceId":3,"name":"xxx","subDomainId":10,"status":1,"aesKey":"xxx","masterDeviceId":3,"physicalDeviceId":"xxx"}
 *     ]
 *   }
 * @param callbackError 可选。接口操作失败时的回调函数，其原型为：function(errorType, error) {}。
 * @return 无
 */
listDevices : function(callbackOk, callbackError) {
}
~~~

##### 查询绑定了指定设备的所有用户

指定设备，查询所有绑定了该设备的用户。该方法的声明如下：
~~~
/*
 * 指定设备，查询所有绑定了该设备的用户。
 * @param deviceId 整数，设备的逻辑ID。
 * @param callbackOk 可选。接口操作成功时的回调函数，其原型为：function(data) {}。参数data是远程服务返回的应答消息，其结构是如下数据对应的JSON对象：
 *   {"users":
 *     [
 *       {"userId":xxx, "deviceId":xxx, "userType":xxx, "phone":"xxx", "email":"xxx"},
 *       {"userId":xxx, "deviceId":xxx, "userType":xxx, "phone":"xxx", "email":"xxx"}
 *     ]
 *   }
 * @param callbackError 可选。接口操作失败时的回调函数，其原型为：function(deviceId, errorType, error) {}。其中，deviceId是设备的逻辑ID；errorType是字符串，表示远程服务返回的错误消息的类型；error是字符串，表示远程服务返回的错误消息的内容。
 * @retrun 无
 */
listUsers : function(deviceId, callbackOk, callbackError) {
}
~~~

##### 检查设备是否在线

检查设备是否在线的方法的声明如下：
~~~
/*
 * 检查设备是否在线。
 * @param deviceId 整数，表示要检查的设备的逻辑ID。
 * @param callbackOk 可选。接口操作成功时的回调函数，其原型为：function(deviceId, isOnline) {}。其中deviceId是被检查的设备的逻辑ID；isOnline是布尔值，为true时表示该设备在线，否则表示设备不在线。
 * @param callbackError 可选。接口操作失败时的回调函数，其原型为：function(deviceId, errorType, error) {}。其中deviceId是被检查的设备的逻辑ID；errorType是字符串，表示远程服务返回的错误消息的类型；error是字符串，表示远程服务返回的错误消息的内容。
 * @return 无
 */
isOnline : function(deviceId, callbackOk, callbackError) {
}
~~~

#### 与AbleCloud云服务通信

全局变量ac的成员函数sendToService()提供与AbleCloud云服务通信的功能。该方法的声明如下：
~~~
/*
 * 与AbleCloud云服务通信。
 * @param subDomain 类型为字符串，表示要访问的服务所属的子域。
 * @param service 类型为字符串，表示要访问的服务的名字。
 * @param version 类型为字符串，表示要访问的服务的版本号，如"v1"。
 * @param method 类型为字符串，表示要访问的方法名。
 * @param data 类型为Object，是要发送给云端服务的数据。
 * @param callbackOk 接口操作成功时的回调函数。可选。
 * @param callbackError 接口操作失败时的回调函数。可选。
 * @return 无
 */
sendToService : function(subDomain, service, version, method, data, callbackOk, callbackError) {
}
~~~

#### 与设备通信

全局变量ac的成员函数sendToDevice()提供与设备通信的功能。该方法的声明如下：
~~~
/*
 * 与设备通信。
 * @param deviceId 类型为整数，表示要访问的设备的逻辑ID。
 * @param messageCode 类型为整数，是要发送给设备的消息码。
 * @param messageContent 表示要发送给设备的自定义的消息内容。
 * @param marshaller 消息内容messageContent的序列化函数，负责将要发送给设备的数据序列化为二进制数据。该函数的原型为：function(messageContent) {}，其返回的数据将被直接发送给设备。
 * @param callbackOk 可选。接口操作成功时的回调函数，其原型为：function(deviceId, data) {}。其中deviceId是拟访问的设备的逻辑ID；data是远程服务返回的应答消息。
 * @param callbackError 可选。接口操作失败时的回调函数，其原型为：function(deviceId, errorType, error) {}。其中deviceId是拟访问的设备的逻辑ID；errorType是字符串，表示远程服务返回的错误消息的类型；error是字符串，表示远程服务返回的错误消息的内容。
 * @return 无
 */
sendToDevice : function(deviceId, messageCode, messageContent, marshaller, callbackOk, callbackError) {
}
~~~

其中，参数messageCode表示的消息码的说明见：[消息头的详细说明](firmware/wifi_interface_guide/#13 "消息码说明")。

#### 其它公共接口

除上述公共接口外，全局变量ac还提供了两个公共接口，分别是从当前页面URL的查询字符串中提取参数值（ac.getUrlParam()），和执行POST HTTP请求（ac.doPost()）。

##### 从当前页面URL的查询字符串中提取参数值

假设当前页面的URL地址为：http://www.example.com/demoPage.html?wxOpenId=abcd&acMajorDomain=test&acSubDomain=test。其查询字符串中包含三个参数：wxOpenId，acMajorDomain和acSubDomain。
全局变量ac的成员函数getUrlParam()提供的功能是解析该查询字符串，提取键wxOpenId等对应的值。该方法的声明如下：
~~~
/*
 * 从当前页面URL的查询字符串中提取参数值。
 * @param param 类型为字符串，表示要提取的参数名。
 * @retrun 返回参数值。如果该参数不存在或者其值为空则返回null。
 */
getUrlParam : function(param) {
}
~~~

###### 执行POST HTTP请求

全局变量ac的成员函数doPost()封装了向AbleCloud云服务或者设备发送POST HTTP请求的功能，自动发送特定的HTTP请求头信息及数字签名。该方法的声明如下：
~~~
/*
 * 执行POST HTTP请求。
 * @param url 该请求的目标地址。
 * @param data 类型为Object，表示要发送给远程服务的数据。
 * @param callbackOk 接口操作成功时的回调函数。可选。
 * @param callbackError 接口操作失败时的回调函数。可选。
 * @param contentType 可选。类型为字符串，是HTTP请求消息头中"Content-Type"字段的值。缺省情况下取值为"application/x-zc-object"，表示AbleCloud服务所识别的类JSON的对象值。
 * @return 无
 */
doPost : function(url, data, callbackOk, callbackError, contentType) {
}
~~~

#### 私有接口

本小结介绍SDK中包含的私有接口。

##### 随机字符串

全局变量ac的成员函数_randomString()提供生成指定长度随机字符串的功能。该方法的声明如下：
~~~
/*
 * 生成指定长度的随机字符串。
 * @param len 类型为整数，表示要产生的随机字符串的长度。
 * @return 生成的随机字符串。
 */
_randomString : function(len) {
}
~~~

##### 计算数字签名

全局变量ac的成员函数__signature()提供了计算满足AbleCloud服务需求的数字签名的功能。该方法的声明如下：
~~~
/*
 * 计算数字签名。
 * @param expire 类型为整数，表示该签名的有效时间长度，单位为秒。
 * @param timestamp 类型为整数，其值是自1970年1月1日0点以来的秒数，是该计算该签名的时间戳。
 * @param nonce 类型为字符串，是计算该签名时所使用的随机字符串。
 * @param token 类型为字符串，是AbleCloud为当前用户分配的秘密标识符。
 * @return 返回代表数字签名的字符串。
 */
_signature : function(expire, timestamp, nonce, token) {
}
~~~

##### 取当前微信客户端用户的OpenID

全局变量ac的成员函数_getWXOpenId()可检查当前用户的微信OpenID。该方法的声明如下：
~~~
/*
 * 取当前用户的微信OpenID。
 * @return 返回当前用户的微信OpenID。如用户无效，则返回空字符串。
 */
_getWXOpenId : function () {
}
~~~

##### 取当前用户的ID

全局变量ac的成员函数_getACUserId()可检查当前登录用户，并返回其ID。该方法的声明如下：
~~~
/*
 * 取当前用户的ID。
 * @return 返回当前用户的ID。有效的用户ID是正整数。如果用户未登录，返回0。
 */
_getACUserId : function() {
}
~~~

##### 取当前用户的标识符

全局变量ac的成员函数_getACUserId()可检查当前登录用户，并返回其由AbleCloud分配的秘密标识符。该方法的声明如下：
~~~
/*
 * 取当前用户的标识符。
 * @return 返回当前用户的标识符。如果用户未登录，则返回空字符串。
 */
_getACUserId : function() {
}
~~~

##### 取当前应用所对应的AbleCloud服务的主域名

全局变量ac的成员函数_getACMajorDomain()提供了获取当前应用所对应的AbleCloud服务的主域名的功能。该方法的声明如下：
~~~
/*
 * 取当前应用所对应的AbleCloud服务的主域名。
 * @return 返回主域名。返回值为空字符串时表示该值不存在。
 */
_getACMajorDomain : function() {
}
~~~

##### 取当前应用所对应的AbleCloud服务的子域名

全局变量ac的成员函数_getACSubDomain()提供了获取当前应用所对应的AbleCloud服务的子域名的功能。该方法的声明如下：
~~~
/*
 * 取当前应用所对应的AbleCloud服务的子域名。
 * @return 返回子域名。返回值为空字符串时表示该值不存在。
 */
_getACSubDomain : function() {
}
~~~

##### 检查AbleCloud服务的响应状态

全局变量ac的成员函数_isACResponseOk()可检查AbleCloud服务返回的响应消息内容，以判断其响应代表操作成功还是失败。该方法的声明如下：
~~~
/*
 * 检查AbleCloud服务的响应状态。
 * @param xhr 发起HTTP请求的ajax客户端对象。
 * @param respBody 远程服务返回的消息。
 * @return 返回true表示响应的状态是操作成功，否则表示响应的状态是操作失败。
 */
_isACResponseOk : function(xhr, respBody) {
}
~~~

##### 构造AbleCloud服务HTTP请求的消息头

全局变量ac的成员函数_makeACHttpRequestHeaders()可构造AbleCloud服务要求的特定HTTP请求消息头，包括数字签名等。该方法的声明如下：
~~~
/*
 * 构造AbleCloud服务HTTP请求的消息头。
 * @return 返回一个包含多个键/值对的对象，每个键/值对代表一项HTTP请求消息头。
 */
_makeACHttpRequestHeaders : function() {
}
~~~

##### 生成AbleCloud服务的URL地址

全局变量ac的成员函数_makeACServiceURL()可方便地构造AbleCloud服务的URL地址。该方法的声明如下：
~~~
/*
 * 构造AbleCloud服务的URL地址。
 * @param service 类型为字符串，是要访问的服务的名字。
 * @param version 类型为字符串，表示要访问的服务的版本号，如"v1"。
 * @param method 类型为字符串，是要访问的方法名。
 * @return 返回该服务的完整的URL地址。
 */
_makeACServiceURL : function(service, version, method) {
}
~~~
