/**
 * Hanhan
 * My Script
 */

 'use strict'

 const urlFor = require('hexo-util').url_for.bind(hexo)
 
 function queryGenshin (args) {
   const data = args[0]
 
   return `
   <script type="text/javascript" src="/js/jquery-1.8.3.js"></script>
   <script type="text/javascript" src="/js/hanhan.js"></script>
   <div class="genshin-query">
    <input type="text" id="genshin-uid"/ placeholder="${data}">
    <button class="genshin-query-button" onclick="getGenshinUID(${data})">查询原神面板</button>
   </div>
   `
 }
//  <a href="https://enka.network/u/${uid}" target="_blank">
//  </a>
 hexo.extend.tag.register('queryGenshin', queryGenshin)