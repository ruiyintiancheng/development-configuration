import { constantRouterMap, dashboardRouterMap } from '@/router'
const _import = require('@/router/_import_' + process.env.NODE_ENV)
import Layout from '@/views/layout/Layout'
import { deepClone, tranformStr, isRepeatComponent } from '@/utils/index'
// import { baseRequest } from '@/api/base'

/**
 * 设置访问路由的component对应的组件
 * @param {菜单数据} menuData
 */
function setBaseRouter(menuData, baseData, parentPath) {
  for (const item of menuData) {
    if (item.component && item.component !== '') {
      if (!isRepeatComponent(item.component)) {
        item.name = tranformStr(item.component)
      } else {
        item.name = tranformStr(item.path)
        item.meta.name = tranformStr(item.component)
      }
      try {
        item.component = _import(item.component)
      } catch (e) {
        item.component = _import('errorPage/404')
      }
    } else {
      item.component = _import('errorPage/404')
    }
    if (parentPath) {
      item.path = parentPath + '/' + item.path
    } else {
      item.path = item.path + ''
    }
    if (item.children && item.children.length > 0) {
      setBaseRouter(item.children, baseData, item.path)
    } else {
      baseData.push(item)
    }
  }
}

var leftDataMap = {} // 左侧菜单集合
/**
 * 设置顶层菜单 和左侧菜单集合
 * @param {原始数据} topData
 */
function setSideRouter(topData) {
  for (const item of topData) {
    item.path = item.path + ''
    item.name = item.path
    if (item.children && item.children[0] && item.children[0].meta.type === '2') {
      const children = item.children
      setleftIdToString(children)
      leftDataMap[item.name] = children
      item.path = ''
      delete item.children
    }
    if (item.children) {
      setSideRouter(item.children)
    }
  }
}

/**
 * 吧id改为String
 * @param {children集合} list
 */
function setleftIdToString(list) {
  for (const iterator of list) {
    iterator.path = iterator.path + ''
    if (iterator.children && iterator.children[0]) {
      setleftIdToString(iterator.children)
    }
  }
}

/**
 * 设置路由最外层layout组件
 * @param {数据菜单} menuData
 */
function setLayout(menuData) {
  const baseMenu = []
  for (const iterator of menuData) {
    const itemMenu = {
      path: '/',
      component: Layout,
      children: [
        iterator
      ]
    }
    baseMenu.push(itemMenu)
  }
  return baseMenu
}

/**
 * 设置左侧菜单的真实路径
 */
function getFathPath(leftRoutes, path) {
  for (const iterator of leftRoutes) {
    if (!iterator.meta.fathPath) {
      iterator.path = path + '/' + iterator.path
      iterator.meta.fathPath = true
    }
    if (iterator.children && iterator.children.length !== 0) {
      getFathPath(iterator.children, iterator.path)
    }
  }
}

