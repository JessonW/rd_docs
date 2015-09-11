#云端自定义服务开发指导

#开发准备
**本章首先我们先来了解一下UDS开发最终需要发布提交什么东西到AbleCloud平台上，然后我们从DemoService讲起，从官网下载文件开始到如何使它在本机跑起来，以及最后如何新建一个属于自己的UDS服务。**
##服务框架发布库
ablecloud一期发布java版本服务开发框架，其发布目录、文件如下所示
```java
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

><font color=red>注意事项：</font>

>1. 所有依赖的第三方jar包，均放在lib文件夹下。其核心jar包为ablecloud的服务框架`ablecloud-framework-1.1.0.jar`和`ac-java-api-1.0.0.jar`。各jar包版本根据ablecloud发行的大版本不同可能不同。

>1. 在开发者开发完自定义服务后，需要将自定义服务编译好的jar包也放到ablecloud发布库的lib文件夹下,并在pom.xml里`<additionalClasspathElement>`标签下添加测试依赖

>1. 注意服务框架发布库结构不允许修改，否则发布失败

##本机启动DemoService
**本机启动要求本机上已装jre虚拟机**

1、首先，从AbleCloud官网下载中下载DemoService.zip，解压之后修改config文件夹下的cloudservice-conf.xml文件

        <?xml version="1.0" encoding="UTF-8"?>
		<configuration>
	    	<developer>
                <!-- 对应 个人信息-->个人信息-->开发者ID -->
        		<id>4</id>
    		</developer>

    		<authentication>
                <!-- 对应 密钥对管理-->全部密钥对，选择已启用的随便一对 -->
        		<access-key>33df24a54054067e80af49d939b429c2</access-key>
        		<secret-key>5e2fec3440e23c5e807910b13b672015</secret-key>
	    	</authentication>

    		<service>
        		<!-- 此处为本机启动的端口号 -->
        		<port>8080</port>
                <!-- 对应 产品管理-->产品列表-->主域名 -->
        		<major-domain>ablecloud</major-domain>
                <!-- 对应 产品管理-->产品列表-->子域 -->
        		<sub-domain>demo</sub-domain>
    		</service>
		</configuration>
	
><font color="brown">**注:**开发者id，access-key，secret-key等信息，均能通过登录ablecloud测试环境的web console获取。其他不需要修改</font>

2、接着我们还需要在**数据存储-->概况**中新建数据集light-action-data，如下所示：

![demoservice_class](../pic/develop_guide/DemoService_Class.png)

3、最后我们就可以在本机启动服务并进行测试了。

<b>*linux*</b>下在终端运行如下命令启动服务进行测试：
```sh
sh start.sh
```
<b>*windows*</b>下在cmd中运行如下命令启动服务进行测试：
```cmd
start.cmd
```

本地启动成功后，我们使用curl命令进行开灯测试

<b>*linux*</b>下使用curl命令
```curl
curl -v -X POST -H "Content-Type:application/x-zc-object"  -H "X-Zc-Major-Domain:ablecloud" -H "X-Zc-Sub-Domain:test" -H "X-Zc-User-Id:1" -d '{"deviceId":1,"action":"on"}' 'http://localHost:8080/controlLight'
```
<b>*windows*</b>下使用curl命令请求
```curl
curl -v -X POST -H "Content-Type:application/x-zc-object" -H "X-Zc-Major-Domain:ablecloud" -H ":test" -H ":1" --data-ascii "{\"deviceId\":1,\"action\":\"on\"}" "http://localHost:8080/controlLight"
```
><font color="red">**注：**</font>请自行修改`X-Zc-Major-Domain`、`X-Zc-Sub-Domain`、`X-Zc-User-Id`和`deviceId`的值

##开发工具设置
测试通过之后，我们就可以开始写自己的UDS程序了，以下从新建maven工程开始讲解，带你一步步建立起自己的工程。
####系统准备
在进行开发前，需要对系统以及环境进行设置。目前框架只支持java语言，因此系统准备基本都是和java相关，如jdk、maven等。

+ **JDK** 

	安装JDK，建议采用1.7版本JDK
    
+ **maven**

	安装maven，建议采用3.2以上版本
    
+ **ablecloud**

	下载ablecloud-framework-1.1.0.zip并解压

####Intellij
1. **新建工程**
	
    选择新建maven工程，JDK选择正确的版本。
    
    ![new project](../pic/reference/intellij/new_project_1_1.png)
    
    选择**maven**工程
    
    ![info](../pic/reference/intellij/new_project_1_2.png)
    
    注意jdk版本选择安装的1.7+
    点击**next**即可。
    
    ![next](../pic/reference/intellij/next.png)
    
    进入下一个页面，根据情况填写groupid/artifactid/version等信息。
    
    ![info](../pic/reference/intellij/new_project_1_3.png)
    
    填好后点击**next**，进入下一步，填写工程名以及存放路径。
    
    ![name](../pic/reference/intellij/new_project_1_4.png)
    
    然后点击**finish**完成新建工程向导。
    
    ![finish](../pic/reference/intellij/new_project_1_5.png)
    
    至此，新建工程完成。
   
1. **设置工程**

	按照步骤1完成了工程的新建，还需对工程属性进行一些设置以方便后续的编译、单测。
    点击**File** -> **Project Structure...**
    
    ![setting](../pic/reference/intellij/set_project_1_1.png)
    
    首先设置工程所使用的JDK版本1.7+和语言级别7.0
    
    ![lib](../pic/reference/intellij/set_project_1_2.png)
    
    设置开发服务所要依赖的ablecloud框架包，点击**+**号，选择下载并解压后的ablecloud开发框架的**lib目录**即可。
    同上，打开**Project Structure...**,然后选择**Libraries**，点击右边的**+**号，选择**Java**，如下图所示
    
    ![lib](../pic/reference/intellij/set_project_2_1.png)
    
    在弹出的对话框中选择下载并解压后的ablecloud中的lib目录，并点击**OK**
    
    ![lib](../pic/reference/intellij/set_project_2_2.png)
    
    回到上一个窗口后再次点击**OK**确认
    
    ![lib](../pic/reference/intellij/set_project_2_3.png)
    
    这个过程中，我们可以对添加的lib库重命名（可选），例如这里重命名为**ablecloud-libs**。点击**OK**完成添加。
    
    ![lib](../pic/reference/intellij/set_project_2_4.png)
    
    完成上述步骤后，我们将在工程视图里面看到新添加的该目录，如下
    
    ![lib](../pic/reference/intellij/set_project_2_5.png))
    
    至此，开发者开发服务所以来的ablecloud开发框架库添加成功。
    
1. **修改pom.xml文件**

	下面是一个demo的完整pom.xml文件，如下：
    
		<?xml version="1.0" encoding="UTF-8"?>
		<project xmlns="http://maven.apache.org/POM/4.0.0"
         	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    		<modelVersion>4.0.0</modelVersion>

    		<groupId>com.ablecloud.demo</groupId>
    		<artifactId>SmartHome</artifactId>
    		<version>1.0.0</version>

    		<properties>
        		<ablecloud.lib.dir>/home/chenpeng/IdeaProjects/ablecloud-framework/target/lib</ablecloud.lib.dir>
    		</properties>

    		<build>
	        	<plugins>
	            	<plugin>
	                	<!--this plugin and dependency jars are used for testing-->
	                	<groupId>org.apache.maven.plugins</groupId>
	                	<artifactId>maven-surefire-plugin</artifactId>
	                	<version>2.18.1</version>
                        <dependencies>
                    		<dependency>
                        		<groupId>org.apache.maven.surefire</groupId>
                        		<artifactId>surefire-junit47</artifactId>
                        		<version>2.18.1</version>
                    		</dependency>
                		</dependencies>
	                	<configuration>
	                    	<argLine>-Dmode=test</argLine>
	                    	<additionalClasspathElements>
    	                    	<additionalClasspathElement>${ablecloud.lib.dir}/ablecloud-framework-1.0.2.jar</additionalClasspathElement>
        	                	<additionalClasspathElement>${ablecloud.lib.dir}/slf4j-log4j12-1.7.7.jar</additionalClasspathElement>
            	            	<additionalClasspathElement>${ablecloud.lib.dir}/slf4j-api-1.7.7.jar</additionalClasspathElement>
                	        	<additionalClasspathElement>${ablecloud.lib.dir}/log4j-1.2.17.jar</additionalClasspathElement>
                    	    	<additionalClasspathElement>${ablecloud.lib.dir}/junit-4.11.jar</additionalClasspathElement>
                                <additionalClasspathElement>${ablecloud.lib.dir}/hamcrest-core-1.3.jar</additionalClasspathElement>
                        		<additionalClasspathElement>${ablecloud.lib.dir}/commons-configuration-1.10.jar</additionalClasspathElement>
                        		<additionalClasspathElement>${ablecloud.lib.dir}/commons-collections-3.2.1.jar</additionalClasspathElement>
                        		<additionalClasspathElement>${ablecloud.lib.dir}/commons-lang-2.6.jar</additionalClasspathElement>
	                        	<additionalClasspathElement>${ablecloud.lib.dir}/commons-logging-1.1.1.jar</additionalClasspathElement>
    	                    	<additionalClasspathElement>${ablecloud.lib.dir}/jetty-all-9.2.10.v20150310.jar</additionalClasspathElement>
        	                	<additionalClasspathElement>${ablecloud.lib.dir}/jackson-core-2.3.2.jar</additionalClasspathElement>
            	            	<additionalClasspathElement>${ablecloud.lib.dir}/jackson-annotations-2.3.2.jar</additionalClasspathElement>
                	        	<additionalClasspathElement>${ablecloud.lib.dir}/jackson-databind-2.3.2.jar</additionalClasspathElement>
                    		</additionalClasspathElements>
	                	</configuration>
	            	</plugin>
	            	<plugin>
    	            	<groupId>org.apache.maven.plugins</groupId>
            	    	<artifactId>maven-compiler-plugin</artifactId>
                        <version>3.3</version>
        	        	<configuration>
                	    	<source>1.7</source>
                    		<target>1.7</target>
                    		<encoding>UTF-8</encoding>
                    		<compilerArguments>
	                        	<extdirs>${ablecloud.lib.dir}</extdirs>
    	                	</compilerArguments>
        	        	</configuration>
            		</plugin>
            		<plugin>
                		<groupId>org.apache.maven.plugins</groupId>
                		<artifactId>maven-jar-plugin</artifactId>
                        <version>2.6</version>
                		<executions>
	                    	<execution>
	    	                    <phase>package</phase>
    	    	                <goals>
        	    	                <goal>jar</goal>
            	    	        </goals>
                	    	</execution>
                		</executions>
                		<configuration>
                    		<outputDirectory>${project.build.directory}/lib</outputDirectory>
                		</configuration>
            		</plugin>
        		</plugins>
    		</build>
		</project>

    <font style="background:cyan">完整拷贝该示例pom.xml文件内容，其中绝大部分内容都无须修改，开发者仅需修改如下几个配置项即可：</font>
    
    	<project>
    		<groupId>your service group id</groupId>
       		<artifactId>your service artifact id</artifactId>
       		<version>your service version</version>
       		<properties>
        		<ablecloud.lib.dir>unzipped ablecloud lib dir where you put</ablecloud.lib.dir>
       		</properties>
    	</project>
        
	<font style="background:cyan">注意以下配置项**一定不能修改**，否则单测将无法通过。开发者不用担心该配置项，线上环境该配置项自动失效。</font>
        
1. **修改配置文件**

	配置文件位于ablecloud发行库的config文件夹下，名字为cloudservice-conf.xml。
    
		<?xml version="1.0" encoding="UTF-8"?>
		<configuration>
	    	<developer>
        		<id>4</id>
    		</developer>

    		<authentication>
        		<access-key>33df24a54054067e80af49d939b429c2</access-key>
        		<secret-key>5e2fec3440e23c5e807910b13b672015</secret-key>
        		<timeout>5000</timeout>
	    	</authentication>

    		<framework>
        		<router>192.168.1.126:5000</router>
    		</framework>

    		<service>
        		<name>SmartHome</name>
        		<class>com.ablecloud.demo.DemoService</class>
        		<port>1234</port>
        		<major-domain>ablecloud</major-domain>
        		<sub-domain>demo</sub-domain>
        		<major-version>1</major-version>
        		<minor-version>0</minor-version>
        		<patch-version>0</patch-version>
    		</service>
		</configuration>
	
    ><font color="brown">**注:**开发者id，access-key，secret-key等信息，均能通过登录ablecloud测试环境的web console获取。
    除了**service.class**配置项在测试环境和线上环境均生效外，所有的其它配置项只在测试环境有效。线上服务将忽略配置文件中的配置项。</font>
    
1. **编译单测**

	在IDE的终端（terminal）或系统终端中运行命令`mvn package`即可完整的执行编译、单元测试（如果写了单测代码的话）。
    
1. **本地运行**

	如果编译、单测都没有问题，则将编译出来的服务jar包（在服务工程主目录下的target/lib目录下）拷贝到ablecloud框架的lib目录下，在ablecloud的框架主目录执行ablecloud提供的脚本`sh start.sh -m test`或`start.cmd -m test`，即可在您的开发机上启动您编写好的服务程序。
    
	><font color="brown">**注：**在本机上运行服务测试时必须加**-m test**参数，否则无法启动服务。服务启动所需的参数，如域名、版本、端口等信息均在xml的配置文件中设置。</font>
    
1. **提交到平台**

	将你编译好的服务jar包（位于你服务代码主目录下的target/lib文件夹中，如`~/SmartHome/target/lib/SmartHome-1.0.0.jar`）放入ablecloud框架的lib目录下，然后将ablecloud的config目录、lib目录、start.sh打成zip包，通过ablecloud的web平台提交。

####Eclipse
1. **新建工程**

	选择**File-->New-->Project...**
    
    ![new project](../pic/reference/eclipse/new_project_1_1.png)
    
    选择**maven**工程
    
    ![new project](../pic/reference/eclipse/new_project_1_2.png)
    
    点击**Next**进入下一步
    
    ![next](../pic/reference/eclipse/next.png)
    
    填写groupId,artifactId,version等信息，并点击**Finish**完成新建工程。
    
    ![info](../pic/reference/eclipse/new_project_1_3.png)
    
1. **设置工程**
	在工程视窗右键点击步骤1中新建的工程进行工程设置。或者点击菜单栏**Project-->Properties**进行设置
    
    ![setting](../pic/reference/eclipse/set_project_1_1.png)
    
    首先设置工程对ablecloud发行库的依赖。如图选择**Java Build Path**的**Libaries**标签页，点击**Add Library...**
    
    ![setting](../pic/reference/eclipse/set_project_1_2.png)
    
    在**Add Library**页选择**User Library**
    
    ![setting](../pic/reference/eclipse/set_project_1_3.png)
    
    继续点击**User Libraries...**按钮
    
    ![setting](../pic/reference/eclipse/set_project_1_4.png)
    
    然后点击**New...**新建一个用户library文件夹
    
    ![setting](../pic/reference/eclipse/set_project_1_5.png)
    
    这里可以给该用户lib重命名，如图中命名为ablecloud-libs，点击**OK**完成
    
    ![setting](../pic/reference/eclipse/set_project_1_6.png)
    
    回到**User Libraries**页面，点击右方的**Add External JARs...**按钮，选择下载并解压的ablecloud发行库中的**lib**目录，将该目录中所有的jars添加到新建的user library中。
    
    ![setting](../pic/reference/eclipse/set_project_1_7.png)
    
    勾选上新建的user library，并点击**Finish**将ablecloud的jars添加到新建的工程中。
    
    ![setting](../pic/reference/eclipse/set_project_1_8.png)
    
    下面进行java语言的设置，类似上面的设置，先进入**Properties**窗口，选择**Java Compiler**，**去掉**默认的*Use compliance from execution environment...*，并且选择*Compiler compliance level*为**1.7**
    
    ![setting](../pic/reference/eclipse/set_project_2_1.png)
    
1. **修改pom.xml文件**

	同**intellij**章节
    
1. **修改配置文件**

	同**intellij**章节

1. **编译单测**

	TBD

1. **本地运行**

	同**intellij**章节
    
1. **提交到平台**

	同**intellij**章节
   


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

>此外，非常重要的一点，我们需要使用4.11及以上的junit，并且使用标签**@FixMethodOrder(MethodSorters.NAME_ASCENDING)**固定test case的执行顺序，因为我们的test case可能前后依赖，比如在test1ControlLight中写入数据，在后面的test case中会读取。因此，在为测试函数命名的时候，如果有前后依赖关系的，需要考虑命名的规则按ascii字典序。</font>

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




#STORE存储接口示例
以数据集`test_data`为例，假定其分区键为`deviceId`（字符串型）；主键为`deviceId`（字符串型）和`timestamp`（整型）；其他字段包括`status`（字符串型）、`mode`（字符串型）、`speed`（整型）和`pm25`（浮点型）等。

##Create
###方式一：显示的传入primary keys的k-v对
```java
ac.store("test_data", context).create("deviceId", "12345", "timestamp", 1L)	// 这里是k-v对
                    .put("status", "run")
                    .put("mode", "auto")
                    .put("speed", 45L)
                    .put("pm25", 35.5)
                    .execute();
