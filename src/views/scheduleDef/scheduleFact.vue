<template>
  <el-dialog title="查看"
             :visible.sync="formVisible"
             :close-on-click-modal='false'
             v-el-drag-dialog
             width="81%"
             custom-class="dialog-default">
    <div class="dialog-contant-default schedule-fact">
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
          <el-table-column slot="optionColumn"
                           label="操作"
                           align="center"
                           :width="250">
            <template slot-scope="scope">
              <el-button type="success"
                         plain
                         size="mini"
                         @click="showLog(scope.row)">查看日志</el-button>
            </template>
          </el-table-column>
        </basic-table>
      </div>
      <schedule-log ref="scheduleLog"></schedule-log>
    </div>
  </el-dialog>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import { baseRequest } from '@/api/base'
import scheduleLog from './scheduleLog'
const url = '/basic/facts/selects'
export default {
  name: 'scheduleDefScheduleFact',
  components: {
    SearchForm,
    BasicTable,
    scheduleLog
  },
  data() {
    return {
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      formVisible: false,
      defId: null,
      tableHeight: 0
    }
  },
  methods: {
    openDialog(param) {
      this.defId = param.defId
      this.formVisible = true
      this.$nextTick(function() {
        this.tableHeight = document.querySelector('.dialog-contant-default.schedule-fact').offsetHeight - 245
      })
      this.getOption()
    },
    searchOption() {
      const param = this.$refs.searchForm.searchParam()
      param.defId = this.defId
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
    },
    showLog(row) {
      this.$refs.scheduleLog.openDialog(row)
    }
  }
}
</script>

