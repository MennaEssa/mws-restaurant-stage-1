"undefined"!=typeof indexedDB?module.exports=require("./idb.js"):module.exports={open:function(){return Promise.reject("IDB requires a browser environment")},delete:function(){return Promise.reject("IDB requires a browser environment")}};