```
###方式二：传入primary keys的对象
```java
ACObject pk = new ACObject();
pk.put("deviceId", "12345");
pk.put("timestamp", 1L);
ac.store("test_data", context).create(pk)	// 这里是primary keys的对象
                    .put("status", "run")
                    .put("mode", "auto")
                    .put("speed", 45L)
                    .put("pm25", 35.5)
                    .execute();
```
##Find
```java
ACObject ao = ac.store("test_data", context)
                    .find("deviceId", "12345", "timestamp", 1L)
                    .execute();
String status = ao.get("status");
String mode = ao.get("mode");
Long speed = ao.get("speed");
```
##Scan
由于是分区数据集，在Scan时需要传入分区键值对，这里是`deviceId`及其值。注意如果是非分区的数据集，则调用scan接口时不需要传入参数，如`ac.store("test_data", context).scan()...`
><font color=red>务必注意</font>：存储服务为了保证服务整体可用性，限制单次查询最多返回1000条结果。

###示例一：设定start和limit，由start开始正向扫描，返回limit数量的结果集，其中各数据记录按主键自然正序排列
```java
ac.store("test_data", context).scan("deviceId", "12345")
                    .start("timestamp", 1L)
                    .limit(10)
                    .execute();
```
###示例二：设定start和end，由start开始正向扫描到end，返回start和end之间的结果集，其中各数据记录按主键自然正序排列
```java
ac.store("test_data", context).scan("deviceId", "12345")
                    .start("timestamp", 1L)
                    .end("timestamp", 10L)
                    .execute();
