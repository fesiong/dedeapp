var cacheData = {};

export default {
    getCache: (t:string) => {
        return cacheData[t]
    },

    setCache: (t:string, a:any) => {
        cacheData[t] = a
    },
}