# dedecms网站配套小程序

说明：该小程序源码同时支持百度智能小程序，微信小程序，支付宝小程序，头条小程序等，下面以百度小程序为例子展开配置说明  


## dedecms网站配套百度小程序使用指南

## 一、前言  
dedecms网站配套百度小程序，可以直接将dedecms站点的数据传输到百度小程序中，省去使用第三方小程序管理后台的烦恼，不需要重新给百度小程序再发布一遍产品和文章，节省大量的编辑工作。

## 二、安装方法  
1. 将baiduapp.zip解压，得到appclient-0.4.3.php、dedecms-0.4.3.zip。
2. 将appclient-0.4.3.php重命名为appclient.php，并上传到网站根目录，访问一次，如果有内容输出，表示正常。
3. 将dedecms-0.4.3.zip解压到dedecms文件夹，并用百度开发者工具打开预览
4. 打开dedecms根目录下的config.js，按照里面的说明和示例填写基本配置信息。（小程序的配置同样可以通过dedecms后台配置，后台配置在后台的系统设置->系统基本参数->站点设置里）。
5. 点击百度开发者工具->项目信息，填写appid
6. 到百度小程序后台，添加站点域名为请求域名。
7. 在百度开发者工具提交发布。
8. 到百度小程序后台->开发管理中，将刚提交上来的小程序代码提交审核。

## 三、百度开发者工具使用
请自行熟悉，这里不做详细解答

## 四、小程序配置
小程序的配置文件在小程序包的根目录下的config.js。初次安装，需要配置必要的信息，才能让小程序正常工作。如果您的织梦站点没有使用产品模块，则可能需要选择停用产品功能。同样的配置也可以通过织梦后台配置。后台的配置在：后台的系统设置->系统基本参数->站点设置 里面。一下大部分配置并不需要操作，默认即可。

### 接口设置
填写API地址：API地址由您的站点地址+appclient.php组成，例如你的站点地址是http://dev.dedecms.com，那么API地址则是http://dev.dedecms.com/appclient.php，请确保这个地址能正常访问到接口文件，接口文件的上传请参照 二、安装方法  

1. 基本设置
基本配置信息包括小程序logo、小程序名称，小程序名称显示在小程序首页顶部导航上。配置如图  
![001](https://raw.githubusercontent.com/fesiong/dedeapp/master/demo/001.png)  

2. 首页TDK设置
首页TDK是指标题、关键词、描述，同网站首页的TDK一致，是小程序重要指标，务必认真填写。如图  
![002](https://raw.githubusercontent.com/fesiong/dedeapp/master/demo/002.png)  

3. 联系方式设置
联系方式包括公司名称、公司地址、联系电话、联系微信，它们会显示在联系我们的页面里，以及各个页面的悬浮按钮。如图
![003](https://raw.githubusercontent.com/fesiong/dedeapp/master/demo/003.png)  

4. 内容设置
内容设置可以设置关于我们、联系我们、首页显示的分类内容、启用产品功能、停用产品功能等。  
关于我们、联系我们需要指定单页id或分类id，优先使用单页id，只有填写了正确的id后，小程序才能正确调用关于我们和联系我们。如图  
![004](https://raw.githubusercontent.com/fesiong/dedeapp/master/demo/004.png)  
小程序首页默认会显示一组分离以及分类的内容列表，正确配置首页显示的分类，可以让首页更美观以及将更有用的信息展示给用户。比如需要将培训视频、学员作品、客户案例展示在首页，他们的分类id分别是1，7，8，那么首页分类则填写1,7,8，它们之间需要使用英文的,隔开。如图  
![005](https://raw.githubusercontent.com/fesiong/dedeapp/master/demo/005.png)  

6. 启用产品功能
将配置中的showProduct值设置为1，如果织梦站点使用商品模块来管理产品，则productCategory不需要设置，小程序会自动调用商品模块来获取产品分类和产品详情。如图  
![006](https://raw.githubusercontent.com/fesiong/dedeapp/master/demo/006.png)  

如果织梦站点使用文章模块来管理产品，则还需要设置productCategory的值为产品分类的顶级分类id。如图  
![007](https://raw.githubusercontent.com/fesiong/dedeapp/master/demo/007.png)  
同时还需要将产品中心的导航添加上。打开app.json，找到首页，在它下方加入产品中心，如图  
![008](https://raw.githubusercontent.com/fesiong/dedeapp/master/demo/008.png)  
还需要将首页导航图标反注释。打开config.js。如图  
![009](https://raw.githubusercontent.com/fesiong/dedeapp/master/demo/009.png)  

7. 停用产品功能
将配置中的showProduct值设置为0即可。如图  
![010](https://raw.githubusercontent.com/fesiong/dedeapp/master/demo/010.png)  
同时还需要将产品中心的导航移除。打开app.json，找到产品中心代码，并将它们移除，如图  
![011](https://raw.githubusercontent.com/fesiong/dedeapp/master/demo/011.png)  
还需要将首页导航图标注释。打开config.js。如图
![012](https://raw.githubusercontent.com/fesiong/dedeapp/master/demo/012.png)  

8. 首页幻灯片设置
配置首页幻灯片可以让小程序更突出，也可以让首屏加载更快。幻灯片同时支持在织梦后台配置，织梦后台的文档，添加幻灯属性后，即可替代config.js的配置。  
每张幻灯片由4个字段组成，model的值可以是article或product，id的值是对应的文章或产品id，title为显示的名称，title可以不填，logo为图片地址。如图  
![013](https://raw.githubusercontent.com/fesiong/dedeapp/master/demo/013.png)  

9. 首页导航图标设置

首页导航图标可以让更重要的信息直达。建议配置不要超过5个。  
每个图标由3个字段组成，url为小程序的链接，title为名称，logo为图片地址，尽量使用网络图片地址。如图
![014](https://raw.githubusercontent.com/fesiong/dedeapp/master/demo/014.png)    

## 五、sitemap的生成
访问你的网址+/appclient.php?a=sitemap
例如网址是https://www.baidu.com，那么，sitemap地址就是https://www.baidu.com/appclient.php?a=sitemap

## 六、技术支持
微信: no_reg  
网站：[织梦小程序](https://www.kandaoni.com)  

参与讨论：请添加我的微信进微信群讨论  

![no_reg](https://www.kandaoni.com/uploads/20211/5/fe4d9fbabdc70ffc.png)