```
###示例三：设定end和limit，由end开始逆向扫描，返回limit数量的数据集，注意其中各数据记录按主键倒序排列。
><font color="brown">**注：**我们经常遇到的获取设备最新的n条数据的需求就可以用这个接口组合来实现。</font>
```java
ac.store("test_data", context).scan("deviceId", "12345")
                    .end("timestamp", 10L)
                    .limit(10)
                    .execute();
```
###示例四：指定查询过滤器进行查询
```java
// 查询条件1：状态是正在运行并且转速大于等于300
ACFilter f1 = ac.filter().whereEqualTo("status", "running")
                    .whereGreaterThanOrEqualTo("speed", 300L);

// 查询条件2：状态是已停止并且PM2.5监控值小于50.0
ACFilter f2 = ac.filter().whereEqualTo("status", "stopped")
                    .whereLessThan("pm25", 50.0);

// 查询设备ID为"12345"的设备在一段时间内所有满足条件1或条件2的数据记录
ac.store("test_data", context).scan("deviceId", "12345")
                    .start("timestamp", 1L)
                    .end("timestamp", 10L)
                    .where(f1)
                    .or(f2)
                    .execute();
```
###示例五：指定查询过滤器进行查询并排序，注意排序的各字段之间有优先级关系，在参数列表中越靠前优先级越高
```java
// 查询条件：状态是正在运行
ACFilter f = ac.filter().whereEqualTo("status", "running");

