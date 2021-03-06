#智能硬件架构模型

![arch](../pic/features/architecture.png) 


上图是目前常见的智能硬件联网解决方案，从图中可以看到，整个硬件联网闭环存在三条消息流，分别表示不同的消息传递方式。

**远程控制 --**
如图中绿色箭头所示，用户在终端(如智能手机上)，发送控制命令到AbleCloud的云端，云端再将消息发往具体的某一设备，实现远程控制。
比如在酷热的夏天，下班回家前，您可以提前通过手机将家里的空调打开，并及时的查看家里温度情况，当您回到家时即可享受一片清凉。

**局域网通信 --**
如图中棕色箭头所示，当用户和设备在同一局域网内时，用户可以通过终端直接向设备发送控制命令实现直连，从而实现更加可靠的控制。设备直连的优势在于，当家里的公网访问出现故障时，您的智能设备仍然具备可用性。

**事件上报 --**
如图中紫色箭头所示，设备可以将运行中的状态、传感器采集到的各类数据上传到云端进行数据存储，供厂商进行数据分析和设备管理，也可以将上报的消息推送数据给用户。例如，当家里的安防系统出现异常时，发送报警数据到云端，云端再将该消息通过设定好的方式推送给客户，让用户及时了解家里所发生的情况，方便及时处理和应对。

#AbleCloud的功能模块

**1. 联网固件**

智能设备需要连接到云端，因此需要联网模块实现和互联网的连接。目前最主流的和互联网连接的联网模块是WiFi模块。除此之外还有蜂窝网络、以太网等联网方式。使用AbleCloud云服务的设备需要保证能够正常连接到AbleCloud的云端。因此，对于主流的WiFi模块，AbleCloud提供了联网固件，只要将这些联网固件烧入这些厂商的WiFi模块，就能够实现设备到云端的连接。对于目前AbleCloud尚未适配的联网模块，AbleCloud提供模块和云端握手的SDK，厂商只需要对SDK中的底层驱动部分进行适配即可实现设备到云端的连接。对于安卓设备、linux设备等自带网卡的设备，AbleCloud提供了SDK，只要使用SDK开发，即可让设备连接到AbleCloud的云端。

**2. 客户端SDK**

为了帮助开发者快速开发智能设备的客户端应用，我们提供Android、iOS和微信三大平台的SDK。厂商可利用AbleCloud提供的SDK快速开发控制智能硬件的APP。SDK提供了”帐号管理”、“设备管理”、“局域网通信”、“定时任务”、“和云端通信”、“实时消息同步”、”OTA管理”、“推送服务”等功能。 

**3. 云服务引擎**

云服务引擎，是我们提供的PaaS平台，包括开发、测试框架以及完整的运行平台。云服务引擎上提供通用服务和开发运行平台。通用服务包括：帐号管理、设备管理、定时任务、实时消息同步、OTA、推送服务、第三方云对接、存储管理、虚拟设备、设备调试等。对于通用服务，只需要调用SDK相关的接口或者在管理后台页面上操作即可使用，不需要在云端进行任何开发。

通用服务能满足智能联网设备的通用需求。对于个性化、定制化需求，我们提供云端服务开发引擎和运行平台,厂商也可以快速开发出自己的定制云端服务。

***云服务开发引擎***
AbleCloud封装了开发Web服务的框架，厂商的开发人员利用这个开发框架，可以完全不用关注服务和APP端、和设备端RPC交互的细节，而是将全部精力集中在服务具体业务逻辑的实现上。开发框架提供了完整的web service框架，让您用很少的代码即可实现一个服务，并提供了完备的单元测试、集成测试方案和工具包。

***云服务运行平台***
当厂商的自定义云端服务开发完毕并测试完成后，开发人员只需要将服务可执行程序提交到AbleCloud提供的PaaS平台，之后AbleCloud将自动完成发布、运维、日志收集、故障自动修复、服务监控报警、定时任务等工作。


