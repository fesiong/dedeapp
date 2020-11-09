import fetch from './request'

const api = {
  //对应接口
  index: ((params = {}) => {
    return fetch("?a=index", params, true);
  }),
  categories: ((params = {}) => {
    return fetch("categories", params);
  }),
  category: (params => {
    return fetch("?a=category", params, true);
  }),
  articles: ((params = {}) => {
    return fetch("?a=articles", params);
  }),
  article: (params => {
    return fetch("?a=article", params);
  }),
  products: ((params = {}) => {
    return fetch("?a=products", params);
  }),
  product: (params => {
    return fetch("?a=product", params);
  }),
  list: (params => {
    return fetch("?a=list", params);
  }),
  setting: ((params = {}) => {
    return fetch("?a=setting", params, true);
  }),
  page: (params => {
    return fetch("?a=page", params, true);
  }),
  default: (params => {
    return fetch("?a=default", params);
  }),
  update: ((params = {}) => {
    return fetch("?a=update", params, true);
  }),
}

export default api