// 查询设备ID为"12345"的设备在一段时间内所有满足条件的数据记录并按照转速（正序）、PM2.5监控值（倒序）以及时间戳（倒序）排序
// 本示例的意图为：查询设备ID为"12345"的设备在"1L"到"10L"这段时间内所有正在运转时上报的数据，同时进行排序，转速越低越靠前，转速相同的PM2.5越高越靠前，PM2.5也相同的时间越近越靠前
ac.store("test_data", context).scan("deviceId", "12345")
                    .start("timestamp", 1L)
                    .end("timestamp", 10L)
                    .where(f)
                    .orderByAsc("speed")
                    .orderByDesc("pm25", "timestamp")
                    .execute();
```
###示例六：分组并进行简单的数值统计
```java
/*
 将设备ID为"12345"的设备在一段时间内的数据记录按照运行状态和控制模式分组，假设有四种情况：
 -------------------------
 | status    |    mode   |
 -------------------------
 | running   |    auto   |
 -------------------------
 | running   |    manual |
 -------------------------
 | stopped   |    auto   |
 -------------------------
 | stopped   |    manual |
 -------------------------
 本示例的意图为：统计设备ID为"12345"的设备在"1L"到"10L"这段时间内所有上报的数据，按照"status"和"mode"分组，统计每个分组的记录总数、合计转速、平均转速和平均PM2.5以及最大转速和最大PM2.5.
*/
ac.store("test_data", context).scan("deviceId", "12345")
                    .start("timestamp", 1L)
                    .end("timestamp", 10L)
                    .groupBy("status", "mode")
                    .count()
                    .sum("speed")
                    .avg("speed", "pm25")
                    .max("speed", "pm25")
                    .execute();
