#云端服务开发参考

#简介
为了快速开发和业务逻辑相关的服务端程序，提高开发者效率，提高企业产品研发/上线的效率，AbleCloud提供了统一的服务开发框架，并内嵌了一系列由AbleCloud提供的云端服务。该框架支持开发者开发可运行于AbleCloud云端的自定义后端服务（UDS：User Defined Service）以及定时任务。AbleCloud的服务框架提供了高度封装的RPC服务，client与server通信时，client只需要知道service的名字，并提供相应的访问参数即可。当前AbleCloud提供Java版本的服务编程框架。本章介绍该框架提供的API。

#服务框架发布库
AbleCloud一期发布Java版本服务开发框架，其发布目录、文件如下所示

```
/config
	/cloudservice-conf.xml
/lib
	/ablecloud-framework-1.3.0.jar
    /ac-java-api-1.2.0.jar
	/commons-collections-3.2.1.jar
    /commons-configuration-1.10.jar
    /commons-lang-2.6.jar
    /slf4j-api-1.7.7.jar
    /...
start.sh
start.cmd
```
><font color=red>注意事项：</font>

>1. 所有依赖的第三方jar包，均放在lib文件夹下。其中包括AbleCloud的服务框架`ablecloud-framework-1.3.0.jar`和`ac-java-api-1.2.0.jar`。根据AbleCloud的发行状态，各jar包的版本号可能不同。

>1. 开发者开发的自定义服务也编译成jar包，并置于lib文件夹下。同时，还要在pom.xml里的`<additionalClasspathElement>`标签下添加测试依赖。

>1. 按上述目录结构将所有文件压缩、打包成一个ZIP文件（文件名可自取）。要求ZIP文件解压缩后能直接得到上述目录或文件，不能存在其它中间层次的目录。

>1. 在开发者管理控制台中提交压缩后的ZIP文件，之后即可通过“上线”/“下线”功能管理UDS的运行状态。

#服务开发框架
开发者在使用AbleCloud框架开发服务时，仅需简单的使用前文介绍的基础数据结构，将精力集中在实现应用的业务逻辑上，快速完成服务程序的开发/测试/发布。
##ACService：UDS
AbleCloud定义了抽象基类ACService，开发者只需要继承该类，并实现各个handler即可。定义如下:

