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
        <template slot="optionColumn">
          <el-table-column label="操作"
                           fixed="right"
                           width="200"
                           align="center">
            <template slot-scope="scope">
              <el-button type="primary"
                         size="mini"
                         plain
                         @click="updateOption(scope.row)">修改</el-button>
              <el-button type="danger"
                         size="mini"
                         plain
                         @click="deleteform(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </template>
      </basic-table>
      <el-dialog :title="dialogTitle[operateStatus]"
                 :visible.sync="formVisible"
                 :close-on-click-modal="false"
                 custom-class="dialog-default"
                 width="40%">
        <div class="dialog-contant-default">
          <update-form ref="updateForm"
                       :updateFormData="updateFormData"></update-form>
        </div>
        <div slot="footer"
             class="dialog-footer">
          <el-button @click="formVisible = 'false'"
                     size="mini">取消</el-button>
          <el-button @click="save"
                     size="mini"
                     type="primary">保存</el-button>
        </div>
      </el-dialog>
    </div>

  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import UpdateForm from 'update-form-ry'
import { getSearchParam } from '@/utils/index'
import elDragDialog from '@/directive/el-dragDialog'
import { baseRequest } from '@/api/base'
const url = '/basic/fenHangAccess/selects'
export default {
  directives: { elDragDialog },
  name: 'systemManagementkonwledgeBaseManagementgeFenHangJieKouRen',
  components: {
    SearchForm,
    BasicTable,
    UpdateForm
  },
  data() {
    return {
      fileList: [],
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      updateFormData: null, // 弹框数据
      formVisible: false, // 弹框开关
      languageData: null, // 语言设置数据
      operateStatus: null, // 操作选项
      msgId: null, // 修改保存参数id
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
      baseRequest(url).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        const param = getSearchParam(result.formConfig)
        this.$refs.basicTable.getData(url, param)
      })
    },
    updateOption(row) {
      this.operateStatus = 2
      this.getUpdateForm(row)
      this.msgId = row.msgId
    },
    getUpdateForm(row) {
      const param = { msgId: row.msgId }
      baseRequest('/basic/checkRule/getUpdateData', param).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.validator = JSON.parse(result.validator)
        this.updateFormData = result
        this.formVisible = true
        this.$nextTick(function() {
          this.$refs.updateForm.clearValidate()
        })
      })
      // const param = { msgId: row.msgId }
      // baseRequest('/checkRule/getUpdateData', param).then(response => {
      //   const result = response.data
      //   result.formConfig = JSON.parse(result.formConfig)
      //   result.validator = JSON.parse(result.validator)
      //   this.updateFormData = result
      //   this.formVisible = true
      //   this.$nextTick(function() {
      //     this.$refs.updateFrom.clearValidate()
      //   })
      // })
    },
    addOption() {
      this.operateStatus = 1
      this.getAddForm()
    },
    getAddForm() {
      if (this.updateFormData === null) {
        const param = { urlMode: 1 }
        baseRequest('/basic/fenHangAccess/getAddDate', param).then(response => {
          response.data.item = {}
          const result = response.data
          result.formConfig = JSON.parse(result.formConfig)
          result.validator = JSON.parse(result.validator)
          this.updateFormData = result
          this.formVisible = true
          this.$nextTick(function() {
            this.$refs.updateForm.clearValidate()
          })
        })
      } else {
        this.updateFormData.item = {}
        this.formVisible = true
        this.$nextTick(function() {
          this.$refs.updateForm.clearValidate()
        })
      }
    },
    deleteform(row) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      })
    }
  }
}
</script>

