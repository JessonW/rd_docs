#云端自定义服务开发指导

#UDS Demo
这里我们以一个完整的demo程序做示例，通过真实代码介绍如何基于ACService开发用户自己的服务程序。demo场景不一定完全符合常识，其目的是为了尽量简单而全面的演示服务框架提供的功能。
##场景介绍
本示例场景有一智能灯，可以通过手机端向云端发消息远程控制灯的开/关，云端服务把这些APP发来的控制行为记录到ablecloud提供的云存储中。同时，智能灯也可能由用户通过机械开关起停，智能灯将这类开/关事件也主动汇报到服务端，我们写的服务程序将主动汇报开/关数据也存到云存储中。所有存储在云存储中的数据，可提供给APP查询，比如可用于统计用户的作息习惯等。
##实现步骤
先简单分析下需求，然后梳理出实现步骤。

>1. 要开发服务程序，继承自`ACService`实现我们自己的服务框架必不可少，因此我们要实现服务的主体框架`DemoService`；
>1. 服务要接收来自APP对灯的远程控制命令，也会接收来自APP的数据查询请求，因此必须为`handleMsg`提供具体的实现handler；
>1. 服务要向智能灯发送控制命令，因此我们需要和灯以及APP端定义具体的控制消息格式`LightMsg`；
>1. 在步骤3定义好了消息格式后，我们还需要根据`ACDeviceMsgMarshaller`实现具体的消息序列化/反序列化器`LightMsgMarshaller`；
>1. 实现了`LightMsgMarshaller`后，重载`ACService`的`init`接口，将序列化器设置到`ac`框架中；
>1. 服务要接收智能灯汇报的开/关消息，因此必须为`handleDeviceMsg`提供具体的实现handler；

