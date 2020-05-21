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
                   :tableOption="configData"
                   :pagenation="true"
                   :rowNum="true">
        <el-table-column slot="optionColumn"
                         label="操作"
                         align="center"
                         width="200"
                         fixed="right">
          <template slot-scope="scope">
            <el-button type="primary"
                       plain
                       size="mini"
                       @click="updateOption(scope.row)">修改</el-button>
            <el-button type="danger"
                       plain
                       size="mini"
                       @click="deleteForm(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <el-dialog :title="dialogTitle[operateStatus]"
               :visible.sync="formVisible"
               :close-on-click-modal='false'
               v-el-drag-dialog
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default">
        <update-form v-if="operateStatus!==3"
                     ref="updateFrom"
                     :updateFormData="updateFormData"></update-form>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary"
                   @click="saveOperate()">保存</el-button>
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
const url = '/basic/events/selects'
export default {
  name: 'eventIndex',
  components: {
    SearchForm,
    BasicTable,
    UpdateForm
  },
  data() {
    return {
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      updateFormData: null, // 弹框数据
      formVisible: false, // 弹框开关
      operateStatus: null, // 操作选项
      eventId: null, // 修改保存参数id
      dialogTitle: { // 弹框标题
        1: '添加',
        2: '修改'
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
      baseRequest(url, { urlMode: '1' }).then(response => {
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
      this.getAddForm()
    },
    // 修改表单
    updateOption(row) {
      this.operateStatus = 2
      this.eventId = row.eventId
      this.getUpdateForm(row)
    },
    // 获取添加表单
    getAddForm() {
      const param = { urlMode: 1 }
      baseRequest('/basic/events/getAddData', param).then(response => {
        response.data.item = {}
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        this.updateFormData = result
        this.formVisible = true
        this.$nextTick(function() {
          this.$refs.updateFrom.clearValidate()
        })
      })
    },
    // 获取修改表单
    getUpdateForm(row) {
      const param = { eventId: row.eventId }
      baseRequest('/basic/events/select', param).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        this.updateFormData = result
        this.formVisible = true
        this.$nextTick(function() {
          this.$refs.updateFrom.clearValidate()
        })
      })
    },
    // 删除
    deleteForm(row) {
      const param = { eventId: row.eventId }
      this.$confirm('此操作将永久删除该条数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        baseRequest('/basic/events/delete', param).then(response => {
          this.searchOption()
          this.$Message.success('操作成功')
        })
      })
    },
    // 保存操作
    saveOperate() {
      if (this.operateStatus === 1) {
        this.$refs.updateFrom.saveRequest('/events/add').then(() => {
          this.searchOption()
          this.$Message.success('操作成功')
          this.formVisible = false
        })
      } else if (this.operateStatus === 2) {
        const param = this.$refs.updateFrom.getFormData()
        param.eventId = this.eventId
        this.$refs.updateFrom.saveRequest('/events/update', param).then(() => {
          this.searchOption()
          this.$Message.success('操作成功')
          this.formVisible = false
        })
      }
    }
  }
}
</script>

