/**
 * 说明：这里的配置，如果后台也同时配置了，则会被后台相同的配置替代，这里的配置可以加速小程序显示
 */
const appConfig = {
  /* API地址 */
  api: 'https://www.taokee.top/api/app',
  /* 基本配置 */
  /* 小程序logo */
  logo: 'https://www.taokee.top/img/logo.png',
  /* 小程序名称 */
  title: '织梦网站小程序制作',
  /* 首页标题 */
  seoTitle: '织梦网站小程序制作：量身定制百度智能小程序、微信小程序',
  /* 首页关键词 */
  keywords: '织梦小程序开发,织梦小程序源码,织梦小程序教程,织梦小程序定制',
  /* 首页描述 */
  description: '织梦小程序专门为织梦网站开发微信小程序，百度智能小程序，拥有多年小程序开发经验，众多成功案例。找织梦小程序开发公司，选择织梦小程序开发团队。',
  /* 联系方式 */
  /* 联系电话 */
  mobile: '17097218761',
  /* 联系微信 */
  wechat: '17097218761',
  /* 公司名称 */
  company: '织梦网站小程序制作',
  /* 公司地址 */
  address: '广东深圳',
  /* 内容设置 */
  /* 关于我们的单页/分类id */
  aboutId: '1',
  /* 联系我们单页/分类id */
  contactId: '2',
  /* 排除不显示的分类id，多个分类id请用英文的,隔开 */
  ignoreCategory: '3,4',
  /* 是否显示产品, 1显示，0不显示 */
  showProduct: 1,
  /* 产品模型id，默认是6 */
  productModelId: '6',
  /* 产品顶级分类id， 只有在没有使用产品模型的时候需要填写 */
  productCategory: '',
  // /* 是否显示案例，1显示，0不显示 */
  // showCase: 1,
  // /* 案例分类顶级id，不填写有可能不能正常显示案例 */
  // caseCategory: '9',
  /* 需要显示在首页的分类，多个分类用,隔开 */
  indexCategory: '1,7,8',
  /* 首页幻灯片，可以显示多个, 如果后台的产品设置了幻灯显示，则这里配置失效
  每张幻灯片由4个字段组成，model的值可以是article或product，id的值是对应的文章或产品id，title为显示的名称，logo为图片地址 */
  indexBanner: [
    {
      id: 0,
      model: 'article',
      title: '',
      logo: 'https://www.taokee.top/img/banner1.jpg'
    },
    {
      id: 0,
      model: 'article',
      logo: 'https://www.taokee.top/img/banner2.jpg'
    }
  ],
  /* 首页导航图标，建议不超过5个
  每个图标由3个字段组成，url为小程序的链接，title为名称，logo为图片地址 */
  indexNav: [
    {
      url: '/pages/products/index',
      title: '产品中心',
      logo: '/assets/nav-1.png'
    },
    {
      url: '/pages/articles/index',
      title: '文章中心',
      logo: '/assets/nav-2.png'
    },
    {
      url: '/pages/about/index',
      title: '关于我们',
      logo: '/assets/nav-3.png'
    },
    {
      url: '/pages/contact/index',
      title: '联系我们',
      logo: '/assets/nav-4.png'
    },
  ],
}

export default appConfig