export default {
  pages: [
    'pages/index/index',
    'pages/category/index',
    'pages/articles/index',
    'pages/article/index',
    'pages/products/index',
    'pages/product/index',
    'pages/about/index',
    'pages/contact/index',
    'pages/browser/index',
  ],
  window: {
    backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#3998fc',
      defaultTitle: "标题",
      titleBarColor: "#3998fc",
      gestureBack: "YES",
      navigationBarTitleText: "标题",
      navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: "#666",
    selectedColor: "#f44",
    backgroundColor: "#fafafa",
    borderStyle: 'black',
    list: [{
      pagePath: "pages/index/index",
      iconPath: "./assets/home.png",
      selectedIconPath: "./assets/home-selected.png",
      text: "首页"
    },
    {
      pagePath: "pages/products/index",
      iconPath: "./assets/shop.png",
      selectedIconPath: "./assets/shop-selected.png",
      text: "产品中心"
    },
    {
      pagePath: "pages/articles/index",
      iconPath: "./assets/article.png",
      selectedIconPath: "./assets/article-selected.png",
      text: "文章中心"
    },
    {
      pagePath: "pages/about/index",
      iconPath: "./assets/about.png",
      selectedIconPath: "./assets/about-selected.png",
      text: "关于我们"
    },
    {
      pagePath: "pages/contact/index",
      iconPath: "./assets/contact.png",
      selectedIconPath: "./assets/contact-selected.png",
      text: "联系我们"
    }]
  }
}