```
###示例七：复杂示例，各接口之间限制比较少，可以灵活组合来满足需求
```java
// 将设备ID为"12345"的设备在一段时间内满足查询条件的数据记录进行分组、排序和聚合
ACFilter f1 = ac.filter().whereGreaterThan("speed", 0L)
                    .whereLessThan("speed", 50L);
ACFilter f2 = ac.filter().whereGreaterThanOrEqualTo("speed", 300L);
ACFilter f3 = ac.filter().whereLessThan("pm25", 30.0);
ac.store("test_data", context).scan("deviceId", "12345")
                    .start("timestamp", 1L)
                    .end("timestamp", 100L)
                    .where(f1)
                    .or(f2)
                    .or(f3)
                    .groupBy("status", "mode")
                    .orderByAsc("status", "mode")
                    .count()
                    .max("speed")
                    .min("speed", "pm25")
                    .execute();
```
##FullScan
分区数据集还可以调用FullScan接口得到全表扫描的Iterator，每次调用Iterator的next()方法得到下一个有数据记录存在的分区中的数据，注意各分区间不保证有序！
同时注意全表扫描过程中Iterator会自动跳过没有数据的分区，整个扫描结束的条件是next()方法返回为空
```java
// 延续Scan示例七中的查询条件进行全表所有分区的扫描
ACFilter f1 = ac.filter().whereGreaterThan("speed", 0L)
                    .whereLessThan("speed", 50L);