```java
public abstract class ACService {
    // 开发者可以调用ac的相关接口直接调用AbleCloud提供的云服务。
    protected AC ac;
    
    // 以下信息可用于服务内部追踪问题等用，比如打印到日志中
    protected long developerId;			// 开发者id
    protected String majorDomain;		// 服务的主域名
    protected String subDomain;			// 服务的子域名
    protected int majorVersion;			// 服务的主版本号
    protected int minorVersion;			// 服务的副版本号
    protected int patchVersion;			// 服务的修订版本号

    /**
     * 开发者可根据自身需要，重载该方法，在该方法里做一些初始化工作，框架在启动服务时会调用该函数。
     *
     * @throws Exception
     */
    public void init() throws Exception {}

    /**
     * 处理APP-->Service，Service-->Service之间的交互消息
     * @param req   请求消息体
     * @param resp  响应消息体
     * @throws Exception
     */
    public abstract void handleMsg(ACMsg req, ACMsg resp) throws Exception;

    /**
     * 处理匿名请求
     *
     * @param req  请求消息体
     * @param resp 响应消息体
     * @throws Exception
     */
    public void handleAnonymousMsg(ACMsg req, ACMsg resp) throws Exception {}
    
    /**
     * 处理Device-->Service之间的交互消息
     * 如果服务不处理和设备之间的交互消息，则无须重载该方法。
     *
     * 当前，处理设备汇报的消息不做响应。
     *
     * @param context		设备的上下文，其中uid字段为系统填充
     * @param deviceId		设备的逻辑id
     * @param req			请求消息体
     * @throws Exception
     */
    public abstract void handleDeviceMsg(ACContext context, long deviceId, ACDeviceMsg req) throws Exception;

    /**
     * 处理JINDDONG-->Service之间的交互消息，收到Stream点数组，进行设备控制
     *
     * @param context          设备的上下文，其中uid字段为系统填充
     * @param physicalDeviceId 设备的物理id
     * @param req              请求消息体(Stream数组)
     * @param resp             响应消息体
     * @throws Exception
     */
    public void handleJDSetStatusMsg(ACContext context, String physicalDeviceId, List<ACJDMsg> req, ACMsg resp) throws Exception {}

    /**
     * 处理JINDDONG-->Service之间的交互消息,获取设备上所有Stream点
     *
     * @param context          设备的上下文，其中uid字段为系统填充
     * @param physicalDeviceId 设备的物理id
     * @param resp             响应消息体(Stream数组)
     * @throws Exception
     */
    public void handleJDGetStatusMsg(ACContext context, String physicalDeviceId, List<ACJDMsg> resp) throws Exception {}
    
    /**
     * 处理SUNING-->Service之间的交互消息，收到Stream点数组，进行设备控制
     *
     * @param physicalDeviceId 设备的物理id
     * @param req              请求消息体(Stream数组)
     * @param resp             响应消息体
     * @throws Exception
     */
    public void handleSNSetStatusMsg(ACContext context, String physicalDeviceId, List<ACSNMsg> req, ACMsg resp) throws Exception {
    }

    /**
     * 处理SUNING-->Service之间的交互消息,获取设备上所有Stream点
     *
     * @param physicalDeviceId 设备的物理id
     * @param resp             响应消息体(Stream数组)
     * @throws Exception
     */
    public void handleSNGetStatusMsg(ACContext context, String physicalDeviceId, List<ACSNMsg> resp) throws Exception {
    }

    /**
     * 处理设备强制解绑的消息（不需要调解绑接口，此时不能与设备进行交互）
     * 如果除了解绑设备之外没有任何其他的处理逻辑，则无需继承此方法
     *
     * @param context          设备的上下文，其中uid字段为系统填充
     * @param physicalDeviceId 设备的物理id
     */
    public void handleDeviceForceUnbind(ACContext context, String physicalDeviceId, ACMsg resp) throws Exception {
    }

    /**
     * 内部调用接口，开发者不用关注且不能修改。
     * 设置服务相关的信息，并将全局AC框架传给服务
     * 服务内部可以使用AC框架提供的各种功能，如
     * 帐号管理、设备管理、存储服务等。
     * @param ac
     * @param config
     */
    public final void setEnv(AC ac, ACConfiguration config) {}

    /**
     * 内部调用接口，开发者不用关注且不能修改。
     * @return
     */
    public final AC getAc() {}
}
```
在上述抽象类中，对开发者来说，总共有七个公共接口，其中init提供了默认实现。如果开发者实现的某一服务不需要和设备直接交互，则直接重载handleDeviceMsg为空实现即可。开发者可以将精力集中在handleMsg接口的实现中，该接口处理客户端请求，并作出响应。下文会对该抽象类进行详细介绍。

><font color="red">**注：**</font>通常情况下，开发者只需要重点实现**handleMsg**即可。当然如果需要处理复杂的设备上报数据，则还需要重点实现**handleDeviceMsg**并根据不同code做不同处理 。

##ACCronJob：后台任务
#### ACCronJob
AbleCloud定义了云端定时任务的抽象基类ACCronJob。开发者需要继承该类，并实现其定义的抽象方法ACCronJob::run，即能完成定时任务的开发。ACCronJob的定义如下：

