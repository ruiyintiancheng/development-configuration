<template>
  <div class="monitor-log">
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
                   :tableOption="configData"
                   :pagenation="true"
                   :rowNum="true">
        <template slot="firstColumn">
          <el-table-column fixed="left"
                           width="150"
                           label="日志ID"
                           align="center">
            <template slot-scope="scope">
              <el-button type="text"
                         size="mini"
                         @click="seeView(scope.row)">{{scope.row.log_id}}</el-button>
            </template>
          </el-table-column>
        </template>

        <el-table-column slot="optionColumn"
                         label="日志信息"
                         align="center"
                         :width="250">
          <template slot-scope="scope">{{formatLogMsg(scope.row)}}</template>
        </el-table-column>
      </basic-table>
    </div>
    <el-dialog title="详细信息"
               :visible.sync="formVisible"
               :close-on-click-modal='false'
               v-el-drag-dialog
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default">
        <update-form ref="updateFrom"
                     :updateFormData="updateFormData"></update-form>
        <el-form ref="form"
                 :model="item"
                 label-position="left"
                 label-width="100px"
                 class="baseUpdate-form">
          <el-form-item prop="logMsg"
                        label="日志信息">
            <el-input class="form-input"
                      type="textarea"
                      rows="6"
                      readonly="readonly"
                      v-model="item.logMsg"
                      clearable>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import UpdateForm from 'update-form-ry'
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'
const url = '/basic/logs/selectMonitorLog'
export default {
  name: 'monitorLogIndex',
  components: {
    SearchForm,
    BasicTable,
    UpdateForm
  },
  data() {
    return {
      item: {
        logMsg: ''
      },
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      updateFormData: null, // 弹框数据
      formVisible: false // 弹框开关
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
      baseRequest(url, { urlMode: '1' }).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        const param = getSearchParam(result.formConfig)
        this.$refs.basicTable.getData(url, param)
      })
    },
    // 展示日志信息
    seeView(row) {
      this.getSeeView(row)
    },
    // 获取日志信息
    getSeeView(row) {
      const param = { logId: row.log_id }
      baseRequest('/basic/logs/getMonitorLog', param).then(response => {
        const result = response.data
        this.item.logMsg = result.item.log_msg
        result.formConfig = JSON.parse(result.formConfig)
        this.updateFormData = result
        this.formVisible = true
        this.$nextTick(function() {
          this.$refs.form.clearValidate()
          this.$refs.updateFrom.clearValidate()
        })
      })
    },
    // 格式化日志信息
    formatLogMsg(row) {
      const logMsg = row.log_msg
      const newLogMsg = logMsg.substring(0, 40)
      return newLogMsg + '...'
    }
  }
}
</script>
<style lang="scss">
.monitor-log {
  .baseUpdate-form {
    margin-left: calc(50% - 150px);
    .form-input,
    .el-date-editor.el-input.form-input {
      width: 205px;
    }
  }
}
</style>