ACFilter f2 = ac.filter().whereGreaterThanOrEqualTo("speed", 300L);

ACFilter f3 = ac.filter().whereLessThan("pm25", 30.0);

ACIterator it = ac.store("test_data", context).fullScan()
                    .start("timestamp", 1L)
                    .end("timestamp", 100L)
                    .where(f1)
                    .or(f2)
                    .or(f3)
                    .groupBy("status", "mode")
                    .orderByAsc("status", "mode")
                    .count()
                    .max("speed")
                    .min("speed", "pm25")
                    .execute();

List<ACObject> zos;
while((zos = it.next()) != null) {
	// 处理当前分区中的数据
        ...
}
```
##BatchDelete
分区或者非分区的数据集都可以使用BatchDelete接口来支持批量删除。对于分区数据集，类似scan接口，每次的批量删除操作也是在某个分区键的范围内进行的，同时可以定义一个或几个ACFilter作为删除的条件；对于非分区数据集，同样类似于scan接口，batchDelete接口也是无参的，同时必须定义一个或几个ACFilter进行条件删除。
```java
ACFilter f1 = ac.filter().whereGreaterThan("speed", 0L)
                    .whereLessThan("speed", 50L);

ACFilter f2 = ac.filter().whereGreaterThanOrEqualTo("speed", 300L);

ACFilter f3 = ac.filter().whereLessThan("pm25", 30.0);

ac.store("test_data", context).batchDelete("deviceId", "12345")
                    .where(f1)
                    .or(f2)
                    .or(f3)
                    .execute();
```
##SimpleFullScan和Scan
**基于SimpleFullScan和Scan的全表分页浏览**

全表的分页浏览也是一个重要的需求。本需求可以通过SimpleFullScan和Scan接口来实现，下面分别给出分区数据集和非分区数据集的实现示例。

###非分区数据集
```java
// limit是每个分页的最大数据条数，举例为50
int limit = 50;
List<ACObject> zos;

// 第一次调用scan，由非分区表的起始向下扫描limit+1条数据。注意每次多取一条，呈现前limit条，最后一条用作下一次取数据的start；同时注意非分区数据集的scan不需要传分区键
zos = ac.store("test_data", context)
	.scan()
	.limit(limit + 1)
	.execute();

