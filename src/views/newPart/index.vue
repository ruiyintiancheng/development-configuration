<template>
  <div class="app-container"
       style="margin-left:5px;">
    <div class="my-col"
         :style="{'width': leftWidth + 'px'}">
      <div class="row-botton clearfix">
        <div class="row-title">
          <svg-icon icon-class="tree" />
          <span>数据源树</span>
        </div>
      </div>
      <el-input placeholder="筛选"
                v-model="filterText"
                style="padding:5px 10px;width:85%;"></el-input>
      <el-tree class="filter-tree"
               :filter-node-method="filterNode"
               :data="treeData"
               :props="treeOption"
               default-expand-all
               :expand-on-click-node="false"
               @node-contextmenu="rightClick"
               empty-text=""
               ref="tree2">
      </el-tree>
    </div>
    <div class="my-col my-col-button"
         style="width: 20px; position: relative;">
      <div class="botton-body">
        <el-button @click="leftArrowRight"
                   v-show="!openLeft"
                   type="text"
                   icon="el-icon-d-arrow-right"
                   style="margin-left: 0;"></el-button>
        <el-button @click="leftArrowLeft"
                   v-show="openLeft"
                   type="text"
                   icon="el-icon-d-arrow-left"
                   style="margin-left: 0;"></el-button>
      </div>
    </div>
    <div class="my-col"
         v-centerw="{leftWidth}">
      <div class="sqlWindow">
        <el-tabs v-model="editableTabsValue2"
                 type="card"
                 closable
                 @tab-remove="removeTab"
                 @tab-click="switchTabs">
          <el-tab-pane v-for="(demo, index) in editableTabs2"
                       :key="demo.name"
                       :label="demo.title"
                       :name="demo.name"
                       style="margin:0">
            <tab :code="demo.name"
                 :ref="index"
                 :id="demo.name"
                 :dataSourceCondition='demo'>
            </tab>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <el-popover placement="bottom"
                trigger="manual"
                v-model="visible">
      <el-menu show-timeout=0
               class="el-menu-vertical-demo"
               @select="selectOption">
        <el-menu-item index="1"
                      style="height: 30px;line-height: 30px;">
          <span slot="title">新建</span>
        </el-menu-item>
      </el-menu>
    </el-popover>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'