##具体实现
###DemoService
`DemoService`为自定义服务主要逻辑处理类，通过`handleMsg`处理APP端发来的消息，通过`handleDeviceMsg`处理设备上报上来的消息。
当前为了简单，在`handleMsg`中实现了两个具体的处理函数`handleControlLight`和`handleQueryData`。在`handleDeviceMsg`中只实现了一个具体的处理函数`handleLightReport`。生产环境真正的服务用户可以根据业务任意扩展handler。
```java
package com.ablecloud.demo;

import com.ablecloud.common.*;
import com.ablecloud.service.ACDeviceStub;
import com.ablecloud.service.ACService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

public class DemoService extends ACService {
    private static final Logger logger = LoggerFactory.getLogger(DemoService.class);
    private static final String DATA_CLASS_NAME = "light-action-data";
    private static final long FROM_APP = 0;
    private static final long FROM_SWITCH = 1;

	/**
     * 重载init函数。
     * 因为我们的服务要处理和设备交互的消息，因此在该函数中将序列化/反序列化器设置到ac框架中。
     *
     * @throws Exception
     */
    public void init() throws Exception {
        ac.setDeviceMsgMarshaller(new LightMsgMarshaller());
    }

	/**
     * 处理来自APP或其它service发来消息的入口函数
     *
     * @param req   请求消息
     * @param resp  响应消息
     * @throws Exception
     */
    public void handleMsg(ACMsg req, ACMsg resp) throws Exception {
        String name = req.getName();
        if (name != null) {
            switch (name) {
                case "controlLight":
                    handleControlLight(req, resp);
                    break;
                case "queryData":
                    handleQueryData(req, resp);
                    break;
                default:
                    logger.warn("got an invalid request, method[" + name + "] is not implemented.");
            }
        } else {
            logger.warn("got an invalid request, method name is empty.");
        }
    }

	/**
     * 处理来自设备上报消息的入口函数
     *
     * @param context       上下文信息，在设备联动情况下，可能会跨子域访问
     * @param deviceId      设备的逻辑id
     * @param req           设备上报消息
     * @throws Exception
     */
    public void handleDeviceMsg(ACContext context, long deviceId, ACDeviceMsg req) throws Exception {
        Integer msgCode = req.getCode();
        switch (msgCode) {
            case LightMsg.CODE:
                handleLightReport(context, subDomain, deviceId, req);
                break;
            default:
                logger.warn("got an unknown report, opcode[" + msgCode + "]");
        }
    }

	//////////////////////////////////////
    // 具体的私有handler

    /**
     *  处理来自APP端的智能灯控制命令，再将命令发往具体的设备
     *
     *  实际上，厂商在实现后端服务的时候，通常情况下自定义服务不用处理APP端发来的设备控制请求也
     *  能实现远程控制。因为ablecloud在云端提供了设备管理服务，APP通过APP端的sendToDevice
     *  接口可以将控制命令远程发往ablecloud的设备管理服务，设备管理服务再将控制命令发给设备。
     *
     *  本示例在开发者自定义的这个服务中实现对灯的控制，一方面是为了展示后端服务的灵活性，可以作
     *  各种事情，包括对设备的控制，比如后端服务在多设备联动的时候，可能会主动往设备发控制命令。
     *  另外一方面，为了将控制数据存入ablecloud提供的云存储服务中以供查询之用。
     *
     * @param req       请求消息
     * @param resp      响应消息
     * @throws Exception
     */
    private void handleControlLight(ACMsg req, ACMsg resp) throws Exception {
        Long lightId = req.get("deviceId");
        String action = req.get("action");
        byte deviceAction = LightMsg.OFF;
        if (action.equalsIgnoreCase("on")) {
            deviceAction = LightMsg.ON;
        }
        ACDeviceMsg deviceReqMsg = new ACDeviceMsg(LightMsg.CODE, new LightMsg(deviceAction));
        ACDeviceMsg deviceRespMsg;
        try {
            // 通过ac框架的sendToDevice接口，向灯发送控制命令
            deviceRespMsg = ac.bindMgr(req.getContext()).sendToDevice(req.getContext().getSubDomainName(), lightId, deviceReqMsg);
            // do some check of deviceRespMsg.getCode()
            resp.put("code", deviceRespMsg.getCode());
            long timestamp = System.currentTimeMillis();
            // 通过ac框架，将APP对智能灯的控制数据存入云端存储
            ac.store(DATA_CLASS_NAME, req.getContext())
                    .create("deviceId", lightId, "time", timestamp)
                    .put("action", (long) deviceAction)
                    .put("type", FROM_APP)
                    .execute();
            resp.setAck();
            logger.info("handle control light ok, action[" + action + "].");
        } catch (ACServiceException e) {
            resp.setErr(e.getErrorCode(), e.getErrorMsg());
            logger.error("send to device[" + lightId + "] error:", e);
        }
    }

	/**
     * 处理智能灯汇报的消息，在该函数中，服务还将收到的汇报数据写入ablecloud提供的云端存储中。
     *
     * @param context   汇报设备的上下文数据，包括主域/子域等。
     * @param deviceId  汇报设备的逻辑id
     * @param req       汇报的消息
     * @throws Exception
     */
    private void handleLightReport(ACContext context, long deviceId, ACDeviceMsg req) throws Exception {
        try {
            LightMsg lightMsg = (LightMsg) req.getContent();
            long onOff = lightMsg.getLedOnOff();
            long timestamp = System.currentTimeMillis();
            // 通过ac框架，将智能灯汇报的数据存入云端存储
            ac.store(DATA_CLASS_NAME, context)
                    .create("deviceId", deviceId, "time", timestamp)
                    .put("action", onOff)
                    .put("type", FROM_SWITCH)
                    .execute();
        } catch (ACServiceException e) {
            logger.error("handle light report error:", e);
        }
    }

	/**
     * 处理APP端发来的数据查询，并将查询到的智能等开/关记录数据返回
     *
     * @param req       请求消息
     * @param resp      响应消息
     * @throws Exception
     */
    private void handleQueryData(ACMsg req, ACMsg resp) throws Exception {
        Long lightId = req.get("deviceId");
        Long startTime = req.get("startTime");
        Long endTime = req.get("endTime");
        try {
            List<ACObject> zos = ac.store(DATA_CLASS_NAME, req.getContext())
                    .scan("deviceId", lightId)
                    .start("time", startTime)
                    .end("time", endTime)
                    .execute();
            if (zos != null) {
                resp.put("actionData", zos);
            }
            resp.setAck();
        } catch (ACServiceException e) {
            resp.setErr(e.getErrorCode(), e.getErrorMsg());
            logger.error("handle query data error:", e);
        }
    }
}
```

