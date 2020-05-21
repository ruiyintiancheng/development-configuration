<template>
  <div class="resouce-connection">
    <div class="base-row">
      <div class="row-botton clearfix">
        <div class="row-title">
          <svg-icon icon-class="search" />
          <span>筛选查询</span>
        </div>
        <div class="row-option">
          <el-button icon="el-icon-search"
                     @click="searchOption"
                     type="primary">查询</el-button>
          <el-button icon="el-icon-refresh"
                     @click="reset">重置</el-button>
          <a @click="searchToggle=false"
             v-if="searchToggle">
            <svg-icon icon-class="up" />&nbsp;收起</a>
          <a @click="searchToggle=true"
             v-else>
            <svg-icon icon-class="down" />&nbsp;展开</a>
        </div>
      </div>
      <search-form v-show="searchToggle"
                   ref="searchForm"
                   :inputCount="3"
                   :searchFormData="configData"></search-form>
    </div>
    <div class="base-row">
      <div class="row-botton clearfix">
        <div class="row-title">
          <svg-icon icon-class="ul" />
          <span>数据列表</span>
        </div>
        <div class="row-option">
          <el-button icon="el-icon-plus"
                     @click="addOption">添加</el-button>
          <a @click="tableToggle=false"
             v-if="tableToggle">
            <svg-icon icon-class="up" />&nbsp;收起</a>
          <a @click="tableToggle=true"
             v-else>
            <svg-icon icon-class="down" />&nbsp;展开</a>
        </div>
      </div>

      <basic-table v-show="tableToggle"
                   ref="basicTable"
                   :height="tableHeight"
                   :tableOption="configData"
                   :rowNum="true">
        <template slot="optionColumn">
          <el-table-column label="操作"
                           align="center"
                           width="200"
                           fixed="right">
            <template slot-scope="scope">
              <el-button type="primary"
                         plain
                         size="mini"
                         @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </template>
      </basic-table>
    </div>
    <el-dialog :title="dialogTitle[operateStatus]"
               append-to-body
               v-el-drag-dialog
               :visible.sync="tableVisible"
               :close-on-click-modal='false'
               width="60%"
               custom-class="dialog-default">
      <div class="dialog-contant-default">
        <div class="base-row">
          <div class="row-botton clearfix">
            <div class="row-title">
              <svg-icon icon-class="search" />
              <span>筛选查询</span>
            </div>
            <div class="row-option">
              <el-button icon="el-icon-search"
                         @click="searchOptionAdd"
                         type="primary">查询</el-button>
              <el-button icon="el-icon-refresh"
                         @click="addOption">重置</el-button>
              <a @click="resSelSearchToggle=false"
                 v-if="resSelSearchToggle">
                <svg-icon icon-class="up" />&nbsp;收起</a>
              <a @click="resSelSearchToggle=true"
                 v-else>
                <svg-icon icon-class="down" />&nbsp;展开</a>
            </div>
          </div>
          <search-form v-show="resSelSearchToggle"
                       ref="searchFormAdd"
                       :inputCount="3"
                       :searchFormData="configDataAdd"></search-form>
        </div>
        <div class="base-row">
          <div class="row-botton clearfix">
            <div class="row-title">
              <svg-icon icon-class="ul" />
              <span>数据列表</span>
            </div>
            <div class="row-option">
              <a @click="resSelTableToggle=false"
                 v-if="resSelTableToggle">
                <svg-icon icon-class="up" />&nbsp;收起</a>
              <a @click="resSelTableToggle=true"
                 v-else>
                <svg-icon icon-class="down" />&nbsp;展开</a>
            </div>
          </div>
          <basic-table v-show="resSelTableToggle"
                       ref="basicTableAdd"
                       :tableOption="configDataAdd"
                       :pagenation="true"
                       :height="tableHeight-30">
            <template slot="firstColumn">
              <el-table-column align="center"
                               width="50"
                               type="selection"
                               :selectable="selectableHandle">
              </el-table-column>
            </template>
          </basic-table>
        </div>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="tableVisible = false">关闭</el-button>
        <el-button type="primary"
                   @click="saveOperate()">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import elDragDialog from '@/directive/el-dragDialog'
import { baseRequest } from '@/api/base'
const url = '/basic/resource/selectByActionId'
const addUrl = '/basic/resource/selects'
export default {
  directives: { elDragDialog },
  name: 'userManagementComponentsResourceConnection',
  components: {
    SearchForm,
    BasicTable
  },
  props: {
    actionId: {
      type: [String, Number]
    }
  },
  data() {
    return {
      tableHeight: 0,
      configData: {}, // 模板数据
      configDataAdd: {}, // 模板数据
      configColumnData: {},
      tableVisible: false,
      searchToggle: true,
      searchToggleResource: true,
      tableToggle: true,
      searchColumnToggle: true,
      sourceVisible: false,
      updateFormData: null, // 弹框数据
      formVisible: false, // 弹框开关
      languageData: null, // 语言设置数据
      operateStatus: null, // 操作选项
      resSelSearchToggle: true, // 资源选择弹框开关
      resSelTableToggle: true, // 资源选择列表弹框开关
      msgId: null, // 修改保存参数id
      dialogTitle: { // 弹框标题
        1: '资源选择'
      },
      disabledId: []
    }
  },
  created() {
    this.getOption()
  },
  mounted() {
    this.$nextTick(function() {
      this.tableHeight = document.querySelector('.resouce-connection').offsetHeight - 190
    })
  },
  methods: {
    // 点击查询
    searchOption() {
      const param = this.$refs.searchForm.searchParam()
      param.actionId = this.actionId
      this.$refs.basicTable.getData(url, param)
    },
    // 初始化数据
    getOption() {
      baseRequest(url, { 'urlMode': '1' }).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        this.$nextTick(function() {
          this.searchOption()
        })
      })
    },
    // 保存操作
    saveOperate() {
      const param = this.$refs.basicTableAdd.getSelect()
      if (param.length > 0) {
        baseRequest('/basic/resource/addResourceAction', { actionId: this.actionId, resources: param }).then(response => {
          this.searchOptionAdd()
          this.searchOption()
          this.$Message.success('保存成功')
        })
      } else {
        this.$message({
          type: 'info',
          message: '至少选择一条数据!'
        })
      }
    },
    // 重置
    reset() {
      this.$refs.searchForm.resetForm()
    },
    // 资源删除
    handleDelete(row) {
      this.$confirm('此操作将永久删除该资源, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const param = { resourceId: row.resourceId }
        baseRequest('/basic/resource/deleteActionResource', param).then(request => {
          this.searchOption()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      })
    },

    // 点击添加
    addOption() {
      this.operateStatus = 1
      this.tableVisible = true
      baseRequest(addUrl, { 'urlMode': '1' }).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configDataAdd = result
        this.$nextTick(function() {
          this.searchOptionAdd()
        })
      })
    },
    // 点击查询
    searchOptionAdd() {
      baseRequest(url, { 'urlMode': '2', 'actionId': this.actionId }).then(response => {
        this.disabledId = []
        for (const it of response.data.item) {
          this.disabledId.push(it.resourceId)
        }
        const param = this.$refs.searchFormAdd.searchParam()
        param.resourceType = '1'
        this.$refs.basicTableAdd.getData(addUrl, param)
      })
    },
    selectableHandle(row, index) {
      for (const iterator of this.disabledId) {
        if (iterator === row.resourceId) {
          return false
        }
      }
      return true
    }
  }
}
</script>
<style type=""<style lang="scss">
.resouce-connection {
  height: 99%;
}
</style>