const permission = {
  state: {
    routers: [],
    sideTitle: '', // 侧标题
    addRouters: [],
    topRouters: [],
    leftMap: {},
    leftRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    },
    CLEAR_ROUTERS: (state) => {
      state.routers = []
    },
    SET_TOP_ROUTERS: (state, routers) => {
      state.topRouters = dashboardRouterMap.concat(routers)
    },
    SET_LEFT_MAP: (state, map) => {
      state.leftMap = map
    },
    SET_LEFT_ROUTERS: (state, routers) => {
      state.leftRouters = routers
    },
    SET_SIDE_TITLE: (state, title) => {
      state.sideTitle = title
    }
  },
  actions: {
    // 设置侧标题
    setSideTitle({ commit }, titile) {
      return new Promise(resolve => {
        commit('SET_SIDE_TITLE', titile)
        resolve()
      })
    },
    GenerateLeftRoutes({ commit }, parmObj) {
      return new Promise(resolve => {
        getFathPath(parmObj.leftRoutes, parmObj.path)
        commit('SET_LEFT_ROUTERS', parmObj.leftRoutes)
        resolve()
      })
    },
    GenerateRoutes({ commit, state }, data) {
      return new Promise((resolve, reject) => {
        // baseRequest('/function/getMenu').then(response => {
        //   if (response.data.item[0] && response.data.item[0].children) {
        //     response.data.item[0].children.unshift({ 'path': 'dashboard', 'component': 'dashboard/index', 'meta': { 'icon': 'home', 'title': '首页', 'type': '2', 'hidden': true }})
        //   }
        //   const menuData = response.data.item
        //   const newData = deepClone(menuData)
        //   var baseData = [] // 路由数据数组
        //   setBaseRouter(menuData, baseData)
        //   const baseMenu = setLayout(baseData)
        //   commit('SET_ROUTERS', baseMenu)

        //   leftDataMap = {}
        //   setSideRouter(newData)
        //   commit('SET_TOP_ROUTERS', newData)
        //   commit('SET_LEFT_MAP', leftDataMap)
        //   resolve()
        // }).catch(error => {
        //   reject(error)
        // })
        const menuData =
        [{
          'path': 71,
          'component': null,
          'children': [{
            'path': 72,
            'component': null,
            'children': [
            ],
            'meta': {
              'icon': null,
              'title': '我的收藏',
              'type': '2'
            },
            'parentId': 71
          }],
          'meta': {
            'icon': 'home',
            'title': '我的工作台',
            'type': '1'
          },
          'parentId': 0
        }, {
          'path': 1,
          'component': null,
          'children': [{
            'path': 2,
            'component': null,
            'children': [{
              'path': 3,
              'component': 'resources/index',
              'meta': {
                'icon': null,
                'title': '资源管理',
                'type': '2'
              },
              'parentId': 2
            }, {
              'path': 4,
              'component': 'systemManagement/functionManagement/index',
              'meta': {
                'icon': null,
                'title': '功能管理',
                'type': '2'
              },
              'parentId': 2
            }, {
              'path': 5,
              'component': 'codeManagement/index',
              'meta': {
                'icon': null,
                'title': '代码管理',
                'type': '2'
              },
              'parentId': 2
            }, {
              'path': 6,
              'component': 'permissionConfiguration/index',
              'meta': {
                'icon': null,
                'title': '权限管理',
                'type': '2'
              },
              'parentId': 2
            }, {
              'path': 8,
              'component': 'cacheDef/index',
              'meta': {
                'icon': null,
                'title': '缓存管理',
                'type': '2'
              },
              'parentId': 2
            }, {
              'path': 9,
              'component': 'validates/index',
              'meta': {
                'icon': null,
                'title': '验证器',
                'type': '2'
              },
              'parentId': 2
            }, {
              'path': 10,
              'component': 'queryComponent/index',
              'meta': {
                'icon': null,
                'title': '查询组件',
                'type': '2'
              },
              'parentId': 2
            }, {
              'path': 11,
              'component': 'scheduleDef/index',
              'meta': {
                'icon': null,
                'title': '定时任务',
                'type': '2'
              },
              'parentId': 2
            }, {
              'path': 12,
              'component': 'event/index',
              'meta': {
                'icon': null,
                'title': '事件管理',
                'type': '2'
              },
              'parentId': 2
            }, {
              'path': 13,
              'component': 'clientCache/index',
              'meta': {
                'icon': null,
                'title': '客户端缓存',
                'type': '2'
              },
              'parentId': 2
            }, {
              'path': 87,
              'component': 'resourceParams/index',
              'meta': {
                'icon': null,
                'title': '资源参数',
                'type': '2'
              },
              'parentId': 2
            }, {
              'path': 88,
              'component': 'vueParamsDef/index',
              'meta': {
                'icon': null,
                'title': 'VUE参数',
                'type': '2'
              },
              'parentId': 2
            }, {
              'path': 89,
              'component': 'configs/index',
              'meta': {
                'icon': null,
                'title': '系统参数',
                'type': '2'
              },
              'parentId': 2
            }, {
              'path': 99,
              'component': 'customConfigDef/index',
              'meta': {
                'icon': null,
                'title': '用户自定义配置',
                'type': '2'
              },
              'parentId': 2
            }, {
              'path': 100,
              'component': 'dataType/index',
              'meta': {
                'icon': null,
                'title': '数据类型',
                'type': '2'
              },
              'parentId': 2
            }],
            'meta': {
              'icon': null,
              'title': '系统配置',
              'type': '2'
            },
            'parentId': 1
          }, {
            'path': 13,
            'component': null,
            'children': [{
              'path': 14,
              'component': 'monitorLog/index',
              'meta': {
                'icon': null,
                'title': '系统日志',
                'type': '2'
              },
              'parentId': 13
            }, {
              'path': 15,
              'component': 'resourceAccess/sqlMonitoring',
              'meta': {
                'icon': null,
                'title': 'SQL监控',
                'type': '2'
              },
              'parentId': 13
            }, {
              'path': 16,
              'component': 'systemManagement/taskManage/taskMonitoring/index',
              'meta': {
                'icon': null,
                'title': '资源监控',
                'type': '2'
              },
              'parentId': 13
            }, {
              'path': 17,
              'component': 'serverInfo/index',
              'meta': {
                'icon': null,
                'title': '服务器信息',
                'type': '2'
              },
              'parentId': 13
            },
            {
              'path': 1776,
              'component': 'newPart/index',
              'meta': {
                'icon': null,
                'title': 'sql查询',
                'type': '2'
              },
              'parentId': 13
            },
            {
              'path': 1777,
              'component': 'cacheData/index',
              'meta': {
                'icon': null,
                'title': '客户端缓存',
                'type': '2'
              },
              'parentId': 13
            }],
            'meta': {
              'icon': null,
              'title': '系统监控',
              'type': '2'
            },
            'parentId': 1
          }],
          'meta': {
            'icon': 'dashboard',
            'title': '开发配置',
            'type': '1'
          },
          'parentId': 0
        }]
        const newData = deepClone(menuData)
        var baseData = [] // 路由数据数组
        setBaseRouter(menuData, baseData)
        const baseMenu = setLayout(baseData)
        commit('SET_ROUTERS', baseMenu)

        leftDataMap = {}
        setSideRouter(newData)
        commit('SET_TOP_ROUTERS', newData)
        commit('SET_LEFT_MAP', leftDataMap)
        resolve()
      })
    }
  }
}

export default permission