###LightMsg
`LightMsg`是控制灯开/关的消息（命令），需要设备/APP/服务三方共同确定。如果服务需要和其它类型的智能设备交互，则再定义其它的message即可。
```java
package com.ablecloud.demo;

class LightMsg {
    public static final int CODE = 68;
    public static final int REPORT_CODE = 203;
    public static final byte ON = 1;
    public static final byte OFF = 0;
    private byte ledOnOff;				// 1表示开灯，0表示关灯
    private byte[] pad;

    public LightMsg(byte ledOnOff) {
        this.ledOnOff = ledOnOff;
        pad = new byte[3];
    }

    public void setLedOnOff(byte ledOnOff) {
        this.ledOnOff = ledOnOff;
    }

    public void setPad(byte[] pad) {
        this.pad = pad;
    }

    byte getLedOnOff() {
        return ledOnOff;
    }

    byte[] getPad() {
        return pad;
    }
}
```

###LightMsgMarshaller
该序列化/反序列化器用于序列化智能灯控制消息，如果一个服务会和多类智能设备交互，则在你自定义的marshaller中可以对多中设备消息进行序列化/反序列化操作。
```java
package com.ablecloud.demo;

import com.ablecloud.service.ACDeviceMsg;
import com.ablecloud.service.ACDeviceMsgMarshaller;

import java.nio.ByteBuffer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LightMsgMarshaller implements ACDeviceMsgMarshaller {
    private static final Logger logger = LoggerFactory.getLogger(LightMsgMarshaller.class);

	/**
     * 将具体的ACDeviceMsg序列化成字节数组，用于控制设备时通过网络传输给设备
     *
     * @param msg       设备消息
     * @return          序列化后的字节数组
     * @throws Exception
     */
    public byte[] marshal(ACDeviceMsg msg) throws Exception {
        int msgCode = msg.getCode();
        ByteBuffer bb;
        switch (msgCode) {
            case LightMsg.CODE:
            case LightMsg.REPORT_CODE:
                LightMsg lightMsg = (LightMsg)msg.getContent();
                bb = ByteBuffer.allocate(4);
                bb.put(lightMsg.getLedOnOff());
                bb.put(lightMsg.getPad());
                return bb.array();
            default:
                logger.warn("got an unknown msgCode[" + msgCode + "]");
                throw new IllegalArgumentException("got an unknown msgCode[" + msgCode + "]");
        }
    }

	/**
     * 将通过网络收到的字节数组数据，反序列化成具体的消息，以便从消息中提取各个字段。
     *
     * @param msgCode   消息码，ablcloud也称为操作码opCode
     * @param payload   设备消息序列化后的字节数组
     * @return          设备消息
     * @throws Exception
     */
    public ACDeviceMsg unmarshal(int msgCode, byte[] payload) throws Exception {
        if (payload == null || payload.length == 0) {
            logger.warn("input payload is empty.");
            throw new IllegalArgumentException("empty payload");
        }

        ByteBuffer bb;
        switch (msgCode) {
            case LightMsg.CODE:
            case LightMsg.REPORT_CODE:
                bb = ByteBuffer.wrap(payload);
                byte ledOnOff = bb.get();
                byte[] pad = new byte[3];
                bb.get(pad);
                return new ACDeviceMsg(msgCode, new LightMsg(ledOnOff));
            default:
                logger.warn("got an unknown msgCode[" + msgCode + "]");
                throw new IllegalArgumentException("got an unknown msgCode[" + msgCode + "]");
        }
    }
}
```

简简单单的百十来行代码，一个完整的服务程序便开发完了。在终端运行`mvn package`即可编译成jar包。本章节重点介绍服务的开发，即便如此，也只是很简单的进行了说明。你可以开发更多好玩的逻辑，比如多设备联动，当某些设备上报的数据达到你设置的规则时，触发另外的设备做出响应。
对于如何进行测试咱们开发的服务，请见下一章节测试简介。

# 云端定时任务Demo
本小结介绍一个AbleCloud云端定时任务示例。

