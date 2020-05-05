import Taro, { getApp } from '@tarojs/taro'
import appConfig from './config'
import Version from './version'
const app = getApp()

function crc32(a) {
  let c = function() {
      for (var d = 0, f = new Array(256), g = 0; 256 != g; ++g) {
        d = g, d = 1 & d ? -306674912 ^ d >>> 1 : d >>> 1, d = 1 & d ? -306674912 ^ d >>> 1 : d >>> 1, d = 1 & d ? -306674912 ^ d >>> 1 : d >>> 1, d = 1 & d ? -306674912 ^ d >>> 1 : d >>> 1, d = 1 & d ? -306674912 ^ d >>> 1 : d >>> 1, d = 1 & d ? -306674912 ^ d >>> 1 : d >>> 1, d = 1 & d ? -306674912 ^ d >>> 1 : d >>> 1, d = 1 & d ? -306674912 ^ d >>> 1 : d >>> 1, f[g] = d
      }
      return "undefined" != typeof Int32Array ? new Int32Array(f) : f
    }(),
    b = function(g) {
      for (var j, k, h = -1, f = 0, d = g.length; f < d;) {
        j = g.charCodeAt(f++),j < 128 ? h = h >>> 8 ^ c[255 & (h ^ j)] : j < 2048 ? (h = h >>> 8 ^ c[255 & (h ^ (192 | j >> 6 & 31))], h = h >>> 8 ^ c[255 & (h ^ (128 | 63 & j))]) : j >= 55296 && j < 57344 ? (j = (1023 & j) + 64, k = 1023 & g.charCodeAt(f++), h = h >>> 8 ^ c[255 & (h ^ (240 | j >> 8 & 7))], h = h >>> 8 ^ c[255 & (h ^ (128 | j >> 2 & 63))], h = h >>> 8 ^ c[255 & (h ^ (128 | k >> 6 & 15 | (3 & j) << 4))], h = h >>> 8 ^ c[255 & (h ^ (128 | 63 & k))]) : (h = h >>> 8 ^ c[255 & (h ^ (224 | j >> 12 & 15))], h = h >>> 8 ^ c[255 & (h ^ (128 | j >> 6 & 63))], h = h >>> 8 ^ c[255 & (h ^ (128 | 63 & j))])
      }
      return h ^ -1
    };
  return String(b(a) >>> 0)
}

function request(url, params, cacheKey = ''){
  url = appConfig.api + url
  let header = {
    'X-Requested-With': 'XMLHttpRequest',
    'Version': Version
  }

  return Taro.request({
    url: url,
    data: params,
    header: header
  }).then(async (res) => {
    const { code } = res.data
    if (code !== 0) {
      return Promise.reject(res.data)
    }

    if(cacheKey){
      app.setCache(cacheKey, res.data)
    }

    return res.data
  }).catch((err) => {
    const defaultMsg = '请求异常'
    return Promise.reject({ message: defaultMsg, ...err })
  })
}

export default async function fetch(url, params = {}, cache = false) {
  params.ignoreCategory  = appConfig.ignoreCategory
  params.productModelId  = appConfig.productModelId
  params.productCategory = appConfig.productCategory
  params.showProduct     = appConfig.showProduct
  if(cache){
    let cacheKey = crc32(url + JSON.stringify(params))
    let data = app.getCache(cacheKey)
    if(data){
      return data;
    }else{
      return request(url, params, cacheKey)
    }
  }else{
    return request(url, params)
  }
}