// 后续调用scan接口，start使用上一次扫描的结果数据集的最后一条
while (zos.size() >= limit + 1) {
	zos = ac.store("test_data", context)
		.scan()
		.start(zos.get(limit))
		.limit(limit + 1)
		.execute();
}

```
###分区数据集
```java
// limit是每个分页的最大数据条数，举例为50
int limit = 50;

// 可以定义一些查询条件的过滤器
ACFilter f1 = ac.filter().whereGreaterThan("speed", 0L)
                    .whereLessThan("speed", 50L);

ACFilter f2 = ac.filter().whereGreaterThanOrEqualTo("speed", 300L);

ACFilter f3 = ac.filter().whereLessThan("pm25", 30.0);

ACRowIterator it = ac.store(TEST_CLASS, context)
		.simpleFullScan()
		.where(f1)
		.and(f2)
		.or(f3)
		.execute();

// 注意这里可以直接使用每次期望获取的数据条数limit，不需要传入limit+1;同时每次迭代给定的limit可以不同
List<ACObject> zos;
while ((zos = it.next(limit)) != null) {
	// 处理本次迭代取到的数据集
        ...
}
```
##其它
`delete/update/replace`的接口使用请参见上面的接口说明，使用方式类似，这里不一一举例了。

#UDS访问外网示例
由于uds本身无法访问正常的外网服务，所以AbleCloud内部实现了正向代理，并提供ACHttpClient以访问外网服务
##GET
```java
@Test
public void testGet() {
    try {
        //获取访问外网的ACHttpClient客户端
        ACHttpClient client = ac.getHttpClient("http://apis.baidu.com/apistore/aqiservice/aqi?city=%E5%8C%97%E4%BA%AC");
        //默认为GET方法
        client.setRequestMethod("GET");
        //默认超时时间为5000
        client.setConnectTime(5000);
        //设置访问外网头域
        client.setHeader("apikey", "caf46348383a17f6070e0bda0e361a28");
        //连接url
        client.connect();
        //AbleCloud签名认证失败
        if (client.getResponseCode() == HttpURLConnection.HTTP_OK) {
            assertEquals(client.getResponseMessage(), "OK");
            //通过getData()或getInputStream()获取response,不能同时一起调用
        }
    } catch (IOException e) {
        fail(e.toString());
    }
}
```
##POST
```java
@Test
public void testPost() {
    try {
        String body = "fromdevice=pc&clientip=10.10.10.0&detecttype=LocateRecognize&languagetype=CHN_ENG&imagetype=1&image=/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDABMNDxEPDBMREBEWFRMXHTAfHRsbHTsqLSMwRj5KSUU+RENNV29eTVJpU0NEYYRiaXN3fX59S12Jkoh5kW96fXj/2wBDARUWFh0ZHTkfHzl4UERQeHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHj/wAARCAAfACEDAREAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAQDBQb/xAAjEAACAgICAgEFAAAAAAAAAAABAgADBBESIRMxBSIyQXGB/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/APawEBAQEBAgy8i8ZTVV3UY6V1eU2XoWDDZB19S646Gz39w9fkKsW1r8Wm2yo1PYis1be0JG9H9QNYCAgc35Cl3yuVuJZl0cB41rZQa32dt2y6OuOiOxo61vsLcVblxaVyXD3hFFjL6La7I/sDWAgICAgICB/9k=";
        //获取访问外网的ACHttpClient客户端
        ACHttpClient client = ac.getHttpClient("http://apis.baidu.com/apistore/idlocr/ocr");
        //默认为GET方法
        client.setRequestMethod("POST");
        //默认超时时间为5000
        client.setConnectTime(5000);
        //设置访问外网头域
        client.setHeader("Content-Type", "application/x-www-form-urlencoded");
        client.setHeader("apikey", "caf46348383a17f6070e0bda0e361a28");
        //连接url
        client.connect();
        //设置访问外网消息体
        client.setEntity(body.getBytes("UTF-8"));
        //AbleCloud签名认证失败
        if (client.getResponseCode() == HttpURLConnection.HTTP_OK) {
            assertEquals(client.getResponseMessage(), "OK");
            //通过getData()或getInputStream()获取response,不能同时一起调用
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```


#Error Code
参考[reference-Error Code](../reference/error_code.md)