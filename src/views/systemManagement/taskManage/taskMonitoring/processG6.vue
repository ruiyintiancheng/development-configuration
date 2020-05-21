<template>
  <div id="flowChart">

  </div>
</template>
<script>
import { baseRequest } from '@/api/base'
export default {
  currentFun: '',
  directives: {},
  name: 'processG6Index',
  components: {},
  mounted() {
    this.initG6()
    baseRequest('/basic/taskManage/flowChartedges2').then(response => {
      const result = response.data
      console.log(result.item)
      this.net.source(result.item.nodes, result.item.edges) // 添加节点和线
      this.net.render() // 渲染
      this.net.autoZoom() // 自动缩放
      //   this.net.changeMode('drag') // 拖拽模式
    })
  },
  data() {
    return {
      net: '',
      Util: '',
      workflowName: ''
    }
  },
  methods: {
    initG6() {
      const self = this
      self.Util = window.G6.Util
      self.net = new window.G6.Net({
        id: 'flowChart', // 容器ID
        mode: 'none',
        modes: { none: ['dragCanvas'] },
        grid: {
          forceAlign: true, // 是否支持网格对齐
          cell: 25 // 网格大小
        },
        // width: 500, // 画布宽
        height: window.innerHeight - 200 // 画布高
      })
      // 双击事件
      self.net.on('dblclick', (ev) => {
        if (self.Util.isNode(ev.item)) {
          var param = {
            url: '/logManage/selects',
            title: '日志'
          }
          this.$emit('open-dialog', param) // 调用父节点的 打开弹窗方法
          window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty()
        }
      })

      // 流程方形 节点创建
      // 流程方形 节点创建
      window.G6.registerNode('processRect', {
        draw: function(cfg, group) {
          var model = cfg.model
          var color = model.color
          var keyShape
          keyShape = group.addShape('rect', {
            attrs: {
              x: cfg.x - 75,
              y: cfg.y - 30,
              width: 150,
              height: 60,
              fill: 'white',
              radius: 15,
              stroke: '#999'
            }
          })
          group.addShape('rect', {
            attrs: {
              x: cfg.x - 75,
              y: cfg.y - 30,
              width: 150,
              height: 40,
              fill: color,
              clip: keyShape
            }
          })
          group.addShape('text', { // 标题
            attrs: {
              x: cfg.x,
              y: cfg.y + 2,
              text: cfg.model.title,
              textBaseline: 'bottom',
              textAlign: 'center',
              fontSize: 20,
              fill: 'white'
            }
          })
          group.addShape('text', { // 副标题
            attrs: {
              x: cfg.x,
              y: cfg.y + 10,
              text: cfg.model.subtitle,
              textBaseline: 'top',
              textAlign: 'center',
              fontSize: 12,
              fill: 'black'
            }
          })
          return keyShape
        },
        getAnchorPoints: function() { // 锚点位置
          return [
            [0.5, 1],
            [1, 0.5],
            [0, 0.5],
            [0.5, 0]
          ]
        }
      })
      window.G6.registerNode('startRect', {
        draw: function(cfg, group) {
          var keyShape
          keyShape = group.addShape('rect', {
            attrs: {
              x: cfg.x - 75,
              y: cfg.y - 30,
              width: 150,
              height: 60,
              fill: cfg.model.color,
              radius: 15
            }
          })
          group.addShape('text', { // 标题
            attrs: {
              x: cfg.x,
              y: cfg.y - 20,
              text: cfg.model.title,
              textBaseline: 'top',
              textAlign: 'center',
              fontSize: 25,
              fill: 'white'
            }
          })
          return keyShape
        },
        getAnchorPoints: function() { // 锚点位置
          return [
            [0.5, 1],
            [0.5, 0]
          ]
        }
      })
      self.net.render()
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
#flowChart {
  border: 1px solid #ebeef5;
  position: relative;
  overflow: hidden;
}
.operating {
  position: absolute;
  z-index: 99;
  background-color: #ffffff;
  padding: 20px 10px;
  box-shadow: 1px 1px 4px 0 #0a0a0a2e;
  width: 200px;
  height: 250px;
}
.info {
  position: absolute;
  right: 0;
  z-index: 99;
  box-shadow: 1px 1px 4px 0 #0a0a0a2e;
  .title {
    height: 40px;
    padding-left: 10px;
    border-top: 1px solid #dce3e8;
    border-bottom: 1px solid #dce3e8;
    border-left: 1px solid #dce3e8;
    background: rgb(235, 238, 242);
    line-height: 40px;
    span {
      font-size: 14px;
    }
  }
  .content {
    background: rgba(247, 249, 251, 0.45);
    width: 200px;
    height: 800px;
    border-left: 1px solid #e6e9ed;
    padding: 10px;
  }
}
div.g6-html-node-container {
  border: 0 solid #fff !important;
}
div .rect {
  font-size: 12px;
  text-align: center;
  display: inline-block;
  line-height: 30px;
  width: 40px;
  height: 30px;
}
</style>