一个完整的云端定时任务由两部分组成：

1. **定时规则**：定义任务的执行时间。

1. **定时任务可执行程序**

其中，定时规则是开发者在AbleCloud控制台中创建定时任务时设置。本小结介绍的示例是开发定时任务的可执行程序。

### 场景介绍
本示例的可执行程序完成的任务仅是打印一条日志：任务执行的实际时间。

在AbleCloud控制台中创建该定时任务时，设置的定时规则是“\*/2 \* \* \* \*”，表示每隔2分钟执行一次本任务。

### 实现思路
1. 按要求从ACCronJob派生子类型，在派生类中实现父类定义的抽象方法ACCronJob::run；
1. 通过AbleCloud控制台创建定时任务，设置任务的定时规则；
1. 通过AbleCloud控制台上传任务的可执行程序，创建定时任务的版本，然后“上线”该版本以启动该定时任务。

### 可执行程序的具体实现
下文示例中，DemoCronJob是ACCronJob的派生类型，并且实现了父类定义的抽象方法ACCronJob::run。
~~~
package  com.ablecloud.demo;

import com.ablecloud.service.ACCronJob;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DemoCronJob extends ACCronJob {
	// 日志工具
    private static final Logger logger = LoggerFactory.getLogger(DemoCronJob.class);

    @Override
    public int run() throws Exception {
    	// 在日志中记录任务的执行时间
        logger.info("任务执行时间：" + new java.util.Date().toString() + "。");
        return 0;	// 返回状态码0,表示任务执行成功。
    }
}
~~~

#测试简介
上一章节，我们一步步开发了一个完整的服务程序`DemoService`。代码是写完了，如何验证我们写的代码是否正常工作呢，比如自定义的`LightMsgMarshaller`逻辑是否正确，`DemoService`能否正确处理APP的请求，能否正确控制智能灯，能否正确接收智能灯的汇报消息，能否将汇报数据写入云端存储等，都少不了测试。测试根据阶段分为多种，比如单元测试、模块测试、集成测试等。考虑到后端服务的复杂性，ablecloud提供了多种测试方案，下面会一一介绍。

##单元测试
准备工作做好后，就可以开始我们的测试了，我们的单元测试采用org.apache.maven.surefire插件结合junit来完成。
###测试LighMsgMarshaller
该测试很简单，不与任何后端服务交互，纯粹的测试计算逻辑，用于测试序列化/反序列化逻辑正确与否。
```java
package com.ablecloud.demo;

import com.ablecloud.service.ACDeviceMsg;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

public class LightMsgMarshallerTest {
    @Before
    public void setUp() throws Exception {
    }

    @After
    public void tearDown() throws Exception{
    }

    @Test
    public void testLightMsg() {
        byte ledOnOff = 1;
        LightMsg msg = new LightMsg(ledOnOff);
        LightMsgMarshaller marshaller = new LightMsgMarshaller();
        ACDeviceMsg deviceMsg = new ACDeviceMsg(68, msg);
        byte[] result = null;
        try {
            result = marshaller.marshal(deviceMsg);
            assertNotNull(result);
            assertEquals(4, result.length);
        } catch (Exception e) {
            System.out.println("marshal light msg error: " + e.toString());
            fail("test marshal light msg fail");
        }

        try {
            ACDeviceMsg newDeviceMsg = marshaller.unmarshal(68, result);
            assertEquals(68, newDeviceMsg.getCode());
            LightMsg newMsg = (LightMsg)(newDeviceMsg.getContent());
            assertEquals(1, newMsg.getLedOnOff());
        } catch (Exception e) {
            System.out.println("unmarshal light msg error: " + e.toString());
            fail("test unmarshal light msg fail");
        }
    }
}
```

><font color="red">**注：**测试case的执行，也是通过`mvn package`来驱动并查看测试结果，在ablecloud提供的示例pom.xml中，该命令除了将开发的服务打包成jar文件外，如果开发者编写了单测代码，也会执行单元测试。</font>

###测试DemoService
具体的服务代码测试相对复杂，一方面其依赖的云端服务比较多，另一方面作为服务框架，在没有client，没有设备的情况下驱动测试，需要一些技巧。为此，ablecloud为开发者提供了一系列便于测试用的功能，这里详细介绍下。

