<template>
  <!--流程图画布 -->
  <div id="flowChart">
    <div class="operating"
         :style="{display:operaterShow}"
         style="position:fixed">
      <div class="btn-group"
           id="divId">
        <div class="btn node"
             @click="insertShape('image')"
             title="起始节点">
          <svg-icon icon-class="yuanxing" />
        </div>
        <div class="btn node"
             @click="insertShape('processRect')"
             title="流程节点">
          <svg-icon icon-class="fangxing" />
        </div>
      </div>
      <div class="btn-group">
        <div class="btn actived line"
             @click="draw('arrow')"
             title="箭头直线">
          <svg-icon icon-class="zhixianjiantou" />
        </div>
        <div class="btn line"
             @click="draw('polyLineFlow')"
             title="箭头折现">
          <svg-icon icon-class="zhexian" />
        </div>
      </div>
      <div class="btn-group">
        <div class="btn mode actived"
             @click="changeMode('edit')"
             title="选择模式">
          <svg-icon icon-class="mouse" />
        </div>
        <div class="btn mode"
             @click="changeMode('drag')"
             title="拖拽模式">
          <svg-icon icon-class="cross" />
        </div>
      </div>
      <div class="btn-group">
        <div class="btn delete"
             @click="del"
             style="margin-top: 5px;"
             title="删除">
          <svg-icon icon-class="delete" />
        </div>
        <div class="btn save"
             @click="save"
             title="保存">
          <svg-icon icon-class="save" />
        </div>
      </div>
      <div style="height:20px"></div>
      <div class="btn-group">
        <el-input size="mini"
                  v-model="workflowName"
                  placeholder="请输入流图名称..."></el-input>
      </div>
    </div>
    <div class="operating"
         @click="hiddenOperaterMenu()"
         ref="hiddenDiv"
         style="position:fixed;margin-left:0;width:20px;line-height: 200px;cursor:pointer;">
      <div style="margin-left:-10px;">
        {{btn}}
      </div>
    </div>
    <editDialog :param='param'
                ref="editDialog"
                @update-value="saveData"
                @delete-node="deleteNode"></editDialog>
  </div>
  <!-- <div class="info" style='display:none'>
            <div class="title">
                <span>{{infoTitle}}属性</span>
            </div>
            <div class="content">
                <el-checkbox v-if="isBlank === true" v-model="checked">网格对齐</el-checkbox>
                <el-form v-else label-position="left" label-width="80px">
                <el-form-item v-if="isNode === true" label="名称">
                    <el-input size="mini" v-model="name"></el-input>
                </el-form-item>
                <el-form-item v-if="isEdge === true" label="行为名称">
                    <el-input size="mini" v-model="behavior"></el-input>
                </el-form-item>
                <el-form-item label="颜色" v-if="isEdge === true">
                    <el-color-picker v-model="color"></el-color-picker>
                </el-form-item>
                </el-form>
            </div>
        </div> -->