```java
public abstract class ACCronJob {
    // 开发者可以调用ac的相关接口直接调用AbleCloud提供的云服务。
    protected AC ac;
    
    // 以下信息可用于任务内部追踪问题等用，比如打印到日志中等。
    protected long developerId;         // 开发者id
    protected String majorDomain;       // 服务的主域名
    protected String subDomain;         // 服务的子域名
    protected int majorVersion;         // 服务的主版本号
    protected int minorVersion;         // 服务的副版本号
    protected int patchVersion;         // 服务的修订版本号

    /**
     * 内部调用接口，开发者不用关注且不能修改。
     * 设置服务相关的信息，并将全局AC框架传给服务。服务内部可以使用AC框架提供的各种功能，如帐号管理、设备管理、存储服务等。
     * @param ac
     * @param config
     */
    public final void setEnv(AC ac, ACConfiguration config) {
        this.ac = ac;
        this.developerId = config.getDeveloperId();
        this.majorDomain = config.getServiceMajorDomain();
        this.subDomain = config.getServiceSubDomain();
        this.majorVersion = config.getServiceMajorVersion();
        this.minorVersion = config.getServiceMinorVersion();
        this.patchVersion = config.getServicePatchVersion();
    }

    /**
     * 用于获取AC框架。
     * @return AC对象。
     */
    public final AC getAc() {
        return ac;
    }

    /**
     * 定时任务的执行函数。
     * @return 返回任务的结束后，进程退出时所使用的状态码。
     * @throws Exception
     */
    public abstract int run() throws Exception;
}
```
上述抽象类共定义了三个公共方法：ACCronJob::setEnv，ACCronJob::getAC，以及ACCronJob::run。其中，ACCronJob::run是定时任务的执行函数，要求开发者提供具体实现。

#### Crontab
Crontab定时规则由五部分组成，由左至右分别表示分、时、日、月、周。每个部分之间以空格字符分隔。如“30 12 \* \* \*”表示“每天的12:30”。其中，第一个部分的“30”表示30分，第二个部分的“12”表示12点，后面三个部分的“\*”分别表示每天、每月及一星期内的每一天。
规则中各部分的取值范围如下（参考http://linux.vbird.org/linux_basic/0430cron.php）：

|代表意义|分钟|小时|日期|月份|周|
|---|---|---|---|---|---|
|数字范围|0-59|0-23|1-31|1-12|0-7|
| | | | | | |

其中，“周”的取值为0或7时都表示“星期天”。除此之外，还有如下辅助字符可用于定义时间规则。

|辅助字符|代表意义|
|---|---|
|\*（星号）|代表任何时刻。例如“30 12 \* \* \*”中日、月、周都是\*， 表示“不论何月、何日、星期几的 12:30”。|
|,（英文逗号）|用于指定确定的多个值。如果要定义“每天的3:10及6:10”可使用如下规则：“10 3,6 \* \* \*”。|
|-（连字符）|用于指定时间范围。如果定义“每天的8点至12点之间每小时的20分钟”可使用如下规则：“20 8-12 \* \* \*”。|
|/n（斜杠后跟数字）|表示每个n个单位。例如定义“每5分钟”时可使用如下规则：“\*/5 \* \* \* \*”。|
| | |