import elDragDialog from '@/directive/el-dragDialog'
import sqlInput from './components/sqlInput'
import tab from './components/tab'
// const url = '/sqlExecute/selectBySql'// 执行sql
// const url = '/resource/selectBySql'// 执行sql
const dataSourceUrl = '/basic/sqlExecute/getDataSourceByName'
// const dataSourceUrl = '/dataResources/getTrees'
// const dataSourceUrl = '/dataResources/getDataSourceInfo'
const userUrl = '/basic/source/getUsers'
const tableUrl = '/basic/source/getTables'
export default {
  directives: {
    elDragDialog,
    centerw: {
      update: function(el, binding) {
        const reduceWidth = binding.value.leftWidth + 21
        el.style.width = 'calc(100% - ' + reduceWidth + 'px'
      }
    }
  },
  name: 'newPartIndex',
  components: {
    SearchForm,
    BasicTable,
    sqlInput,
    tab
  },
  data() {
    return {
      filterText: '',
      treeData: [], // 树数据
      defaultProps: { // 树对应关系
        children: 'children',
        label: 'label'
      },

      openLeft: true, // 数据源展开
      leftWidth: 300, // 数据源宽度

      dialogSourceVisible: false,
      dialogSourceUserVisible: false,
      dialogSourceTableVisible: false,
      dialogSourceColumnVisible: false,
      nodeType: '1',
      containHeight: null,
      // sql输入框参数的配置开始
      // 数据值
      tableData: [], // 查询结果数据

      sqlNow: null, // 当前操作的sql
      tableDataList: {}, // 查询结果历史数据
      treeOption: { // 树的配置信息
        label: 'name'
      },
      rightClickDialogVisible: false, // 右键面板
      rightClickDialogleft: null,
      rightClickDialogtop: null,
      visible: false,
      selectDataSource: null,
      // 标签的
      editableTabsValue2: '1',
      // editableTabs2: [{
      //   title: 'Tab 1',
      //   name: '1',
      //   content: 'Tab 1 content'
      // }],
      editableTabs2: [

      ],
      tabIndex: 1
    }
  },
  created() {
    this.containHeight = this.$store.state.app.containHeight - 16

    this.getTrees()
    var self = this
    document.querySelector('body').onclick = function() {
      self.visible = false
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val)
    }
  },
  mounted() {
    this.editableTabs2 = []
  },
  methods: {
    // sql的格式化
    formaterSql() {
      this.$refs.sql.formatter()
    },
    getTrees(dataSourceName) {
      var params = { dataSourceName: null }
      baseRequest(dataSourceUrl, params).then(response => {
        this.treeData = response.data.item
      })
    },
    // 重置
    reset(id) {
      this.$refs.searchForm.resetForm()

      document.getElementById(id)
    },
    dialogFormSubmit() {
      if (this.nodeType === '1') {
        this.dialogSourceVisible = false
      } else if (this.nodeType === '2') {
        this.dialogSourceUserVisible = false
      } else {
        this.dialogSourceTableVisible = false
      }
      this.$message({
        type: 'success',
        message: '保存成功!'
      })
    },
    // 点击树切换数据
    handleNodeClick(data) {
      const type = data.type
      this.nodeType = type
      if (type === '1') {
        // this.getOption()
      } else if (type === '2') {
        baseRequest(userUrl).then(response => {
          const result = response.data
          result.formConfig = JSON.parse(result.formConfig)
          result.tableConfig = JSON.parse(result.tableConfig)
          this.configData = result
          const param = getSearchParam(result.formConfig)
          this.$refs.basicTable.getData(userUrl, param)
        })
      } else {
        baseRequest(tableUrl).then(response => {
          const result = response.data
          result.formConfig = JSON.parse(result.formConfig)
          result.tableConfig = JSON.parse(result.tableConfig)
          this.configData = result
          const param = getSearchParam(result.formConfig)
          this.$refs.basicTable.getData(tableUrl, param)
        })
      }
    },
    filterNode(value, data) { // 树的查询
      if (!value) return true
      return data[this.treeOption.label].indexOf(value) !== -1
    },

    rightClick(data, row) { // 数据源右键事件
      if (row.name === '数据源') {
        return
      }
      this.selectDataSource = row
      this.visible = true
      this.$nextTick(function() {
        var tooltip = document.querySelector('.el-popover')
        tooltip.style.left = data.clientX + 'px'
        tooltip.style.top = data.clientY + 'px'
        tooltip.style.padding = '5px'
      })
    },
    selectOption(index) {
      if (index === '1') {
        this.addTab(this.editableTabsValue2)
      }
    },
    addTab(targetName) { // 添加标签
      var newTabName = ++this.tabIndex + ''
      this.editableTabs2.push({// 标签中需要带的属性
        title: this.selectDataSource.name, // 数据源的名称
        name: newTabName,
        datSourceType: this.selectDataSource.datSourceType, // 数据源的类型
        dataSourceCode: this.selectDataSource.dataSourceCode, // 数据源的编号,后台通过这个属性进行数据源的识别
        dataSourceName: this.selectDataSource.dataSourceName, // 数据源名称
        sqlMessage: '', // sql 执行返回消息
        content: 'New Tab content',
        sqlShow: true,
        tableShow: false
      })
      this.editableTabsValue2 = newTabName
      // 添加标签,在查询结果历史对象中添加空数据
      this.tableDataList[this.editableTabsValue2] = {
        tableData: null,
        tableHead: null,
        sqlNow: null,
        datasourceMessage: this.selectDataSource
      }
      this.tableData = null
      this.tableHead = null
      this.sqlNow = ''
      this.resultMessage = ''
    },
    removeTab(targetName) { // 删除标签
      var tabs = this.editableTabs2
      let activeName = this.editableTabsValue2
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }
      this.editableTabsValue2 = activeName
      this.editableTabs2 = tabs.filter(tab => tab.name !== targetName)
      // 删除标签,清除查询结果历史对象的对应内容
      delete this.tableDataList[this.editableTabsValue2]
    },
    switchTabs(tabs) { // 切换标签
      this.tableData = this.tableDataList[tabs.name].tableData
      this.tableHead = this.tableDataList[tabs.name].tableHead
      this.resultMessage = this.tableDataList[tabs.name].resultMessage
      // this.sqlNow = this.tableDataList[ tabs.name].sqlNow
    },
    leftArrowLeft() { // 数据源收缩
      this.leftWidth = 0
      this.openLeft = !this.openLeft
    },
    leftArrowRight() { // 数据源展开
      this.leftWidth = 300
      this.openLeft = !this.openLeft
    }
  }
}
</script>
<style scoped>
.app-container .code-tree {
  margin-top: 5px;
  overflow: auto;
  position: relative;
  border: 1px solid #e4e4e4;
}
.app-container .sqlWindow .base-row-self {
  margin: 5px 0;
}
.app-container .sqlWindow {
  margin: 5px 15px;
}
.is-top {
  margin: 5px 15px;
  margin-left: 60px;
}
.app-container .sqlWindow .tableList {
  margin: 0;
}
/* .sqlButton{
      margin-right: 0px;

    } */
.app-container .sqlWindow .sqlArea .sql-button {
  text-align: right;
  padding: 5px;
}
.my-col {
  height: 100%;
  float: left;
  overflow: hidden;
  transition: width 0.28s linear 0s;
}
.my-col-button {
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
}
.botton-body {
  width: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}
</style>
