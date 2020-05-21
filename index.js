// import resources from './src/views/resources'
// import functionManagement from './src/views/systemManagement/functionManagement'
// import codeManagement from './src/views/codeManagement'
// import permissionConfiguration from './src/views/permissionConfiguration'
// import cacheDef from './src/views/cacheDef'
// import validates from './src/views/validates'
// import scheduleDef from './src/views/scheduleDef'
// import event from './src/views/event'
// import resourceParams from './src/views/resourceParams'
// import vueParamsDef from './src/views/vueParamsDef'
// import configs from './src/views/configs'
// import customConfigDef from './src/views/customConfigDef'
// import monitorLog from './src/views/monitorLog'
// import sqlMonitoring from './src/views/resourceAccess/sqlMonitoring'
// import taskMonitoring from './src/views/systemManagement/taskManage/taskMonitoring'
// import serverInfo from './src/views/serverInfo'
// // 定义 Loading 对象
// const Loading = {
//   // install 是默认的方法。当外界在 use 这个组件的时候，就会调用本身的 install 方法，同时传一个 Vue 这个类的参数。
//   install: function(Vue) {
//     Vue.component('resources', resources)
//     Vue.component('functionManagement', functionManagement)
//     Vue.component('codeManagement', codeManagement)
//     Vue.component('permissionConfiguration', permissionConfiguration)
//     Vue.component('cacheDef', cacheDef)
//     Vue.component('validates', validates)
//     Vue.component('scheduleDef', scheduleDef)
//     Vue.component('event', event)
//     Vue.component('resourceParams', resourceParams)
//     Vue.component('vueParamsDef', vueParamsDef)
//     Vue.component('configs', configs)
//     Vue.component('customConfigDef', customConfigDef)
//     Vue.component('monitorLog', monitorLog)
//     Vue.component('sqlMonitoring', sqlMonitoring)
//     Vue.component('taskMonitoring', taskMonitoring)
//     Vue.component('serverInfo', serverInfo)
//   }
// }
// // 导出
// export default Loading
module.exports = function(path) {
  const arr = path.split('$developmentConfiguration')
  const component = arr[arr.length - 1]
  return function() {
    return import('./src/views' + component + '.vue')
  }
}