##AC
在介绍ACService和ACCronJob的时候提到过重要的成员变量ac，ac实际上是AbleCloud对抽象服务框架AC的具体实现，其实现过程对开发者透明。通过AC，开发者可以根据需要获取一系列内嵌服务的功能接口。AC的定义如下：
```java
public abstract class AC {
    protected ACConfiguration config;

    /**
     * 构建一个开发者上下文
     * @return
     */
    public ACContext newContext() {}

    /**
     * 构建一个用户上下文，由于是框架创建的，因此也会带着开发者信息，一般用于单测
     * @param userId
     * @return
     */
    public ACContext newContext(long userId) {}
    
    /**
     * 构建一个用于数据查询的过滤器
     *
     * @return
     */
    public ACFilter filter(){}
    
    /**
     * 用于对数据分类进行具体的操作，如create/find/delete/update/scan等
     *
     * @param className     要操作的分类名
     * @param context       要进行操作的开发者context
     * @return
     */
    public abstract ACStore store(String className, ACContext context);
    
    /**
     * 则用于创建数据分类/清空数据等操作。
     * 用于测试之用。
     *
     * @return
     */
    public abstract ACStoreForTest storeForTest(ACContext context);

    /**
     * 往某一服务发送命令/消息
     *
     * @param subDomain 该服务所在产品名
     * @param name      服务名
     * @param version   服务版本
     * @param req       具体的消息内容，此处req无需构造ACContext
     * @return 服务端相应的消息
     * @throws Exception
     */
    public abstract ACMsg sendToService(String subDomain, String name, int version, ACMsg req) throws Exception;
    
    /**
     * 往JD service发送命令/消息,上报设备上的所有Stream点到JINGDONG Service
     *
     * @param context          设备的上下文，其中uid字段为系统填充
     * @param physicalDeviceId 设备的物理id
     * @param req              请求消息体(Stream数组)
     * @return 服务端相应的消息
     * @throws Exception
     */
    public abstract ACMsg sendToJDService(ACContext context, String physicalDeviceId, List<ACJDMsg> req) throws Exception;
    
    /**
     * 由于uds本身无法访问正常的外网服务，所以AbleCloud内部实现了正向代理，并提供ACHttpClient访问外网服务
     *
     * @param url 访问外网的url
     * @return ACHttpClient
     * @throws IOException
     */
    public abstract ACHttpClient getHttpClient(String url) throws IOException;

    /**
     * 获取帐号管理器。开发者组实现自定义服务时，
     * 可以调用ACAccountMgr提供的各个通用接口
     *
     * @param context   开发者的context
     * @return
     */
    public abstract ACAccountMgr accountMgr(ACContext context);

    /**
     * 获取用于单元测试的帐号管理器，可以注册用户等
     *
     * @param context   开发者的context
     * @return
     */
    public abstract ACAccountMgrForTest accountMgrForTest(ACContext context);

    /**
     * 获取设备绑定管理器。开发者在实现自定义服务时，
     * 可以调用ACBindMgr提供的各个通用接口
     *
     * @param context 用户的context
     * @return
     */
    public abstract ACBindMgr bindMgr(ACContext context);

    /**
     * 获取用于单元测试的设备绑定管理器，可以绑定/解绑设备等
     *
     * @param context 用户的context
     * @return
     */
    public abstract ACBindMgrForTest bindMgrForTest(ACContext context);
    
    /**
     * 获取推送通知管理器，可以给用户发送通知消息
     *
     * @param context   开发者的context
     * @return
     */
    public abstract ACNotificationMgr notificationMgr(ACContext context);
    
    /**
     * 获取用于单元测试的推送通知管理器
     *
     * @param context 开发者的context
     * @return
     */
    public abstract ACNotificationMgrForTest notificationMgrForTest(ACContext context);
    
    /**
     * 获取定时管理器，可以定时给设备发送消息
     *
     * @param context 开发者的context
     * @return
     */
    public abstract ACTimerTaskMgr timerTaskMgr(ACContext context);

    /**
     * 获取用于单元测试的定时管理器
     *
     * @param context 开发者的context
     * @return
     */
    public abstract ACTimerTaskMgrForTest timerTaskMgrForTest(ACContext context);
    
    /**
     * 为便于测试，开发者可实现一个服务的桩
     * 在框架中添加一个服务桩，即mock
     *
     * @param name  服务名
     * @param stub  服务桩的实现，实际上也是一个ACService
     */
    public abstract void addServiceStub(String name, ACService stub);

    /**
     * 为便于测试，开发者可实现一个设备的桩
     *
     * @param subDomain     设备所属子域
     * @param stub          设备桩
     */
    public abstract void addDeviceStub(String subDomain, ACDeviceStub stub);

    /**
     * 获取用于单元测试的服务框架ac
     * @param config    单元测试环境构造的config
     * @return
     * @throws Exception
     */
    public static final AC getTestAc(ACConfiguration config) throws Exception {}
}
```
><font color=red>注意</font>：由于开发者具有超级权限，所以AbleCloud除了提供正常的服务管理器接口外，还提供一些用于单元测试的管理器接口，如`ac.accountMgrForTest(ac.newContext())`

#内嵌云端服务
顾名思义，内嵌云端服务，是指AbleCloud抽象并实现的多种通用后端服务，避免开发者重复开发这些基础设施。开发者可直接使用这些服务，降低应用服务程序的开发代价，提高开发效率。各个云端服务的对象可通过上节介绍的服务框架AC的相关接口获取。

API说明请参考[Java SDK开发参考](./java.md)。

#Error Code
参考[Reference-Error Code](../reference/error_code.md)。