####测试demo
通过前面的介绍，开发者在开发服务的过程，大部分功能是实现`handleMsg`或`handleDeviceMsg`的各个handler，因此测试工作也集中组对各个handler的测试。在单元测试的过程，无须通过任何client工具驱动，即可完成自动化的单元测试。

这里通过一个完整的测试代码演示如何对DemoService进行测试，测试代码中有详细的注释，请仔细阅读代码中的注释，相信你能够比较清晰的了解整个单元测试的代码编写流程。
```java
package com.ablecloud.demo;

import com.ablecloud.common.*;
import com.ablecloud.service.AC;
import com.ablecloud.service.ACStore;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.runners.MethodSorters;
import org.junit.Test;

import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class DemoServiceTest {
    // 我们会在多个测试case中用到以下的成员，并且只需要初始化一次，
    // 因此我们定义为static的
    private static ACConfiguration config;  // 测试过程的配置信息，在cloudservice-conf.xml中配置
    private static AC ac;                   // 测试用的AC框架，正式环境由框架初始化，开发者不用关注
    private static DemoService demoService; // 我们开发的服务
    private static ACAccount account;       // 用于保存测试的帐号信息
    private static ACUserDevice light;          // 用于保存测试的设备信息

    // 在所有的test case执行前初始化一次
    @BeforeClass
    public static void setUp() throws Exception {
        try {
            // 这里初始化config对象，必须指定测试环境配置文件的绝对路径，否则会找不到配置文件
            config = new ACConfiguration("cloudservice-conf.xml");
            ac = AC.getTestAc(config);          // 通过AC的接口获取用于测试的ac框架

            demoService = new DemoService();
            demoService.setEnv(ac, config);     // 需要调用该接口，将框架ac赋予demoService
            demoService.init();                 // 初始化demoService，将marshshaller设置给ac

            // 使用开发者权限创建一个测试账号
            account = ac.accountMgrForTest(ac.newContext()).register("test@ablecloud.cn", "13100000000", "pswd");
            // 使用注册的测试账号绑定一个虚拟的测试设备
            light = ac.bindMgrForTest(ac.newContext(account.getUid())).bindDevice("1234567812345678", "light1");
            // 创建数据集表（若已在平台上填写过数据集，则此处无需创建）
            ac.storeForTest(ac.newContext()).createClass("light_action_data")
                    .addColumn("deviceId", ACStore.INT_TYPE, 20)
                    .addColumn("time", ACStore.INT_TYPE, 20)
                    .addColumn("action", ACStore.INT_TYPE, 20)
                    .addColumn("type", ACStore.INT_TYPE, 20)
                    .setEntityGroupKeys("deviceId")
                    .setPrimaryKeys("deviceId", "time")
                    .execute();
            // 创建数据分类是一个异步操作，在真正开始测试前，睡眠一段时间（这里是3秒）
            Thread.sleep(3000);     
        } catch (Exception e) {
            e.printStackTrace();
            fail("set up fail");
        }
    }


    @AfterClass
    public static void tearDown() throws Exception {
        // 执行完test后，需要解绑setUp绑定的测试设备，同时注销测试账号，确保下次单测能顺利通过
        ac.bindMgrForTest(ac.newContext(account.getUid())).unbindDevice(light.getId());
        ac.accountMgrForTest(ac.newContext()).deleteAccount("13100000000");  
        // 若setUp没有创建数据集，则此处无需删除表
        ac.storeForTest(ac.newContext()).deleteClass("light_action_data")
                .execute();
    }

    @Test
    public void test1ControlLight() throws Exception {
        try {
            // 创建一个用户的context
            ACContext context = ac.newContext(account.getUid());
            // 添加一个灯的桩，子域为"light"
            demoService.addDeviceStub(config.getSubDomain(), new LightStub());    

            // 下面构造client发送的请求参数
            ACMsg req = new ACMsg();
            req.setContext(context);            // 将上面用户的context传入
            req.setName("controlLight");        // 设置请求消息的名字
            req.put("deviceId", light.getId()); // 设置要控制灯的逻辑id
            req.put("action", "on");            // "on"表示开灯

            // 构造响应消息，用于接收服务端返回的消息
            ACMsg resp = new ACMsg();
            // 这里直接调用服务的处理handler，驱动测试
            demoService.handleMsg(req, resp);
            // 服务发送消息给设备后，设备会将处理结果代码返回
            // 在我们实现的LightStub中，返回的code为102，比较结果是否正确
            assertEquals(102, resp.get("code"));
        } catch (Exception e) {
            e.printStackTrace();
            fail("test control light fail");
        }
    }

    @Test
    public void test2LightReportAndQuery() throws Exception {
        // 先测试智能灯上报消息，将上报数据写入云端存储中
        try {
            int opCode = LightMsg.REPORT_CODE;           // 灯上报时的命令号
            LightMsg lightMsg = new LightMsg((byte) 1);  // 1--on
            ACDeviceMsg acDeviceMsg = new ACDeviceMsg(opCode, lightMsg);
            // 这里直接调用服务的设备消息处理handler，驱动测试
            // 这里由于设备汇报的消息中context没有用户id信息，随便填一个大于0的id即可
            demoService.handleDeviceMsg(ac.newContext(1), light.getId(), light.getPhysicalId(), acDeviceMsg);
        } catch (Exception e) {
            e.printStackTrace();
            fail("test light report fail");
        }

        // 这里用上面写入云端存储的数据来驱动测试app发来的数据查询请求处理handler
        try {
            ACMsg req = new ACMsg();
            ACMsg resp = new ACMsg();
            // 这里是模拟用户发的查询请求，因此需要设置用户的context
            req.setContext(ac.newContext(account.getUid()));
            req.setName("queryData");
            req.put("deviceId", light.getId());
            req.put("startTime", 0L);
            req.put("endTime", System.currentTimeMillis());
            // 这里直接调用服务的消息处理handler，驱动测试
            demoService.handleMsg(req, resp);
            List<ACObject> zos = resp.get("actionData");
            assertEquals(2, zos.size());
            for (ACObject zo : zos) {
                System.out.println("device[" + zo.get("deviceId") + "] time[" + zo.get("time") +
                        "] action[" + zo.get("action") + "]");
            }
        } catch (Exception e) {
            e.printStackTrace();
            fail("test query data fail");
        }
    }
}
```