</template>
<script>
var currentEdge = 'arrow' // 箭头直线
import { registG6Shape } from '@/utils/g6Shape'
import editDialog from './dialog'
import { baseRequest } from '@/api/base'
export default {
  currentFun: '',
  directives: {},
  name: 'taskConfigurationProcessG6',
  components: {
    editDialog
  },
  mounted() {
    this.initG6()
    const btns = document.querySelectorAll('.btn-group .btn')
    btns.forEach((val, index) => {
      const btn = val.classList
      val.addEventListener('click', function() {
        // btns.forEach((value, index) => { value.classList.remove('actived') })
        if (!btn.contains('delete') && !btn.contains('save')) {
          if (btn.contains('line')) {
            const lines = document.querySelectorAll('.btn.line')
            lines.forEach((value, index) => { value.classList.remove('actived') })
          } else if (btn.contains('mode')) {
            const modes = document.querySelectorAll('.btn.mode')
            modes.forEach((value, index) => { value.classList.remove('actived') })
          } else if (btn.contains('node')) {
            const nodes = document.querySelectorAll('.btn.node')
            nodes.forEach((value, index) => { value.classList.remove('actived') })
          }
          btn.add('actived')
        }
      }, false)
    })
    baseRequest('/basic/taskManage/flowChartedges').then(response => { // 线
      const result = response.data
      //   this.sourceData = result.item
      this.gridChange = true //  网格改变触发 添加事件,需要变量来解决弹窗事件
      this.net.source(result.item.nodes, result.item.edges)
      this.net.render()
      this.gridChange = false
      // this.net.autoZoom()
    })
  },
  created() {
  },
  props: {
  },
  data() {
    return {
      name: '',
      behavior: '', // 线行为名称
      color: '',
      net: '',
      Util: '',
      workflowName: '',
      activation: '', // 当前激活的节点
      isNode: false, // 当前是节点
      isEdge: false,
      isBlank: true, // 当前是空白区
      checked: true, // 网格对齐
      gridChange: false, // 网格对其按钮发生改变
      infoTitle: '画布', // 属性标题
      oldColor: '', // 获取节点本身颜色
      type: '', // 有值为编辑状态
      operaterShow: 'none',
      btn: '》',
      param: {}
    }
  },
  methods: {
    initG6() {
      const self = this
      self.Util = window.G6.Util
      self.net = new window.G6.Net({
        id: 'flowChart', // 容器ID
        mode: 'edit',
        grid: {
          forceAlign: true, // 是否支持网格对齐
          cell: 25 // 网格大小
        },
        fitView: 'cc', // 布局
        // width: '100', // 画布宽
        height: window.innerHeight - 220 // 画布高
      })
      /** 点击节点*/
      self.net.on('itemclick', function(ev) {
        self.isNode = self.Util.isNode(ev.item) // 是否为Node
        self.activation = ev.item
        self.name = ev.item._attrs.model.title
        if (self.isNode) {
          self.infoTitle = '节点'
          self.isEdge = false
        } else {
          self.isEdge = true
          self.infoTitle = '边'
        }
        self.color = self.oldColor
      })
      self.net.on('click', (ev) => {
        if (!self.Util.isNull(ev.item)) {
          self.isBlank = false
        } else {
          self.isEdge = false
          self.isBlank = true
          self.infoTitle = '画布'
        }
      })
      // 双击事件
      self.net.on('dblclick', (ev) => {
        if (self.Util.isNode(ev.item)) {
          self.activation = ev.item
          self.param.obj = ev.item._attrs.model
          self.$refs.editDialog.openDialog() // 显示弹窗
        }
      })
      /**
       * 鼠标移入移出事件改变颜色
       */
      self.net.on('itemmouseenter', ev => {
        const item = ev.item
        // self.oldColor = item.get('model').color // 获取节点颜色
        self.oldColor = ev.item._attrs.model.color
        self.net.update(item, {
          color: '#108EE9'
        })
        self.net.refresh()
      })
      self.net.on('itemmouseleave', ev => { // 子项鼠标离开事件
        const item = ev.item
        self.net.update(item, {
          color: self.oldColor
        })
        self.net.refresh()
      })
      /**
       * 鼠标放到锚点上 触发画线函数 */
      var dragging = true
      self.net.on('mousedown', function(ev) {
        dragging = false
      })
      self.net.on('mouseup', ev => {
        dragging = true
      })
      self.net.on('mouseenter', function(ev) {
        var shape = ev.shape
        if (shape && shape.hasClass('anchor-point') && dragging) {
          self.net.beginAdd('edge', {
            shape: currentEdge
          })
        }
      })
      self.net.on('mouseleave', function(ev) {
        var shape = ev.shape
        if (shape && shape.hasClass('anchor-point') && dragging) {
          self.net.changeMode('edit')
        }
      })
      /** 图形添加时 监听事件 */
      self.net.on('itemadd', (ev) => {
        if (!this.gridChange) { // 判断是否是网格改变造成的添加
          self.isNode = self.Util.isNode(ev.item)
          if (self.isNode) {
            if (ev.item.getModel().shape === 'startRect') {
              ev.item.getModel().title = '开始'
            } else {
              self.activation = ev.item
              self.param.isAdd = true
              self.param.obj = {} // 将参数置空
              self.$refs.editDialog.openDialog() // 将弹窗显示
            }
          }
        }
      })
      // 注册节点形状
      registG6Shape()
      // 流程方形 节点创建
      self.net.render()
    },
    insertShape(shape) {
      this.net.beginAdd('node', {
        shape: shape,
        color: '#228ACC'
      })
    },
    saveData(obj) { // 更新数据
      this.net.update(this.activation, {
        title: obj.title,
        subtitle: obj.subtitle
      })
    },
    deleteNode() {
      this.net.remove(this.activation) // 移除 当前节点
      // 取消所有激活状态的 按钮
      const nodes = document.querySelectorAll('.btn.node')
      nodes.forEach((value, index) => { value.classList.remove('actived') })
    },
    draw(operate) {
      currentEdge = operate
    },
    changeMode(mode) { // 拖拽与编辑模式的切换
      this.net.changeMode(mode)
    },
    del() { // 删除
      this.net.del()
    },
    save() { // 保存
      /* 验证流图名称*/
      if (this.workflowName !== '') {
        const data = this.net.save()
        if (data.source.nodes.length === 0) {
          this.$message({ type: 'error', message: '流图内容不能为空' })
          return false
        }
        /* 验证节点名称*/
        for (const item of data.source.nodes) {
          if (item.title === '' || item.title === null || item.title === undefined) {
            this.$message({ type: 'error', message: '节点名称不能为空' })
            return false
          }
        }
        data.source['name'] = this.workflowName
        /* let json = JSON.stringify(data, null, 2);*/
        console.log(JSON.stringify(data, null, 2))
        // this.$emit('saveData', data.source, this.type)
      } else {
        this.$message({ type: 'error', message: '流图名称不能为空' })
      }
      /* console.log(saveData, json);*/
    },
    hiddenOperaterMenu() { // 隐藏操作菜单
      if (this.operaterShow === 'none') {
        this.operaterShow = 'block'
        this.btn = '《'
        this.$refs.hiddenDiv.style.marginLeft = '200px'
      } else {
        this.operaterShow = 'none'
        this.btn = '》'
        this.$refs.hiddenDiv.style.marginLeft = '0'
      }
    }
  },
  watch: {
    /**
       * 监听输入框
       */
    name: function() {
      this.update()
    },
    behavior: function() {
      this.update()
    },
    color: function() {
      this.update()
    },
    /**
       * 网格切换
       */
    checked: function() {
      this.gridChange = true // 网格改变触发 添加事件,需要变量来解决弹窗事件
      const _saveData = this.net.save()
      this.net.destroy() // 销毁画布
      this.initG6()
      this.net.read(_saveData)
      this.net.render()
      this.gridChange = false
    },
    sourceData: function() {
      this.gridChange = true //  网格改变触发 添加事件,需要变量来解决弹窗事件
      this.net.destroy() //  销毁画布
      this.initG6()
      this.net.source(this.sourceData.nodes, this.sourceData.edges)
      this.net.render()
      this.gridChange = false
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

.btn-group {
  // border-right: 1px solid #efefef;
  // display: inline-block;
  padding-left: 10px;
  padding-right: 14px;
  &:last-of-type {
    border-right: 0;
  }
  .btn {
    display: inline-block;
    margin: 2px;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    cursor: pointer;
    color: #a6a6a8;
    border: 1px solid rgba(233, 233, 233, 0);
    i {
      font-size: 20px;
    }
    &:hover {
      border: 1px solid #e9e9e9;
      color: #767a85;
      border-radius: 2px;
      background: #fafafe;
    }
  }
  .btn.actived {
    border: 1px solid #e9e9e9;
    color: #767a85;
    border-radius: 2px;
    background: #fafafe;
  }
  .el-form-item {
    margin-bottom: 0 !important;
  }
}
div.g6-html-node-container {
  border: 0 solid #fff !important;
}
</style>