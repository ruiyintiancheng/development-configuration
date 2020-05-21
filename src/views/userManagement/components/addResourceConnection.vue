<template>
  <div class="app-container">
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
                     @click="getOption">重置</el-button>
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
                   :rowCheck="true"
                   :tableOption="configData"
                   :pagenation="true"
                   noHeight>

      </basic-table>
    </div>

  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'

import { getSearchParam } from '@/utils/index'
import elDragDialog from '@/directive/el-dragDialog'
import { baseRequest } from '@/api/base'
const url = '/basic/functionManage/connection'
export default {
  directives: { elDragDialog },
  name: 'userManagementComponentsResourceConnection',
  components: {
    SearchForm,
    BasicTable
  },
  data() {
    return {
      configData: {}, // 模板数据
      tableVisible: false,
      searchToggle: true,
      tableToggle: true,
      updateFormData: null, // 弹框数据
      formVisible: false, // 弹框开关
      languageData: null, // 语言设置数据
      operateStatus: null, // 操作选项
      msgId: null, // 修改保存参数id
      dialogTitle: { // 弹框标题
        1: '资源选择'
      }
    }
  },
  created() {
    this.getOption()
  },
  methods: {
    searchOption() {
      this.$refs.basicTable.getData(url, this.$refs.searchForm.searchParam())
    },
    getOption() {
      baseRequest(url).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        const param = getSearchParam(result.formConfig)
        this.$refs.basicTable.getData(url, param)
      })
    },
    // 点击添加
    addOption() {
      this.operateStatus = 1
      this.tableVisible = true
    },
    // // 修改表单
    // updateOption(row) {
    //   this.operateStatus = 2
    //   this.msgId = row.msgId
    //   this.getUpdateForm(row)
    // },
    // // 获取添加表单
    // getAddForm() {
    //   if (this.updateFormData === null) {
    //     const param = { urlMode: 1 }
    //     baseRequest('/resource/addReturn', param).then(response => {
    //       response.data.item = {}
    //       const result = response.data
    //       result.formConfig = JSON.parse(result.formConfig)
    //       result.validator = JSON.parse(result.validator)
    //       this.updateFormData = result
    //       this.formVisible = true
    //       this.$nextTick(function() {
    //         this.$refs.updateFrom.clearValidate()
    //       })
    //     })
    //   } else {
    //     this.formVisible = true
    //     this.updateFormData.item = {}
    //     this.$nextTick(function() {
    //       this.$refs.updateFrom.clearValidate()
    //     })
    //   }
    // },
    // // 获取修改表单
    // getUpdateForm(row) {
    //   const param = { msgId: row.msgId }
    //   baseRequest('/resource/updateReturn', param).then(response => {
    //     const result = response.data
    //     result.formConfig = JSON.parse(result.formConfig)
    //     result.validator = JSON.parse(result.validator)
    //     this.updateFormData = result
    //     this.formVisible = true
    //     this.$nextTick(function() {
    //       this.$refs.updateFrom.clearValidate()
    //     })
    //   })
    // },
    // // 获取语言设置数据 打开弹框
    // getLanguageData(row) {
    //   this.operateStatus = 3
    //   this.msgId = row.msgId
    //   const param = { msgId: this.msgId }
    //   baseRequest('/i18n/getLanguageData', param).then(response => {
    //     this.languageData = response.data.item
    //     this.formVisible = true
    //   })
    // },
    // 保存操作
    saveOperate() {
      if (this.operateStatus === 1) {
        const param = this.$refs.updateFrom.getFormData()
        baseRequest('/basic/dicts/saveAdd', param).then(response => {
          this.searchOption()
          this.$Message.success('操作成功')
        })
      } else if (this.operateStatus === 2) {
        const param = this.$refs.updateFrom.getFormData()
        param.msgId = this.msgId
        baseRequest('/basic/dicts/saveUpdate', param).then(response => {
          this.searchOption()
          this.$Message.success('操作成功')
        })
      } else {
        const param = { item: this.languageData }
        baseRequest('/basic/dicts/saveUpdate', param).then(response => {
          this.searchOption()
          this.$Message.success('操作成功')
        })
      }
      this.formVisible = false
    },
    // 资源删除
    handleDelete(row) {
      this.$confirm('此操作将永久删除该资源, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const param = { resourceId: row.resourceId }
        baseRequest('/basic/resource/deleteResource', param).then(request => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      })
    }
  }
}
</script>

