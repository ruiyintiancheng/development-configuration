<template>
  <el-dialog title="查看日志"
             append-to-body
             :visible.sync="formVisible"
             :close-on-click-modal='false'
             v-el-drag-dialog
             width="77%"
             custom-class="dialog-default">
    <div class="dialog-contant-default schedule-log">
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
                     :height="tableHeight"
                     :tableOption="configData"
                     :pagenation="true"
                     :rowNum="true"
                     :rowCheck="false">
        </basic-table>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import { baseRequest } from '@/api/base'
const url = '/basic/factLogs/selects'
export default {
  name: 'scheduleDefScheduleLog',
  components: {
    SearchForm,
    BasicTable
  },
  data() {
    return {
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      formVisible: false,
      factId: null,
      tableHeight: 0
    }
  },
  methods: {
    openDialog(param) {
      this.factId = param.factId
      this.formVisible = true
      this.$nextTick(function() {
        this.tableHeight = document.querySelector('.dialog-contant-default.schedule-log').offsetHeight - 245
      })
      this.getOption()
    },
    searchOption() {
      const param = this.$refs.searchForm.searchParam()
      param.factId = this.factId
      this.$refs.basicTable.getData(url, param)
    },
    getOption() {
      baseRequest(url, { urlMode: '1' }).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        this.$nextTick(function() {
          this.searchOption()
        })
      })
    }
  }
}
</script>