><font color="red">**注意：**可以看到，所有的单元test case，我们均是直接调用`handleMsg`或`handleDeviceMsg`驱动测试，无需编写或使用client工具。

此外，非常重要的一点，我们需要使用4.11及以上的junit，并且使用标签**@FixMethodOrder(MethodSorters.NAME_ASCENDING)**固定test case的执行顺序，因为我们的test case可能前后依赖，比如在test1ControlLight中写入数据，在后面的test case中会读取。因此，在为测试函数命名的时候，如果有前后依赖关系的，需要考虑命名的规则按ascii字典序。</font>

####测试桩
从前面的场景分析我们知道，开发的DemoService会和等交互，但是我们在开发服务的过程，很可能智能灯也在研发之中，还没有发布硬件产品。这中情况在生产环境很常见，我们后端服务开发者不需要也不应该等待硬件设备开发完毕才做相应的功能测试。为此，ablecloud在服务开发框架中提供了设备桩`ACDeviceStub`功能，开发者只需要依照此接口实现具体的设备桩即可。
示例的桩处理很简单，实际上你可以任意扩展，比如在桩中模拟灯的各种状态，代码如下：
```java
package com.ablecloud.demo;

import com.ablecloud.service.ACDeviceMsg;
import com.ablecloud.service.ACDeviceStub;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LightStub extends ACDeviceStub {
    private static final Logger logger = LoggerFactory.getLogger(LightStub.class);

	/**
     * 收到控制灯的命令，并做出相应。这里响应的code为102
     */
    public void handleControlMsg(String majorDomain, String subDomain,
                                 ACDeviceMsg req, ACDeviceMsg resp) throws Exception {
        int code = req.getCode();
        if (code != LightMsg.CODE) {
            logger.warn("got an incorrect opcode[" + code + "]");
            return;
        }
        resp.setCode(102);		// return code from light is 102
        LightMsg reqMsg = (LightMsg)req.getContent();
        LightMsg respMsg = new LightMsg(reqMsg.getLedOnOff());
        resp.setContent(respMsg);
    }
}
```

##集成测试
单元测试通过后，我们还需要进行集成测试，因为单元测试的过程，我们并没有真正启动开发的服务，某些场景或代码路径不一定覆盖全，比如网络通信部分、服务框架部分等。
由于大部分逻辑在单元测试阶段均做了，因此集成测试相对简单，大致步骤如下：

###在本地机器或任意开发机上启动服务
按照[开发环境设置](dev_guide "开发环境设置")章节，通过运行`start.cmd`或`start.sh`启动服务

<font color="red">**注意**</font>

1、运行`start.cmd`或`start.sh`的条件，需满足启动的根目录的结构如下：
```
/config
	/cloudservice-conf.xml
/lib
	/ablecloud-framework-1.1.0.jar
    /ac-java-api-1.0.0.jar
	/commons-collections-3.2.1.jar
    /commons-configuration-1.10.jar
    /commons-lang-2.6.jar
    /slf4j-api-1.7.7.jar
    /...
start.sh
start.cmd
```
2、服务启动成功后，会在根目录下生成`log`的文件夹，进入该文件夹查看`service.log`文件，若能看到如下日志，说明服务已经启动成功，可以进入下一个步骤了。
```
2015-09-08 17:37:47,047 INFO main:1 [ACServer.java:41:main] - Starting service...
2015-09-08 17:37:47,047 INFO main:1 [ACConfiguration.java:331:dumpConfig] - get config item[mode] value[test]
...
2015-09-08 17:37:47,047 INFO main:1 [Log.java:178:initialized] - Logging initialized @147ms
2015-09-08 17:37:47,047 INFO main:1 [Server.java:301:doStart] - jetty-9.1.5.v20140505
2015-09-08 17:37:47,047 INFO main:1 [AbstractConnector.java:266:doStart] - Started ServerConnector@4b27ad{HTTP/1.1}{0.0.0.0:8080}
2015-09-08 17:37:47,047 INFO main:1 [Server.java:350:doStart] - Started @206ms
2015-09-08 17:37:47,047 INFO main:1 [ACServer.java:80:main] - Start service teddy ok.
```

###用任意客户端发送http请求
使用任意客户端发送http请求测试自己的接口正确性，例如用curl或自己开发的客户端都可以。以下详细介绍如何使用curl命令进行进一步测试。
><font color="brown">**注：**ablcloud提供的多种服务，其client和service之间的通信，底层采用http协议，方法为POST，因此任何能发送http请求的工具均可以用作服务测试的客户端。</font>

如：向我们开发的`DemoService`发送开灯命令：

####linux下使用curl命令
```curl
curl -v -X POST -H "Content-Type:application/x-zc-object"  -H "X-Zc-Major-Domain:ablecloud" -H "X-Zc-Sub-Domain:test" -H "X-Zc-User-Id:1" -d '{"deviceId":1,"action":"on"}' 'http://localHost:8080/controlLight'
```
####windows下使用curl命令请求
```curl
curl -v -X POST -H "Content-Type:application/x-zc-object" -H "X-Zc-Major-Domain:ablecloud" -H "X-Zc-Sub-Domain:test" -H "X-Zc-User-Id:1" --data-ascii "{\"deviceId\":1,\"action\":\"on\"}" "http://localHost:8080/controlLight"
```

其中`-H`指定头域ACContext的信息，`-d`指定的内容，是构造的ACMsg中的请求参数，`http://localHost:8080/controlLight`中的`ip:port`是你启动DemoService的主机和端口号,`controlLight`即为具体的方法，对应ACMsg设置的名字。
><font color="red">**注：**若在HandleMsg接口的处理中使用`req.getContext()`获取请求的用户信息，则在构造http请求的时候，需要使用`-H`增加如下三个头域：`X-Zc-Major-Domain`、`X-Zc-Sub-Domain`、`X-Zc-User-Id`</font>

#Error Code
参考[reference-Error Code](../reference/error_code.md)